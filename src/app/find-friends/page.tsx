"use client";

import { IUserProfile } from "@/types/entities";
import logger from "@/utils/logger";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import findFriendsStyles from "./find-friends.module.scss";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function FindFriends() {
  const hasFetchedRef = useRef(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [users, setUsers] = useState<IUserProfile[]>([]);

  const router = useRouter();

  const { data: session } = useSession({
    required: false,
  });

  const goToProfile = (id: string | undefined) => {
    if (id) {
      router.push(`/profiles/${id}`);
    }
  };

  useEffect(() => {
    async function fetchUsers() {
      if (isLoading || users.length || hasFetchedRef.current) {
        return;
      }

      try {
        hasFetchedRef.current = true;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const usersData = await response.json();
        setUsers(usersData);
      } catch (error: unknown) {
        const errorString = `Error fetching users. Error: ${error}`;
        logger.log(errorString);
        setError(errorString);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, [isLoading, users.length]);

  return (
    <div className={findFriendsStyles.findFriendsContainer}>
      {error
        ? "Error fetching users"
        : !isLoading &&
          hasFetchedRef.current &&
          users.map((userProfile: IUserProfile, index: number) => {
            if (session?.user.id === userProfile.id) {
              return;
            }

            return (
              <div
                key={index}
                className={findFriendsStyles.userProfileContainer}
                onClick={() => goToProfile(userProfile.id)}
              >
                <Image
                  className={"profileImage"}
                  src={userProfile.image}
                  width={40}
                  height={40}
                  alt={userProfile.name}
                />

                <div className={findFriendsStyles.userName}>
                  {userProfile.name}
                </div>
              </div>
            );
          })}
    </div>
  );
}

export default FindFriends;
