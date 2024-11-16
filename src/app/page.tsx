"use client";

import { useEffect, useState } from "react";
import { User } from "next-auth";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import Post from "./components/post";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  // const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    setError(false);
    setIsLoading(true);

    async function fetchUsers() {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`)
        // fetch("/api/profiles")
        .then((res) => res.json())
        .then((data) => setUsers(data))
        .catch((error) => {
          setError(true);
          console.error("Error fetching users:", error);
        });
    }

    fetchUsers();
    setIsLoading(false);
  }, [isLoading, setIsLoading, setError]);

  return (
    <div>
      <SkeletonTheme
        baseColor="var(--gray-alpha-100);"
        height={68}
        borderRadius={4}
      >
        {(isLoading || !users.length) && (
          <Skeleton count={5} style={{ marginBottom: "20px" }} />
        )}

        {error && <p>Error fetching users</p>}

        {!isLoading &&
          !error &&
          users.map((user) => (
            <div key={user.id}>
              {user.posts?.map((post, index) => (
                <Post key={index} user={user} post={post} />
              ))}
            </div>
          ))}
      </SkeletonTheme>
    </div>
  );
}
