import { useSession } from "next-auth/react";
import styles from "./footer.module.scss";

const Footer = () => {
  const { data: session, status } = useSession();

  const userId = session?.user.id ?? "";

  if (status === "loading") {
    return null;
  }

  return (
    <footer className={styles.footer}>
      <a href="/">Home</a>
      {status === "authenticated" && (
        <>
          <a href={`/profiles/${userId}`}>Profile</a>
          <a href="/api/auth/signout">Sign out</a>
        </>
      )}
      {status === "unauthenticated" && <a href="/login">Sign in</a>}
    </footer>
  );
};

export default Footer;
