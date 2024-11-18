"use client";

import { useCallback, useEffect, useState } from "react";
// import { User } from "next-auth";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import Post from "./components/post";
import { IPost } from "@/types/entities";

export default function Home() {
  // const [users, setUsers] = useState<IUserProfile[]>([]);
  const [postsData, setPostsData] = useState<{
    posts: IPost[];
    paginated: boolean;
  }>({
    posts: [],
    paginated: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true); // To check if there are more posts to fetch

  // const router = useRouter();

  const memoizedFetchPosts = useCallback(
    async function fetchPosts() {
      if (isLoading || !hasMore) {
        return;
      }

      setError(false);
      setIsLoading(true);

      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL
          }/posts?paginated=true&limit=20${cursor ? `&cursor=${cursor}` : ""}`
        );
        // await fetch(`/api/post?userId=${userId}`)
        const data = await response.json();

        setPostsData((prevData) => {
          const newPosts = data.posts.filter(
            (newPost) =>
              !prevData.posts.some(
                (existingPost) => existingPost.id === newPost.id
              )
          );

          return {
            posts: [...prevData.posts, ...newPosts],
            paginated: data.paginated,
          };
        });

        setCursor(data.nextCursor); // Update the cursor
        setHasMore(data.hasMore); // Check if there are more posts
      } catch (error) {
        setError(true);
        console.error("Post fetching error", error);
      } finally {
        setIsLoading(false);
      }
    },
    [cursor, hasMore, isLoading]
  );

  useEffect(() => {
    // async function fetchUsers() {
    //   fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users`)
    //     // fetch("/api/profiles")
    //     .then((res) => res.json())
    //     .then((data) => setUsers(data))
    //     .catch((error) => {
    //       setError(true);
    //       console.error("Error fetching users:", error);
    //     });
    // }

    // fetchUsers();
    // setIsLoading(false);
    memoizedFetchPosts();
  }, [memoizedFetchPosts]);

  // console.log("Users data:", users);

  console.log("Posts data:", postsData);

  return (
    <div>
      <SkeletonTheme
        baseColor="var(--gray-alpha-100);"
        height={68}
        borderRadius={4}
      >
        {(isLoading || !postsData.posts.length) && (
          <Skeleton count={15} style={{ marginBottom: "20px" }} />
        )}

        {error && <p>Error fetching users</p>}

        {/* {!isLoading &&
          !error &&
          users.map((userProfile: IUserProfile) => (
            <div key={userProfile.id}>
              {userProfile.posts?.map((post, index) => (
                <Post key={index} userProfile={userProfile} post={post} />
              ))}
            </div>
          ))} */}

        {!isLoading &&
          !error &&
          postsData.posts.map((post: IPost) => (
            <Post key={post.id} userProfile={post.user} post={post} />
          ))}

        {hasMore && (
          <button onClick={memoizedFetchPosts} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load More"}
          </button>
        )}
      </SkeletonTheme>
    </div>
  );
}
