"use client";

import { Session } from "next-auth";

import navigationStyles from "./navigation.module.scss";
import { usePathname } from "next/navigation";
import Link from "next/link";

function Navigation({ session }: { session: Session | null }) {
  const userId = session?.user.id ?? "";
  const pathname = usePathname();

  return (
    <nav className={navigationStyles.navigation}>
      <Link
        href="/"
        className={pathname === "/" ? navigationStyles.active : ""}
      >
        Home
      </Link>
      <Link
        href="/find-friends"
        className={pathname === "/find-friends" ? navigationStyles.active : ""}
      >
        Find Friends
      </Link>

      {userId ? (
        <>
          <Link href="/api/auth/signout">Sign out</Link>
          <Link
            href={`/profiles/${userId}`}
            className={
              pathname === `/profiles/${userId}` ? navigationStyles.active : ""
            }
          >
            Profile
          </Link>
          <Link
            href={`/messages`}
            className={pathname === "/messages" ? navigationStyles.active : ""}
          >
            Messages
          </Link>
        </>
      ) : (
        <Link
          href="/login"
          className={pathname === "/login" ? navigationStyles.active : ""}
        >
          Sign in
        </Link>
      )}
    </nav>
  );
}

export default Navigation;
