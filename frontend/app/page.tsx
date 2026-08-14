"use client";

import Link from "next/link";
import { ArrowRight, ArrowRightLeft, LayoutDashboard, QrCode, Send } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { Reveal } from "@/components/Reveal";

const productRoutes = [
  { href: "/onboarding", index: "01", label: "Onboard", detail: "XRP to FTestXRP", icon: ArrowRightLeft },
  { href: "/send", index: "02", label: "Move", detail: "Send across Coston2", icon: Send },
  { href: "/merchant", index: "03", label: "Pay", detail: "IDR-priced merchant QR", icon: QrCode },
  { href: "/dashboard", index: "04", label: "Verify", detail: "Balance and receipts", icon: LayoutDashboard },
];

export default function Home() {
  return (
    <div className="page-enter pb-6">
      <section className="relative flex min-h-[720px] flex-col items-center justify-center overflow-hidden py-20 text-center sm:min-h-[790px]">
        <div aria-hidden="true" className="hero-signal-line absolute left-1/2 top-0 h-full w-px -translate-x-1/2" />
        <div aria-hidden="true" className="absolute left-1/2 top-[13%] h-[430px] w-[430px] -translate-x-1/2 rounded-full bg-flare-crimson/[0.11] blur-[110px] sm:h-[540px] sm:w-[540px]" />
        <BrandMark priority decorative className="brand-float absolute left-1/2 top-[10%] w-[300px] -translate-x-1/2 opacity-[0.13] blur-[0.2px] sm:w-[420px]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <Reveal>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-flare-crimson/25 bg-flare-crimson/[0.07] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-flare-light backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-flare-bright shadow-[0_0_10px_rgba(255,26,75,0.9)]" />
              Interoperable XRP, live on Coston2
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="text-balance text-5xl font-medium leading-[0.96] tracking-[-0.06em] text-white sm:text-7xl lg:text-[92px]">
              XRP, ready for
              <span className="block text-slate-500">the real world.</span>
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="mx-auto mt-7 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
              Onboard with FAssets. Move FXRP. Accept merchant payments with pricing and receipts anchored to Flare.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/onboarding" className="shine-button group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100 active:scale-[0.98]">
                Open the live rail
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.07]">
                View on-chain proof
              </Link>
            </div>
          </Reveal>
        </div>

        <Reveal variant="card" delay={300} className="relative z-10 mt-16 w-full max-w-5xl">
          <div className="overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#0c0d11]/85 p-2 shadow-[0_35px_100px_-48px_rgba(230,0,55,0.72)] backdrop-blur-2xl">
            <div className="grid gap-px overflow-hidden rounded-[18px] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">
              {productRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <Link key={route.href} href={route.href} className="group flex min-h-28 items-center gap-4 bg-[#0d0f14] px-5 py-5 text-left transition hover:bg-[#13151c]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-slate-400 transition group-hover:border-flare-crimson/40 group-hover:text-flare-light">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="font-mono text-[9px] text-slate-600">/{route.index}</span>
                      <span className="mt-1 block text-sm font-semibold text-white">{route.label}</span>
                      <span className="mt-1 block truncate text-[11px] text-slate-500">{route.detail}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <section className="grid gap-8 border-y border-white/[0.07] py-10 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-flare-light">Built for useful assets</p>
            <h2 className="mt-3 max-w-xl text-2xl font-medium tracking-[-0.03em] text-white sm:text-3xl">One asset rail. No custody layer.</h2>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] text-slate-500">
            <span><strong className="mr-2 text-white">FAssets</strong> onboarding</span>
            <span><strong className="mr-2 text-white">FTSO v2</strong> pricing</span>
            <span><strong className="mr-2 text-white">Coston2</strong> settlement proof</span>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
