"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Send, LayoutDashboard, QrCode, ArrowRightLeft } from "lucide-react";
import { WalletConnectButton } from "./WalletConnectButton";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Beranda" },
    { href: "/onboarding", label: "Mint FXRP", icon: ArrowRightLeft },
    { href: "/send", label: "Kirim Remitansi", icon: Send },
    { href: "/dashboard", label: "Dashboard Penerima", icon: LayoutDashboard },
    { href: "/qris", label: "Simulasi QRIS", icon: QrCode, badge: "FDC Demo" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-flare flex items-center justify-center shadow-flare-glow group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white">Flare</span>
              <span className="text-xl font-extrabold tracking-tight text-flare-bright">It</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
              FXRP Remittance Rail
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-surface-glass border border-slate-800/60">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-flare text-white shadow-flare-glow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Wallet */}
        <div className="flex items-center gap-3">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
