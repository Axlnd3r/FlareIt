"use client";

import { useCallback, useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { LayoutDashboard, RefreshCw, ShieldCheck } from "lucide-react";
import { CONTRACT_ADDRESSES, ERC20_ABI, FXRP_DECIMALS } from "@/lib/contracts";
import { RateDisplay } from "@/components/RateDisplay";
import { TransactionHistory } from "@/components/TransactionHistory";
import { formatIdr, type RateData } from "@/lib/api";

export default function DashboardPage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [rate, setRate] = useState<RateData | null>(null);
  const handleRate = useCallback((nextRate: RateData) => setRate(nextRate), []);
  const { data: balanceRaw, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.FXRP,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && chainId === 114) },
  });
  const balance = balanceRaw ? Number(formatUnits(balanceRaw, FXRP_DECIMALS)) : 0;

  return (
    <div className="page-enter mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="flex items-center gap-2 text-3xl font-bold text-white"><LayoutDashboard className="h-7 w-7 text-flare-bright" />Recipient dashboard</h1><p className="mt-1 text-sm text-slate-400">FTestXRP balance and SendContract history.</p></div>
        <button onClick={() => void refetch()} className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-xs font-bold text-white"><RefreshCw className="h-4 w-4" />Refresh</button>
      </header>

      <section className="interactive-card grid gap-px overflow-hidden rounded-xl border border-slate-800 bg-slate-800 md:grid-cols-2">
        <div className="bg-surface-card p-6"><p className="text-xs text-slate-500">On-chain balance</p><p className="mt-3 font-mono text-3xl font-bold text-white">{balance.toFixed(6)} <span className="text-base text-slate-500">FXRP</span></p><p className="mt-3 flex items-center gap-1 text-xs text-emerald-400"><ShieldCheck className="h-4 w-4" />FAssets Coston2 token balance</p></div>
        <div className="bg-surface-card p-6"><p className="text-xs text-slate-500">Estimated IDR value</p><p className="mt-3 font-mono text-3xl font-bold text-white">{rate ? formatIdr(balance * rate.xrpIdr) : "Unavailable"}</p><p className="mt-3 text-xs text-slate-500">Reference only; this is not an IDR balance or fiat settlement.</p></div>
      </section>

      <RateDisplay compact onRateChange={handleRate} />
      <TransactionHistory xrpIdrRate={rate?.xrpIdr} />
    </div>
  );
}
