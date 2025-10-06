import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import Head from "next/head"
import { Providers } from './providers';
import { Toaster } from '../components/ui/sonner';



const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Neural Creator - Social App for Artists",
  description: "A blockchain-based platform for artists, musicians, and video creators to share their content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
          <Toaster />

        </Providers>

      </body>
    </html>
  );
}
