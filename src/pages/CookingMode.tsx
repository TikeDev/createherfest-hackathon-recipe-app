import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRecipe } from "../storage/recipes";
import { updateRecipe } from "../storage/recipes";
import type { RecipeJSON, Step, Ingredient, GroceryCategory } from "../types/recipe";
import { classifyGroceries } from "../agent/classifyGroceries";
import ThemeToggle from "../components/ui/ThemeToggle";
import { Icon } from "@/components/ui/icon";
import { useViewPreferences } from "@/contexts/ViewPreferencesContext";
import { useProfile } from "@/hooks/useProfile";
import { playAlarm, stopAlarm } from "@/utils/alarm";
import { VisualAlarm } from "@/components/ui/VisualAlarm";
import {
  ShoppingCart,
  Moon,
  Scissors,
  Flame,
  UtensilsCrossed,
  Beef,
  Milk,
  Package,
  Leaf,
  FlaskConical,
  Archive,
  Snowflake,
  Croissant,
  CupSoda,
  Box,
  Star,
  Check,
  X,
  Lightbulb,
  ChevronUp,
  ChevronDown,
  Timer,
  AlertTriangle,
  Salad,
  CircleCheckBig,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  BellOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Hook ────────────────────────────────────────────────────────
function useRecipe(id: string) {
  const [recipe, setRecipe] = useState<RecipeJSON | null>(null);
  useEffect(() => {
    if (!id) return;
    void getRecipe(id).then((r) => setRecipe(r ?? null));
  }, [id]);
  return recipe;
}

// ─── Shared UI ───────────────────────────────────────────────────
const Btn = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}) => {
  const baseClasses =
    "rounded-[10px] px-6 py-3 text-sm font-bold cursor-pointer font-nunito transition-all duration-150 w-full";
  const variantClasses = {
    primary: `bg-sage text-white border-none ${disabled ? "opacity-50 cursor-default" : "hover:bg-sage-dark"}`,
    secondary: "bg-transparent text-sage border-[1.5px] border-sage hover:bg-sage/10",
    ghost: "bg-transparent text-muted-foreground border-none hover:text-foreground",
  };

  return (
    <button
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`${baseClasses} ${variantClasses[variant]}`}
      style={{
        backgroundColor:
          variant === "primary"
            ? disabled
              ? "var(--color-mist)"
              : "var(--color-sage)"
            : variant === "secondary"
              ? "transparent"
              : "transparent",
        color:
          variant === "primary"
            ? "white"
            : variant === "secondary"
              ? "var(--color-sage)"
              : "var(--muted-foreground)",
        border: variant === "secondary" ? "1.5px solid var(--color-sage)" : "none",
      }}
    >
      {children}
    </button>
  );
};

const Card = ({
  children,
  style: s = {},
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      backgroundColor: "var(--card)",
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 1px 12px rgba(45,59,53,0.07)",
      color: "var(--card-foreground)",
      ...s,
    }}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontSize: 12,
      fontWeight: 800,
      color: "var(--muted-foreground)",
      textTransform: "uppercase",
      letterSpacing: 1.5,
      marginBottom: 12,
    }}
  >
    {children}
  </div>
);

// ─── Loading Spinner ─────────────────────────────────────────────
const LoadingSpinner = ({ text }: { text: string }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      padding: 40,
    }}
  >
    <Icon icon={Loader2} size="lg" decorative className="text-sage animate-spin" />
    <div style={{ fontSize: 14, color: "var(--muted-foreground)", fontWeight: 600 }}>{text}</div>
  </div>
);

// ─── Stage bar ───────────────────────────────────────────────────
type Stage = "groceries" | "preprep" | "prep" | "cook" | "serve";

const STAGE_ICONS: Record<Stage, LucideIcon> = {
  groceries: ShoppingCart,
  preprep: Moon,
  prep: Scissors,
  cook: Flame,
  serve: UtensilsCrossed,
};

const STAGES: { key: Stage; label: string }[] = [
  { key: "groceries", label: "Groceries" },
  { key: "preprep", label: "Pre-Prep" },
  { key: "prep", label: "Prep" },
  { key: "cook", label: "Cook" },
  { key: "serve", label: "Serve" },
];

const StageBar = ({ current }: { current: Stage }) => {
  const currentIdx = STAGES.findIndex((s) => s.key === current);
  return (
    <nav
      aria-label="Cooking stages"
      style={{
        padding: "14px 48px",
        backgroundColor: "var(--card)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
      }}
    >
      {STAGES.map((s, i) => (
        <div
          key={s.key}
          aria-current={i === currentIdx ? "step" : undefined}
          style={{ display: "flex", alignItems: "center", flex: i < 4 ? 1 : 0 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              aria-hidden="true"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                backgroundColor:
                  i === currentIdx
                    ? "var(--color-sage)"
                    : i < currentIdx
                      ? "var(--color-mist)"
                      : "var(--color-mist-pale)",
                border:
                  i === currentIdx ? "2px solid var(--color-sage-dark)" : "2px solid transparent",
                transition: "all 0.25s",
              }}
            >
              <Icon icon={STAGE_ICONS[s.key]} size="sm" decorative />
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: i === currentIdx ? 800 : 500,
                whiteSpace: "nowrap",
                color:
                  i === currentIdx
                    ? "var(--color-sage)"
                    : i < currentIdx
                      ? "var(--color-mist)"
                      : "var(--muted-foreground)",
              }}
            >
              {s.label}
            </span>
          </div>
          {i < 4 && (
            <div
              style={{
                flex: 1,
                height: 2,
                margin: "0 10px",
                backgroundColor: i < currentIdx ? "var(--color-mist)" : "var(--color-mist-pale)",
              }}
            />
          )}
        </div>
      ))}
    </nav>
  );
};

// ─── Step layout (shared for preprep/prep/cook) ──────────────────
const StepLayout = ({
  icon: IconComponent,
  title,
  stepLabel,
  stepContent,
  progressBar,
  sidebar,
}: {
  icon: LucideIcon;
  title: string;
  stepLabel: string;
  stepContent: React.ReactNode;
  progressBar?: React.ReactNode;
  sidebar: React.ReactNode;
}) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40 }}>
    <div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--muted-foreground)",
          marginBottom: 20,
          textTransform: "uppercase",
          letterSpacing: 1.2,
        }}
      >
        {stepLabel}
      </div>
      {stepContent}
      {progressBar}
    </div>
    <div style={{ position: "sticky", top: 130, alignSelf: "start" }}>
      <Card style={{ textAlign: "center", marginBottom: 16, padding: 36 }}>
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}>
          <Icon icon={IconComponent} decorative className="text-sage w-14 h-14" />
        </div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            fontFamily: "'Lora', serif",
            color: "var(--foreground)",
          }}
        >
          {title}
        </div>
      </Card>
      {sidebar}
    </div>
  </div>
);

// ─── Groceries ───────────────────────────────────────────────────
const CATEGORY_ICONS: Record<GroceryCategory, LucideIcon> = {
  Produce: Salad,
  Protein: Beef,
  Dairy: Milk,
  Pantry: Package,
  "Spices & Seasonings": Leaf,
  "Oils & Vinegars": FlaskConical,
  "Canned & Jarred": Archive,
  Frozen: Snowflake,
  Bakery: Croissant,
  Beverages: CupSoda,
  Other: Box,
};

function GroceriesStage({
  recipe,
  onNext,
  onBack,
}: {
  recipe: RecipeJSON;
  onNext: () => void;
  onBack: () => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<Record<string, GroceryCategory> | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [classifyFailed, setClassifyFailed] = useState(false);

  useEffect(() => {
    // Check if ingredients already have categories
    const hasCategories = recipe.ingredients.some((ing) => ing.category);

    if (hasCategories) {
      // Use stored categories
      const storedCategories: Record<string, GroceryCategory> = {};
      recipe.ingredients.forEach((ing) => {
        storedCategories[ing.id] = ing.category || "Other";
      });
      setCategories(storedCategories);
    } else {
      // No categories found - classify on demand for legacy recipes
      setClassifying(true);
      classifyGroceries(recipe.ingredients)
        .then(async (classified) => {
          setCategories(classified);
          // Save categories back to recipe for future use
          try {
            const updatedRecipe: RecipeJSON = {
              ...recipe,
              ingredients: recipe.ingredients.map((ing) => ({
                ...ing,
                category: classified[ing.id] || "Other",
              })),
            };
            await updateRecipe(updatedRecipe);
          } catch (error) {
            console.warn("Failed to save categories:", error);
          }
        })
        .catch((error) => {
          console.error("Failed to classify groceries:", error);
          setClassifyFailed(true);
          setCategories({}); // Empty categories will trigger flat list
        })
        .finally(() => setClassifying(false));
    }
  }, [recipe]);

  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const total = recipe.ingredients.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  // Group ingredients by category once classification is ready
  const grouped = new Map<GroceryCategory, Ingredient[]>();
  const hasAnyCategories = categories && Object.keys(categories).length > 0;

  if (hasAnyCategories) {
    for (const ing of recipe.ingredients) {
      const cat = categories[ing.id] ?? "Other";
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(ing);
    }
  }

  const renderIngredient = (ing: Ingredient, isLast: boolean) => (
    <div
      key={ing.id}
      role="checkbox"
      aria-checked={!!checked[ing.id]}
      tabIndex={0}
      onClick={() => toggle(ing.id)}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle(ing.id);
        }
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 24px",
        cursor: "pointer",
        opacity: checked[ing.id] ? 0.4 : 1,
        transition: "all 0.2s",
        borderBottom: isLast ? "none" : "1px solid var(--border)",
        backgroundColor: checked[ing.id] ? "var(--accent)" : "transparent",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          flexShrink: 0,
          backgroundColor: checked[ing.id] ? "var(--color-sage)" : "transparent",
          border: `2px solid ${checked[ing.id] ? "var(--color-sage)" : "var(--border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        {checked[ing.id] && <Icon icon={Check} size="xs" decorative className="text-white" />}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--foreground)",
            textDecoration: checked[ing.id] ? "line-through" : "none",
            lineHeight: 1.4,
          }}
        >
          {ing.name}
        </div>
        <div style={{ fontSize: 14, color: "var(--muted-foreground)", marginTop: 2 }}>
          {ing.raw}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 36 }}>
      <div>
        <div style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 28,
              fontFamily: "'Lora', serif",
              fontWeight: 700,
              color: "var(--foreground)",
              margin: "0 0 6px",
            }}
          >
            Groceries
          </h2>
          <p style={{ color: "var(--muted-foreground)", margin: 0, fontSize: 14 }}>
            {classifying
              ? "Organizing by aisle…"
              : "Check off everything you need before you start."}
          </p>
        </div>

        {/* Show loading spinner while classifying */}
        {classifying ? (
          <Card>
            <LoadingSpinner text="Organizing groceries by aisle..." />
          </Card>
        ) : hasAnyCategories ? (
          /* Grouped by category */
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {Array.from(grouped.entries()).map(([cat, ings]) => (
              <div key={cat}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: "var(--color-sage)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon icon={CATEGORY_ICONS[cat]} size="lg" decorative className="text-white" />
                  </div>
                  <span
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "var(--foreground)",
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                    }}
                  >
                    {cat}
                  </span>
                </div>
                <Card style={{ padding: 0, overflow: "hidden" }}>
                  {ings.map((ing, i) => renderIngredient(ing, i === ings.length - 1))}
                </Card>
              </div>
            ))}
          </div>
        ) : (
          /* Flat list fallback (classification failed or no categories) */
          <>
            {classifyFailed && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  backgroundColor: "var(--accent)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "var(--muted-foreground)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Icon icon={AlertTriangle} size="sm" decorative />
                <span>Unable to organize by aisle. Showing flat list.</span>
              </div>
            )}
            <Card style={{ padding: 0, overflow: "hidden" }}>
              {recipe.ingredients.map((ing, i) =>
                renderIngredient(ing, i === recipe.ingredients.length - 1)
              )}
            </Card>
          </>
        )}
      </div>
      <div style={{ position: "sticky", top: 130, alignSelf: "start" }}>
        <Card style={{ marginBottom: 16 }}>
          <SectionLabel>Progress</SectionLabel>
          <div
            style={{ fontSize: 40, fontWeight: 900, color: "var(--color-sage)", marginBottom: 4 }}
          >
            {checkedCount} / {total}
          </div>
          <div style={{ fontSize: 15, color: "var(--muted-foreground)", marginBottom: 12 }}>
            items checked
          </div>
          <div
            style={{
              height: 8,
              backgroundColor: "var(--color-mist-pale)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 4,
                backgroundColor: "var(--color-sage)",
                width: `${total ? (checkedCount / total) * 100 : 0}%`,
                transition: "width 0.3s",
              }}
            />
          </div>
        </Card>
        {recipe.metadata.totalTimeMinutes && (
          <Card style={{ marginBottom: 20 }}>
            <SectionLabel>Total time</SectionLabel>
            <div style={{ fontSize: 36, fontWeight: 900, color: "var(--foreground)" }}>
              {recipe.metadata.totalTimeMinutes} min
            </div>
          </Card>
        )}
        <Btn onClick={onNext}>I have everything · Next →</Btn>
        <div style={{ marginTop: 10 }}>
          <Btn variant="ghost" onClick={onBack}>
            ← Back
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── Generic step stage (PrePrep / Prep) ─────────────────────────
function StepStage({
  icon,
  title,
  steps,
  onNext,
  onBack,
}: {
  icon: LucideIcon;
  title: string;
  steps: Step[];
  onNext: () => void;
  onBack: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [tipOpen, setTipOpen] = useState(false);
  const step = steps[idx];
  const isLast = idx === steps.length - 1;

  const handleNext = () => {
    setTipOpen(false);
    if (isLast) {
      onNext();
    } else {
      setIdx((i) => i + 1);
    }
  };
  const handleBack = () => {
    setTipOpen(false);
    if (idx > 0) {
      setIdx((i) => i - 1);
    } else {
      onBack();
    }
  };

  if (!step) return null;

  const techniqueNote = step.annotations.find((a) => a.type === "technique");

  return (
    <StepLayout
      icon={icon}
      title={title}
      stepLabel={`Step ${idx + 1} of ${steps.length}`}
      stepContent={
        <div>
          <Card style={{ padding: 44, marginBottom: 14 }}>
            <p
              style={{
                fontSize: 22,
                lineHeight: 1.9,
                color: "var(--foreground)",
                fontFamily: "'Lora', serif",
                margin: 0,
              }}
            >
              {step.text}
            </p>
            {step.isCritical && step.criticalNote && (
              <div
                style={{
                  marginTop: 16,
                  backgroundColor: "var(--destructive)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "white",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  lineHeight: 1.5,
                }}
              >
                <Icon icon={AlertTriangle} size="sm" decorative className="flex-shrink-0 mt-0.5" />{" "}
                {step.criticalNote}
              </div>
            )}
          </Card>
          {techniqueNote && (
            <div>
              <button
                onClick={() => setTipOpen(!tipOpen)}
                style={{
                  backgroundColor: "transparent",
                  border: "1.5px solid var(--color-mist)",
                  borderRadius: 10,
                  padding: "11px 18px",
                  fontSize: 13,
                  color: "var(--color-sage)",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Icon icon={Lightbulb} size="sm" decorative />
                <span>What does this mean?</span>
                <Icon icon={tipOpen ? ChevronUp : ChevronDown} size="sm" decorative />
              </button>
              {tipOpen && (
                <div
                  style={{
                    backgroundColor: "var(--accent)",
                    borderRadius: "0 0 10px 10px",
                    padding: "14px 18px",
                    fontSize: 14,
                    color: "var(--foreground)",
                    lineHeight: 1.8,
                    border: "1px solid var(--border)",
                    borderTop: "none",
                  }}
                >
                  {techniqueNote.text}
                </div>
              )}
            </div>
          )}
        </div>
      }
      progressBar={
        <div
          role="group"
          aria-label={`Step ${idx + 1} of ${steps.length}`}
          style={{ display: "flex", gap: 8, marginTop: 20 }}
        >
          {steps.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to step ${i + 1}`}
              aria-current={i === idx ? "step" : undefined}
              onClick={() => {
                setTipOpen(false);
                setIdx(i);
              }}
              style={{
                height: 4,
                flex: 1,
                borderRadius: 2,
                cursor: "pointer",
                transition: "background 0.2s",
                backgroundColor: i <= idx ? "var(--color-sage)" : "var(--color-mist-pale)",
                border: "none",
                padding: 0,
              }}
            />
          ))}
        </div>
      }
      sidebar={
        <>
          <Btn onClick={handleNext}>{isLast ? "Done · Next stage →" : "Done · Next step →"}</Btn>
          <div style={{ marginTop: 10 }}>
            <Btn variant="secondary" onClick={handleBack}>
              ← Back
            </Btn>
          </div>
        </>
      }
    />
  );
}

// ─── Circular Timer ──────────────────────────────────────────────
const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CircularTimer({
  timeLeft,
  totalSeconds,
  paused,
  done,
  onPause,
  onUnpause,
  onRestart,
  onDismissAlarm,
  alarmPlaying,
}: {
  timeLeft: number;
  totalSeconds: number;
  paused: boolean;
  done: boolean;
  onPause: () => void;
  onUnpause: () => void;
  onRestart: () => void;
  onDismissAlarm?: () => void;
  alarmPlaying?: boolean;
}) {
  const pct = totalSeconds > 0 ? timeLeft / totalSeconds : 0;
  const offset = CIRCUMFERENCE * (1 - pct);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Card
      style={{
        padding: 28,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
      }}
    >
      {/* Circle */}
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg width="200" height="200" aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="var(--color-mist-pale)"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={
              done ? "var(--color-mist)" : paused ? "var(--muted-foreground)" : "var(--color-sage)"
            }
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
          />
        </svg>
        {/* Time label centered over the SVG */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              color: done ? "var(--color-mist)" : "var(--foreground)",
              fontFamily: "'Lora', serif",
              lineHeight: 1,
            }}
          >
            {fmt(timeLeft)}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted-foreground)",
              marginTop: 4,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {done ? "done" : paused ? "paused" : "remaining"}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10 }}>
        {!done &&
          (paused ? (
            <button
              onClick={onUnpause}
              style={{
                ...timerBtnStyle("var(--color-sage)", "white"),
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon icon={Play} size="sm" decorative /> Resume
            </button>
          ) : (
            <button
              onClick={onPause}
              style={{
                ...timerBtnStyle("transparent", "var(--color-sage)", "var(--color-sage)"),
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon icon={Pause} size="sm" decorative /> Pause
            </button>
          ))}
        <button
          onClick={onRestart}
          style={{
            ...timerBtnStyle("transparent", "var(--muted-foreground)", "var(--border)"),
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Icon icon={RotateCcw} size="sm" decorative /> Restart
        </button>
      </div>

      {done && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "var(--color-sage)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon icon={CircleCheckBig} size="sm" decorative /> Timer done — ready for the next step
          </div>
          {alarmPlaying && onDismissAlarm && (
            <button
              onClick={onDismissAlarm}
              style={{
                ...timerBtnStyle("var(--color-sage)", "white"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <Icon icon={BellOff} size="sm" decorative /> Dismiss Alarm
            </button>
          )}
        </div>
      )}
    </Card>
  );
}

const timerBtnStyle = (bg: string, color: string, border?: string): React.CSSProperties => ({
  backgroundColor: bg,
  color,
  border: `1.5px solid ${border ?? bg}`,
  borderRadius: 10,
  padding: "9px 18px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Nunito', sans-serif",
});

// ─── Cook ────────────────────────────────────────────────────────
function CookStage({
  steps,
  onNext,
  onBack,
}: {
  steps: Step[];
  onNext: () => void;
  onBack: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerDone, setTimerDone] = useState(false);
  const [alarmAudio, setAlarmAudio] = useState<HTMLAudioElement | null>(null);
  const [showVisualAlarm, setShowVisualAlarm] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { profile } = useProfile();
  const step = steps[idx];
  const isLast = idx === steps.length - 1;
  const timerSeconds = step?.timingMinutes ? Math.round(step.timingMinutes * 60) : null;

  const clearTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const runInterval = () => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) {
          clearTimer();
          setTimerActive(false);
          setTimerDone(true);
          // Trigger alarm when timer completes
          if (profile?.alarmEnabled) {
            void playAlarm(profile).then((audio) => {
              setAlarmAudio(audio);
            });
            if (profile.visualAlarmEnabled) {
              setShowVisualAlarm(true);
            }
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setTimerActive(true);
    setTimerPaused(false);
    setTimerDone(false);
    runInterval();
  };

  const pauseTimer = () => {
    clearTimer();
    setTimerActive(false);
    setTimerPaused(true);
  };

  const unpauseTimer = () => {
    setTimerActive(true);
    setTimerPaused(false);
    runInterval();
  };

  const restartTimer = () => {
    if (timerSeconds) startTimer(timerSeconds);
  };

  const dismissAlarm = () => {
    stopAlarm(alarmAudio);
    setAlarmAudio(null);
    setShowVisualAlarm(false);
  };

  const resetTimerState = () => {
    clearTimer();
    setTimerActive(false);
    setTimerPaused(false);
    setTimerDone(false);
    setTimeLeft(null);
    dismissAlarm();
  };

  // Reset timer when step changes
  useEffect(() => {
    resetTimerState();
  }, [idx]);

  // Cleanup on unmount
  useEffect(() => () => clearTimer(), []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const timerStarted = timerActive || timerPaused || timerDone;

  if (!step) return null;

  return (
    <>
      <StepLayout
        icon={Flame}
        title="Cook"
        stepLabel={`Step ${idx + 1} of ${steps.length}`}
        stepContent={
          <div>
            <Card style={{ padding: 44, marginBottom: 16 }}>
              <p
                style={{
                  fontSize: 22,
                  lineHeight: 1.9,
                  color: "var(--foreground)",
                  fontFamily: "'Lora', serif",
                  margin: 0,
                }}
              >
                {step.text}
              </p>
            </Card>

            {timerSeconds && !timerStarted && (
              <button
                onClick={() => startTimer(timerSeconds)}
                style={{
                  backgroundColor: "var(--accent)",
                  border: "1.5px solid var(--color-mist)",
                  borderRadius: 12,
                  padding: "15px 24px",
                  fontSize: 14,
                  color: "var(--color-sage)",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Icon icon={Timer} size="md" decorative /> Start Timer · {fmt(timerSeconds)}
              </button>
            )}

            {timerStarted && timeLeft !== null && timerSeconds && (
              <CircularTimer
                timeLeft={timeLeft}
                totalSeconds={timerSeconds}
                paused={timerPaused}
                done={timerDone}
                onPause={pauseTimer}
                onUnpause={unpauseTimer}
                onRestart={restartTimer}
                onDismissAlarm={dismissAlarm}
                alarmPlaying={alarmAudio !== null || showVisualAlarm}
              />
            )}

            <div
              role="group"
              aria-label={`Step ${idx + 1} of ${steps.length}`}
              style={{ display: "flex", gap: 8, marginTop: 20 }}
            >
              {steps.map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  style={{
                    height: 4,
                    flex: 1,
                    borderRadius: 2,
                    backgroundColor: i <= idx ? "var(--color-sage)" : "var(--color-mist-pale)",
                  }}
                />
              ))}
              <span
                style={{
                  position: "absolute",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  clip: "rect(0,0,0,0)",
                  whiteSpace: "nowrap",
                }}
              >
                Step {idx + 1} of {steps.length}
              </span>
            </div>
          </div>
        }
        sidebar={
          <>
            <Btn
              onClick={() => {
                resetTimerState();
                if (isLast) {
                  onNext();
                } else {
                  setIdx((i) => i + 1);
                }
              }}
            >
              {isLast ? "Done · Next stage →" : "Done · Next step →"}
            </Btn>
            <div style={{ marginTop: 10 }}>
              <Btn
                variant="secondary"
                onClick={() => {
                  resetTimerState();
                  if (idx > 0) {
                    setIdx((i) => i - 1);
                  } else {
                    onBack();
                  }
                }}
              >
                ← Back
              </Btn>
            </div>
          </>
        }
      />
      {/* Visual alarm overlay */}
      <VisualAlarm isActive={showVisualAlarm} onDismiss={dismissAlarm} />
    </>
  );
}

// ─── Serve ───────────────────────────────────────────────────────
function ServeStage({
  recipe,
  onComplete,
  onBack,
}: {
  recipe: RecipeJSON;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", paddingTop: 48 }}>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
        <Icon icon={UtensilsCrossed} decorative className="text-sage w-20 h-20" />
      </div>
      <h2
        style={{
          fontSize: 38,
          fontFamily: "'Lora', serif",
          fontWeight: 700,
          color: "var(--foreground)",
          margin: "0 0 10px",
          lineHeight: 1.3,
        }}
      >
        You made it.
        <br />
        Time to eat.
      </h2>
      <p style={{ fontSize: 16, color: "var(--muted-foreground)", marginBottom: 44 }}>
        {recipe.title}
      </p>

      {!submitted ? (
        <Card style={{ marginBottom: 28 }}>
          <div
            style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}
          >
            How complex did this feel?
          </div>
          <div style={{ fontSize: 13, color: "var(--muted-foreground)", marginBottom: 22 }}>
            Your rating helps improve future matches
          </div>
          <div
            role="radiogroup"
            aria-label="Complexity rating"
            style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 14 }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                role="radio"
                aria-checked={rating === n}
                aria-label={`${n} out of 5 stars`}
                onClick={() => setRating(n)}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  border: "none",
                  backgroundColor: rating >= n ? "var(--color-sage)" : "var(--color-mist-pale)",
                  cursor: "pointer",
                  fontSize: 22,
                  transition: "all 0.15s",
                  transform: rating === n ? "scale(1.15)" : "scale(1)",
                }}
              >
                <Icon
                  icon={Star}
                  size="md"
                  decorative
                  className={rating >= n ? "text-white" : "text-sage"}
                />
              </button>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "var(--muted-foreground)",
              padding: "0 4px",
              marginBottom: 24,
            }}
          >
            <span>Very easy</span>
            <span>Very complex</span>
          </div>
          <Btn onClick={() => setSubmitted(true)} disabled={rating === 0}>
            Rate it →
          </Btn>
        </Card>
      ) : (
        <Card
          style={{
            marginBottom: 28,
            backgroundColor: "var(--accent)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Icon icon={Leaf} size="lg" decorative className="text-sage mb-2" />
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-sage)" }}>
            Thanks — rating saved
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
        <button
          onClick={onBack}
          style={{
            padding: "13px 28px",
            borderRadius: 10,
            border: "1.5px solid var(--color-sage)",
            backgroundColor: "transparent",
            color: "var(--color-sage)",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Back
        </button>
        <button
          onClick={onComplete}
          style={{
            padding: "13px 28px",
            borderRadius: 10,
            border: "none",
            backgroundColor: "var(--color-sage)",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Cook something else →
        </button>
      </div>
    </div>
  );
}

// ─── Main CookingMode ────────────────────────────────────────────
interface Props {
  recipe: RecipeJSON;
  onComplete: () => void;
  onBack: () => void;
}

export function CookingMode({ recipe, onComplete, onBack }: Props) {
  const [stage, setStage] = useState<Stage>("groceries");
  // Access view preferences to ensure theme context is connected
  useViewPreferences();

  // Split flat steps array into stages using isCritical for preprep
  const prePrepSteps = recipe.steps.filter((s) => s.isCritical);
  const prepSteps = recipe.steps.filter((s) => !s.isCritical && !s.timingMinutes);
  const cookSteps = recipe.steps.filter((s) => !s.isCritical && !!s.timingMinutes);

  const stageContent: Record<Stage, React.ReactNode> = {
    groceries: (
      <GroceriesStage recipe={recipe} onNext={() => setStage("preprep")} onBack={onBack} />
    ),
    preprep:
      prePrepSteps.length > 0 ? (
        <StepStage
          icon={Moon}
          title="Pre-Prep"
          steps={prePrepSteps}
          onNext={() => setStage("prep")}
          onBack={() => setStage("groceries")}
        />
      ) : null,
    prep: (
      <StepStage
        icon={Scissors}
        title="Prep"
        steps={prepSteps}
        onNext={() => setStage("cook")}
        onBack={() => setStage(prePrepSteps.length > 0 ? "preprep" : "groceries")}
      />
    ),
    cook: (
      <CookStage
        steps={cookSteps}
        onNext={() => setStage("serve")}
        onBack={() => setStage("prep")}
      />
    ),
    serve: <ServeStage recipe={recipe} onComplete={onComplete} onBack={() => setStage("cook")} />,
  };

  // Auto-skip preprep if no critical steps
  useEffect(() => {
    if (stage === "preprep" && prePrepSteps.length === 0) {
      setStage("prep");
    }
  }, [stage, prePrepSteps.length]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--background)",
        fontFamily: "'Nunito', 'Segoe UI', sans-serif",
        color: "var(--foreground)",
      }}
    >
      <h1
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
        }}
      >
        Cooking: {recipe.title}
      </h1>
      {/* Nav */}
      <nav
        aria-label="Cooking mode"
        style={{
          backgroundColor: "var(--card)",
          borderBottom: "1px solid var(--border)",
          padding: "0 48px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 8px rgba(45,59,53,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon icon={Leaf} size="lg" decorative className="text-sage" />
          <span
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "var(--foreground)",
              fontFamily: "'Lora', Georgia, serif",
            }}
          >
            Simmer
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle compact />
          <button
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-sage)",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: "'Nunito', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon icon={X} size="sm" decorative /> Exit cooking mode
          </button>
        </div>
      </nav>

      {/* Stage bar */}
      <StageBar current={stage} />

      {/* Content */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "44px 48px 80px" }}>
        {stageContent[stage]}
      </div>
    </div>
  );
}

// ─── Wrapper (connected to router) ───────────────────────────────
export default function CookingModeWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  const recipe = useRecipe(id ?? "");

  if (!recipe)
    return (
      <div
        role="status"
        style={{
          padding: 40,
          fontFamily: "'Nunito', sans-serif",
          color: "var(--muted-foreground)",
          textAlign: "center",
          backgroundColor: "var(--background)",
          minHeight: "100vh",
        }}
      >
        Simmer is thinking...
      </div>
    );

  return (
    <CookingMode
      recipe={recipe}
      onComplete={() => {
        void navigate("/");
      }}
      onBack={() => {
        void navigate(-1);
      }}
    />
  );
}
