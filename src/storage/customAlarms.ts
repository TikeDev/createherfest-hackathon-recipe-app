import { getDB } from "./db";
import { CUSTOM_AUDIO_LIMITS, AUDIO_VALIDATION_ERRORS } from "@/constants/alarmSounds";

export interface CustomAlarmData {
  id: string;
  audioBlob: Blob;
  fileName: string;
  fileSize: number;
  duration: number;
  uploadedAt: string;
}

export interface AudioValidationResult {
  valid: boolean;
  error?: string;
  duration?: number;
}

/**
 * Validate an audio file before storing
 * Checks: file type, size, and duration
 */
export async function validateAudioFile(file: File): Promise<AudioValidationResult> {
  // Check file type
  if (
    !CUSTOM_AUDIO_LIMITS.ALLOWED_TYPES.includes(
      file.type as (typeof CUSTOM_AUDIO_LIMITS.ALLOWED_TYPES)[number]
    )
  ) {
    return { valid: false, error: AUDIO_VALIDATION_ERRORS.INVALID_TYPE };
  }

  // Check file size
  if (file.size > CUSTOM_AUDIO_LIMITS.MAX_FILE_SIZE) {
    return { valid: false, error: AUDIO_VALIDATION_ERRORS.FILE_TOO_LARGE };
  }

  // Check duration by loading the audio
  try {
    const duration = await getAudioDuration(file);

    if (duration > CUSTOM_AUDIO_LIMITS.MAX_DURATION) {
      return { valid: false, error: AUDIO_VALIDATION_ERRORS.DURATION_TOO_LONG };
    }

    return { valid: true, duration };
  } catch {
    return { valid: false, error: AUDIO_VALIDATION_ERRORS.LOAD_FAILED };
  }
}

/**
 * Get the duration of an audio file in seconds
 */
async function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(objectUrl);
      resolve(audio.duration);
    });

    audio.addEventListener("error", () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load audio file"));
    });

    audio.src = objectUrl;
  });
}

/**
 * Save a custom alarm sound to IndexedDB
 * Validates the file before saving
 */
export async function saveCustomAlarm(file: File): Promise<{ success: boolean; error?: string }> {
  // Validate the file first
  const validation = await validateAudioFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const db = await getDB();

    // Store the blob directly
    const alarmData: CustomAlarmData = {
      id: "custom-alarm", // Single custom alarm per user
      audioBlob: file,
      fileName: file.name,
      fileSize: file.size,
      duration: validation.duration || 0,
      uploadedAt: new Date().toISOString(),
    };

    await db.put("customAlarms", alarmData);
    return { success: true };
  } catch (error) {
    console.error("Failed to save custom alarm:", error);
    return { success: false, error: "Failed to save custom alarm" };
  }
}

/**
 * Get the custom alarm sound from IndexedDB
 * Returns a blob URL that can be used with Audio API
 */
export async function getCustomAlarm(): Promise<string | null> {
  try {
    const db = await getDB();
    const alarmData = (await db.get("customAlarms", "custom-alarm")) as CustomAlarmData | undefined;

    if (!alarmData) {
      return null;
    }

    // Create a blob URL from the stored blob
    return URL.createObjectURL(alarmData.audioBlob);
  } catch (error) {
    console.error("Failed to get custom alarm:", error);
    return null;
  }
}

/**
 * Get custom alarm metadata (without creating blob URL)
 */
export async function getCustomAlarmMetadata(): Promise<Omit<CustomAlarmData, "audioBlob"> | null> {
  try {
    const db = await getDB();
    const alarmData = (await db.get("customAlarms", "custom-alarm")) as CustomAlarmData | undefined;

    if (!alarmData) {
      return null;
    }

    // Return metadata without the blob
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { audioBlob, ...metadata } = alarmData;
    return metadata;
  } catch (error) {
    console.error("Failed to get custom alarm metadata:", error);
    return null;
  }
}

/**
 * Delete the custom alarm sound
 */
export async function deleteCustomAlarm(): Promise<boolean> {
  try {
    const db = await getDB();
    await db.delete("customAlarms", "custom-alarm");
    return true;
  } catch (error) {
    console.error("Failed to delete custom alarm:", error);
    return false;
  }
}

/**
 * Check if a custom alarm exists
 */
export async function hasCustomAlarm(): Promise<boolean> {
  try {
    const db = await getDB();
    const alarmData = (await db.get("customAlarms", "custom-alarm")) as CustomAlarmData | undefined;
    return !!alarmData;
  } catch (error) {
    console.error("Failed to check custom alarm:", error);
    return false;
  }
}
