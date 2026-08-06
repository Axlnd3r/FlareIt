"use client";

import React, { useState } from "react";
import { RateDisplay } from "@/components/RateDisplay";
import { SendForm } from "@/components/SendForm";
import { type RateData } from "@/lib/api";

export default function SendPage() {
  const [currentRate, setCurrentRate] = useState<RateData | null>(null);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Kirim FXRP Instan</h1>
        <p className="text-sm text-slate-400 mt-1">
          Kirim dana remitansi ke Indonesia dengan kurs live FTSO v2 dan biaya mendekati nol.
        </p>
      </div>

      {/* Live Rate Display */}
      <RateDisplay onRateChange={setCurrentRate} compact />

      {/* Primary Remittance Form */}
      <SendForm />
    </div>
  );
}
