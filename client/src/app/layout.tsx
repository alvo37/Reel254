import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reel254",
  description: "A platform for film enthusiasts to connect and share",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <head>
          <link rel="icon" href="/images/reel_favicon.png" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Reel254</title>
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Toaster position="bottom-right" />
          <div className="app-full-bleed">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  );
}
