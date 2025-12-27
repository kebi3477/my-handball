import { useEffect, useState } from "react";
import styles from "./TeamPickerModal.module.scss";
import type { Gender, MyTeam } from "@/types/team";
import { useTeam } from "@/hooks/useTeam";
import Error from "@/components/Error";

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
  initialGender = "M",
}: Props) {
  const [gender, setGender] = useState<Gender>(initialGender);

  const { data, loading, error } = useTeam({ gender });
  
  useEffect(() => {
    setGender(initialGender);
  }, [initialGender]);

  if (!open) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.modal__overlay} onClick={onClose} />

      <div className={styles.modal__sheet} role="dialog" aria-modal="true" aria-label="팀 선택">
        <div className={styles.header}>
          <strong className={styles.header__title}>
            {gender === "M" ? "남자부 팀 선택" : "여자부 팀 선택"}
          </strong>
          <button className={styles.header__close} onClick={onClose} aria-label="닫기">✕</button>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tabs__tab} ${gender === "M" ? styles.active : ""}`}
            onClick={() => setGender("M")}
            type="button"
          >
            남자팀
          </button>
          <button
            className={`${styles.tabs__tab} ${gender === "W" ? styles.active : ""}`}
            onClick={() => setGender("W")}
            type="button"
          >
            여자팀
          </button>
        </div>

        {error && <Error />}

        {!error && loading && <p className={styles.state}>불러오는 중…</p>}

        {!error && !loading && (
          <div className={styles.team}>
            {data?.teams.map((t) => (
              <button
                key={`${gender}-${t.teamNum}`}
                className={styles.team__cell}
                onClick={() => onPicked({ ...t, gender })}
                type="button"
              >
                <span className={styles.team__cell__logo_wrap}>
                  {t.logoUrl ? (
                    <img src={t.logoUrl} alt={`${t.name} 로고`} className={styles.team__cell__logo} />
                  ) : (
                    <div className={styles.team__cell__logo_fallback} />
                  )}
                </span>
                <span className={styles.team__cell__name}>{t.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
