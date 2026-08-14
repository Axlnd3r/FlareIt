import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mint FXRP | FlareIt",
  description: "Mint FTestXRP on Coston2 from an XRP Ledger Testnet payment.",
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
