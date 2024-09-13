// src/app/profile/page.tsx

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "../components/footer/footer";

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
          <button onClick={() => signOut({ callbackUrl: "/" })}>
            Sign out
          </button>
        </div>
      ) : (
        <p>Redirecting...</p>
      )}
      <Footer />
    </div>
  );
};

export default ProfilePage;
