import Image from "next/image";
import { useRouter } from "next/navigation";

import { formatDate } from "@/utils/formatDate";

import postStyles from "./post.module.scss";
import { UserProfile } from "@/app/profiles/[userId]/page";

export interface IPost {
  id: string;
  content: string;
  createdAt: string;
}

function Post({ user, post }: { user: UserProfile; post: IPost }) {
  const router = useRouter();

  const goToProfile = (id: string) => {
    if (id) {
      router.push(`/profiles/${id}`);
    }
  };

  return (
    <div
      key={post.id}
      className={postStyles.postsContainer}
      onClick={() => goToProfile(user.id ?? "")}
    >
      <div className={postStyles.singlePostContainer}>
        <Image
          className={postStyles.profileImage}
          src={user?.image ?? ""}
          width={40}
          height={40}
          alt={user?.name ?? ""}
        />
        <div>
          <div className={postStyles.userName}>{user.name}</div>
          <div className={postStyles.postContent}>{post.content}</div>
        </div>
      </div>
      <div className={postStyles.postDate}>
        Created at: {formatDate(post.createdAt)}
      </div>
    </div>
  );
}

export default Post;
