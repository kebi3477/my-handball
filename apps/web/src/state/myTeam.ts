import { atom } from "recoil";
import type { MyTeam } from "@/types/team";

const STORAGE_KEY = "myTeam";

function readFromStorage(): MyTeam | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MyTeam) : null;
  } catch {
    return null;
  }
}

function writeToStorage(value: MyTeam | null) {
  if (typeof window === "undefined") return;
  try {
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore storage errors (e.g., private mode) 
  }
}

export const myTeamAtom = atom<MyTeam | null>({
  key: "myTeam",
  default: null,
  effects_UNSTABLE: [
    ({ setSelf, onSet, resetSelf }) => {
      if (typeof window === "undefined") return;

      const stored = readFromStorage();
      if (stored) setSelf(stored);

      const handleStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        if (event.newValue) {
          try {
            setSelf(JSON.parse(event.newValue) as MyTeam);
          } catch {
            resetSelf();
          }
        } else {
          resetSelf();
        }
      };

      window.addEventListener("storage", handleStorage);

      onSet((newValue, _, isReset) => {
        if (isReset || newValue == null) {
          writeToStorage(null);
          return;
        }
        writeToStorage(newValue);
      });

      return () => {
        window.removeEventListener("storage", handleStorage);
      };
    },
  ],
});
