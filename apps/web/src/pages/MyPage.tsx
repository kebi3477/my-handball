import { useState } from "react";
import { Link } from "react-router-dom";
import TeamPickerModal from "@/components/TeamPickerModal";
import { useMyTeam } from "@/hooks/useMyTeam";
import { useSeason } from "@/hooks/useSeason";
import type { MyTeam } from "@/types/team";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import style from "./MyPage.module.scss";
import { SEASON_LABELS, SEASON_YEARS, type SeasonKey } from "@/constants/schedule";

function MyPage() {
  const { team: myTeam, save } = useMyTeam();
  const { season, save: saveSeason } = useSeason();
  const { theme, setTheme } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handlePicked = (team: MyTeam) => {
    save(team);
    setPickerOpen(false);
  };

  const handleSeasonChange = (next: SeasonKey) => {
    saveSeason(next);
  };

  return (
    <div className={style.container}>
      <section className={style.card}>
        <div className={style.card__header}>
          <div className={style.card__label}>마이팀</div>
          {myTeam && (
            <button
              type="button"
              className={style.card__reset}
              onClick={() => save(null)}
            >
              초기화
            </button>
          )}
        </div>

        <button
          type="button"
          className={`${style.team} ${myTeam ? style.active : ""}`}
          onClick={() => setPickerOpen(true)}
        >
          <div className={style.team__logo}>
            {myTeam?.logoUrl ? (
              <img src={myTeam.logoUrl} alt={`${myTeam.name} 로고`} />
            ) : (
              <div className={style.team__placeholder} />
            )}
          </div>
          <div className={style.team__text}>
            <div className={style.team__label}>
              {myTeam ? "선택된 마이팀" : "아직 팀이 없어요"}
            </div>
            <div className={style.team__name}>
              {myTeam?.name ?? "마이팀을 골라 달력과 일정에서 바로 확인하세요."}
            </div>
          </div>
          <div className={style.team__action}>변경</div>
        </button>

        <div className={style.tip}>
          좋아하는 팀을 언제든 다시 고를 수 있어요. 선택 즉시 홈과 일정에 반영됩니다.
        </div>
      </section>

      <section className={style.card}>
        <div className={style.card__header}>
          <div className={style.card__label}>설정</div>
        </div>

        <div className={style.settings}>
          <div className={style.settings__row}>
            <div className={style.settings__text}>
              <div className={style.settings__title}>조회 시즌</div>
              <div className={style.settings__desc}>홈 · 일정 · 캘린더에 공통 적용</div>
            </div>

            <div className={style.select}>
              <label className={style.visuallyHidden} htmlFor="season-select">조회 시즌 선택</label>
              <select
                id="season-select"
                className={style.select__field}
                value={season}
                onChange={(e) => handleSeasonChange(e.target.value as SeasonKey)}
                aria-label="조회 시즌 선택"
              >
                {SEASON_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {SEASON_LABELS[y]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={style.settings__row}>
            <div className={style.settings__text}>
              <div className={style.settings__title}>테마</div>
              <div className={style.settings__desc}>기기 설정 · 라이트 · 다크 선택</div>
            </div>

            <div className={style.select}>
              <label className={style.visuallyHidden} htmlFor="theme-select">테마 선택</label>
              <select
                id="theme-select"
                className={style.select__field}
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeMode)}
                aria-label="테마 선택"
              >
                <option value="system">기기 설정 따름</option>
                <option value="light">라이트</option>
                <option value="dark">다크</option>
              </select>
            </div>
          </div>

          <Link to="/policy" className={style.settings__row}>
            <div className={style.settings__text}>
              <div className={style.settings__title}>개인정보 처리방침</div>
              <div className={style.settings__desc}>수집 및 이용 내용을 확인하세요</div>
            </div>
            <div className={style.settings__action}>보기</div>
          </Link>
        </div>
      </section>

      <TeamPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPicked={handlePicked}
      />
    </div>
  );
}

export default MyPage;
