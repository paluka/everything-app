import { useState } from "react";

import createPostStyles from "./createPost.module.scss";

function CreatePost({ userId }: { userId: string }) {
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (isLoading) {
      return;
    }

    setError(false);
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
    )
      .then((res) => res.json())
      .catch((error) => {
        setError(error.message);
        console.error("Post saving error", error);
      });

    console.log(response);
    setIsLoading(false);
  };

  return (
    <div className={createPostStyles.createPost}>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />

      <button onClick={handleSubmit}>Post</button>

      {isLoading && <span>Loading...</span>}
      {error && <span>There was an error saving your post</span>}
    </div>
  );
}

export default CreatePost;
