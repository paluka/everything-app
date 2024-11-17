// src/app/profiles/[userId]/page.tsx

"use client";

import { useSession, signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import CreatePost from "../../components/createPost/";
import ProfileFeed from "../../components/profileFeed/";

import profilesStyles from "./profiles.module.scss";
import { IUserProfile } from "@/types/entities";

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session, status } = useSession({
    required: false,
    // required: true, // This will make sure the session is required and fetched before rendering
    // onUnauthenticated() {
    //   router.push("/login");
    // },
  });

  // const router = useRouter();
  const { userId } = useParams();
  let userIdString = "";

  if (Array.isArray(userId)) {
    userIdString = userId[0];
  } else {
    userIdString = userId;
  }

  console.log("User ID string:", userIdString);

  useEffect(() => {
    // if (status === "loading") return; // Do nothing while loading
    // if (!session) router.push("/login"); // Redirect to login if not authenticated

    if (userIdString && !isLoading) {
      setIsLoading(true);
      setError("");

      const fetchUserProfile = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userIdString}`
          );
          // const response = await fetch(`/api/profiles/${userIdString}`);
          if (!response.ok) {
            throw new Error("User profile not found");
          }
          const data = await response.json();
          setUserProfile(data);
        } catch (error) {
          setError("Failed to fetch profile");
        }
      };

      fetchUserProfile();
      setIsLoading(false);
    }
  }, [isLoading, setIsLoading, setError, setUserProfile, userIdString]);

  console.log("User data:", userProfile);

  const userIsProfileOwner = session?.user?.id == userIdString;

  // const imageUrl =
  //   (userIsProfileOwner ? session?.user?.image : profile?.image) ??
  //   "https://picsum.photos/100/100";

  // const imageUrl =
  //   (userIsProfileOwner ? session?.user?.image : userProfile?.image) ?? "";

  // const userObj = userIsProfileOwner ? session?.user : userProfile;

  console.log("User Object passed to the Profile Feed:", userProfile);

  return (
    <>
      {/* {status === "authenticated" && ( */}
      {!isLoading && (
        <SkeletonTheme
          baseColor="var(--gray-alpha-100);"
          // height={68}
          borderRadius={4}
        >
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
            </div>
          )) || <Skeleton height={40} />}

          {userIsProfileOwner && (
            <button onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </button>
          )}

          {userIsProfileOwner && <CreatePost userId={userIdString} />}

          {(userProfile && <ProfileFeed user={userProfile} />) || (
            <Skeleton count={5} height={68} style={{ marginBottom: "20px" }} />
          )}
        </SkeletonTheme>
      )}
    </>
  );
};

export default ProfilePage;
