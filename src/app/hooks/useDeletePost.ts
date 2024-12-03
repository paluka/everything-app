import { useState } from "react";

export function useDeletePost() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasFetched, setHasFetched] = useState<boolean>(false);
  const [deletedPostId, setDeletedPostId] = useState<string>("");

  async function deletePost(postId: string) {
    if (isLoading || hasFetched || error) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts/${postId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete post with id: ${postId}`);
      }
      setHasFetched(true);
      setDeletedPostId(postId);
    } catch (error) {
      const errorString = `Error deleting post with id ${postId}. Error: ${error}`;
      console.error(errorString);
      setError(errorString);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    deletePost,
    isLoading,
    error,
    deletedPostId,
    setDeletedPostId,
    setHasFetched,
  };
}
