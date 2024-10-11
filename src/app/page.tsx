"use client";

import { useEffect, useState } from "react";
import { User } from "next-auth";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { formatDate } from "@/utils/formatDate";
import styles from "./page.module.scss";

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();

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

  const goToProfile = (id: string) => {
    if (id) {
      router.push(`/profiles/${id}`);
    }
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error fetching users</p>}

      {users.map((user) => (
        <div key={user.id}>
          {user.posts?.map((post) => (
            <div
              key={post.id}
              className={styles.postsContainer}
              onClick={() => goToProfile(user.id ?? "")}
            >
              <div className={styles.singlePostContainer}>
                <Image
                  src={user.image ?? ""}
                  width={40}
                  height={40}
                  alt={user.name ?? ""}
                />
                <div>
                  <p>{user.name}</p>
                  <p>{post.content}</p>
                </div>
              </div>
              <div className={styles.postDate}>
                Created at: {formatDate(post.createdAt)}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
