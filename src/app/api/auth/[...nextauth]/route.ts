import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions, Session, Token } from "next-auth";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

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
  pages: {
    signIn: "/profile",
    signOut: "/login",
    // error: "/error",
    // verifyRequest: "/verify-request",
    // newUser: "/new-user",
  },
  callbacks: {
    async session({ session, token }) {
      console.log("session callback", session, token);
      // Add custom properties to the session object
      if (token) {
        (session as Session).user.id = (token as Token).id;
      }
      return session;
    },
    async jwt({ token, user }) {
      console.log("jwt callback", token, user);
      // Add custom properties to the token object
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    // async redirect({ url, baseUrl }) {
    //   console.log("redirect callback", url, baseUrl);
    //   // Allows relative callback URLs
    //   if (url.startsWith("/")) return `${baseUrl}${url}`;
    //   // Allows callback URLs on the same origin
    //   else if (new URL(url).origin === baseUrl) return url;
    //   return baseUrl;
    // },
  },
};

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
