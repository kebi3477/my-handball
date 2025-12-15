import { useCallback, useState } from "react";
import Symbol from "@/assets/icons/symbol.svg?react";
import Logo from "@/assets/icons/logo.svg?react";
import ProgressBackIcon from "@/assets/icons/icon-progress-back.svg?react";
import TeamCheckIcon from "@/assets/icons/icon-team-check.svg?react";
import type { Gender, TeamItem } from "@/types/team";
import style from "./Welcome.module.scss";
import { useTeam } from "@/hooks/useTeam";
import { useProfileSetup } from "@/hooks/useProfileSetup";
import { useMyTeam } from "@/hooks/useMyTeam";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "M", label: "남자" },
  { value: "W", label: "여자" },
];

const AGE_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "19세 이하" },
  { value: "2", label: "20-24세" },
  { value: "3", label: "25-29세" },
  { value: "4", label: "30-34세" },
  { value: "5", label: "35-39세" },
  { value: "6", label: "40세 이상" },
];

function Welcome() {
  const [step, setStep] = useState<number>(0);
  const [gender, setGender] = useState<string>('');
  const [age, setAge] = useState<string>('');

  const [selectedGender, setSelectedGender] = useState<Gender>('M');
  const [selectedTeam, setSelectedTeam] = useState<TeamItem|null>(null);

  const profileSetup = useProfileSetup();
  const myTeam = useMyTeam();
  const { data, loading, error } = useTeam({ gender: selectedGender })

  const step1Complete = gender && age;
  const step2Complete = selectedTeam;

  const goNext = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 3));
  }, []);

  const goPrev = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goMain = useCallback(() => {
    profileSetup.save(true);
    myTeam.save(selectedTeam);
    window.location.reload();
  }, [selectedTeam]);

  const transform = `translateX(${-25 * step}%)`;
  const progressWidth = `${33.3 * step}%`;
  const nextDisabled = (step === 1 && !step1Complete) || (step === 2 && !step2Complete);

  return (
    <div className={style.container}>
      <div className={style.progress}>
        <button className={style.progress__button} onClick={goPrev}>
          <ProgressBackIcon />
        </button>
        <div className={style.progress__background}>
          <div className={style.progress__fill} style={{ width: progressWidth }}></div>
        </div>
      </div>
      <div className={style.content} style={{ transform }}>
        <div className={style.step}>
          <div className={style.logo}>
            <Symbol />
            <Logo />
          </div>
          <div className={style.welcome}>
            마이팀 경기,<br />이제 놓치지 않기
          </div>
        </div>

        <div className={style.step} style={{ padding: '0 20px' }}>
          <div className={style.step__title} style={{ padding: '0 20px' }}>
            성별/연령대를<br/>알려주세요!
          </div>

          <div className={style.gender}>
            {GENDER_OPTIONS.map((g) => {
              const active = g.value === gender;
              return (
                <button
                  key={g.value}
                  type="button"
                  className={`${style.gender__button} ${active && style.active}`}
                  onClick={() => setGender(g.value)}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          <div className={style.age}>
            {AGE_OPTIONS.map((a) => {
              const active = a.value === age;
              return (
                <button
                  key={a.value}
                  type="button"
                  className={`${style.age__button} ${active && style.active}`}
                  onClick={() => setAge(a.value)}
                  aria-pressed={active}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={style.step}>
          <div className={style.step__title}>
            본인이 좋아하는 핸드볼<br/>팀을 골라주세요
          </div>

          <div className={style.team}>
            <div className={style.team__scroll}>
              { !loading && data?.teams?.map(team => {
                const active = team === selectedTeam;
                return (
                  <button 
                    className={`${style.team__block} ${active && style.active}`} 
                    onClick={() => setSelectedTeam(team)}
                  >
                    <div className={style.team__image}>
                      <img src={team.logoUrl ? team.logoUrl : ''} />
                    </div>
                    <div className={style.team__name}>{team.name}</div>
                    { active && (
                      <div className={style.team__check}>
                        <TeamCheckIcon />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          <div className={style.team_gender}>
            { GENDER_OPTIONS.map(g => { 
              const active = selectedGender === g.value;
              return (
                <button
                  className={`${style.team_gender__button} ${active && style.active}`}
                  onClick={() => setSelectedGender(g.value)}
                >
                  {g.label}팀
                </button>
              )
            })}
          </div>
        </div>

        <div className={style.step}>
          설정 끝
        </div>
      </div>

      <div className={style.button_area}>
        <div className={style.buttonRow}>
          {step === 0 && (
            <button className={style.primary} onClick={goNext}>
              시작하기
            </button>
          )}

          {(step === 1 || step === 2) && (
            <button className={style.primary} onClick={goNext} disabled={nextDisabled}>
              다음
            </button>
          )}

          {step === 3 && (
            <button className={style.primary} onClick={goMain}>
              입장하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Welcome;
