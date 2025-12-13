import { atom } from "recoil";

const STORAGE_KEY = "profileSetup";

function read(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "1" || v === "true";
  } catch {
    return false;
  }
}

function write(value: boolean) {
  if (typeof window === "undefined") return;
  
  if (value) {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export const profileSetupAtom = atom<boolean>({
  key: "profileSetup",
  default: false,
  effects_UNSTABLE: [
    ({ setSelf, onSet }) => {
      if (typeof window === "undefined") return;

      setSelf(read());

      const onStorage = (e: StorageEvent) => {
        if (e.key !== STORAGE_KEY) return;
        setSelf(e.newValue === "1" || e.newValue === "true");
      };

      window.addEventListener("storage", onStorage);
      onSet((v) => write(v));

      return () => window.removeEventListener("storage", onStorage);
    },
  ],
});
