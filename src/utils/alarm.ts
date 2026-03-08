import type { UserProfile } from "@/types/profile";
import { ALARM_SOUNDS, type AlarmSoundId } from "@/constants/alarmSounds";
import { getCustomAlarm } from "@/storage/customAlarms";

const DEFAULT_SOUND_ID: AlarmSoundId = "moderate";
const TONE_INTERVAL_MS = 1200; // ~0.83Hz (well below 3Hz flash guidance)

export type AlarmSettings = Pick<
  UserProfile,
  "alarmEnabled" | "alarmSoundId" | "alarmVolume" | "customAlarmUploaded"
>;

export interface AlarmPlayback {
  stop: () => void;
}

function clampVolume(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function isBuiltInSoundId(value: string): value is AlarmSoundId {
  return value in ALARM_SOUNDS;
}

async function playAudioUrl(
  url: string,
  volume: number,
  cleanupUrl?: string
): Promise<AlarmPlayback | null> {
  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp || !cleanupUrl) return;
    URL.revokeObjectURL(cleanupUrl);
    cleanedUp = true;
  };

  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.loop = true;
    await audio.play();

    return {
      stop: () => {
        audio.pause();
        audio.currentTime = 0;
        cleanup();
      },
    };
  } catch (error) {
    cleanup();
    console.error("Failed to play alarm audio:", error);
    return null;
  }
}

function playGeneratedTone(soundId: AlarmSoundId, volume: number): AlarmPlayback | null {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextCtor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextCtor) {
    console.error("No AudioContext available for alarm fallback");
    return null;
  }

  const context = new AudioContextCtor();
  void context.resume().catch(() => {
    // Best effort. If autoplay policy blocks this, visual alarm still covers notification.
  });

  const frequency = ALARM_SOUNDS[soundId].fallbackFrequency;

  const playPulse = () => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.03);
    gain.gain.linearRampToValueAtTime(0, now + 0.45);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.5);
  };

  playPulse();
  const intervalId = window.setInterval(playPulse, TONE_INTERVAL_MS);

  return {
    stop: () => {
      window.clearInterval(intervalId);
      void context.close();
    },
  };
}

/**
 * Play alarm based on user profile settings
 * Returns a playback handle so callers can stop and cleanup the alarm
 */
export async function playAlarm(profile: AlarmSettings): Promise<AlarmPlayback | null> {
  if (profile.alarmEnabled === false) {
    return null;
  }

  const volume = clampVolume((profile.alarmVolume ?? 70) / 100);
  const rawSoundId = profile.alarmSoundId ?? DEFAULT_SOUND_ID;
  const soundId = isBuiltInSoundId(rawSoundId) ? rawSoundId : DEFAULT_SOUND_ID;

  // Try custom upload first when explicitly selected
  if (rawSoundId === "custom" && profile.customAlarmUploaded) {
    try {
      const customAlarm = await getCustomAlarm();
      if (customAlarm) {
        const playback = await playAudioUrl(customAlarm, volume, customAlarm);
        if (playback) return playback;
      }
    } catch (error) {
      console.error("Failed to load custom alarm:", error);
    }
  }

  // Then try selected built-in sound
  const builtInPlayback = await playAudioUrl(ALARM_SOUNDS[soundId].file, volume);
  if (builtInPlayback) return builtInPlayback;

  // Last resort for missing placeholder files: generated tone via Web Audio API
  return playGeneratedTone(soundId, volume);
}

/**
 * Stop the currently playing alarm
 */
export function stopAlarm(playback: AlarmPlayback | null): void {
  playback?.stop();
}
