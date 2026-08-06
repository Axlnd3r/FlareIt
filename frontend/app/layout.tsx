import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Flame, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "FlareIt — Trustless FXRP & FTSO v2 Remittance Rail",
  description: "Cross-border remittance for Indonesian TKI powered by FXRP & FTSO v2 real-time price feeds on Flare Network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="bg-background text-slate-100 min-h-screen flex flex-col antialiased">
        <Providers>
          <Navbar />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          <footer className="border-t border-slate-800/80 bg-surface-glass py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-flare flex items-center justify-center">
                  <Flame className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white">FlareIt</span>
                <span>• Flare Summer Signal Hackathon Submission</span>
              </div>

              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" /> Coston2 Testnet (Chain ID 114)
                </span>
                <span className="text-slate-500">FTSO v2 Enshrined Feeds</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
