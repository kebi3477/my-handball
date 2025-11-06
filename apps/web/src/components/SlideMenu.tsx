import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./SlideMenu.module.scss";
import TeamPickerModal from "./TeamPickerModal";
import { useMyTeam } from "@/hooks/useMyTeam";
import type { MyTeam } from "@/types/team";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

function SlideMenu({ isOpen, onClose }: Props) {
  const { team: myTeam, save } = useMyTeam();

  const myTeamLabel = useMemo(
    () => (myTeam ? myTeam.name : "팀을 선택해 주세요"),
    [myTeam]
  );

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
          <button className={styles.closeBtn} onClick={onClose} aria-label="메뉴 닫기">
            ✕
          </button>
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

          {myTeam && (
            <Link className={styles.itemLink} to="/calendar" onClick={onClose}>
              <div className={styles.itemTitle}>달력</div>
              <div className={styles.itemDesc}>내 팀 일정 보기</div>
            </Link>
          )}

          <hr className={styles.divider} />

          <Link className={styles.itemLink} to="/schedule" onClick={onClose}>
            <div className={styles.itemTitle}>전체 일정</div>
            <div className={styles.itemDesc}>리그 전체 일정 보기</div>
          </Link>
        </nav>
      </aside>

      <TeamPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        initialGender={myTeam?.gender ?? "W"}
        onPicked={(team: MyTeam) => {
          save(team);
          setPickerOpen(false);
        }}
      />
    </>
  );
}

export default SlideMenu;
