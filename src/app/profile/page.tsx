// src/app/profile/page.tsx

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!session) router.push("/login"); // Redirect to login if not authenticated
  }, [session, status, router]);

  if (status === "loading") {
    return <p>Loading...</p>; // Show a loading message while session is being checked
  }

  return (
    <div>
      {session ? (
        <div>
          <h1>Welcome, {session.user?.name}</h1>

          {session.user?.image && (
            <Image
              src={session.user?.image}
              alt="Profile Image"
              width={100}
              height={100}
            />
          )}

          <button onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </button>
        </div>
      ) : (
        <p>Redirecting...</p>
      )}
    </div>
  );
};

export default ProfilePage;
