"use client";

import React from "react";
import { QrCode, Cpu, ShieldCheck, FileCode, CheckCircle2 } from "lucide-react";
import { QrisScanSimulator } from "@/components/QrisScanSimulator";

export default function QrisPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
          <QrCode className="w-3.5 h-3.5" />
          <span>Fase 4 Stretch Feature — FDC Attestation Design</span>
        </div>

        <h1 className="text-3xl font-extrabold text-white">
          Simulasi Pembayaran QRIS Merchant
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Demonstrasi UX bagaimana keluarga penerima dapat membelanjakan saldo FXRP langsung di warung/merchant lokal Indonesia via QRIS.
        </p>
      </div>

      {/* Interactive QRIS Scanner */}
      <QrisScanSimulator />

      {/* FDC Attestation Architecture Deep-Dive Document */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-flare-crimson/15 text-flare-bright border border-flare-crimson/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Spesifikasi Desain Flare Data Connector (FDC)
            </h3>
            <p className="text-xs text-slate-400">
              Mekanisme verifikasi attestasi off-chain settlement QRIS ke smart contract on-chain Flare
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Dalam aplikasi dunia nyata pasca-hackathon, integrasi QRIS memerlukan kerjasama dengan Penyelenggara Jasa Pembayaran (PJP) berlisensi Bank Indonesia (seperti DANA, Midtrans, atau LinkAja).
          </p>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-flare-bright flex items-center gap-1.5">
              <FileCode className="w-4 h-4" /> Alur Kontrak `QrisSettlement.sol`
            </h4>
            <pre className="font-mono text-[11px] text-slate-300 bg-slate-900 p-3 rounded-xl overflow-x-auto">
{`// Contrak recording intent di Coston2:
event PaymentIntent(address indexed payer, string merchantId, uint256 amount, uint256 timestamp);

function recordPaymentIntent(string calldata merchantId, uint256 amount) external returns (bytes32);`}
            </pre>
          </div>

          <ul className="space-y-2 list-disc list-inside text-slate-400 pl-1">
            <li><strong>Proof of Off-Chain Payment:</strong> FDC Validator membaca API callback dari PJP bahwa dana IDR telah diterima merchant.</li>
            <li><strong>State Finality:</strong> Bukti dikirim ke Flare via Merkle Tree attestation secara decentralized.</li>
            <li><strong>Zero Trust Middleman:</strong> Tidak ada perantara tunggal yang dapat memalsukan konfirmasi settlement.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
