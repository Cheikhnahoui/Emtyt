import type { Metadata } from "next";
import { Tajawal, Reem_Kufi } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({ subsets: ["arabic", "latin"], weight: ["400", "500", "700"], variable: "--font-tajawal" });
const reem = Reem_Kufi({ subsets: ["arabic", "latin"], variable: "--font-reem" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Emteyt | ملاحف وأزياء نسائية موريتانية", template: "%s | Emteyt" },
  description: "متجر Emteyt: أجمل الملاحف الموريتانية والأزياء النسائية التقليدية والعصرية والإكسسوارات.",
  openGraph: { siteName: "Emteyt", locale: "ar_MR", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${reem.variable}`}>
      <body>{children}</body>
    </html>
  );
}
