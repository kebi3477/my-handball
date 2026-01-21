import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { tutorialOpenAtom, tutorialSeenAtom } from "@/state/tutorial";

export function useTutorial() {
  const [seen, setSeen] = useRecoilState(tutorialSeenAtom);
  const [open, setOpen] = useRecoilState(tutorialOpenAtom);

  const start = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const close = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const complete = useCallback(() => {
    setSeen(true);
    setOpen(false);
  }, [setOpen, setSeen]);

  return {
    seen,
    open,
    start,
    close,
    complete,
    setSeen,
  };
}
