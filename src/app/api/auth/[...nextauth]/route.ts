import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

// import { ISession, IToken } from "@/types/auth";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  debug: true,
  // Optional: Add a database or other configuration here
  // database: process.env.DATABASE_URL,
  session: {
    strategy: "jwt", // Use JWT for session management
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
      console.log("redirect callback", url, baseUrl);
      // If the URL is the sign-in page, redirect to the user's profile
      if (url === "/login") {
        console.log("redirect callback", url, baseUrl);
        const session = await getSession();
        if (session?.user?.id) {
          console.log("redirect callback", session.user.id);
          // Redirect to the user's profile page
          return `${baseUrl}/profiles/${session.user.id}`;
        }
      }
      return baseUrl;
    },
    async session({ session, token, user }) {
      console.log("Session callback:", { session, token, user });

      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      console.log("JWT callback:", { token, user, account, profile });

      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
  },
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
