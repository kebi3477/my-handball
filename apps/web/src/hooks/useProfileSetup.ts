import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { profileSetupAtom } from "@/state/profileSetup";

export function useProfileSetup() {
  const [profileSetup, setProfileSetup] = useRecoilState(profileSetupAtom);

  const save = useCallback(
    (next: boolean) => {
      setProfileSetup(next);
    },
    [setProfileSetup],
  );

  return { profileSetup, save };
}
