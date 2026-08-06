"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { LayoutDashboard, ShieldCheck, RefreshCw } from "lucide-react";
import { CONTRACT_ADDRESSES, ERC20_ABI, FXRP_DECIMALS } from "@/lib/contracts";
import { RateDisplay } from "@/components/RateDisplay";
import { TransactionHistory } from "@/components/TransactionHistory";
import { formatIdr, fetchRate, type RateData } from "@/lib/api";

export default function DashboardPage() {
  const { address } = useAccount();
  const [rateData, setRateData] = useState<RateData | null>(null);

  useEffect(() => {
    fetchRate().then(setRateData).catch(console.error);
  }, []);

  const { data: fxrpBalanceRaw, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.FXRP,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const fxrpBalance = fxrpBalanceRaw ? Number(formatUnits(fxrpBalanceRaw as bigint, FXRP_DECIMALS)) : 0;
  const xrpIdr = rateData?.xrpIdr || 17069.69;
  const idrEquivalent = fxrpBalance * xrpIdr;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <LayoutDashboard className="w-7 h-7 text-flare-bright" />
            Dashboard Penerima
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Pandangan ramah pengguna non-teknis — estimasi nilai saldo dalam Rupiah berdasarkan orakel FTSO v2.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Perbarui Saldo</span>
        </button>
      </div>

      {/* Recipient Primary Balance Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* IDR Primary Balance Hero Card */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Saldo Diterima (Nilai Rupiah)
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Siap Digunakan
            </span>
          </div>

          <div>
            <p className="text-4xl sm:text-5xl font-extrabold font-mono text-emerald-400">
              {formatIdr(idrEquivalent)}
            </p>
            <p className="text-xs text-slate-400 mt-2 font-mono">
              = {fxrpBalance.toFixed(4)} FXRP (Dikonversi via FTSO Rate 1 FXRP = {formatIdr(xrpIdr)})
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Bisa langsung ditransfer atau digunakan di merchant QRIS
            </span>
          </div>
        </div>

        {/* FXRP Asset Card */}
        <div className="glass-panel p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Aset On-Chain</span>
              <span className="px-2 py-0.5 rounded bg-flare-crimson/20 text-flare-bright font-bold text-[10px]">
                FAssets
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {fxrpBalance.toFixed(4)}
            </p>
            <p className="text-xs text-slate-400 font-mono">FXRP Token</p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="text-white font-semibold">100% Backed by FAssets</p>
            <p>Terhubung langsung dengan ledger XRP tanpa kustodian bank.</p>
          </div>
        </div>
      </div>

      {/* Live FTSO Rate Display */}
      <RateDisplay compact />

      {/* Full Transaction History */}
      <TransactionHistory xrpIdrRate={xrpIdr} />
    </div>
  );
}
