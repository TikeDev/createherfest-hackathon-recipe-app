import { useState, useEffect, useCallback, useRef } from "react";
import { getPrimaryProfile, saveProfile } from "@/storage/profile";
import type { UserProfile } from "@/types/profile";

const DEFAULT_PROFILE: Omit<UserProfile, "id" | "createdAt" | "updatedAt"> = {
  role: "primary",
  allergens: [],
  excludedIngredients: [],
  toolRestrictions: [],
  limitationDuration: "temporary",
  mobilityLimits: [],
  dexterityLimits: [],
  dietPattern: [],
  prepAssistPreferences: [],
  preferredAppliances: [],
  cognitiveLoad: "medium",
  timePreferenceMinutes: undefined,
  budgetLevel: undefined,
  alarmEnabled: true,
  alarmSoundId: "moderate",
  alarmVolume: 70,
  visualAlarmEnabled: false,
  customAlarmId: undefined,
  customAlarmUploaded: false,
};

function createNewProfile(): UserProfile {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    ...DEFAULT_PROFILE,
  };
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isDirty, setIsDirty] = useState(false);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    void getPrimaryProfile()
      .then((existing) => setProfile(existing ?? createNewProfile()))
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback((patch: Partial<UserProfile>) => {
    setIsDirty(true);
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const save = useCallback(async () => {
    if (!profile) return;
    setSaveStatus("saving");
    await saveProfile(profile);
    setSaveStatus("saved");
    setIsDirty(false);
    clearTimeout(statusTimeoutRef.current);
    statusTimeoutRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
  }, [profile]);

  const discard = useCallback(async () => {
    const existing = await getPrimaryProfile();
    setProfile(existing ?? createNewProfile());
    setIsDirty(false);
    setSaveStatus("idle");
  }, []);

  useEffect(() => {
    return () => clearTimeout(statusTimeoutRef.current);
  }, []);

  return { profile, loading, saveStatus, isDirty, update, save, discard };
}
