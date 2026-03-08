import { z } from "zod";
import {
  FDA_ALLERGENS,
  DIET_PATTERNS,
  TOOL_RESTRICTIONS,
  MOBILITY_LIMITS,
  DEXTERITY_LIMITS,
  PREP_ASSIST_OPTIONS,
  PREFERRED_APPLIANCES,
  COGNITIVE_LOAD_LEVELS,
  BUDGET_LEVELS,
  LIMITATION_DURATIONS,
  PROFILE_ROLES,
  ALARM_SOUND_OPTIONS,
} from "./profile";

export const profileSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  role: z.enum(PROFILE_ROLES),

  // Hard constraints
  allergens: z.array(z.enum(FDA_ALLERGENS)),
  excludedIngredients: z.array(z.string()),
  toolRestrictions: z.array(z.enum(TOOL_RESTRICTIONS)),

  // Disability & physical
  limitationDuration: z.enum(LIMITATION_DURATIONS),
  mobilityLimits: z.array(z.enum(MOBILITY_LIMITS)),
  dexterityLimits: z.array(z.enum(DEXTERITY_LIMITS)),

  // Preferences
  dietPattern: z.array(z.enum(DIET_PATTERNS)),
  prepAssistPreferences: z.array(z.enum(PREP_ASSIST_OPTIONS)),
  preferredAppliances: z.array(z.enum(PREFERRED_APPLIANCES)),
  cognitiveLoad: z.enum(COGNITIVE_LOAD_LEVELS),
  timePreferenceMinutes: z.number().int().positive().optional(),
  budgetLevel: z.enum(BUDGET_LEVELS).optional(),

  // Timer alarm preferences
  alarmEnabled: z.boolean().default(true),
  alarmSoundId: z.enum(ALARM_SOUND_OPTIONS).default("moderate"),
  alarmVolume: z.number().int().min(0).max(100).default(70),
  visualAlarmEnabled: z.boolean().default(false),
  customAlarmId: z.string().optional(),
  customAlarmUploaded: z.boolean().default(false),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
