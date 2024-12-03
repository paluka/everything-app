import { useState } from "react";

import createPostStyles from "./createPost.module.scss";
import { IPost } from "@/types/entities";

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

  const handleSubmit = async () => {
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

      const data = await response.json();
      console.log(`Create post response: ${JSON.stringify(data)}`);

      addNewlyCreatedPost({
        content,
        userId,
        id: data.id,
        createdAt: data.createdAt,
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
    <div className={createPostStyles.createPost}>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />

      <button onClick={handleSubmit}>Post</button>

      {isLoading && <span>Loading...</span>}
      {error && <span>{error}</span>}
    </div>
  );
}

export default CreatePost;
