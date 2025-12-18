import styles from "./SkeletonCalendar.module.scss";

function SkeletonCalendar() {
  return (
    <div className={styles.loading}>
      <div className={styles.loading__week}>
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} className={styles.loading__week_day} />
        ))}
      </div>

      <div className={styles.loading__grid} role="presentation">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className={styles.loading__day}>
            <span className={styles.loading__dot} />
            <span className={styles.loading__pill} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonCalendar;
