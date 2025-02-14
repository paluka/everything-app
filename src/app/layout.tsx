// "use client";

import type { Metadata } from "next";

import { getServerSession } from "next-auth";
import localFont from "next/font/local";

import "./globals.scss";
import layoutStyles from "./layout.module.scss";
import Navigation from "./components/navigation/";
import SessionProviderWrapper from "./components/sessionProviderWrapper";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { SessionUserProfileProvider } from "./hooks/useSessionUserProfileContext";
import PasswordPrompt from "./components/passwordPrompt";

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
        <div className={layoutStyles.page}>
          <h1 className={layoutStyles.header}>Everything App</h1>
          <Navigation session={session} />
          <SessionProviderWrapper session={session}>
            <SessionUserProfileProvider session={session}>
              <PasswordPrompt />
              <main className={layoutStyles.main}>{children}</main>
            </SessionUserProfileProvider>
          </SessionProviderWrapper>
        </div>
      </body>
    </html>
  );
}
