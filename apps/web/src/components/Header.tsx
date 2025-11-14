import { Link } from "react-router-dom";
import styles from "./Header.module.scss";

export default function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}></div>
      <Link className={styles.titleLink} to="/">
        <h1 className={styles.title}>KOHA</h1>
      </Link>
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
