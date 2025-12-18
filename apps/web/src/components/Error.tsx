import Logo from "@/assets/icons/logo.svg?react";
import Symbol from "@/assets/icons/symbol.svg?react";
import styles from "./Error.module.scss";

type ErrorProps = {
  title?: string;
  message?: string;
  retryLabel?: string;
  homeLabel?: string;
  onRetry?: () => void;
  onHome?: () => void;
};

function Error({
  title = "문제가 발생했어요",
  message = "잠시 후 다시 시도하거나 홈으로 돌아가주세요.\n불편을 드려 죄송합니다.",
  retryLabel = "다시 시도",
  homeLabel = "홈으로 이동",
  onRetry,
  onHome,
}: ErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    window.location.reload();
  };

  const handleHome = () => {
    if (onHome) {
      onHome();
      return;
    }
    window.location.href = "/";
  };

  return (
    <div className={styles.container} role="alert">
      <div className={styles.logo}>
        <Symbol />
        <Logo />
      </div>

      <div className={styles.panel}>
        <div className={styles.panel__label}>Oops!</div>
        <h1 className={styles.panel__title}>{title}</h1>
        <p className={styles.panel__message}>{message}</p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.button} ${styles.primary}`}
          onClick={handleRetry}
        >
          {retryLabel}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.secondary}`}
          onClick={handleHome}
        >
          {homeLabel}
        </button>
      </div>
    </div>
  );
}

export default Error;
