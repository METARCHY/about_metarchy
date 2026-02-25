import type { Metadata } from "next";
import { SocketProvider } from "@/contexts/SocketContext";
import PrivyProviderWrapper from "@/components/PrivyProviderWrapper";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Metarchy",
  description: "Web3 Turn-style Strategy Game",
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
        <PrivyProviderWrapper>
          <SocketProvider>
            {children}
          </SocketProvider>
        </PrivyProviderWrapper>
      </body>
    </html>
  );
}
