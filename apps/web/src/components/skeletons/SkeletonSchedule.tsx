import styles from "./SkeletonSchedule.module.scss";

function SkeletonSchedule() {
  return (
    <div className={styles.loading}>
      {Array.from({ length: 2 }).map((_, dayIdx) => (
        <div key={dayIdx} className={styles.loading__day}>
          <div className={styles.loading__date} />
          <div className={styles.loading__cards}>
            {Array.from({ length: 2 }).map((_, cardIdx) => (
              <div key={cardIdx} className={styles.loading__card}>
                <div className={styles.loading__grid}>
                  <div className={styles.loading__side}>
                    <span className={styles.loading__logo} />
                    <span className={styles.loading__line} />
                  </div>
                  <div className={styles.loading__center}>
                    <span className={styles.loading__score} />
                    <div className={styles.loading__meta}>
                      <span className={styles.loading__chip} />
                      <span className={styles.loading__chip} />
                    </div>
                  </div>
                  <div className={styles.loading__side}>
                    <span className={styles.loading__logo} />
                    <span className={styles.loading__line} />
                  </div>
                </div>
                <div className={styles.loading__broadcast}>
                  <span className={styles.loading__pill} />
                  <span className={styles.loading__pill} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkeletonSchedule;
