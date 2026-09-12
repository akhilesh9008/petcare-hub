"use client";

import { useCallback, useEffect, useState } from "react";
import type { Role } from "@/features/demo-data";

export interface ProfessionalProfile {
  role: "VETERINARIAN" | "SERVICE_PROVIDER";
  businessName: string;
  focus: string;
  location: string;
  credential: string;
  bio: string;
  availability: string[];
}

function profileKey(userId: string) {
  return `petcare-hub-professional-profile-v1:${userId}`;
}

export function useProfessionalProfile(userId: string, role: Role) {
  const [profile, setProfile] = useState<ProfessionalProfile | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    try {
      const raw = window.localStorage.getItem(profileKey(userId));
      const parsed = raw ? JSON.parse(raw) as Partial<ProfessionalProfile> : undefined;
      if (parsed && (parsed.role === "VETERINARIAN" || parsed.role === "SERVICE_PROVIDER")) {
        setProfile({
          role: parsed.role,
          businessName: typeof parsed.businessName === "string" ? parsed.businessName : "",
          focus: typeof parsed.focus === "string" ? parsed.focus : "",
          location: typeof parsed.location === "string" ? parsed.location : "",
          credential: typeof parsed.credential === "string" ? parsed.credential : "",
          bio: typeof parsed.bio === "string" ? parsed.bio : "",
          availability: Array.isArray(parsed.availability) ? parsed.availability.filter((value): value is string => typeof value === "string") : [],
        });
      } else {
        setProfile(undefined);
      }
    } catch {
      setProfile(undefined);
    } finally {
      setLoaded(true);
    }
  }, [userId, role]);

  const saveProfile = useCallback((next: ProfessionalProfile) => {
    setProfile(next);
    window.localStorage.setItem(profileKey(userId), JSON.stringify(next));
  }, [userId]);

  return { profile, loaded, saveProfile };
}
