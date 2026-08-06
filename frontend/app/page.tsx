"use client";

import React from "react";
import Link from "next/link";
import { Send, ArrowRightLeft, LayoutDashboard, QrCode, ShieldCheck, Zap, Globe, Coins, TrendingUp } from "lucide-react";
import { RateDisplay } from "@/components/RateDisplay";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative pt-6 pb-10 sm:py-16 text-center max-w-4xl mx-auto space-y-6">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-flare-crimson/20 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-flare-crimson/15 border border-flare-crimson/30 text-flare-bright text-xs font-bold shadow-flare-glow-sm">
          <Zap className="w-3.5 h-3.5 animate-pulse" />
          <span>Flare Summer Signal Hackathon • Interoperable Asset Track</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Kirim Remitansi TKI Instan <br />
          <span className="gradient-text-red">Tanpa Potongan Kustodian</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Menggantikan operator transfer uang kustodian tradisional dengan rail settlement trustless berbasis <strong>FAssets (FXRP)</strong> dan orakel <strong>FTSO v2</strong> di Flare Network.
        </p>

        {/* Quick Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/send"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-flare hover:opacity-95 text-white font-extrabold text-sm shadow-flare-glow transition active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Mulai Kirim FXRP</span>
          </Link>

          <Link
            href="/onboarding"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl glass-panel hover:border-slate-700 text-slate-200 font-bold text-sm transition"
          >
            <ArrowRightLeft className="w-4 h-4 text-flare-bright" />
            <span>Onboarding XRP → FXRP</span>
          </Link>
        </div>
      </section>

      {/* Live FTSO Rate Display Card */}
      <section>
        <RateDisplay />
      </section>

      {/* Remittance Market Stats Banner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <div className="p-2.5 rounded-xl bg-flare-crimson/10 text-flare-bright w-fit">
            <Globe className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-white">$17.25 Miliar USD</p>
          <p className="text-xs text-slate-400">Total remitansi TKI masuk Indonesia pada 2025 (Bank Indonesia).</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-emerald-400">Hemat 5% - 10% Fee</p>
          <p className="text-xs text-slate-400">Memangkas potongan margin FX & biaya transaksi Western Union/Bank.</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-2">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-white">Finalitas Detik</p>
          <p className="text-xs text-slate-400">Penerima menerima FXRP di wallet secara instant di Coston2 testnet.</p>
        </div>
      </section>

      {/* 4 Core Features Workflow */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white">Alur Produk FlareIt</h2>
          <p className="text-xs text-slate-400 mt-1">4 Komponen Jangkar Utama Pengiriman Remitansi FXRP</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/onboarding" className="glass-panel glass-panel-hover p-6 rounded-2xl block group space-y-3">
            <div className="w-10 h-10 rounded-xl bg-flare-crimson/15 text-flare-bright flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-flare-bright transition">1. Mint / Claim FXRP</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pengirim mengonversi XRP menjadi FXRP via FAssets bridge resmi Flare.
            </p>
          </Link>

          <div className="glass-panel glass-panel-hover p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Live FTSO Rate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Melihat kurs XRP/USD transparan real-time dari oarakel FTSO v2 di smart contract.
            </p>
          </div>

          <Link href="/send" className="glass-panel glass-panel-hover p-6 rounded-2xl block group space-y-3">
            <div className="w-10 h-10 rounded-xl bg-flare-crimson/15 text-flare-bright flex items-center justify-center group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-flare-bright transition">3. Transfer Instan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mengirim FXRP langsung ke wallet keluarga penerima tanpa perantara kustodian.
            </p>
          </Link>

          <Link href="/dashboard" className="glass-panel glass-panel-hover p-6 rounded-2xl block group space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition">4. Dashboard Awam</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Keluarga melihat estimasi nilai saldo dalam Rupiah & riwayat transaksi ramah pengguna.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
