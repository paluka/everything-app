import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

// import { ISession, IToken } from "@/types/auth";

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID environment variable is not set.");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET environment variable is not set.");
}

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
  // Optional: Add a database or other configuration here
  // database: process.env.DATABASE_URL,
  session: {
    strategy: "jwt", // Use JWT for session management
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    // encryption: true,
  },
  // pages: {
  //   signIn: "/profile",
  //   signOut: "/login",
  //   // error: "/error",
  //   // verifyRequest: "/verify-request",
  //   // newUser: "/new-user",
  // },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // console.log("redirect callback", url, baseUrl);
      // If the URL is the sign-in page, redirect to the user's profile
      if (url === "/login") {
        // console.log("redirect callback", url, baseUrl);
        const session = await getSession();
        if (session?.user?.id) {
          // console.log("redirect callback", session.user.id);
          // Redirect to the user's profile page
          return `${baseUrl}/profiles/${session.user.id}`;
        }
      }
      return baseUrl;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async session({ session, token, user }) {
      // console.log("Session callback:", { session, token, user });

      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async jwt({ token, user, account, profile }) {
      // console.log("JWT callback:", { token, user, account, profile });

      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
  },
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
