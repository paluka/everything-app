"use client";

import { IUserProfile } from "@/types/entities";
import logger from "@/utils/logger";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Session } from "next-auth";

interface SessionUserProfileContextType {
  sessionUserProfile: IUserProfile | null;
  setSessionUserProfile: Dispatch<SetStateAction<IUserProfile | null>>;
}

const SessionUserProfileContext = createContext<
  SessionUserProfileContextType | undefined
>(undefined);

export const useSessionUserProfileContext = () => {
  const context = useContext(SessionUserProfileContext);

  if (!context) {
    throw new Error(
      "useSessionUserProfile must be used within a SessionUserProfileProvider"
    );
  }
  return context;
};

export function SessionUserProfileProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const hasFetchedRef = useRef(false);

  const [sessionUserProfile, setSessionUserProfile] =
    useState<IUserProfile | null>(null);
  // const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getSessionUserProfile() {
      if (
        !session?.user.id ||
        // isLoading ||
        sessionUserProfile ||
        hasFetchedRef.current
      ) {
        return;
      }

      hasFetchedRef.current = true;
      // setIsLoading(true);
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
        logger.log(
          "User data in session user profile context:",
          userProfileData
        );
      } catch (error) {
        const errorString = `Failed to fetch profile: ${error}`;
        // setError(errorString);
        logger.error(errorString);
      } finally {
        // setIsLoading(false);
      }
    }
    if (session) {
      getSessionUserProfile();
    }
  }, [session, sessionUserProfile]);

  return (
    <SessionUserProfileContext.Provider
      value={{ sessionUserProfile, setSessionUserProfile }}
    >
      {children}
    </SessionUserProfileContext.Provider>
  );
}
