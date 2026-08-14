"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useChainId, useReadContract, useSwitchChain } from "wagmi";
import { formatUnits } from "viem";
import { QRCodeSVG } from "qrcode.react";
import { AlertCircle, ArrowRightLeft, CheckCircle2, Copy, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { CONTRACT_ADDRESSES, ERC20_ABI, FXRP_DECIMALS } from "@/lib/contracts";
import { createXamanMint, fetchXamanMintStatus, prepareDirectMint, type DirectMintPreparation } from "@/lib/api";

export default function OnboardingPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [amountXrp, setAmountXrp] = useState("10");
  const [prepared, setPrepared] = useState<DirectMintPreparation | null>(null);
  const [xamanUrl, setXamanUrl] = useState<string | null>(null);
  const [xamanUuid, setXamanUuid] = useState<string | null>(null);
  const [xamanSocketUrl, setXamanSocketUrl] = useState<string | null>(null);
  const [signingStatus, setSigningStatus] = useState<"idle" | "waiting" | "signed" | "rejected">("idle");
  const [xrplHash, setXrplHash] = useState("");
  const [loading, setLoading] = useState<"prepare" | "xaman" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: balanceRaw, refetch: refetchBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.FXRP,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && chainId === 114) },
  });
  const balance = balanceRaw ? formatUnits(balanceRaw, FXRP_DECIMALS) : "0";

  const refreshXamanStatus = useCallback(async (uuid = xamanUuid): Promise<void> => {
    if (!uuid) return;
    const status = await fetchXamanMintStatus(uuid);
    if (status.signed && status.txid) {
      setXrplHash(status.txid);
      setSigningStatus("signed");
      void refetchBalance();
    } else if (status.resolved || status.expired || status.cancelled) {
      setSigningStatus("rejected");
    }
  }, [refetchBalance, xamanUuid]);

  useEffect(() => {
    if (!xamanSocketUrl || !xamanUuid) return;
    const socket = new WebSocket(xamanSocketUrl);
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(String(event.data)) as { signed?: boolean; expired?: boolean };
        if (message.signed !== undefined || message.expired) {
          void refreshXamanStatus(xamanUuid).finally(() => socket.close());
        }
      } catch {
        // Xaman welcome and keepalive messages are not payload updates.
      }
    };
    return () => socket.close();
  }, [refreshXamanStatus, xamanSocketUrl, xamanUuid]);

  async function prepare(): Promise<void> {
    if (!address) return;
    setLoading("prepare");
    setError(null);
    setXamanUrl(null);
    setXamanUuid(null);
    setXamanSocketUrl(null);
    setSigningStatus("idle");
    try {
      setPrepared(await prepareDirectMint(address, amountXrp));
    } catch (reason) {
      setPrepared(null);
      setError(reason instanceof Error ? reason.message : "Direct mint preparation failed");
    } finally {
      setLoading(null);
    }
  }

  async function openXaman(): Promise<void> {
    if (!address) return;
    setLoading("xaman");
    setError(null);
    try {
      const response = await createXamanMint(address, amountXrp);
      setPrepared(response.prepared);
      const url = response.xaman.next?.always;
      const uuid = response.xaman.uuid;
      if (!url || !uuid) throw new Error("Xaman did not return a signing URL and payload ID");
      setXamanUrl(url);
      setXamanUuid(uuid);
      setXamanSocketUrl(response.xaman.refs?.websocket_status || null);
      setSigningStatus("waiting");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Xaman payload failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="page-enter mx-auto max-w-5xl space-y-7">
      <header className="border-b border-white/[0.07] pb-6">
        <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-flare-light"><ArrowRightLeft className="h-4 w-4" />FAssets direct mint</p>
        <h1 className="text-4xl font-medium tracking-[-0.04em] text-white">Bring XRP to Flare.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">One XRPL payment to the official Core Vault. Your Coston2 address is encoded in the memo.</p>
      </header>

      {!isConnected ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-200">Connect the recipient Coston2 wallet to continue.</div>
      ) : chainId !== 114 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
          <p className="text-sm text-amber-200">This flow requires Coston2.</p>
          <button onClick={() => switchChain({ chainId: 114 })} className="mt-3 rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950">Switch network</button>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
          <section className="interactive-card rounded-2xl border border-white/[0.08] bg-surface-card/80 p-5 backdrop-blur-xl sm:p-6">
            <div className="mb-6 flex items-center justify-between border-b border-white/[0.07] pb-5">
              <div><p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">Recipient</p><p className="mt-1 font-mono text-xs text-white">{address}</p></div>
              <div className="text-right"><p className="font-mono text-[10px] uppercase tracking-wider text-slate-500">FTestXRP</p><p className="mt-1 font-mono text-sm font-bold text-white">{Number(balance).toFixed(6)}</p></div>
            </div>

            <label className="block text-xs font-semibold text-slate-300">
              XRP amount on XRPL Testnet
              <input type="number" min="0" step="0.000001" value={amountXrp} onChange={(event) => setAmountXrp(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-white" />
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button onClick={() => void prepare()} disabled={Boolean(loading)} className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{loading === "prepare" && <Loader2 className="h-4 w-4 animate-spin" />}Review payload</button>
              <button onClick={() => void openXaman()} disabled={Boolean(loading)} className="flex items-center justify-center gap-2 rounded-lg bg-flare-crimson px-4 py-3 text-xs font-bold text-white disabled:opacity-50">{loading === "xaman" && <Loader2 className="h-4 w-4 animate-spin" />}Sign with Xaman</button>
            </div>

            {error && <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

            {prepared && (
              <div className="mt-6 space-y-3 border-t border-white/[0.07] pt-5 text-xs">
                <Field label="Core Vault" value={prepared.xrplTransaction.Destination} />
                <Field label="Amount (drops)" value={prepared.quote.grossDrops} />
                <Field label="MemoData" value={prepared.xrplTransaction.Memos[0].Memo.MemoData} />
                <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-800 bg-slate-950 p-3 text-center">
                  <Stat label="Mint fee" value={formatUnits(BigInt(prepared.quote.mintingFeeDrops), 6)} />
                  <Stat label="Executor" value={formatUnits(BigInt(prepared.quote.executorFeeDrops), 6)} />
                  <Stat label="Est. net" value={formatUnits(BigInt(prepared.quote.estimatedNetFxrpDrops), 6)} />
                </div>
                <p className="text-amber-300">{prepared.warning}</p>
              </div>
            )}
          </section>

          <aside className="interactive-card space-y-4 rounded-2xl border border-white/[0.08] bg-surface-card/80 p-5 backdrop-blur-xl">
            {xamanUrl ? (
              <div className="text-center">
                <div className="mx-auto w-fit rounded-lg bg-white p-3"><QRCodeSVG value={xamanUrl} size={190} /></div>
                <a href={xamanUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-flare-bright">Open Xaman <ExternalLink className="h-3 w-3" /></a>
                <p className="mt-2 text-xs text-slate-400">{signingStatus === "waiting" ? "Waiting for the XRPL signature and submission..." : signingStatus === "signed" ? "XRPL payment submitted" : signingStatus === "rejected" ? "Payload rejected or expired" : ""}</p>
                {xamanUuid && signingStatus === "waiting" && <button onClick={() => void refreshXamanStatus()} className="mt-2 text-xs text-slate-300 underline">Check status</button>}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-xs text-slate-500">Your Xaman QR appears here after the payload is created.</div>
            )}

            <label className="block text-xs font-semibold text-slate-300">
              XRPL transaction hash
              <input value={xrplHash} onChange={(event) => setXrplHash(event.target.value.trim())} placeholder="64-character transaction hash" className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-white" />
            </label>
            {/^[A-Fa-f0-9]{64}$/.test(xrplHash) && <a href={`https://testnet.xrpl.org/transactions/${xrplHash}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-flare-bright">Verify on XRPL Testnet <ExternalLink className="h-3 w-3" /></a>}
            <button onClick={() => void refetchBalance()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-white"><RefreshCw className="h-4 w-4" />Refresh FTestXRP balance</button>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <div className="mb-1 flex items-center justify-between"><span className="text-slate-500">{label}</span><button onClick={() => navigator.clipboard.writeText(value).then(() => setCopied(true))} title={`Copy ${label}`} className="text-slate-400 hover:text-white">{copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}</button></div>
      <p className="break-all font-mono text-[11px] text-white">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] text-slate-500">{label}</p><p className="mt-1 font-mono text-xs font-bold text-white">{value} XRP</p></div>;
}
