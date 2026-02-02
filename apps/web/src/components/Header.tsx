import Symbol from '@/assets/icons/symbol.svg?react';
import styles from "./Header.module.scss";
import AnnouncementBell from "./AnnouncementBell";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.header__icon}>
        <Symbol />
      </div>
      <div className={styles.header__actions}>
        <AnnouncementBell />
      </div>
    </header>
  );
}
