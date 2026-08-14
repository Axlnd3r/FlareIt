import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send FXRP | FlareIt",
  description: "Send FTestXRP on Coston2 and verify the on-chain receipt.",
};

export default function SendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
