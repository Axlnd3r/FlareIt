"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Send, LayoutDashboard, QrCode, ArrowRightLeft } from "lucide-react";
import { WalletConnectButton } from "./WalletConnectButton";
import { BrandMark } from "./BrandMark";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/onboarding", label: "Mint FXRP", icon: ArrowRightLeft },
    { href: "/send", label: "Send FXRP", icon: Send },
    { href: "/dashboard", label: "Recipient", icon: LayoutDashboard },
    { href: "/merchant", label: "Merchant", icon: QrCode, badge: "Coston2" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-2 pt-2 sm:px-4">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-white/[0.08] bg-background/80 px-3 shadow-[0_12px_45px_-28px_rgba(230,0,55,0.65)] backdrop-blur-2xl sm:px-5">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#090a0e] shadow-flare-glow-sm transition-transform duration-300 group-hover:scale-105">
            <BrandMark priority className="h-8 w-8 object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight text-white">Flare</span>
              <span className="text-xl font-extrabold tracking-tight text-flare-bright">It</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
              Interoperable asset rail
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.025] p-1 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-flare text-white shadow-flare-glow-sm"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100"
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
      <nav className="mx-auto mt-1 flex max-w-7xl gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-background/85 px-2 py-2 backdrop-blur-2xl md:hidden">
        {navItems.filter((item) => item.href !== "/").map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors ${isActive ? "bg-flare-crimson text-white shadow-flare-glow-sm" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"}`}>
              {Icon && <Icon className="h-3.5 w-3.5" />}{item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
