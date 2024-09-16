import { useSession } from "next-auth/react";
import styles from "./footer.module.scss";

const Footer = () => {
  const { data: session } = useSession();

  const userId = session?.user.id ?? "";

  return (
    <footer className={styles.footer}>
      <a href="/">Home</a>
      {session && <a href={`/profiles/${userId}`}>Profile</a>}
      {!session && <a href="/login">Sign in</a>}
      {session && <a href="/api/auth/signout">Sign out</a>}
    </footer>
  );
};

export default Footer;
