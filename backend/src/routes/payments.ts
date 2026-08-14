import { createHash, createHmac, randomUUID, timingSafeEqual } from "crypto";
import { Router, Request, Response } from "express";
import { isAddress } from "viem";
import { config, isConfigured } from "../config";
import { getRateSnapshot, type RateData } from "./rate";

const router = Router();
const QUOTE_TTL_SECONDS = 300;

function signQuotePayload(payload: object): string {
  if (config.QUOTE_SIGNING_SECRET.length < 32) {
    throw new Error("QUOTE_SIGNING_SECRET must contain at least 32 characters");
  }
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = createHmac("sha256", config.QUOTE_SIGNING_SECRET)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

export function buildMerchantPaymentQuote(
  merchant: `0x${string}`,
  amountIdr: number,
  merchantReference: string,
  rate: RateData,
  nowSeconds = Math.floor(Date.now() / 1000)
) {
  if (!rate.ftsoFeedFresh || rate.xrpIdr <= 0) throw new Error("FTSO rate is stale or invalid");
  const amount = BigInt(Math.ceil(amountIdr / rate.xrpIdr * 1_000_000));
  const paymentId = `0x${createHash("sha256").update(randomUUID()).digest("hex")}`;
  const referenceHash = `0x${createHash("sha256").update(merchantReference || paymentId).digest("hex")}`;
  const idrQuote = Math.round(amountIdr);
  const deadline = nowSeconds + QUOTE_TTL_SECONDS;
  const params = {
    paymentId,
    merchant,
    amount: amount.toString(),
    idrQuote,
    merchantReferenceHash: referenceHash,
    deadline,
  };
  const unsignedQuote = {
    mode: "fxrp-on-chain" as const,
    settlementStatus: "fxrp-on-chain" as const,
    fiatOffRampStatus: "licensed-partner-required" as const,
    expiresAt: deadline,
    rate,
    contract: config.MERCHANT_PAYMENT_ADDRESS,
    functionName: "payMerchant" as const,
    merchantReference,
    params,
    disclaimer: "This QR pays FXRP on Coston2. It is not a production QRIS code or IDR settlement.",
  };
  const quoteToken = signQuotePayload(unsignedQuote);

  return {
    ...unsignedQuote,
    qrPayload: `/merchant?quote=${quoteToken}`,
  };
}

type MerchantPaymentQuote = ReturnType<typeof buildMerchantPaymentQuote>;
const merchantQuotes = new Map<string, ReturnType<typeof buildMerchantPaymentQuote>>();

export function verifyQuoteToken(token: string): MerchantPaymentQuote {
  if (token.length > 12_000) throw new Error("Quote token is too large");
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) throw new Error("Malformed quote token");

  const expected = createHmac("sha256", config.QUOTE_SIGNING_SECRET).update(encoded).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new Error("Invalid quote signature");
  }

  const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as
    Omit<MerchantPaymentQuote, "qrPayload">;
  if (
    parsed.mode !== "fxrp-on-chain"
    || parsed.contract.toLowerCase() !== config.MERCHANT_PAYMENT_ADDRESS.toLowerCase()
    || parsed.functionName !== "payMerchant"
    || !/^0x[a-fA-F0-9]{64}$/.test(parsed.params?.paymentId || "")
    || !isAddress(parsed.params?.merchant || "")
    || !/^\d+$/.test(parsed.params?.amount || "")
    || !Number.isSafeInteger(parsed.params?.idrQuote)
    || parsed.params.idrQuote < 1
    || parsed.params.deadline !== parsed.expiresAt
    || typeof parsed.merchantReference !== "string"
    || parsed.merchantReference.length > 128
  ) {
    throw new Error("Invalid quote payload");
  }

  return {
    ...parsed,
    qrPayload: `/merchant?quote=${token}`,
  };
}

function pruneMerchantQuotes(nowSeconds: number): void {
  for (const [paymentId, quote] of merchantQuotes) {
    if (quote.expiresAt < nowSeconds) merchantQuotes.delete(paymentId);
  }
  while (merchantQuotes.size >= 1000) {
    const oldest = merchantQuotes.keys().next().value as string | undefined;
    if (!oldest) break;
    merchantQuotes.delete(oldest);
  }
}

router.post("/quote", async (req: Request, res: Response): Promise<void> => {
  const merchant = req.body?.merchant;
  const amountIdr = Number(req.body?.amountIdr);
  const merchantReference = String(req.body?.merchantReference || "").trim();

  if (!isAddress(merchant) || !Number.isSafeInteger(amountIdr) || amountIdr < 1 || amountIdr > 100_000_000) {
    res.status(400).json({ error: "Valid merchant address and whole-IDR amount are required" });
    return;
  }
  if (!isConfigured(config.MERCHANT_PAYMENT_ADDRESS)) {
    res.status(503).json({ error: "Merchant payment contract is not deployed", code: "CONTRACT_NOT_CONFIGURED" });
    return;
  }
  if (merchantReference.length > 128) {
    res.status(400).json({ error: "Merchant reference must be at most 128 characters" });
    return;
  }

  try {
    const rate = await getRateSnapshot();
    const quote = buildMerchantPaymentQuote(merchant, amountIdr, merchantReference, rate);
    pruneMerchantQuotes(Math.floor(Date.now() / 1000));
    merchantQuotes.set(quote.params.paymentId, quote);
    res.json(quote);
  } catch (error) {
    res.status(503).json({ error: "Verified payment quote is unavailable", code: "RATE_UNAVAILABLE" });
  }
});

router.get("/quote/:paymentId", (req: Request, res: Response): void => {
  const identifier = req.params.paymentId;
  let quote: MerchantPaymentQuote | undefined;
  if (/^0x[a-fA-F0-9]{64}$/.test(identifier)) {
    quote = merchantQuotes.get(identifier.toLowerCase());
  } else {
    try {
      quote = verifyQuoteToken(identifier);
    } catch {
      res.status(400).json({ error: "Invalid or tampered invoice" });
      return;
    }
  }
  if (!quote) {
    res.status(404).json({ error: "Invoice not found or backend restarted" });
    return;
  }
  if (quote.expiresAt < Math.floor(Date.now() / 1000)) {
    merchantQuotes.delete(quote.params.paymentId);
    res.status(410).json({ error: "Invoice expired" });
    return;
  }
  res.json(quote);
});

export default router;
