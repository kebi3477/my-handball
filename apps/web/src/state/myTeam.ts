import { atom } from "recoil";
import type { MyTeam } from "@/types/team";

const STORAGE_KEY = "myTeam";

function read(): MyTeam | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MyTeam) : null;
  } catch {
    return null;
  }
}

function write(value: MyTeam | null) {
  if (typeof window === "undefined") return;

  if (value) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const myTeamAtom = atom<MyTeam | null>({
  key: "myTeam",
  default: null,
  effects_UNSTABLE: [
    ({ setSelf, onSet, resetSelf }) => {
      if (typeof window === "undefined") return;

      setSelf(read());

      const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        try {
          setSelf(JSON.parse(event.newValue ?? '') as MyTeam);
        } catch {
          resetSelf();
        }
      };

      window.addEventListener("storage", onStorage);

      onSet((newValue, _, isReset) => {
        if (isReset || newValue == null) {
          write(null);
          return;
        }
        write(newValue);
      });

      return () => {
        window.removeEventListener("storage", onStorage);
      };
    },
  ],
});
