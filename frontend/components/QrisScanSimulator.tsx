"use client";

import React, { useState } from "react";
import {
  QrCode,
  Store,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  ArrowRight,
  Cpu,
  Lock,
} from "lucide-react";
import { formatIdr } from "@/lib/api";

const MERCHANTS = [
  { id: "ID102938475610293", name: "Warung Makan Bu Sri", location: "Jakarta Selatan", item: "Nasi Soto Ayam + Es Teh", priceIdr: 25000 },
  { id: "ID987654321098765", name: "Toko Kelontong Berkah", location: "Surabaya", item: "Sembako Mingguan", priceIdr: 150000 },
  { id: "ID554433221100998", name: "Kopi Lokal Indonesia", location: "Bandung", item: "Single Origin Filter Coffee", priceIdr: 35000 },
];

export function QrisScanSimulator() {
  const [selectedMerchant, setSelectedMerchant] = useState(MERCHANTS[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [simulatedTxHash, setSimulatedTxHash] = useState("");

  const xrpIdrRate = 17069.69;
  const fxrpNeeded = selectedMerchant.priceIdr / xrpIdrRate;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setPaymentDone(false);

    setTimeout(() => {
      setIsScanning(false);
      setPaymentDone(true);
      setSimulatedTxHash("0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""));
    }, 2000);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
      {/* Explicit Hackathon Simulation Warning Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200">
          <p className="font-bold text-amber-300">DEMO SIMULATION DISCLOSURE</p>
          <p className="mt-0.5 leading-relaxed">
            Integrasi QRIS asli memerlukan kerja sama dengan Penyelenggara Jasa Pembayaran (PJP) berlisensi Bank Indonesia. Komponen ini menampilkan <strong>Simulasi UX + Desain Arsitektur Flare Data Connector (FDC)</strong> yang akan memverifikasi pembatalan/settlement QRIS secara trustless pasca-hackathon.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Merchant Selector & Details */}
        <div className="w-full md:w-1/2 space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-flare-bright" />
            Pilih Merchant QRIS Warung
          </h3>

          <div className="space-y-2">
            {MERCHANTS.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMerchant(m);
                  setPaymentDone(false);
                }}
                className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  selectedMerchant.id === m.id
                    ? "bg-flare-crimson/15 border-flare-crimson text-white shadow-flare-glow-sm"
                    : "bg-surface-card border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div>
                  <p className="text-sm font-bold">{m.name}</p>
                  <p className="text-xs text-slate-400">{m.item} • {m.location}</p>
                </div>
                <div className="text-right font-mono">
                  <p className="text-sm font-bold text-emerald-400">{formatIdr(m.priceIdr)}</p>
                  <p className="text-[10px] text-slate-400">≈ {(m.priceIdr / xrpIdrRate).toFixed(3)} FXRP</p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">NMID Merchant:</span>
              <span className="font-mono text-slate-200">{selectedMerchant.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Nominal Pembayaran:</span>
              <span className="font-mono font-bold text-white">{formatIdr(selectedMerchant.priceIdr)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Dipotong dari Saldo FXRP:</span>
              <span className="font-mono font-bold text-flare-bright">{fxrpNeeded.toFixed(4)} FXRP</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Scanner Card */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 relative">
          {/* Simulated QR Code Frame */}
          <div className="w-48 h-48 rounded-2xl bg-white p-3 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
            {isScanning ? (
              <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-flare-bright relative">
                <div className="absolute inset-x-0 h-1 bg-flare-bright shadow-flare-glow animate-scan-line" />
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-xs font-mono">Memindai QRIS...</span>
              </div>
            ) : paymentDone ? (
              <div className="w-full h-full bg-emerald-950 text-emerald-400 flex flex-col items-center justify-center p-2 text-center">
                <CheckCircle2 className="w-12 h-12 mb-1 animate-bounce" />
                <span className="text-xs font-bold text-white">Pembayaran Berhasil!</span>
                <span className="text-[10px] text-emerald-300 font-mono mt-1">Simulasi Sukses</span>
              </div>
            ) : (
              <div className="w-full h-full border-4 border-slate-900 flex flex-col items-center justify-center relative">
                {/* Dummy QR Blocks */}
                <QrCode className="w-36 h-36 text-slate-900" />
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              SIMULASI MERCHANT QRIS
            </span>
          </div>

          <button
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-flare hover:opacity-95 text-white font-extrabold text-xs shadow-flare-glow transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Simulasi...</span>
              </>
            ) : paymentDone ? (
              <>
                <RefreshCcw className="w-4 h-4" />
                <span>Simulasi Ulang Merchant Lain</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>Simulasikan Scan & Bayar QRIS</span>
              </>
            )}
          </button>

          {paymentDone && (
            <div className="mt-4 w-full p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-[11px] font-mono text-slate-300 space-y-1">
              <p className="text-emerald-400 font-bold">✓ Payment Intent Logged</p>
              <p className="truncate text-slate-400">Tx: {simulatedTxHash}</p>
            </div>
          )}
        </div>
      </div>

      {/* Flare Data Connector (FDC) Architecture Breakdown */}
      <div className="pt-6 border-t border-slate-800/80 space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-flare-bright" />
          Bagaimana FDC Verifikasi Finalitas QRIS (Desain Pasca-Hackathon)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-flare-bright font-bold text-[10px] block">STEP 1</span>
            <p className="font-semibold text-white mt-1">Pembayaran QRIS</p>
            <p className="text-[11px] text-slate-400 mt-1">Penerima bayar via saldo FXRP di warung merchant.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-flare-bright font-bold text-[10px] block">STEP 2</span>
            <p className="font-semibold text-white mt-1">PJP Settlement</p>
            <p className="text-[11px] text-slate-400 mt-1">PJP partner cairkan Rupiah ke rekening merchant.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-flare-bright font-bold text-[10px] block">STEP 3</span>
            <p className="font-semibold text-white mt-1">Attestasi FDC</p>
            <p className="text-[11px] text-slate-400 mt-1">Validator Flare FDC memverifikasi bukti settlement off-chain.</p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
            <span className="text-emerald-400 font-bold text-[10px] block">STEP 4</span>
            <p className="font-semibold text-white mt-1">Finalitas Trustless</p>
            <p className="text-[11px] text-slate-300 mt-1">Kontrak melepaskan FXRP tanpa perantara bank kustodian.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
