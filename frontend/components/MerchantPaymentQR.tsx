"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { isAddress } from "viem";
import { QRCodeSVG } from "qrcode.react";
import { AlertCircle, CheckCircle2, ExternalLink, Loader2, QrCode, ShieldCheck, Store } from "lucide-react";
import { createMerchantPaymentQuote, fetchMerchantPaymentQuote, formatIdr, type MerchantPaymentQuote } from "@/lib/api";
import {
  CONTRACT_ADDRESSES,
  ERC20_ABI,
  MERCHANT_PAYMENT_ABI,
  getTxExplorerUrl,
  isContractConfigured,
} from "@/lib/contracts";

export function MerchantPaymentQR() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [merchant, setMerchant] = useState("");
  const [amountIdr, setAmountIdr] = useState("25000");
  const [reference, setReference] = useState("ORDER-001");
  const [quote, setQuote] = useState<MerchantPaymentQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteExpired, setQuoteExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractReady = isContractConfigured(CONTRACT_ADDRESSES.MERCHANT_PAYMENT);
  const correctNetwork = chainId === 114;
  const merchantValid = isAddress(merchant) && merchant.toLowerCase() !== address?.toLowerCase();
  const quoteAmount = useMemo(() => BigInt(quote?.params.amount || "0"), [quote]);
  const qrPayload = useMemo(
    () => quote ? new URL(quote.qrPayload, window.location.origin).toString() : "",
    [quote]
  );

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.FXRP,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && contractReady ? [address, CONTRACT_ADDRESSES.MERCHANT_PAYMENT] : undefined,
    query: { enabled: Boolean(address && correctNetwork && contractReady) },
  });
  const approval = useWriteContract();
  const payment = useWriteContract();
  const approvalReceipt = useWaitForTransactionReceipt({ hash: approval.data });
  const paymentReceipt = useWaitForTransactionReceipt({ hash: payment.data });
  const needsApproval = quoteAmount > (allowance ?? 0n);
  const busy = approval.isPending || approvalReceipt.isLoading || payment.isPending || paymentReceipt.isLoading;

  useEffect(() => {
    if (approvalReceipt.isSuccess) void refetchAllowance();
  }, [approvalReceipt.isSuccess, refetchAllowance]);

  useEffect(() => {
    const invoiceId = new URLSearchParams(window.location.search).get("invoice");
    if (!invoiceId) return;
    setQuoteLoading(true);
    fetchMerchantPaymentQuote(invoiceId)
      .then((invoice) => {
        setQuote(invoice);
        setMerchant(invoice.params.merchant);
        setAmountIdr(String(invoice.params.idrQuote));
        setReference(invoice.merchantReference);
        setError(null);
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Invoice unavailable"))
      .finally(() => setQuoteLoading(false));
  }, []);

  useEffect(() => {
    if (!quote) {
      setQuoteExpired(false);
      return;
    }
    const remainingMs = quote.expiresAt * 1000 - Date.now();
    if (remainingMs <= 0) {
      setQuoteExpired(true);
      return;
    }
    setQuoteExpired(false);
    const timeout = window.setTimeout(() => setQuoteExpired(true), remainingMs);
    return () => window.clearTimeout(timeout);
  }, [quote]);

  async function createQuote(): Promise<void> {
    if (!merchantValid) return;
    setQuoteLoading(true);
    setError(null);
    try {
      setQuote(await createMerchantPaymentQuote(merchant, Number(amountIdr), reference));
    } catch (reason) {
      setQuote(null);
      setError(reason instanceof Error ? reason.message : "Payment quote failed");
    } finally {
      setQuoteLoading(false);
    }
  }

  function approve(): void {
    if (!quote) return;
    approval.writeContract({
      address: CONTRACT_ADDRESSES.FXRP,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACT_ADDRESSES.MERCHANT_PAYMENT, quoteAmount],
      chainId: 114,
    });
  }

  function pay(): void {
    if (!quote) return;
    if (Date.now() / 1000 > quote.expiresAt) {
      setQuoteExpired(true);
      setError("Quote expired. Create a new invoice to use the latest rate.");
      return;
    }
    payment.writeContract({
      address: CONTRACT_ADDRESSES.MERCHANT_PAYMENT,
      abi: MERCHANT_PAYMENT_ABI,
      functionName: "payMerchant",
      args: [
        quote.params.paymentId,
        quote.params.merchant,
        quoteAmount,
        BigInt(quote.params.idrQuote),
        quote.params.merchantReferenceHash,
        BigInt(quote.params.deadline),
      ],
      chainId: 114,
    });
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-surface-card p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <p><strong>FlareIt Merchant QR.</strong> FTestXRP settles directly and non-custodially on Coston2. IDR conversion and fiat settlement remain a separate adapter that requires a licensed PJP/acquirer.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-white"><Store className="h-5 w-5 text-flare-bright" />Create merchant invoice</h2>
          <label className="block text-xs font-semibold text-slate-300">Merchant Coston2 address
            <input value={merchant} onChange={(event) => { setMerchant(event.target.value); setQuote(null); }} placeholder="0x..." className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-xs text-white" />
            {merchant && !merchantValid && <span className="mt-1 block text-red-400">Invalid merchant address or same as payer.</span>}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate-300">Amount in IDR
              <input type="number" min="1" value={amountIdr} onChange={(event) => { setAmountIdr(event.target.value); setQuote(null); }} className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-white" />
            </label>
            <label className="block text-xs font-semibold text-slate-300">Reference
              <input maxLength={128} value={reference} onChange={(event) => { setReference(event.target.value); setQuote(null); }} className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-white" />
            </label>
          </div>

          {!isConnected ? (
            <p className="rounded-lg border border-slate-800 p-4 text-xs text-slate-400">Connect the payer wallet.</p>
          ) : !correctNetwork ? (
            <button onClick={() => switchChain({ chainId: 114 })} className="w-full rounded-lg bg-amber-400 px-4 py-3 text-xs font-bold text-slate-950">Switch to Coston2</button>
          ) : !contractReady ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200">Merchant payment contract is not deployed. Quotes and payments are disabled.</p>
          ) : (
            <button onClick={() => void createQuote()} disabled={!merchantValid || Number(amountIdr) <= 0 || quoteLoading} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-xs font-bold text-white disabled:opacity-40">
              {quoteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}Create payment QR
            </button>
          )}

          {error && <p className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200"><AlertCircle className="h-4 w-4" />{error}</p>}

          {quote && (
            <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Invoice</span><span className="font-mono text-white">{reference}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Amount</span><span className="font-mono text-white">{formatIdr(quote.params.idrQuote)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">FXRP</span><span className="font-mono font-bold text-flare-bright">{(Number(quote.params.amount) / 1e6).toFixed(6)}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Rate source</span><span className="text-right text-white">{quote.rate.sources.xrpUsd}</span></div>
              {quoteExpired && <p className="rounded-lg bg-amber-500/10 p-2 text-amber-200">Quote expired. Create a new QR before paying.</p>}
              <button onClick={needsApproval ? approve : pay} disabled={busy || paymentReceipt.isSuccess || quoteExpired} className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-xs font-bold disabled:opacity-50 ${needsApproval ? "bg-amber-400 text-slate-950" : "bg-flare-crimson text-white"}`}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : needsApproval ? <ShieldCheck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {approval.isPending ? "Confirm approval" : approvalReceipt.isLoading ? "Approval pending" : payment.isPending ? "Confirm payment" : paymentReceipt.isLoading ? "Payment pending" : paymentReceipt.isSuccess ? "Payment confirmed" : needsApproval ? "Approve FXRP (1/2)" : "Pay merchant (2/2)"}
              </button>
            </div>
          )}
        </div>

        <aside className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-slate-800 bg-slate-950 p-5">
          {quote ? (
            <>
              <div className="rounded-lg bg-white p-3"><QRCodeSVG value={qrPayload} size={220} level="M" /></div>
              <p className="mt-3 text-center text-[10px] text-slate-500">HTTPS invoice · Coston2 · expires {new Date(quote.expiresAt * 1000).toLocaleTimeString("en-US")}</p>
            </>
          ) : (
            <div className="text-center text-slate-600"><QrCode className="mx-auto h-20 w-20" /><p className="mt-3 text-xs">No QR created yet</p></div>
          )}
          {payment.data && <a href={getTxExplorerUrl(payment.data)} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-1 text-xs text-flare-bright">View payment receipt <ExternalLink className="h-3 w-3" /></a>}
        </aside>
      </div>
    </section>
  );
}
