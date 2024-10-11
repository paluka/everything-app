"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
// import { useState, useEffect } from "react";

function SessionProviderWrapper({
  children,
  session, // : initialSession,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  //   console.log("SessionProviderWrapper session:", session);
  //   const [cachedSession, setCachedSession] = useState(initialSession);

  //   useEffect(() => {
  //     if (initialSession) {
  //       // Cache the session if it exists
  //       localStorage.setItem("session", JSON.stringify(initialSession));
  //       setCachedSession(initialSession);
  //     } else if (!initialSession && cachedSession) {
  //       // Keep the cached session if no new session is provided from the server
  //       const storedSession = localStorage.getItem("session");
  //       if (storedSession) {
  //         setCachedSession(JSON.parse(storedSession));
  //       }
  //     }
  //   }, [initialSession, cachedSession]);

  //   <SessionProvider session={cachedSession || initialSession}>
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

export default SessionProviderWrapper;
