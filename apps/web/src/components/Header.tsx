import styles from "./Header.module.scss";

export default function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}></div>
      <h1 className={styles.title}>KOHA</h1>
      <button
        className={styles.menuButton}
        aria-label="메뉴 열기"
        onClick={onOpenMenu}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </button>
    </header>
  );
}
