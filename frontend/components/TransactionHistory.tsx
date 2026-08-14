"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { AlertCircle, ArrowDownLeft, ArrowUpRight, ExternalLink, History, RefreshCw, Search } from "lucide-react";
import { fetchTransactions, formatIdr, formatRelativeTime, shortenAddress, type Transaction } from "@/lib/api";
import { getTxExplorerUrl } from "@/lib/contracts";

interface TransactionHistoryProps {
  customAddress?: string;
  xrpIdrRate?: number;
}

export function TransactionHistory({ customAddress, xrpIdrRate }: TransactionHistoryProps) {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchAddress, setSearchAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeAddress = searchAddress || customAddress || address;

  const loadHistory = useCallback(async () => {
    if (!activeAddress) return;
    setLoading(true);
    try {
      const response = await fetchTransactions(activeAddress);
      setTransactions(response.transactions);
      setError(null);
    } catch (reason) {
      setTransactions([]);
      setError(reason instanceof Error ? reason.message : "History unavailable");
    } finally {
      setLoading(false);
    }
  }, [activeAddress]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  return (
    <section className="rounded-lg border border-slate-800 bg-surface-card p-5">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-white"><History className="h-5 w-5 text-flare-bright" />On-chain history</h2>
          <p className="mt-1 text-xs text-slate-400">Indexed from SendContract.Sent events on Coston2</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input value={searchAddress} onChange={(event) => setSearchAddress(event.target.value)} placeholder="0x address" className="w-52 rounded-lg border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 font-mono text-xs text-white" />
          </div>
          <button onClick={() => void loadHistory()} disabled={loading} className="p-2 text-slate-400 hover:text-white" title="Refresh history">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200"><AlertCircle className="h-4 w-4" />{error}</div>
      ) : !activeAddress ? (
        <p className="py-10 text-center text-sm text-slate-500">Connect a wallet or enter an address.</p>
      ) : transactions.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No transfer events found for this address.</p>
      ) : (
        <div className="mt-4 divide-y divide-slate-800">
          {transactions.map((transaction) => {
            const received = transaction.direction === "received";
            const amount = Number(transaction.amountFxrp);
            return (
              <div key={`${transaction.txHash}-${transaction.id}`} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  {received ? <ArrowDownLeft className="h-5 w-5 text-emerald-400" /> : <ArrowUpRight className="h-5 w-5 text-flare-bright" />}
                  <div>
                    <p className="text-sm font-semibold text-white">{received ? "From" : "To"} {shortenAddress(received ? transaction.sender : transaction.recipient)}</p>
                    <p className="text-xs text-slate-500">{formatRelativeTime(transaction.createdAt)} · block {transaction.blockNumber ?? "pending"}</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-mono text-sm font-bold text-white">{received ? "+" : "-"}{amount.toFixed(6)} FXRP</p>
                  {xrpIdrRate && <p className="text-xs text-slate-500">Est. {formatIdr(amount * xrpIdrRate)}</p>}
                  <a href={getTxExplorerUrl(transaction.txHash)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-flare-bright">Explorer <ExternalLink className="h-3 w-3" /></a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
