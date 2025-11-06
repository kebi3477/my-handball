import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { myTeamAtom } from "@/state/myTeam";
import type { MyTeam } from "@/types/team";

export function useMyTeam() {
  const [team, setTeam] = useRecoilState(myTeamAtom);

  const save = useCallback(
    (next: MyTeam | null) => {
      setTeam(next);
    },
    [setTeam],
  );

  return { team, save };
}
