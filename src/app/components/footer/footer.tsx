import styles from "./footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <a href="/">Home</a>
      <a href="/profile">Profile</a>
      <a href="/login">Sign in</a>
    </footer>
  );
};

export default Footer;
