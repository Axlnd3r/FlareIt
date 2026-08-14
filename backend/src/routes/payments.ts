import { createHash, randomUUID } from "crypto";
import { Router, Request, Response } from "express";
import { isAddress } from "viem";
import { config, isConfigured } from "../config";
import { getRateSnapshot, type RateData } from "./rate";

const router = Router();
const QUOTE_TTL_SECONDS = 300;

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
  const query = new URLSearchParams({
    invoice: paymentId,
  });

  return {
    mode: "fxrp-on-chain" as const,
    settlementStatus: "fxrp-on-chain" as const,
    fiatOffRampStatus: "licensed-partner-required" as const,
    expiresAt: deadline,
    rate,
    contract: config.MERCHANT_PAYMENT_ADDRESS,
    functionName: "payMerchant" as const,
    merchantReference,
    params,
    qrPayload: `/merchant?${query.toString()}`,
    disclaimer: "This QR pays FXRP on Coston2. It is not a production QRIS code or IDR settlement.",
  };
}

const merchantQuotes = new Map<string, ReturnType<typeof buildMerchantPaymentQuote>>();

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
  const paymentId = req.params.paymentId.toLowerCase();
  if (!/^0x[a-f0-9]{64}$/.test(paymentId)) {
    res.status(400).json({ error: "Invalid invoice ID" });
    return;
  }
  const quote = merchantQuotes.get(paymentId);
  if (!quote) {
    res.status(404).json({ error: "Invoice not found or backend restarted" });
    return;
  }
  if (quote.expiresAt < Math.floor(Date.now() / 1000)) {
    merchantQuotes.delete(paymentId);
    res.status(410).json({ error: "Invoice expired" });
    return;
  }
  res.json(quote);
});

export default router;
