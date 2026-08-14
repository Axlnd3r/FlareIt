import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { AmbientBackground } from "@/components/AmbientBackground";
import { BrandMark } from "@/components/BrandMark";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "FlareIt — Put XRP to Work on Flare",
  description: "Onboard XRP through FAssets, move FXRP, and pay merchants with verifiable Coston2 receipts.",
  icons: { icon: "/brand/flareit-mark.png", apple: "/brand/flareit-mark.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen flex-col bg-background text-slate-100 antialiased">
        <Providers>
          <AmbientBackground />
          <Navbar />

          <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>

          <footer className="relative z-10 mt-16 border-t border-slate-800/80 bg-background/80 py-8 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-400 sm:px-6 md:flex-row lg:px-8">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#090a0e]">
                  <BrandMark className="h-5 w-5 object-contain" />
                </div>
                <span className="font-bold text-white">FlareIt</span>
                <span>• Flare Summer Signal Hackathon Submission</span>
              </div>

              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="h-4 w-4" /> Coston2 Testnet (Chain ID 114)
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
