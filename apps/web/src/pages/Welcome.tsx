import { useCallback, useState } from 'react';
import Symbol from '@/assets/icons/symbol.svg?react';
import Logo from '@/assets/icons/logo.svg?react';
import style from './Welcome.module.scss';

function Welcome() {
  const [step, setStep] = useState<number>(0);

  const goNext = useCallback(() => {
    setStep(prev => prev+1);
  }, [step]);

  const goPrev = useCallback(() => {
    setStep(prev => prev-1);
  }, [step]);

  const goMain = useCallback(() => {
    window.location.reload();
  }, []);

  const transform = -25 * step;

  return (
    <div className={style.container}>
      <div className={style.content} style={{ transform: `translateX(${transform}%)` }}>
        <div className={style.wrap}>
          <div className={style.logo}>
            <Symbol />
            <Logo />
          </div>
          <div className={style.welcome}>
            마이팀 경기,<br/>이제 놓치지 않기
          </div>
        </div>
        <div className={style.wrap}>
          1
        </div>
        <div className={style.wrap}>
          2
        </div>
        <div className={style.wrap}>
          3
        </div>
      </div>

      <div className={style.button_area}>
        { step === 0 && (
          <button className={style.primary} onClick={goNext}>시작하기</button>
        )}

        {(step === 1 || step === 2) && ( 
          <>
            <button className={style.secondary} onClick={goPrev}>이전</button>
            <button className={style.primary} onClick={goNext}>다음</button>
          </> 
        )}

        {step === 3 && (
          <button className={style.primary} onClick={goMain}>메인으로</button>
        )}

      </div>
    </div>
  )
}

export default Welcome;