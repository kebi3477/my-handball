import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./TutorialOverlay.module.scss";
import { TUTORIAL_PAGE_LABELS, TUTORIAL_STEPS } from "@/constants/tutorial";
import { useTutorial } from "@/hooks/useTutorial";

const CARD_GAP = 12;
const SPOTLIGHT_PADDING = 8;
const TARGET_TIMEOUT = 2200;

function waitForTarget(id: string, timeout = TARGET_TIMEOUT) {
  return new Promise<HTMLElement | null>((resolve) => {
    const start = performance.now();

    const tick = () => {
      const el = document.querySelector<HTMLElement>(`[data-tutorial-id="${id}"]`);
      if (el) {
        resolve(el);
        return;
      }

      if (performance.now() - start > timeout) {
        resolve(null);
        return;
      }

      requestAnimationFrame(tick);
    };

    tick();
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function TutorialOverlay() {
  const { open, close, complete, setSeen } = useTutorial();
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 });
  const [cardPosition, setCardPosition] = useState({ top: 0, left: 0 });
  const [arrowOffset, setArrowOffset] = useState(0);
  const [arrowAxis, setArrowAxis] = useState<"x" | "y">("x");
  const targetRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const steps = useMemo(() => TUTORIAL_STEPS, []);
  const step = steps[stepIndex];
  const totalSteps = steps.length;

  useEffect(() => {
    if (!open) return;
    setStepIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!step) return;
    if (location.pathname === step.route) return;
    navigate(step.route);
  }, [location.pathname, navigate, open, step]);

  useEffect(() => {
    if (!open) return;
    if (!step) return;
    if (location.pathname !== step.route) return;

    let cancelled = false;
    setTargetRect(null);
    targetRef.current = null;

    const locate = async () => {
      const target = await waitForTarget(step.targetId);
      if (cancelled || !open) return;
      if (!target) return;

      targetRef.current = target;
      target.scrollIntoView({ block: "center", behavior: "auto" });
      setTargetRect(target.getBoundingClientRect());
    };

    locate();

    return () => {
      cancelled = true;
    };
  }, [location.pathname, open, step]);

  useEffect(() => {
    if (!open) return;

    let rafId = 0;

    const update = () => {
      if (!targetRef.current) return;
      setTargetRect(targetRef.current.getBoundingClientRect());
    };

    const schedule = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(update);
    };

    const root = document.getElementById("root");
    window.addEventListener("resize", schedule);
    root?.addEventListener("scroll", schedule, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", schedule);
      root?.removeEventListener("scroll", schedule);
    };
  }, [open, stepIndex]);

  useLayoutEffect(() => {
    if (!open) return;
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    setCardSize({ width: rect.width, height: rect.height });
  }, [open, stepIndex, step?.title, step?.description]);

  useEffect(() => {
    if (!open || !step) return;
    if (!cardSize.width || !cardSize.height) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const safe = 12;

    if (!targetRect) {
      setCardPosition({
        top: (vh - cardSize.height) / 2,
        left: (vw - cardSize.width) / 2,
      });
      setArrowOffset(0);
      setArrowAxis("x");
      return;
    }

    const rect = targetRect;
    let top = 0;
    let left = 0;

    if (step.placement === "bottom") {
      top = rect.bottom + CARD_GAP;
      left = rect.left + rect.width / 2 - cardSize.width / 2;
      setArrowAxis("x");
    } else if (step.placement === "top") {
      top = rect.top - CARD_GAP - cardSize.height;
      left = rect.left + rect.width / 2 - cardSize.width / 2;
      setArrowAxis("x");
    } else if (step.placement === "left") {
      top = rect.top + rect.height / 2 - cardSize.height / 2;
      left = rect.left - CARD_GAP - cardSize.width;
      setArrowAxis("y");
    } else {
      top = rect.top + rect.height / 2 - cardSize.height / 2;
      left = rect.right + CARD_GAP;
      setArrowAxis("y");
    }

    const clampedLeft = clamp(left, safe, vw - cardSize.width - safe);
    const clampedTop = clamp(top, safe, vh - cardSize.height - safe);
    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;

    if (step.placement === "left" || step.placement === "right") {
      const rawOffset = targetCenterY - clampedTop;
      const max = cardSize.height - 16;
      setArrowOffset(clamp(rawOffset, 16, Math.max(16, max)));
    } else {
      const rawOffset = targetCenterX - clampedLeft;
      const max = cardSize.width - 16;
      setArrowOffset(clamp(rawOffset, 16, Math.max(16, max)));
    }

    setCardPosition({ top: clampedTop, left: clampedLeft });
  }, [cardSize.height, cardSize.width, open, step, targetRect]);

  useEffect(() => {
    if (!open) return;

    const root = document.getElementById("root");
    const prevOverflow = root?.style.overflow;

    if (root) {
      root.style.overflow = "hidden";
    }

    const prevent = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("wheel", prevent, { passive: false, capture: true });
    window.addEventListener("touchmove", prevent, { passive: false, capture: true });
    window.addEventListener("keydown", prevent, true);

    return () => {
      if (root && prevOverflow !== undefined) {
        root.style.overflow = prevOverflow;
      }
      window.removeEventListener("wheel", prevent, true);
      window.removeEventListener("touchmove", prevent, true);
      window.removeEventListener("keydown", prevent, true);
    };
  }, [open]);

  if (!open || !step) return null;

  const pageLabel = TUTORIAL_PAGE_LABELS[step.page];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === totalSteps - 1;

  const handlePrev = () => {
    if (isFirst) return;
    setStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    if (isLast) {
      complete();
      return;
    }
    setStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleSkip = () => {
    setSeen(true);
    close();
  };

  const spotlightStyle = targetRect
    ? {
        top: Math.max(0, targetRect.top - SPOTLIGHT_PADDING),
        left: Math.max(0, targetRect.left - SPOTLIGHT_PADDING),
        width: Math.max(0, targetRect.width + SPOTLIGHT_PADDING * 2),
        height: Math.max(0, targetRect.height + SPOTLIGHT_PADDING * 2),
      }
    : undefined;

  const arrowStyle: React.CSSProperties = {
    "--arrow-offset": arrowOffset,
  } as React.CSSProperties;

  return (
    <div className={styles.overlay} aria-modal="true" role="dialog" aria-label="튜토리얼">
      {!targetRect && <div className={styles.dim} />}
      {targetRect && <div className={styles.spotlight} style={spotlightStyle} />}

      <div
        ref={cardRef}
        className={`${styles.card} ${styles[`card_${step.placement}`]}`}
        style={{ top: cardPosition.top, left: cardPosition.left }}
      >
        <div className={styles.card__meta}>
          <span className={styles.card__page}>{pageLabel}</span>
          <span className={styles.card__count}>
            {stepIndex + 1}/{totalSteps}
          </span>
        </div>

        <div className={styles.card__title}>{step.title}</div>
        <div className={styles.card__desc}>{step.description}</div>

        <div className={styles.card__actions}>
          <button
            type="button"
            className={styles.button}
            onClick={handlePrev}
            disabled={isFirst}
          >
            이전
          </button>
          <button type="button" className={styles.button} onClick={handleSkip}>
            건너뛰기
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.button_primary}`}
            onClick={handleNext}
          >
            {isLast ? "완료" : "다음"}
          </button>
        </div>

        <div
          className={`${styles.card__arrow} ${styles[`arrow_${arrowAxis}`]}`}
          style={arrowStyle}
        />
      </div>
    </div>
  );
}
