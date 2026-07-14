import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/wireframe/Shell";

export const metadata: Metadata = {
  title: "Hempac Sales Engine — Wireframes (A1)",
  description: "Lo-fi wireframes for the Hempac Sport sales engine. Greyscale, static sample data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
