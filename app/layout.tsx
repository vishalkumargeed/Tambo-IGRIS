import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import Favicon from "./components/Favicon";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sentinel AI",
  description: "Github & User Experience Designer",
  icons: {
    icon: "/icons8-github-16.png",
    shortcut: "/icons8-github-16.png",
    apple: "/icons8-github-16.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} font-sans antialiased`}
      > 
        <Favicon />
    <div className="font-heading tracking-tight">

    
        <SessionProvider>
          {children}
        </SessionProvider>
     
        <Analytics />
        </div>
      </body>
    </html>
  );
}
