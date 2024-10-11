"use client";

// import { useSession } from "next-auth/react";
import { Session } from "next-auth";

import styles from "./navigation.module.scss";

function Navigation({ session }: { session: Session | null }) {
  // const { data: session, status } = useSession();
  // {
  //   required: true, // This will make sure the session is required and fetched before rendering
  //   // onUnauthenticated() {
  //   //   // Optional: You can handle redirection here if needed
  //   //   // Example: window.location.href = "/login";
  //   // },
  // });

  const userId = session?.user.id ?? "";

  return (
    <nav className={styles.navigation}>
      <a href="/">Home</a>

      {userId ? (
        <>
          <a href="/api/auth/signout">Sign out</a>
          <a href={`/profiles/${userId}`}>Profile</a>
        </>
      ) : (
        <a href="/login">Sign in</a>
      )}
    </nav>
  );
}

export default Navigation;
