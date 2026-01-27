import styles from "./Policy.module.scss";

function Policy() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>개인정보 처리방침</h1>
        <div className={styles.meta}>시행일: 2026-01-01</div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.section__title}>1. 목적</h2>
        <p className={styles.text}>
          마이핸드볼은 이용자의 개인정보를 소중히 다루며, 서비스 제공에 필요한
          최소한의 정보만 수집합니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.section__title}>2. 수집하는 정보</h2>
        <ul className={styles.list}>
          <li>성별, 연령대</li>
          <li>선호 팀 정보: 팀 성별, 팀 번호, 팀명, 팀 로고 URL</li>
          <li>앱 설정 정보: 마이팀, 시즌, 테마, 프로필 설정 완료 여부</li>
        </ul>
        <p className={styles.text}>
          앱 설정 정보는 기기 내 로컬 스토리지에 저장됩니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.section__title}>3. 수집 방법</h2>
        <p className={styles.text}>
          회원가입 없이 시작하기 과정에서 이용자가 직접 입력한 정보를 수집하며,
          입력된 정보는 서버로 전송됩니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.section__title}>4. 이용 목적</h2>
        <ul className={styles.list}>
          <li>맞춤 일정 및 랭킹 화면 제공</li>
          <li>선호 팀 기반 콘텐츠 제공</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.section__title}>5. 보관 및 파기</h2>
        <p className={styles.text}>
          수집한 정보는 서비스 제공 목적이 달성되면 지체 없이 파기하며,
          이용자가 앱 데이터를 삭제하거나 초기화하면 로컬 스토리지 정보도 함께 삭제됩니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.section__title}>6. 제3자 제공</h2>
        <p className={styles.text}>
          마이핸드볼은 이용자의 개인정보를 외부에 제공하지 않습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.section__title}>7. 이용자의 권리</h2>
        <p className={styles.text}>
          이용자는 언제든지 앱 내 설정에서 마이팀을 초기화하거나 앱 데이터를 삭제하여
          개인정보 수집을 중단할 수 있습니다.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.section__title}>8. 문의처</h2>
        <p className={styles.text}>
          개인정보 관련 문의는 아래 연락처로 부탁드립니다.
        </p>
        <div className={styles.contact}>이메일: kebi3477@naver.com</div>
      </section>
    </div>
  );
}

export default Policy;
