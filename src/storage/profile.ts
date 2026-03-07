import { getDB } from "./db";
import type { UserProfile } from "@/types/profile";

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDB();
  await db.put("profile", { ...profile, updatedAt: new Date().toISOString() });
}

export async function getProfile(id: string): Promise<UserProfile | undefined> {
  const db = await getDB();
  const profile = (await db.get("profile", id)) as UserProfile | undefined;

  // Apply defaults for alarm preferences if they don't exist (migration)
  if (profile && typeof profile.alarmEnabled === "undefined") {
    const updated: UserProfile = {
      ...profile,
      alarmEnabled: true,
      alarmSoundId: "moderate",
      alarmVolume: 70,
      visualAlarmEnabled: false,
      customAlarmUploaded: false,
      updatedAt: new Date().toISOString(),
    };
    await db.put("profile", updated);
    return updated;
  }

  return profile;
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const db = await getDB();
  const profiles = (await db.getAll("profile")) as UserProfile[];

  // Apply migration to all profiles
  const migratedProfiles: UserProfile[] = profiles.map((profile) => {
    if (typeof profile.alarmEnabled === "undefined") {
      return {
        ...profile,
        alarmEnabled: true,
        alarmSoundId: "moderate",
        alarmVolume: 70,
        visualAlarmEnabled: false,
        customAlarmUploaded: false,
      } as UserProfile;
    }
    return profile;
  });

  return migratedProfiles;
}

export async function getPrimaryProfile(): Promise<UserProfile | undefined> {
  const db = await getDB();
  const results = (await db.getAllFromIndex("profile", "by_role", "primary")) as UserProfile[];
  const profile = results[0] as UserProfile | undefined;

  // Apply defaults for alarm preferences if they don't exist (migration)
  if (profile && typeof profile.alarmEnabled === "undefined") {
    const updated: UserProfile = {
      ...profile,
      alarmEnabled: true,
      alarmSoundId: "moderate",
      alarmVolume: 70,
      visualAlarmEnabled: false,
      customAlarmUploaded: false,
      updatedAt: new Date().toISOString(),
    };
    await db.put("profile", updated);
    return updated;
  }

  return profile;
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("profile", id);
}
