"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import logger from "@/utils/logger";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { IUserProfile } from "@/types/entities";

interface UserContextType {
  sessionUserProfile: IUserProfile | null;
  setSessionUserProfile: (sessionUserProfile: IUserProfile | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useSessionUserProfile = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

function SessionProviderWrapper({
  children,
  session, // : initialSession,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const hasFetchedRef = useRef(false);

  const [sessionUserProfile, setSessionUserProfile] =
    useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [error, setError] = useState<string>("");

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

  useEffect(() => {
    async function getSessionUserProfile() {
      if (
        !session?.user.id ||
        isLoading ||
        sessionUserProfile ||
        hasFetchedRef.current
      ) {
        return;
      }

      hasFetchedRef.current = true;
      setIsLoading(true);
      // setError("");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${session.user.id}`
        );
        // const response = await fetch(`/api/profiles/${userIdString}`);
        if (!response.ok) {
          throw new Error("Failed to fetch session user profile");
        }
        const userProfileData = await response.json();
        setSessionUserProfile(userProfileData);
        logger.log("User data:", userProfileData);
      } catch (error) {
        const errorString = `Failed to fetch profile: ${error}`;
        // setError(errorString);
        logger.error(errorString);
      } finally {
        setIsLoading(false);
      }
    }
    if (session) {
      getSessionUserProfile();
    }
  }, [isLoading, session, sessionUserProfile]);

  logger.log("Session Provider's session", { session });
  return (
    <SessionProvider session={session}>
      <UserContext.Provider
        value={{ sessionUserProfile, setSessionUserProfile }}
      >
        {children}
      </UserContext.Provider>
    </SessionProvider>
  );
}

export default SessionProviderWrapper;
