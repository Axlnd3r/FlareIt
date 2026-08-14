"use client";

import { RateDisplay } from "@/components/RateDisplay";
import { SendForm } from "@/components/SendForm";

export default function SendPage() {
  return (
    <div className="page-enter mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Send FXRP</h1>
        <p className="mt-1 text-sm text-slate-400">Transfer FTestXRP through FlareIt and verify the receipt on Coston2.</p>
      </header>
      <RateDisplay compact />
      <SendForm />
    </div>
  );
}
