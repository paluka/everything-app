// import { useEffect, useState } from "react";
// import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";

// import Post, { IPost } from "../post";
import Post from "../post";
import { IPost, IUserProfile } from "@/types/entities";

import profileFeedStyles from "./profileFeed.module.scss";
import { useDeletePost } from "@/app/hooks/useDeletePost";

// import { UserProfile } from "@/app/profiles/[userId]/page";

const ProfileFeed = ({
  userProfile,
  setUserProfile,
  userIsProfileOwner,
}: {
  userProfile: IUserProfile;
  setUserProfile: Dispatch<SetStateAction<IUserProfile | null>>;
  userIsProfileOwner: boolean;
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    post: IPost | null;
  } | null>(null);

  const { deletePost, deletedPostId, setDeletedPostId, setHasFetched } =
    useDeletePost();

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
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/posts?id=${user.id}`
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

  useEffect(() => {
    if (deletedPostId) {
      setUserProfile({
        ...userProfile,
        posts: userProfile?.posts?.filter((post) => post.id != deletedPostId),
      });
      setDeletedPostId("");
      setHasFetched(false);
    }
  }, [
    deletedPostId,
    setDeletedPostId,
    setHasFetched,
    setUserProfile,
    userProfile,
    userProfile.posts,
  ]);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);

    if (userIsProfileOwner && contextMenu) {
      document.addEventListener("click", handleClick);
      document.addEventListener("contextmenu", handleClick);

      return () => {
        document.removeEventListener("click", handleClick);
        document.removeEventListener("contextmenu", handleClick);
      };
    }
  }, [contextMenu, userIsProfileOwner]);

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
      {userProfile.posts?.map((post, index) => (
        <Post
          key={index}
          userProfile={userProfile}
          post={post}
          contextMenu={contextMenu}
          setContextMenu={setContextMenu}
          userIsProfileOwner={userIsProfileOwner}
          deletePost={deletePost}
        />
      ))}
      {/* </SkeletonTheme> */}
    </div>
  );
};

export default ProfileFeed;
