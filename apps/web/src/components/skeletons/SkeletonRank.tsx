import styles from "./SkeletonRank.module.scss";

function SkeletonRank() {
  return (
    <div className={styles.loading}>
      <div className={styles.loading__top}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className={styles.loading__top__wrap}>
            <span className={styles.loading__top__label} />
            <div className={styles.loading__top__card}>
              <span className={styles.loading__avatar} />
              <span className={styles.loading__line} />
              <span className={styles.loading__chip} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.loading__scroll}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className={styles.loading__item}>
            <span className={styles.loading__rank} />
            <div className={styles.loading__card}>
              <span className={styles.loading__logo} />
              <span className={styles.loading__line} />
              <span className={styles.loading__chip} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonRank;
