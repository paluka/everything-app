// src/app/profiles/[userId]/page.tsx

"use client";

import { useSession, signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import CreatePost from "../../components/createPost/";
import ProfileFeed from "../../components/profileFeed/";

import profilesStyles from "./profiles.module.scss";
import { IFollow, IPost, IUserProfile } from "@/types/entities";
import logger from "@/utils/logger";
import { useSessionUserProfileContext } from "@/app/hooks/useSessionUserProfileContext";

const ProfilePage = () => {
  const isFetchingRef = useRef(false);
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const { data: session } = useSession({
    required: false,
  });

  const { userId } = useParams();
  let userIdString = "";

  if (Array.isArray(userId)) {
    userIdString = userId[0];
  } else {
    userIdString = userId;
  }
  const userIsProfileOwner = session?.user?.id == userIdString;

  const { sessionUserProfile, setSessionUserProfile } =
    useSessionUserProfileContext();

  useEffect(() => {
    async function fetchUserProfile() {
      if (userIsProfileOwner) {
        if (sessionUserProfile) {
          setUserProfile(sessionUserProfile);
        }
        return;
      }

      if (isLoading || !userIdString || userProfile || isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userIdString}`
        );
        // const response = await fetch(`/api/profiles/${userIdString}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }
        const userProfileData = await response.json();
        setUserProfile(userProfileData);
        logger.log("User data on profile page:", userProfileData);
        logger.log("User ID string in profile page:", {
          userIdString,
          userIsProfileOwner,
        });
      } catch (error) {
        const errorString = `Failed to fetch profile: ${error}`;
        setError(errorString);
        logger.error(errorString);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    }
    fetchUserProfile();
  }, [
    isLoading,
    sessionUserProfile,
    userIdString,
    userIsProfileOwner,
    userProfile,
  ]);

  const messageUser = (id: string | undefined) => {
    if (id) {
      router.push(`/messages?userId=${id}`);
    }
  };

  const followUser = async (followingId: string | undefined) => {
    if (isLoading || isFetchingRef.current || !session?.user.id) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/follow`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            followerId: session?.user.id,
            followingId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to follow user");
      }

      setUserProfile((prevUserProfile: IUserProfile | null) =>
        prevUserProfile
          ? {
              ...prevUserProfile,
              followerCount: prevUserProfile.followerCount + 1,
              followers: [
                ...prevUserProfile.followers,
                {
                  createdAt: new Date().toISOString(),
                  follower: { id: session?.user.id },
                } as IFollow,
              ],
            }
          : null
      );

      setSessionUserProfile((prevSessionUserProfile: IUserProfile | null) =>
        prevSessionUserProfile
          ? {
              ...prevSessionUserProfile,
              followingCount: prevSessionUserProfile.followingCount + 1,
              following: [
                ...prevSessionUserProfile.following,
                {
                  createdAt: new Date().toISOString(),
                  following: { id: userProfile?.id },
                } as IFollow,
              ],
            }
          : null
      );
    } catch (error) {
      const errorString = `Failed to follow user: ${error}`;
      setError(errorString);
      logger.error(errorString);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  const unfollowUser = async (followingId: string | undefined) => {
    if (isLoading || isFetchingRef.current || !session?.user.id) {
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/follow/${session?.user.id}/${followingId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to unfollow user");
      }

      setUserProfile((prevUserProfile: IUserProfile | null) =>
        prevUserProfile
          ? {
              ...prevUserProfile,
              followerCount: prevUserProfile.followerCount - 1,
              followers: [
                ...prevUserProfile.followers.filter(
                  (followerItem) =>
                    followerItem.follower?.id != session?.user.id
                ),
              ],
            }
          : null
      );

      setSessionUserProfile((prevSessionUserProfile: IUserProfile | null) =>
        prevSessionUserProfile
          ? {
              ...prevSessionUserProfile,
              followingCount: prevSessionUserProfile.followingCount - 1,
              following: [
                ...prevSessionUserProfile.following.filter(
                  (followingItem) =>
                    followingItem.following?.id != userProfile?.id
                ),
              ],
            }
          : null
      );
    } catch (error) {
      const errorString = `Failed to unfollow user: ${error}`;
      setError(errorString);
      logger.error(errorString);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  function addNewlyCreatedPost(post: Partial<IPost>) {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        posts: userProfile.posts
          ? [post as IPost, ...userProfile.posts]
          : [post as IPost],
      });
    }
  }

  return (
    <>
      {!isLoading && (
        <SkeletonTheme baseColor="var(--gray-alpha-100);" borderRadius={4}>
          {error && <p>{error}</p>}

          {(userProfile?.image && (
            <Image
              className={"profileImage"}
              src={userProfile.image}
              alt="Profile Image"
              width={100}
              height={100}
            />
          )) || <Skeleton width={100} height={100} />}

          {(userProfile && (
            <div>
              <div className={profilesStyles.userName}>{userProfile.name}</div>
              <div
                className={profilesStyles.userId}
              >{`@${userProfile.id}`}</div>
              <div>{`${userProfile.followerCount} Follower${
                userProfile.followerCount == 1 ? "" : "s"
              }`}</div>
              <div>{`${userProfile.followingCount} Following`}</div>
            </div>
          )) || <Skeleton height={40} />}

          {(userIsProfileOwner && (
            <button onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </button>
          )) || (
            <>
              {!session?.user.id ||
              !userProfile ||
              !sessionUserProfile?.following?.some((followItem: IFollow) => {
                logger.log(`Following list item`, followItem);
                return followItem.following?.id === userProfile.id;
              }) ? (
                <button onClick={() => followUser(userProfile?.id)}>
                  Follow
                </button>
              ) : (
                <button onClick={() => unfollowUser(userProfile?.id)}>
                  Unfollow
                </button>
              )}

              <button onClick={() => messageUser(userProfile?.id)}>
                Message
              </button>
            </>
          )}

          {userIsProfileOwner && (
            <CreatePost
              userId={userIdString}
              addNewlyCreatedPost={addNewlyCreatedPost}
            />
          )}

          {(userProfile && (
            <ProfileFeed
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              userIsProfileOwner={userIsProfileOwner}
            />
          )) || (
            <Skeleton count={5} height={68} style={{ marginBottom: "20px" }} />
          )}
        </SkeletonTheme>
      )}
    </>
  );
};

export default ProfilePage;
