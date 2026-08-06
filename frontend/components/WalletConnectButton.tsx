"use client";

import React, { useState } from "react";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { Wallet, LogOut, ChevronDown, ExternalLink } from "lucide-react";
import { shortenAddress } from "@/lib/api";
import { EXPLORER_BASE } from "@/lib/contracts";

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [showMenu, setShowMenu] = useState(false);

  const { data: balance } = useBalance({
    address,
  });

  const formattedBalance = balance
    ? Number(formatUnits(balance.value, balance.decimals)).toFixed(3)
    : "0.000";

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-surface-glass border border-slate-800 hover:border-flare/40 transition-all text-sm font-medium shadow-card-shadow"
        >
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-flare-crimson/15 text-flare-light text-xs border border-flare-crimson/30">
            <span className="w-1.5 h-1.5 rounded-full bg-flare-bright animate-pulse" />
            <span>Coston2</span>
          </div>

          <span className="text-slate-200 font-mono font-medium">
            {shortenAddress(address)}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showMenu ? "rotate-180" : ""}`} />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface border border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <p className="text-xs text-slate-400">Connected Wallet</p>
                <p className="text-sm font-mono font-semibold text-white">{shortenAddress(address, 6)}</p>
              </div>
              <a
                href={`${EXPLORER_BASE}/address/${address}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg text-slate-400 hover:text-flare-light hover:bg-slate-800/60 transition"
                title="View on Explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="py-3">
              <p className="text-xs text-slate-400">Saldo Gas Native (C2FLR)</p>
              <p className="text-base font-semibold text-slate-100">
                {balance ? `${formattedBalance} ${balance.symbol}` : "Loading..."}
              </p>
            </div>

            <button
              onClick={() => {
                disconnect();
                setShowMenu(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-flare text-white font-semibold text-sm shadow-flare-glow hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
        >
          <Wallet className="w-4 h-4" />
          <span>{isPending ? "Connecting..." : "Connect Wallet"}</span>
        </button>
      ))}
    </div>
  );
}
