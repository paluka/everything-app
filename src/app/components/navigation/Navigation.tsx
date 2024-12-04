"use client";

import { Session } from "next-auth";

import styles from "./navigation.module.scss";

function Navigation({ session }: { session: Session | null }) {
  const userId = session?.user.id ?? "";

  return (
    <nav className={styles.navigation}>
      <a href="/">Home</a>

      {userId ? (
        <>
          <a href="/api/auth/signout">Sign out</a>
          <a href={`/profiles/${userId}`}>Profile</a>
          <a href={`/messages`}>Messages</a>
        </>
      ) : (
        <a href="/login">Sign in</a>
      )}
    </nav>
  );
}

export default Navigation;
