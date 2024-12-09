"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import Post from "./components/post";
import { IPost } from "@/types/entities";
import { useSession } from "next-auth/react";
import { useDeletePost } from "./hooks/useDeletePost";
import logger from "@/utils/logger";

export default function Home() {
  const [postsData, setPostsData] = useState<{
    posts: IPost[];
    paginated: boolean;
  }>({
    posts: [],
    paginated: false,
  });
  const isFetchingRef = useRef(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true); // To check if there are more posts to fetch

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    post: IPost | null;
  } | null>(null);

  const {
    deletePost,
    deletedPostId,
    setDeletedPostId,
    setHasFetched: setHasDeleteFetched,
  } = useDeletePost();

  const { data: session } = useSession({
    required: false,
  });

  useEffect(() => {
    if (deletedPostId) {
      setPostsData({
        ...postsData,
        posts: postsData.posts.filter((post) => post.id != deletedPostId),
      });

      setDeletedPostId("");
      setHasDeleteFetched(false);
    }
  }, [
    deletedPostId,
    setDeletedPostId,
    setHasDeleteFetched,
    postsData.posts,
    postsData,
  ]);

  const memoizedFetchPosts = useCallback(
    async function fetchPosts() {
      if (isLoading || !hasMore || isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      setError("");
      setIsLoading(true);

      try {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BACKEND_URL
          }/posts?paginated=true&limit=20${cursor ? `&cursor=${cursor}` : ""}`
        );
        // await fetch(`/api/post?userId=${userId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const newPostsData = await response.json();

        setPostsData((prevData) => {
          const newPosts = newPostsData.posts.filter(
            (newPost) =>
              !prevData.posts.some(
                (existingPost) => existingPost.id === newPost.id
              )
          );

          return {
            posts: [...prevData.posts, ...newPosts],
            paginated: newPostsData.paginated,
          };
        });

        setCursor(newPostsData.nextCursor); // Update the cursor
        setHasMore(newPostsData.hasMore); // Check if there are more posts
        setHasFetched(true);

        logger.log("New posts data:", newPostsData);
      } catch (error) {
        setError(`Post fetching error: ${error}`);
        console.error("Post fetching error", error);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [cursor, hasMore, isLoading]
  );

  useEffect(() => {
    memoizedFetchPosts();
  }, [memoizedFetchPosts]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);

    if (contextMenu) {
      document.addEventListener("click", handleClick);
      document.addEventListener("contextmenu", handleClick);

      return () => {
        document.removeEventListener("click", handleClick);
        document.removeEventListener("contextmenu", handleClick);
      };
    }
  }, [contextMenu]);

  return (
    <div>
      <SkeletonTheme
        baseColor="var(--gray-alpha-100);"
        height={68}
        borderRadius={4}
      >
        {(isLoading || !hasFetched) && (
          <Skeleton count={15} style={{ marginBottom: "20px" }} />
        )}

        {error && <p>{error}</p>}

        {!isLoading &&
          !error &&
          hasFetched &&
          ((postsData.posts.length &&
            postsData.posts.map((post: IPost) => (
              <Post
                key={post.id}
                userProfile={post.user}
                post={post}
                contextMenu={contextMenu}
                setContextMenu={setContextMenu}
                userIsProfileOwner={session?.user?.id == post.userId}
                deletePost={deletePost}
              />
            ))) ||
            "Create your first post!")}

        {hasMore && (
          <button onClick={memoizedFetchPosts} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load More"}
          </button>
        )}
      </SkeletonTheme>
    </div>
  );
}
