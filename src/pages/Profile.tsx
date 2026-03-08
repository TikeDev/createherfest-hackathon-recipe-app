import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { handleRadioKeyDown } from "@/utils/a11y";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALARM_SOUNDS } from "@/constants/alarmSounds";
import { ShieldAlert, Accessibility, ChefHat, Bell, Clock, ArrowLeft, Check } from "lucide-react";
import { saveCustomAlarm, deleteCustomAlarm } from "@/storage/customAlarms";
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
} from "@/types/profile";

type ArrayField =
  | "allergens"
  | "excludedIngredients"
  | "toolRestrictions"
  | "mobilityLimits"
  | "dexterityLimits"
  | "dietPattern"
  | "prepAssistPreferences"
  | "preferredAppliances";

// --- Reusable sub-components ---

/** Multi-select toggle chip group */
function ChipGroup({
  legend,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-forest dark:text-cream-text">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(opt)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 ${
                isSelected
                  ? "bg-sage text-white"
                  : "border border-mist-pale bg-surface text-forest/70 hover:border-mist hover:text-forest dark:text-cream-text/70 dark:border-forest dark:hover:border-mist dark:hover:text-cream-text"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Single-select radio group (pill style) */
function RadioPillGroup<T extends string>({
  legend,
  options,
  selected,
  onChange,
  labels,
}: {
  legend: string;
  options: readonly T[];
  selected: T;
  onChange: (value: T) => void;
  labels?: Record<T, string>;
}) {
  return (
    <fieldset className="space-y-2" role="radiogroup">
      <legend className="text-sm font-semibold text-forest dark:text-cream-text">{legend}</legend>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const isSelected = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onChange(opt)}
              onKeyDown={(e) => handleRadioKeyDown(e, [...options], selected, onChange)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 ${
                isSelected
                  ? "bg-sage text-white"
                  : "border border-mist-pale bg-surface text-forest/70 hover:bg-mist-pale dark:text-cream-text/70 dark:border-forest"
              }`}
            >
              {labels ? labels[opt] : opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Free-text chip input for excluded ingredients */
function FreeTextChips({
  legend,
  values,
  onAdd,
  onRemove,
}: {
  legend: string;
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = input.trim().toLowerCase();
      if (trimmed && !values.includes(trimmed)) {
        onAdd(trimmed);
      }
      setInput("");
    }
  }

  function handleRemove(value: string) {
    onRemove(value);
    inputRef.current?.focus();
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-forest dark:text-cream-text">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {values.map((val) => (
          <span
            key={val}
            className="inline-flex items-center gap-1 rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold text-sage"
          >
            {val}
            <button
              type="button"
              onClick={() => handleRemove(val)}
              aria-label={`Remove ${val}`}
              className="ml-0.5 rounded-full p-0.5 hover:bg-sage/20 focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </span>
        ))}
      </div>
      <label htmlFor="excluded-input" className="sr-only">
        Type an ingredient and press Enter
      </label>
      <input
        ref={inputRef}
        id="excluded-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type an ingredient and press Enter"
        className="w-full rounded-lg border border-mist-pale bg-surface px-3 py-2 text-sm text-forest placeholder:text-forest/40 focus:border-sage focus:outline-none focus:ring-2 focus:ring-sage dark:text-cream-text dark:border-forest dark:placeholder:text-cream-text/40 dark:focus:border-sage"
      />
    </fieldset>
  );
}

/** Collapsible section card */
function Section({
  title,
  icon,
  defaultOpen,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? false);

  return (
    <div className="rounded-xl border border-mist-pale bg-surface dark:border-forest">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-forest focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 rounded-xl dark:text-cream-text"
      >
        <h2 className="flex items-center gap-2 text-lg font-bold font-headline">
          {icon}
          {title}
        </h2>
        <span
          aria-hidden="true"
          className={`text-forest/40 transition-transform duration-300 dark:text-cream-text/40 ${isOpen ? "rotate-180" : ""}`}
        >
          &#x25BE;
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="space-y-6 px-5 pb-5 pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

// --- Main page ---

export default function Profile() {
  const { profile, loading, saveStatus, isDirty, update, save, discard } = useProfile();
  const [uploadError, setUploadError] = useState<string>("");

  if (loading || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 md:py-8">
        <p className="text-sm text-forest/60 dark:text-cream-text/60" role="status">
          Loading profile...
        </p>
      </div>
    );
  }

  async function handleCustomAlarmUpload(file: File) {
    setUploadError("");
    try {
      const result = await saveCustomAlarm(file);
      if (result.success) {
        update({
          customAlarmUploaded: true,
          customAlarmId: "custom-alarm",
          alarmSoundId: "custom",
        });
      } else {
        setUploadError(result.error || "Upload failed");
      }
    } catch {
      setUploadError("Failed to upload custom alarm");
    }
  }

  async function handleCustomAlarmDelete() {
    try {
      await deleteCustomAlarm();
      update({
        customAlarmUploaded: false,
        customAlarmId: undefined,
        alarmSoundId: "moderate",
      });
    } catch (err) {
      console.error("Failed to delete custom alarm:", err);
    }
  }

  function toggleArrayValue(field: ArrayField, value: string) {
    if (!profile) return;
    const current = profile[field];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update({ [field]: next });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-8 space-y-6 md:py-8">
      {/* Header */}
      <div className="space-y-3 md:flex md:items-center md:justify-between md:space-y-0">
        <h1 className="pl-14 text-left text-2xl font-headline text-forest dark:text-cream-text md:pl-0">
          My Profile
        </h1>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => void discard()}
            disabled={!isDirty}
            aria-hidden={!isDirty}
            tabIndex={isDirty ? 0 : -1}
            className={`rounded-lg border border-mist-pale bg-surface px-3 py-1.5 text-xs font-medium text-forest/70 hover:border-mist hover:text-forest transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 dark:text-cream-text/70 dark:border-forest dark:hover:text-cream-text ${
              isDirty ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            Discard
          </button>
          <button
            type="button"
            role="status"
            aria-live="polite"
            onClick={() => void save()}
            disabled={!isDirty || saveStatus === "saving"}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-sage text-white transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 ${
              saveStatus === "saved" || isDirty
                ? "opacity-100 hover:bg-sage-dark"
                : "opacity-40 cursor-not-allowed"
            }`}
          >
            {saveStatus === "saving" && "Saving..."}
            {saveStatus === "saved" && (
              <>
                <Check size={14} aria-hidden="true" />
                Saved
              </>
            )}
            {saveStatus === "idle" && "Save"}
          </button>
          <Link
            to="/recipes"
            className="inline-flex items-center gap-1 rounded-lg bg-surface border border-mist-pale px-3 py-1.5 text-xs font-medium text-forest/70 hover:border-mist hover:text-forest transition-colors focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 dark:text-cream-text/70 dark:border-forest dark:hover:text-cream-text"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to recipes
          </Link>
        </div>
      </div>

      <p className="text-sm text-forest/60 dark:text-cream-text/60">
        Your profile helps Simmer find recipes that work for your body and kitchen. Press Save to
        keep your changes.
      </p>

      {/* Section 1: Safety & Allergens */}
      <Section
        title="Safety & Allergens"
        icon={<ShieldAlert size={20} aria-hidden="true" />}
        defaultOpen
      >
        <ChipGroup
          legend="Allergens (FDA top 9)"
          options={FDA_ALLERGENS}
          selected={profile.allergens}
          onToggle={(v) => toggleArrayValue("allergens", v)}
        />

        <FreeTextChips
          legend="Excluded ingredients"
          values={profile.excludedIngredients}
          onAdd={(v) => update({ excludedIngredients: [...profile.excludedIngredients, v] })}
          onRemove={(v) =>
            update({
              excludedIngredients: profile.excludedIngredients.filter((i) => i !== v),
            })
          }
        />

        <ChipGroup
          legend="Restricted tools & techniques"
          options={TOOL_RESTRICTIONS}
          selected={profile.toolRestrictions}
          onToggle={(v) => toggleArrayValue("toolRestrictions", v)}
        />
      </Section>

      {/* Section 2: Physical & Accessibility Needs */}
      <Section
        title="Physical & Accessibility Needs"
        icon={<Accessibility size={20} aria-hidden="true" />}
      >
        <RadioPillGroup
          legend="How long have you had these limitations?"
          options={LIMITATION_DURATIONS}
          selected={profile.limitationDuration}
          onChange={(v) => update({ limitationDuration: v })}
        />

        <ChipGroup
          legend="Mobility"
          options={MOBILITY_LIMITS}
          selected={profile.mobilityLimits}
          onToggle={(v) => toggleArrayValue("mobilityLimits", v)}
        />

        <ChipGroup
          legend="Dexterity & fine motor"
          options={DEXTERITY_LIMITS}
          selected={profile.dexterityLimits}
          onToggle={(v) => toggleArrayValue("dexterityLimits", v)}
        />
      </Section>

      {/* Section 3: Cooking Preferences */}
      <Section title="Cooking Preferences" icon={<ChefHat size={20} aria-hidden="true" />}>
        <ChipGroup
          legend="Diet patterns"
          options={DIET_PATTERNS}
          selected={profile.dietPattern}
          onToggle={(v) => toggleArrayValue("dietPattern", v)}
        />

        <ChipGroup
          legend="Preferred appliances"
          options={PREFERRED_APPLIANCES}
          selected={profile.preferredAppliances}
          onToggle={(v) => toggleArrayValue("preferredAppliances", v)}
        />

        <ChipGroup
          legend="Prep shortcuts you like"
          options={PREP_ASSIST_OPTIONS}
          selected={profile.prepAssistPreferences}
          onToggle={(v) => toggleArrayValue("prepAssistPreferences", v)}
        />

        <RadioPillGroup
          legend="Recipe complexity preference"
          options={COGNITIVE_LOAD_LEVELS}
          selected={profile.cognitiveLoad}
          onChange={(v) => update({ cognitiveLoad: v })}
          labels={{ low: "Simple", medium: "Moderate", high: "Complex" }}
        />
      </Section>

      {/* Section 4: Cooking Timer Alarms */}
      <Section title="Cooking Timer Alarms" icon={<Bell size={20} aria-hidden="true" />}>
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-forest dark:text-cream-text">
            Timer alarms
          </legend>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-mist-pale bg-surface px-3 py-2 dark:border-forest">
            <label
              id="timer-alarms-enabled-label"
              className="text-sm text-forest dark:text-cream-text"
            >
              Enable alarm when a cooking timer ends
            </label>
            <Switch
              checked={profile.alarmEnabled ?? true}
              onCheckedChange={(checked) => update({ alarmEnabled: checked })}
              aria-labelledby="timer-alarms-enabled-label"
            />
          </div>
        </fieldset>

        <div
          className={`${profile.alarmEnabled === false ? "opacity-60" : ""} space-y-6`}
          aria-disabled={profile.alarmEnabled === false}
        >
          {/* Alarm Sound Selection */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-forest dark:text-cream-text">
              Alarm Sound
            </legend>
            <Select
              value={profile.alarmSoundId ?? "moderate"}
              onValueChange={(value) => update({ alarmSoundId: value })}
              disabled={profile.alarmEnabled === false}
            >
              <SelectTrigger id="alarm-sound" className="w-full">
                <SelectValue placeholder="Select alarm sound" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.entries(ALARM_SOUNDS).map(([id, sound]) => (
                    <SelectItem key={id} value={id}>
                      {sound.label} — {sound.description}
                    </SelectItem>
                  ))}
                  {profile.customAlarmUploaded && (
                    <SelectItem value="custom">Custom Sound</SelectItem>
                  )}
                </SelectGroup>
              </SelectContent>
            </Select>
          </fieldset>

          {/* Volume Slider */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-forest dark:text-cream-text">
              Volume: {profile.alarmVolume}%
            </legend>
            <Slider
              value={[profile.alarmVolume ?? 70]}
              onValueChange={(values) => update({ alarmVolume: values[0] })}
              min={0}
              max={100}
              step={5}
              disabled={profile.alarmEnabled === false}
              className="w-full max-w-md"
              aria-label="Alarm volume"
            />
            <div className="flex max-w-md justify-between text-xs text-forest/50 dark:text-cream-text/50">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </fieldset>

          {/* Visual Alarm Toggle */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-forest dark:text-cream-text">
              Visual Alarm
            </legend>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-mist-pale bg-surface px-3 py-2 dark:border-forest">
              <label
                id="visual-alarm-enabled-label"
                className="text-sm text-forest dark:text-cream-text"
              >
                Screen flash for deaf/hard of hearing
              </label>
              <Switch
                checked={profile.visualAlarmEnabled ?? false}
                onCheckedChange={(checked) => update({ visualAlarmEnabled: checked })}
                disabled={profile.alarmEnabled === false}
                aria-labelledby="visual-alarm-enabled-label"
              />
            </div>
          </fieldset>

          {/* Custom Alarm Upload */}
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-forest dark:text-cream-text">
              Custom Alarm Sound
            </legend>
            <p className="text-xs text-forest/60 dark:text-cream-text/60">
              Upload your own alarm sound (MP3, WAV, OGG, or M4A, max 2MB, max 10 seconds)
            </p>

            {!profile.customAlarmUploaded ? (
              <div>
                <input
                  type="file"
                  accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/m4a,audio/x-m4a"
                  disabled={profile.alarmEnabled === false}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleCustomAlarmUpload(file);
                  }}
                  className="block w-full text-sm text-forest dark:text-cream-text
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-sage file:text-white
                  hover:file:bg-sage-dark
                  file:cursor-pointer cursor-pointer"
                />
                {uploadError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
                    {uploadError}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-mist-pale bg-surface px-3 py-2 dark:border-forest">
                <span className="text-sm text-forest dark:text-cream-text flex items-center gap-2">
                  <span aria-hidden="true">🔔</span>
                  Custom alarm uploaded
                </span>
                <button
                  type="button"
                  disabled={profile.alarmEnabled === false}
                  onClick={() => void handleCustomAlarmDelete()}
                  className="text-xs text-red-600 hover:text-red-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded px-2 py-1"
                >
                  Remove
                </button>
              </div>
            )}
          </fieldset>
        </div>
      </Section>

      {/* Section 5: Time & Budget */}
      <Section title="Time & Budget" icon={<Clock size={20} aria-hidden="true" />}>
        {/* Time preference */}
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold text-forest dark:text-cream-text">
            Max cooking time
          </legend>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-forest/70 dark:text-cream-text/70">
              <input
                type="checkbox"
                checked={profile.timePreferenceMinutes == null}
                onChange={(e) =>
                  update({
                    timePreferenceMinutes: e.target.checked ? undefined : 30,
                  })
                }
                className="rounded border-mist-pale text-sage focus:ring-2 focus:ring-sage focus:ring-offset-2"
              />
              No time preference
            </label>
          </div>
          {profile.timePreferenceMinutes != null && (
            <div className="space-y-1">
              <label htmlFor="time-range" className="sr-only">
                Maximum cooking time in minutes
              </label>
              <input
                id="time-range"
                type="range"
                min={15}
                max={120}
                step={15}
                value={profile.timePreferenceMinutes}
                onChange={(e) => update({ timePreferenceMinutes: Number(e.target.value) })}
                aria-valuetext={`${profile.timePreferenceMinutes} minutes`}
                className="w-full accent-sage focus:outline-none focus:ring-2 focus:ring-sage focus:ring-offset-2 rounded-lg"
              />
              <div className="flex justify-between text-xs text-forest/50 dark:text-cream-text/50">
                <span>15 min</span>
                <span className="font-semibold text-sage">{profile.timePreferenceMinutes} min</span>
                <span>120 min</span>
              </div>
            </div>
          )}
        </fieldset>

        {/* Budget */}
        <RadioPillGroup
          legend="Budget level"
          options={BUDGET_LEVELS}
          selected={profile.budgetLevel ?? "medium"}
          onChange={(v) => update({ budgetLevel: v })}
          labels={{ low: "Budget-friendly", medium: "Moderate", high: "No limit" }}
        />
      </Section>
    </div>
  );
}
