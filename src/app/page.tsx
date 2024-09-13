import Footer from "./components/footer/footer";

import styles from "./page.module.scss";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>Welcome to the home page</main>
      <Footer />
    </div>
  );
}
