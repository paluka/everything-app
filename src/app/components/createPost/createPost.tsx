import { useState } from "react";

import createPostStyles from "./createPost.module.scss";
import { IPost } from "@/types/entities";
import logger from "@/utils/logger";

function CreatePost({
  userId,
  addNewlyCreatedPost,
}: {
  userId: string;
  addNewlyCreatedPost: (post: Partial<IPost>) => void;
}) {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    try {
      setError("");
      setIsLoading(true);

      // const response = await fetch("/api/post", {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content, userId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create the post");
      }

      const newPostData = await response.json();
      logger.log(`Create post response:`, newPostData);

      addNewlyCreatedPost({
        content,
        userId,
        id: newPostData.id,
        createdAt: newPostData.createdAt,
      });
    } catch (error) {
      const errorString = `Post saving error: ${error}`;
      setError(errorString);
      console.error(errorString);
    } finally {
      setContent("");
      setIsLoading(false);
    }
  };

  return (
    <form
      className={createPostStyles.createPost}
      onSubmit={(event) => {
        handleSubmit(event);
      }}
    >
      <input
        type="text"
        value={content}
        placeholder="Create a post!"
        onChange={(event) => setContent(event.target.value)}
      />

      <button onClick={handleSubmit}>Post</button>

      {isLoading && <span>Loading...</span>}
      {error && <span>{error}</span>}
    </form>
  );
}

export default CreatePost;
