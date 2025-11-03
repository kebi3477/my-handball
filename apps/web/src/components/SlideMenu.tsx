import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./SlideMenu.module.scss";
import TeamPickerModal, { TeamItem } from "./TeamPickerModal";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const MY_TEAM_KEY = "myTeam";

export default function SlideMenu({ isOpen, onClose }: Props) {
  const [myTeam, setMyTeam] = useState<TeamItem | null>(null);

  useEffect(() => {
    // 초기 로드 + 다른 탭에서 변경 대응
    const load = () => {
      try {
        const raw = localStorage.getItem(MY_TEAM_KEY);
        setMyTeam(raw ? (JSON.parse(raw) as TeamItem) : null);
      } catch {
        setMyTeam(null);
      }
    };
    load();
    const onStorage = (e: StorageEvent) => {
      if (e.key === MY_TEAM_KEY) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveMyTeam = (next: TeamItem | null) => {
    setMyTeam(next);
    try {
      if (next) localStorage.setItem(MY_TEAM_KEY, JSON.stringify(next));
      else localStorage.removeItem(MY_TEAM_KEY);
    } catch {}
  };
  
  const myTeamLabel = useMemo(
    () => (myTeam ? myTeam.name : "팀을 선택해 주세요"),
    [myTeam]
  );

  // 모달 on/off
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.show : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={`${styles.panel} ${isOpen ? styles.open : ""}`}
        aria-hidden={!isOpen}
        aria-label="사이드 메뉴"
      >
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>메뉴</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="메뉴 닫기">✕</button>
        </div>

        <nav className={styles.nav}>
          <button
            className={styles.item}
            type="button"
            onClick={() => setPickerOpen(true)}
          >
            <div className={styles.itemTitle}>마이팀</div>

            {myTeam ? (
              <div className={styles.myTeamRow}>
                {myTeam.logoUrl ? (
                  <img
                    className={styles.myTeamLogo}
                    src={myTeam.logoUrl}
                    alt={`${myTeam.name} 로고`}
                    loading="lazy"
                  />
                ) : (
                  <span className={styles.myTeamLogoFallback} aria-hidden />
                )}
                <span className={styles.myTeamName}>{myTeam.name}</span>
              </div>
            ) : (
              <div className={styles.itemDesc}>{myTeamLabel}</div>
            )}
          </button>

          {/* 구분선 */}
          <hr className={styles.divider} />

          {/* 달력 (향후 연결 예정) */}
          <button className={styles.item} type="button" onClick={() => {/* TODO: 달력 화면 연결 */}}>
            <div className={styles.itemTitle}>달력</div>
          </button>

          {/* 전체 일정 */}
          <Link className={styles.itemLink} to="/schedule" onClick={onClose}>
            <div className={styles.itemTitle}>전체 일정</div>
            <div className={styles.itemDesc}>리그 전체 일정 보기</div>
          </Link>
        </nav>
      </aside>

      {/* 분리된 모달 컴포넌트 */}
      <TeamPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPicked={(team) => {
          localStorage.setItem(MY_TEAM_KEY, JSON.stringify(team));
          setMyTeam(team);
          setPickerOpen(false);
        }}
      />
    </>
  );
}