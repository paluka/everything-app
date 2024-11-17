// import { useEffect, useState } from "react";
// import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import profileFeedStyles from "./profileFeed.module.scss";
// import Post, { IPost } from "../post";
import Post from "../post";
import { IUserProfile } from "@/types/entities";

// import { UserProfile } from "@/app/profiles/[userId]/page";

const ProfileFeed = ({ user }: { user: IUserProfile }) => {
  // const [posts, setPosts] = useState<IPost[]>([]);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  // const [error, setError] = useState<boolean>(false);

  // useEffect(() => {
  //   if (isLoading) {
  //     return;
  //   }

  //   setError(false);
  //   setIsLoading(true);

  //   const fetchPosts = async () => {
  //     await fetch(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts?userId=${user.id}`
  //     )
  //       // await fetch(`/api/post?userId=${userId}`)
  //       .then((res) => res.json())
  //       .then((data) => setPosts(data))
  //       .catch((error) => {
  //         setError(true);
  //         console.error("Post fetching error", error);
  //       });
  //   };

  //   fetchPosts();

  //   setIsLoading(false);
  // }, [setPosts, setError, setIsLoading, isLoading, user]);

  return (
    <div className={profileFeedStyles.profileFeed}>
      {/* <SkeletonTheme
        baseColor="var(--gray-alpha-100);"
        height={68}
        borderRadius={4}
      > */}
      <h1 className={profileFeedStyles.title}>Profile Feed</h1>

      {/* {(isLoading || !posts.length) && (
          <Skeleton count={5} style={{ marginBottom: "20px" }} />
        )} */}

      {/* {error && <p>Error fetching posts</p>} */}

      {/* {!isLoading &&
          !error &&
          posts.map((post, index) => (
            <Post key={index} user={user} post={post} />
          ))} */}
      {user.posts?.map((post, index) => (
        <Post key={index} user={user} post={post} />
      ))}
      {/* </SkeletonTheme> */}
    </div>
  );
};

export default ProfileFeed;
