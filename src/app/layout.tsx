import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/app/Components/AuthProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import MobileNav from './Components/Navigations/MobileNav'
import { VideoPlayerProvider } from '@/contexts/VideoPlayerContext';
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sow Amadou | Portfolio",
  description: "Un portfolio moderne inspiré de l'interface de Twitter, avec un design épuré et une expérience utilisateur optimisée.",
  metadataBase: new URL('https://sowamadou.com'),
  icons: {
    icon: [
      { url: "https://cdn.sowamadou.com/portfolio-media/logo-Portfolio.svg" },
      { url: "/favicon.ico" }
    ],
    apple: [
      { url: "https://cdn.sowamadou.com/portfolio-media/logo-Portfolio.svg" }
    ],
    shortcut: [
      { url: "https://cdn.sowamadou.com/portfolio-media/logo-Portfolio.svg" }
    ]
  },
  openGraph: {
    title: "Sow Amadou | Portfolio",
    description: "Un portfolio moderne inspiré de l'interface de Twitter, avec un design épuré et une expérience utilisateur optimisée.",
    images: [
      {
        url: "https://cdn.sowamadou.com/portfolio-media/portfolio-twitter.png",
        width: 1200,
        height: 630,
        alt: "Portfolio Sow Amadou",
      },
    ],
    type: "website",
    siteName: "Portfolio Sow Amadou",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sow Amadou | Portfolio",
    description: "Un portfolio moderne inspiré de l'interface de Twitter, avec un design épuré et une expérience utilisateur optimisée.",
    images: ["https://cdn.sowamadou.com/portfolio-media/portfolio-twitter.png"],
  },
  other: {
    "discord:image": "https://cdn.sowamadou.com/portfolio-media/portfolio-twitter.png",
    "theme-color": "#000000",
    "linkedin:author": "sow-amadou1",
    "linkedin:url": "https://www.linkedin.com/in/sow-amadou1",
    "article:author": "Sow Amadou",
    "article:published_time": new Date().toISOString(),
    "og:author": "Sow Amadou",
    "og:updated_time": new Date().toISOString(),
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="https://cdn.sowamadou.com/portfolio-media/logo-Portfolio.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="https://cdn.sowamadou.com/portfolio-media/logo-Portfolio.svg" />
        <Script id="hydration-fix">{`
          // Supprimer les attributs ajoutés par les extensions
          document.documentElement.removeAttribute('data-lt-installed');
        `}</Script>
      </head>
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
