"use client";

import { MerchantPaymentQR } from "@/components/MerchantPaymentQR";

export default function MerchantPage() {
  return (
    <div className="page-enter mx-auto max-w-5xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-flare-bright">Use FXRP</p>
        <h1 className="mt-2 text-3xl font-bold text-white">FlareIt Merchant Payment</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Create an IDR-denominated invoice and pay the merchant directly with FTestXRP on Coston2.
          No custody layer, and every payment produces an on-chain receipt.
        </p>
      </header>
      <MerchantPaymentQR />
    </div>
  );
}
