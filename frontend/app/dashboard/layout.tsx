import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recipient Dashboard | FlareIt",
  description: "View FTestXRP balances and verified Coston2 transfer history.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
