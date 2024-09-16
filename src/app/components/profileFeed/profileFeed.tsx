import { useEffect, useState } from "react";

import profileFeedStyles from "./profileFeed.module.scss";
import { formatDate } from "@/utils/formatDate";

interface Post {
  id: string;
  content: string;
  createdAt: string;
}

const ProfileFeed = ({ userId }: { userId: string }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    setError(false);
    setIsLoading(true);

    const fetchPosts = async () => {
      await fetch(`/api/post?userId=${userId}`)
        .then((res) => res.json())
        .then((data) => setPosts(data))
        .catch((error) => {
          setError(true);
          console.error("Post fetching error", error);
        });
    };

    fetchPosts();

    setIsLoading(false);
  }, [setPosts, setError, setIsLoading, isLoading, userId]);

  return (
    <div className={profileFeedStyles.profileFeed}>
      <h1>Profile Feed</h1>

      {isLoading && <p>Loading...</p>}
      {error && <p>Error fetching posts</p>}

      {posts.map((post) => (
        <div key={post.id} className={profileFeedStyles.post}>
          <p>{post.content}</p>
          <p>Created at: {formatDate(post.createdAt)}</p>
        </div>
      ))}
    </div>
  );
};

export default ProfileFeed;
