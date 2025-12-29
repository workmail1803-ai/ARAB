import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tookan | Enterprise Delivery Management System",
  description:
    "Automate Order Management, Delivery Dispatch, Real-Time Delivery Tracking & Marketing Campaigns to Scale your Business with Tookan.",
  openGraph: {
    title: "Tookan | Enterprise Delivery Management System",
    description:
      "Automate Order Management, Delivery Dispatch, Real-Time Delivery Tracking & Marketing Campaigns to Scale your Business with Tookan.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
