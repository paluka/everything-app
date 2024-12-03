import Image from "next/image";
import { useRouter } from "next/navigation";

import { formatDate } from "@/utils/formatDate";
import { IPost, IUserProfile } from "@/types/entities";

import postStyles from "./post.module.scss";

const CONTEXT_MENU_HEIGHT = 30;

function Post({
  userProfile,
  post,
  contextMenu,
  setContextMenu,
  userIsProfileOwner,
  deletePost,
}: {
  userProfile: IUserProfile;
  post: IPost;
  contextMenu: any;
  setContextMenu: any;
  userIsProfileOwner: boolean;
  deletePost: (postId: string) => Promise<void>;
}) {
  const router = useRouter();

  const goToProfile = (id: string | undefined) => {
    if (id && !contextMenu) {
      router.push(`/profiles/${id}`);
    }
  };

  return (
    <div
      key={post.id}
      className={postStyles.postsContainer}
      onClick={() => goToProfile(userProfile.id)}
      onContextMenu={(e) => {
        if (userIsProfileOwner) {
          e.preventDefault();
          // Get the bounding rectangle of the message container
          const rect = e.currentTarget.getBoundingClientRect();

          setContextMenu({
            x: e.pageX,
            y: rect.top + CONTEXT_MENU_HEIGHT,
            post,
          });
        }
      }}
    >
      <div className={postStyles.singlePostContainer}>
        <Image
          className={"profileImage"}
          src={userProfile.image}
          width={40}
          height={40}
          alt={userProfile.name}
        />
        <div>
          <div className={postStyles.userName}>{userProfile.name}</div>
          <div className={postStyles.postContent}>{post.content}</div>
        </div>
      </div>
      <div className={postStyles.postDate}>
        Created on {formatDate(post.createdAt)}
      </div>
      {userIsProfileOwner && contextMenu && contextMenu.post.id == post.id && (
        <div
          className={postStyles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={() => {
              if (contextMenu.post) {
                deletePost(contextMenu.post.id);
              }
              setContextMenu(null);
            }}
          >
            Delete Post
          </button>
        </div>
      )}
    </div>
  );
}

export default Post;
