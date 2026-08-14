import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Payment | FlareIt",
  description: "Create and settle IDR-denominated merchant invoices with FTestXRP on Coston2.",
};

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
