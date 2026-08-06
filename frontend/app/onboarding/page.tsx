"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { ArrowRightLeft, Coins, ExternalLink, ShieldCheck, CheckCircle2, ArrowRight, Info } from "lucide-react";
import { CONTRACT_ADDRESSES, ERC20_ABI, FXRP_DECIMALS } from "@/lib/contracts";

export default function OnboardingPage() {
  const { address, isConnected } = useAccount();

  const { data: fxrpBalanceRaw, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.FXRP,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const fxrpBalance = fxrpBalanceRaw ? Number(formatUnits(fxrpBalanceRaw as bigint, FXRP_DECIMALS)) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-flare-crimson/15 text-flare-bright text-xs font-bold border border-flare-crimson/30">
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>FAssets Interoperability Protocol</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white">
          Onboarding XRP ke FXRP
        </h1>
        <p className="text-sm text-slate-300 max-w-lg mx-auto">
          Konversi XRP native Anda menjadi token ERC-20 FXRP di jaringan Flare untuk mulai melakukan pengiriman remitansi.
        </p>
      </div>

      {/* Wallet Balance Status Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Status Saldo Wallet Anda</h3>
            <p className="text-xs text-slate-400">Terbaca langsung dari smart contract FXRP ERC-20</p>
          </div>

          <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Wallet Belum Connected"}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 text-center space-y-2">
          <p className="text-xs text-slate-400">Total FXRP Siap Kirim:</p>
          <p className="text-4xl font-extrabold font-mono text-flare-bright">
            {fxrpBalance.toFixed(4)} <span className="text-xl text-slate-400">FXRP</span>
          </p>
          {fxrpBalance > 0 && (
            <p className="text-xs text-emerald-400 flex items-center justify-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saldo FXRP terdeteksi di wallet Anda!
            </p>
          )}
        </div>

        {/* Honest Testnet Guidance Box */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Info className="w-4 h-4" />
            <span>Petunjuk Faucet Testnet Coston2</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Di jaringan <strong>Flare Coston2 Testnet</strong>, token FXRP dan gas C2FLR disediakan secara gratis langsung melalui Coston2 Faucet resmi tanpa perlu proses minting manual dari XRP Ledger.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="https://faucet.flare.network/coston2"
              target="_blank"
              rel="noreferrer"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <span>Buka Faucet Official Flare</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            <button
              onClick={() => refetch()}
              className="px-4 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition"
            >
              Cek Ulang Saldo
            </button>
          </div>
        </div>

        {/* Step-by-step Onboarding Explanation */}
        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Cara Kerja Mint FXRP di Mainnet (Roadmap)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <span className="text-flare-bright font-mono font-bold">01. Deposit XRP</span>
              <p className="text-slate-300">Kirim XRP dari wallet XRPL Anda ke Core Vault FAssets.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <span className="text-flare-bright font-mono font-bold">02. Verifikasi FDC</span>
              <p className="text-slate-300">Flare Data Connector membuktikan transaksi XRPL secara trustless.</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
              <span className="text-flare-bright font-mono font-bold">03. Terima FXRP</span>
              <p className="text-slate-300">Smart contract menerbitkan FXRP 1:1 langsung ke wallet EVM Anda.</p>
            </div>
          </div>
        </div>

        {/* Proceed CTA */}
        <div className="pt-4 border-t border-slate-800">
          <Link
            href="/send"
            className="w-full py-4 rounded-2xl bg-gradient-flare hover:opacity-95 text-white font-extrabold text-sm shadow-flare-glow flex items-center justify-center gap-2 transition"
          >
            <span>Saya Sudah Punya FXRP → Mulai Kirim Remitansi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
