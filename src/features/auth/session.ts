"use client";

import { Role } from "@/features/demo-data";

const roleCookie = "petcare_role";
const sessionCookie = "petcare_session";

export function setDemoSession(role: Role = "PET_OWNER") {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toUTCString();
  document.cookie = `${sessionCookie}=demo-session; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `${roleCookie}=${role}; path=/; expires=${expires}; SameSite=Lax`;
  window.localStorage.setItem("petcare-demo-role", role);
}

export function clearDemoSession() {
  if (typeof document === "undefined") return;
  document.cookie = `${sessionCookie}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${roleCookie}=; path=/; max-age=0; SameSite=Lax`;
  window.localStorage.removeItem("petcare-demo-role");
}

export function getDemoRole(): Role {
  if (typeof window === "undefined") return "PET_OWNER";
  const found = document.cookie.split("; ").find((item) => item.startsWith(`${roleCookie}=`))?.split("=")[1] ?? window.localStorage.getItem("petcare-demo-role");
  return (["PET_OWNER", "VETERINARIAN", "SERVICE_PROVIDER", "ADMIN"] as const).includes(found as Role) ? found as Role : "PET_OWNER";
}
