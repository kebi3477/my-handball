import type { Gender } from "./team";

export type WelcomeSubmitRequest = {
  userGender: Gender;
  ageGroup: string;
  teamGender: Gender;
  teamNum: number | null;
  teamName: string | null;
  teamLogoUrl: string | null;
};
