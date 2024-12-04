import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";

import Post from "../post";
import { IPost, IUserProfile } from "@/types/entities";

import profileFeedStyles from "./profileFeed.module.scss";
import { useDeletePost } from "@/app/hooks/useDeletePost";

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
      <h1 className={profileFeedStyles.title}>Profile Feed</h1>

      {userProfile?.posts?.length
        ? userProfile.posts.map((post, index) => (
            <Post
              key={index}
              userProfile={userProfile}
              post={post}
              contextMenu={contextMenu}
              setContextMenu={setContextMenu}
              userIsProfileOwner={userIsProfileOwner}
              deletePost={deletePost}
            />
          ))
        : "Create your first post!"}
    </div>
  );
};

export default ProfileFeed;
