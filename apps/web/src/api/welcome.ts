import { buildWelcomeSubmitUrl } from "@/config/api";
import type { WelcomeSubmitRequest } from "@/types/welcome";

export async function submitWelcome(data: WelcomeSubmitRequest) {
  const res = await fetch(buildWelcomeSubmitUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `HTTP Error ${res.status}`);
  }
}
