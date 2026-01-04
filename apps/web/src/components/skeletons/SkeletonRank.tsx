import styles from "./SkeletonRank.module.scss";

function SkeletonRank() {
  return (
    <div className={styles.loading}>
      <div className={styles.loading__table}>
        <div className={styles.loading__table_header} aria-hidden={true}>
          {Array.from({ length: 6 }).map((_, idx) => (
            <span key={`head-${idx}`} className={styles.loading__header_cell} />
          ))}
        </div>

        <div className={styles.loading__rows}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className={styles.loading__row}>
              <div className={styles.loading__cell_team}>
                <span className={styles.loading__logo} />
                <div className={styles.loading__meta}>
                  <span className={styles.loading__small_line} />
                  <span className={styles.loading__line} />
                </div>
              </div>
              {Array.from({ length: 5 }).map((_, colIdx) => (
                <span key={`stat-${colIdx}`} className={styles.loading__cell} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SkeletonRank;
