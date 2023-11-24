import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";

import "./globals.css";
import Providers from "./Provider";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PostPulse",
  description: "A centralized hub for diverse discussions on trending topics.",
};

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-white text-slate-900 antialiased light",
        inter.className
      )}
    >
      <NextTopLoader
      color="#333333"
       />
      <body className="min-h-screen pt-12 bg-slate-50 antialiased">
        <Providers>
          <Navbar />
          {authModal}

          <ul className="container max-w-7xl mx-auto h-full pt-12">
            {children}
          </ul>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
