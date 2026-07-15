import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Fraunces } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/crm/Shell";
import { PrototypeProvider } from "@/components/crm/store";
import { StatePreviewControl } from "@/components/crm/PageState";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Hempac Sport · SynCRM",
  description: "School-sales CRM + WhatsApp lead engine for Hempac Sport, by LayerSync.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${fraunces.variable}`}>
      <body className="font-sans">
        <PrototypeProvider>
          <Shell>{children}</Shell>
          <StatePreviewControl />
        </PrototypeProvider>
      </body>
    </html>
  );
}
