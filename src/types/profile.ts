// --- Predefined option constants ---

export const FDA_ALLERGENS = [
  "milk",
  "eggs",
  "fish",
  "shellfish",
  "tree nuts",
  "peanuts",
  "wheat",
  "soybeans",
  "sesame",
] as const;

export const DIET_PATTERNS = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten-free",
  "dairy-free",
  "keto",
  "low-sodium",
  "halal",
  "kosher",
] as const;

export const TOOL_RESTRICTIONS = [
  "knife",
  "heavy lifting (pots)",
  "stovetop",
  "oven",
  "blender",
  "food processor",
  "grater",
  "peeler",
  "rolling pin",
  "hand mixer",
  "stand mixer",
] as const;

export const MOBILITY_LIMITS = [
  "limited standing",
  "wheelchair user",
  "limited reach (upper cabinets)",
  "cannot carry heavy items",
  "limited bending",
] as const;

export const DEXTERITY_LIMITS = [
  "limited grip strength",
  "limited fine motor control",
  "tremor",
  "one-handed",
  "limited wrist rotation",
  "pain with repetitive motion",
] as const;

export const PREP_ASSIST_OPTIONS = [
  "pre-cut vegetables",
  "frozen vegetables",
  "canned goods",
  "rotisserie chicken",
  "pre-made sauces",
  "jarred minced garlic",
  "pre-shredded cheese",
] as const;

export const PREFERRED_APPLIANCES = [
  "slow cooker",
  "air fryer",
  "Instant Pot",
  "microwave",
  "rice cooker",
  "toaster oven",
  "sheet pan (oven only)",
] as const;

export const COGNITIVE_LOAD_LEVELS = ["low", "medium", "high"] as const;
export const BUDGET_LEVELS = ["low", "medium", "high"] as const;
export const LIMITATION_DURATIONS = ["temporary", "chronic", "permanent", "mixed"] as const;
export const PROFILE_ROLES = ["primary", "guest"] as const;

// --- Alarm preferences constants ---
export const ALARM_SOUND_OPTIONS = ["gentle", "moderate", "urgent", "custom"] as const;
export type AlarmSound = (typeof ALARM_SOUND_OPTIONS)[number];

// --- UserProfile interface ---

export interface UserProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  role: (typeof PROFILE_ROLES)[number];

  // Hard constraints (safety-critical, never violated)
  allergens: string[];
  excludedIngredients: string[];
  toolRestrictions: string[];

  // Disability & physical
  limitationDuration: (typeof LIMITATION_DURATIONS)[number];
  mobilityLimits: string[];
  dexterityLimits: string[];

  // Preferences (soft scoring)
  dietPattern: string[];
  prepAssistPreferences: string[];
  preferredAppliances: string[];
  cognitiveLoad: (typeof COGNITIVE_LOAD_LEVELS)[number];
  timePreferenceMinutes?: number;
  budgetLevel?: (typeof BUDGET_LEVELS)[number];

  // --- Timer alarm preferences ---
  alarmEnabled?: boolean;
  alarmSoundId?: string; // ID of the built-in alarm sound
  alarmVolume?: number; // 0-100
  visualAlarmEnabled?: boolean; // Screen flash for deaf/hard of hearing
  customAlarmId?: string; // ID of custom uploaded alarm sound
  customAlarmUploaded?: boolean; // Whether a custom alarm has been uploaded
}
