"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { fetchRate, formatIdr, type RateData } from "@/lib/api";

interface RateDisplayProps {
  onRateChange?: (rateData: RateData) => void;
  compact?: boolean;
}

export function RateDisplay({ onRateChange, compact = false }: RateDisplayProps) {
  const [rate, setRate] = useState<RateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRate();
      setRate(data);
      setError(null);
      onRateChange?.(data);
    } catch (reason) {
      setRate(null);
      setError(reason instanceof Error ? reason.message : "Rate unavailable");
    } finally {
      setLoading(false);
    }
  }, [onRateChange]);

  useEffect(() => {
    void loadRate();
    const interval = window.setInterval(() => void loadRate(), 30_000);
    return () => window.clearInterval(interval);
  }, [loadRate]);

  if (compact) {
    return (
      <div className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-slate-800 bg-surface-card p-3 text-xs">
        {rate ? (
          <div className="flex min-w-0 items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${rate.ftsoFeedFresh ? "bg-emerald-400" : "bg-amber-400"}`} />
            <span className="truncate text-slate-300">
              1 FXRP = ${rate.xrpUsd.toFixed(4)} = {formatIdr(rate.xrpIdr)}
            </span>
          </div>
        ) : (
          <span className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="h-4 w-4" /> {error || "Loading verified rate..."}
          </span>
        )}
        <button onClick={() => void loadRate()} disabled={loading} className="p-2 text-slate-400 hover:text-white" title="Refresh rate">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-surface-card p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-white">Payment rate</h2>
            <p className="text-xs text-slate-400">On-chain XRP/USD with off-chain IDR reference data</p>
          </div>
        </div>
        <button onClick={() => void loadRate()} disabled={loading} className="p-2 text-slate-400 hover:text-white" title="Refresh rate">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && !rate ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
          Verified rate data is unavailable. IDR estimates are disabled. {error}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          <Metric label="XRP / USD" value={rate ? `$${rate.xrpUsd.toFixed(6)}` : "..."} source="FTSO v2" verified />
          <Metric label="USD / IDR" value={rate ? formatIdr(rate.usdIdr) : "..."} source={rate?.sources.usdIdr || "CoinGecko"} />
          <Metric label="FXRP / IDR" value={rate ? formatIdr(rate.xrpIdr) : "..."} source="Derived, no markup" />
        </div>
      )}
    </section>
  );
}

function Metric({ label, value, source, verified = false }: { label: string; value: string; source: string; verified?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{label}</span>
        {verified && <ShieldCheck className="h-4 w-4 text-emerald-400" />}
      </div>
      <p className="mt-2 font-mono text-xl font-bold text-white">{value}</p>
      <p className="mt-1 truncate text-[10px] text-slate-500">{source}</p>
    </div>
  );
}
