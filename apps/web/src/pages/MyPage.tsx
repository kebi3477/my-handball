import { useState } from "react";
import TeamPickerModal from "@/components/TeamPickerModal";
import { useMyTeam } from "@/hooks/useMyTeam";
import type { MyTeam } from "@/types/team";
import style from "./MyPage.module.scss";

function MyPage() {
  const { team: myTeam, save } = useMyTeam();
  const [pickerOpen, setPickerOpen] = useState(false);

  const handlePicked = (team: MyTeam) => {
    save(team);
    setPickerOpen(false);
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

      <TeamPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPicked={handlePicked}
      />
    </div>
  );
}

export default MyPage;
