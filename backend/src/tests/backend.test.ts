import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import initSqlJs from "sql.js";
import type { AddressInfo } from "node:net";
import { createApp } from "../app";
import { config, ZERO_ADDRESS } from "../config";
import { closeDb, getDb, insertTransaction } from "../db/database";
import { buildDirectMintingMemo } from "../routes/fassets";
import { buildMerchantPaymentQuote, verifyQuoteToken } from "../routes/payments";
import { validateFtsoRate, type RateData } from "../routes/rate";

const testDb = path.resolve(".flareit-test.db");

test("buildDirectMintingMemo encodes prefix, padding, and recipient", () => {
  const recipient = "0x1234567890abcdef1234567890abcdef12345678";
  assert.equal(
    buildDirectMintingMemo(recipient),
    "4642505266410018000000001234567890ABCDEF1234567890ABCDEF12345678"
  );
});

test("rate validation rejects zero and stale FTSO data", () => {
  const now = Math.floor(Date.now() / 1000);
  assert.doesNotThrow(() => validateFtsoRate(1.25, now));
  assert.throws(() => validateFtsoRate(0, now), /zero or invalid/);
  assert.throws(() => validateFtsoRate(1.25, now - 301), /stale/);
});

test("merchant quote carries an enforceable five-minute deadline", () => {
  const originalMerchantPayment = config.MERCHANT_PAYMENT_ADDRESS;
  try {
    config.MERCHANT_PAYMENT_ADDRESS = "0x1111111111111111111111111111111111111111";
    const rate: RateData = {
      xrpUsd: 1,
      xrpIdr: 16_000,
      usdIdr: 16_000,
      ftsoTimestamp: 1_700_000_000,
      cacheUpdatedAt: 1_700_000_000,
      ftsoFeedFresh: true,
      sources: {
        xrpUsd: "ftso-v2-direct-on-chain",
        usdIdr: "coingecko-off-chain",
        xrpIdr: "derived",
      },
    };
    const quote = buildMerchantPaymentQuote(
      "0x2222222222222222222222222222222222222222",
      32_000,
      "ORDER-1",
      rate,
      1_700_000_000
    );
    assert.equal(quote.params.amount, "2000000");
    assert.equal(quote.params.deadline, 1_700_000_300);
    assert.match(quote.qrPayload, /\/merchant\?quote=[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    const token = quote.qrPayload.split("quote=")[1];
    assert.equal(verifyQuoteToken(token).params.paymentId, quote.params.paymentId);
    assert.throws(() => verifyQuoteToken(`${token}x`), /signature/);
  } finally {
    config.MERCHANT_PAYMENT_ADDRESS = originalMerchantPayment;
  }
});

test("health and transaction endpoints are packaged and callable", async () => {
  const originalConfig = {
    dbPath: config.DB_PATH,
    sendContract: config.SEND_CONTRACT_ADDRESS,
    rateReader: config.RATE_READER_ADDRESS,
    merchantPayment: config.MERCHANT_PAYMENT_ADDRESS,
  };
  config.DB_PATH = testDb;
  config.SEND_CONTRACT_ADDRESS = ZERO_ADDRESS;
  config.RATE_READER_ADDRESS = ZERO_ADDRESS;
  config.MERCHANT_PAYMENT_ADDRESS = ZERO_ADDRESS;

  const SQL = await initSqlJs();
  const legacy = new SQL.Database();
  legacy.run(`CREATE TABLE transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    amount TEXT NOT NULL,
    tx_hash TEXT NOT NULL UNIQUE,
    block_number INTEGER,
    log_index INTEGER,
    created_at INTEGER NOT NULL
  );`);
  fs.writeFileSync(testDb, Buffer.from(legacy.export()));
  legacy.close();

  const server = createApp().listen(0);
  try {
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const port = (server.address() as AddressInfo).port;

    const health = await fetch(`http://127.0.0.1:${port}/health`);
    assert.equal(health.status, 200);
    const healthBody = await health.json() as { project: string; status: string };
    assert.equal(healthBody.project, "FlareIt Backend");
    assert.equal(healthBody.status, "degraded");

    const invalid = await fetch(`http://127.0.0.1:${port}/api/transactions/not-an-address`);
    assert.equal(invalid.status, 400);

    const valid = await fetch(
      `http://127.0.0.1:${port}/api/transactions/0x1234567890abcdef1234567890abcdef12345678`
    );
    assert.equal(valid.status, 200);
    const body = await valid.json() as { count: number; transactions: unknown[] };
    assert.equal(body.count, 0);
    assert.deepEqual(body.transactions, []);

    const database = await getDb();
    const shared = {
      sender: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      recipient: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
      amount: "1",
      tx_hash: "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
      block_number: 1,
      created_at: 1,
    };
    assert.equal(insertTransaction(database, { ...shared, log_index: 0 }), true);
    assert.equal(insertTransaction(database, { ...shared, log_index: 1 }), true);
  } finally {
    if (server.listening) {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => error ? reject(error) : resolve())
      );
    }
    closeDb();
    if (fs.existsSync(testDb)) fs.unlinkSync(testDb);
    config.DB_PATH = originalConfig.dbPath;
    config.SEND_CONTRACT_ADDRESS = originalConfig.sendContract;
    config.RATE_READER_ADDRESS = originalConfig.rateReader;
    config.MERCHANT_PAYMENT_ADDRESS = originalConfig.merchantPayment;
  }
});
