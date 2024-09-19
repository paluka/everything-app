// src/app/profile/page.tsx

"use client";

import { useSession, signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import CreatePost from "../../components/createPost/createPost";
import ProfileFeed from "../../components/profileFeed/profileFeed";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  image: string;
}

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userId } = useParams();
  let userIdString = "";

  if (Array.isArray(userId)) {
    userIdString = userId[0];
  } else {
    userIdString = userId;
  }

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) router.push("/login"); // Redirect to login if not authenticated

    if (userIdString && !isLoading) {
      setIsLoading(true);
      setError("");

      const fetchProfile = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${userIdString}`
          );
          // const response = await fetch(`/api/profiles/${userIdString}`);
          if (!response.ok) {
            throw new Error("Profile not found");
          }
          const data = await response.json();
          setProfile(data);
        } catch (error) {
          setError("Failed to fetch profile");
        }
      };

      fetchProfile();
      setIsLoading(false);
    }
  }, [
    session,
    status,
    router,
    userIdString,
    isLoading,
    setIsLoading,
    setError,
    setProfile,
  ]);

  if (status === "loading") {
    return <p>Loading...</p>; // Show a loading message while session is being checked
  }

  console.log("session", session);
  console.log("userIdString", userIdString);
  const userIsProfileOwner = session?.user?.id ?? "" == userIdString;

  const imageUrl =
    (userIsProfileOwner ? session?.user?.image : profile?.image) ??
    "https://picsum.photos/100/100";

  return (
    <>
      {session ? (
        <>
          {error && <p>{error}</p>}

          <Image src={imageUrl} alt="Profile Image" width={100} height={100} />

          <h1>{userIsProfileOwner ? session.user?.name : profile?.name}</h1>

          {userIsProfileOwner && (
            <button onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </button>
          )}

          {userIsProfileOwner && <CreatePost userId={userIdString} />}

          <ProfileFeed userId={userIdString} />
        </>
      ) : (
        <p>Redirecting...</p>
      )}
    </>
  );
};

export default ProfilePage;
