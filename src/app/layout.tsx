// "use client";

import type { Metadata } from "next";
// import { SessionProvider } from "next-auth/react";

import { getServerSession } from "next-auth";
import localFont from "next/font/local";

import "./globals.scss";
import pageStyles from "./page.module.scss";
import Navigation from "./components/navigation/";
import SessionProviderWrapper from "./components/sessionProviderWrapper";
import { authOptions } from "./api/auth/[...nextauth]/route";

const geistSans = localFont({
  src: "../../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Everything App",
  description: "The app that does everything",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <title>Everything App</title>
        <link rel="icon" href="/favicon.ico" />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className={pageStyles.page}>
          <h1 className={pageStyles.header}>Everything App</h1>
          <Navigation session={session} />
          <SessionProviderWrapper session={session}>
            <main className={pageStyles.main}>{children}</main>
          </SessionProviderWrapper>
        </div>
      </body>
    </html>
  );
}
