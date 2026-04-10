// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import SmoothScroll from "./components/ui/SmoothScroll";



/* ================= Fonts ================= */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KrishiAI | Smart Crop Yield Prediction & Farm Intelligence",
  description: "KrishiAI is an AI-powered agriculture platform that uses satellite data, weather insights, and machine learning to predict crop yield, monitor crop health, and provide smart farming recommendations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SmoothScroll />
        <Toaster richColors position="top-center" />
       {children}
      </body>
    </html>
  );
}
