"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DM_Sans, Geist, Geist_Mono } from "next/font/google";
import { ApiProviderWrapper } from "./components/providers/ApiProvider";
import { cn } from "./components/utils/utils";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        dmSans.variable,
      )}
    >
      <body className="min-h-full flex flex-col  p-4">
        <QueryClientProvider client={queryClient}>
          <ApiProviderWrapper>{children}</ApiProviderWrapper>
        </QueryClientProvider>
      </body>
    </html>
  );
}
