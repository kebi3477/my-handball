import { useEffect, useState } from "react";
import styles from "./TeamPickerModal.module.scss";

export type Gender = "W" | "M";
export type TeamItem = { teamNum: number; name: string; logoUrl: string | null; href: string | null };
export type TeamApiRes = { url: string; gender: Gender; teams: TeamItem[] };
export type MyTeam = { gender: Gender; teamNum: number; name: string; logoUrl: string | null };

type Props = {
  open: boolean;
  onClose: () => void;
  onPicked: (picked: TeamItem) => void;
  initialGender?: Gender;
};

export default function TeamPickerModal({
  open,
  onClose,
  onPicked,
  initialGender = "W",
}: Props) {
  const [gender, setGender] = useState<Gender>(initialGender);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [items, setItems] = useState<TeamItem[]>([]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        setItems([]);
        const res = await fetch(`http://localhost:3000/api/team?gender=${gender}`, { cache: "no-cache" });
        const json = (await res.json()) as TeamApiRes;
        if (alive) setItems(Array.isArray(json.teams) ? json.teams : []);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? "unknown error");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [gender, open]);

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
        {err && <p className={styles.stateError}>에러: {err}</p>}
        {!loading && !err && (
          <div className={styles.teamGrid}>
            {items.map((t) => (
              <button
                key={`${gender}-${t.teamNum}`}
                className={styles.teamCell}
                onClick={() => onPicked({ teamNum: t.teamNum, name: t.name, logoUrl: t.logoUrl, href: t.href })}
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
