import styles from "./SkeletonCard.module.scss";

function SkeletonCard() {
  return (
    <div className={styles.loading}>
      <div className={styles.loading__card}>
        <div className={styles.loading__header}>
          <span className={styles.loading__badge} />
          <span className={styles.loading__dot} />
        </div>

        <div className={styles.loading__info}>
          <span className={styles.loading__line} />
          <span className={`${styles.loading__line} ${styles["loading__line--small"]}`} />
        </div>

        <div className={styles.loading__grid}>
          <div className={styles.loading__side}>
            <span className={styles.loading__avatar} />
            <span className={styles.loading__line} />
          </div>
          <div className={styles.loading__center}>
            <span className={styles.loading__score} />
          </div>
          <div className={styles.loading__side}>
            <span className={styles.loading__avatar} />
            <span className={styles.loading__line} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkeletonCard;
