"use client";

import "./globals.css";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { ruRU } from '@clerk/localizations'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider localization={ruRU}>
      <html lang="ru" className="dark" suppressHydrationWarning={true}>
        <head>
          <title>Leadbee</title>
          <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔑</text></svg>" />
        </head>
        <body className="antialiased">
          <div className="flex h-screen">
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
