import { Link } from "react-router-dom";
import Symbol from '@/assets/icons/symbol.svg?react';
import styles from "./Header.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.header__icon}>
        <Symbol />
      </div>
    </header>
  );
}
