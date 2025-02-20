import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/Components/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import MobileNav from './Components/Navigations/MobileNav'
import { VideoPlayerProvider } from '@/contexts/VideoPlayerContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <VideoPlayerProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </VideoPlayerProvider>
        <SpeedInsights />
        <MobileNav />
      </body>
    </html>
  );
}
