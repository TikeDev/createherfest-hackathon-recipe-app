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
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const statusTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    void getPrimaryProfile()
      .then((existing) => setProfile(existing ?? createNewProfile()))
      .finally(() => setLoading(false));
  }, []);

  const update = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  // Debounced auto-save
  useEffect(() => {
    if (!profile || loading) return;
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      await saveProfile(profile);
      setSaveStatus("saved");
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = setTimeout(() => setSaveStatus("idle"), 1500);
    }, 800);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [profile, loading]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      clearTimeout(saveTimeoutRef.current);
      clearTimeout(statusTimeoutRef.current);
    };
  }, []);

  return { profile, loading, saveStatus, update };
}
