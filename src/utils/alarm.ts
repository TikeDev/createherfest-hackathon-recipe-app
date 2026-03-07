import type { UserProfile } from "@/types/profile";
import { ALARM_SOUNDS } from "@/constants/alarmSounds";

/**
 * Play alarm based on user profile settings
 * Returns the HTMLAudioElement so it can be stopped later
 */
export async function playAlarm(profile: UserProfile): Promise<HTMLAudioElement | null> {
  if (!profile.alarmEnabled) {
    return null;
  }

  let audioUrl: string | null = null;

  // Check if using custom alarm
  if (profile.customAlarmId && profile.customAlarmUploaded) {
    try {
      const { getCustomAlarm } = await import("@/storage/customAlarms");
      const customAlarm = await getCustomAlarm();
      if (customAlarm) {
        audioUrl = customAlarm;
      }
    } catch (error) {
      console.error("Failed to load custom alarm:", error);
    }
  }

  // Fallback to built-in alarm sound
  if (!audioUrl && profile.alarmSoundId) {
    const soundId = profile.alarmSoundId as keyof typeof ALARM_SOUNDS;
    const builtInSound = ALARM_SOUNDS[soundId];
    if (builtInSound) {
      audioUrl = builtInSound.file;
    }
  }

  // Last resort fallback
  if (!audioUrl) {
    const defaultSound = ALARM_SOUNDS.moderate;
    if (defaultSound) {
      audioUrl = defaultSound.file;
    }
  }

  if (!audioUrl) {
    console.error("No alarm sound available");
    return null;
  }

  try {
    const audio = new Audio(audioUrl);
    audio.volume = (profile.alarmVolume ?? 70) / 100;
    audio.loop = true;

    await audio.play();

    return audio;
  } catch (error) {
    console.error("Failed to play alarm:", error);
    return null;
  }
}

/**
 * Stop the currently playing alarm
 */
export function stopAlarm(audio: HTMLAudioElement | null): void {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}
