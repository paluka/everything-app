import Image from "next/image";
import { useRouter } from "next/navigation";

import { formatDate } from "@/utils/formatDate";

import postStyles from "./post.module.scss";
import { IPost, IUserProfile } from "@/types/entities";

function Post({
  userProfile,
  post,
}: {
  userProfile: IUserProfile;
  post: IPost;
}) {
  const router = useRouter();

  const goToProfile = (id: string | undefined) => {
    if (id) {
      router.push(`/profiles/${id}`);
    }
  };

  return (
    <div
      key={post.id}
      className={postStyles.postsContainer}
      onClick={() => goToProfile(userProfile.id)}
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
    </div>
  );
}

export default Post;
