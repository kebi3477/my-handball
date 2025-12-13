import { useEffect, useState } from "react";
import styles from "./TeamPickerModal.module.scss";
import type { Gender, MyTeam, TeamItem } from "@/types/team";
import { useTeam } from "@/hooks/useTeam";

type Props = {
  open: boolean;
  onClose: () => void;
  onPicked: (picked: MyTeam) => void;
  initialGender?: Gender;
};

export default function TeamPickerModal({
  open,
  onClose,
  onPicked,
  initialGender = "W",
}: Props) {
  const [gender, setGender] = useState<Gender>(initialGender);

  const { data, loading, error } = useTeam({ gender });
  
  useEffect(() => {
    setGender(initialGender);
  }, [initialGender]);

  if (!open) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />

      <div className={styles.modalSheet} role="dialog" aria-modal="true" aria-label="팀 선택">
        <div className={styles.modalHeader}>
          <strong className={styles.modalTitle}>
            {gender === "W" ? "여자부 팀 선택" : "남자부 팀 선택"}
          </strong>
          <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">✕</button>
        </div>

        {/* 탭 */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${gender === "W" ? styles.tabActive : ""}`}
            onClick={() => setGender("W")}
            type="button"
          >
            여자팀
          </button>
          <button
            className={`${styles.tab} ${gender === "M" ? styles.tabActive : ""}`}
            onClick={() => setGender("M")}
            type="button"
          >
            남자팀
          </button>
        </div>

        {/* 목록 */}
        {loading && <p className={styles.state}>불러오는 중…</p>}
        {error && <p className={styles.stateError}>에러: {error}</p>}
        {!loading && !error && (
          <div className={styles.teamGrid}>
            {!loading && data?.teams.map((t) => (
              <button
                key={`${gender}-${t.teamNum}`}
                className={styles.teamCell}
                onClick={() => onPicked({ ...t, gender })}
                type="button"
              >
                {t.logoUrl ? (
                  <img src={t.logoUrl} alt={`${t.name} 로고`} className={styles.teamCellLogo} />
                ) : (
                  <div className={styles.teamCellLogoFallback} />
                )}
                <span className={styles.teamCellName}>{t.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
