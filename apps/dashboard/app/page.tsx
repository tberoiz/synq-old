import styles from "./page.module.css";
export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className="font-semibold">Gaia</h1>
      </main>
      <footer className={styles.footer}>
        <span>footer</span>
      </footer>
    </div>
  );
}
