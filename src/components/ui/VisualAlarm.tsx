import { useEffect } from "react";
import { Icon } from "./icon";
import { Bell } from "lucide-react";

interface VisualAlarmProps {
  isActive: boolean;
  onDismiss: () => void;
}

export function VisualAlarm({ isActive, onDismiss }: VisualAlarmProps) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isActive, onDismiss]);

  if (!isActive) return null;

  return (
    <>
      {/* Custom animation for flashlight effect */}
      <style>
        {`
          @keyframes flashlight {
            0%, 100% { opacity: 0.75; }
            50% { opacity: 0.95; }
          }
        `}
      </style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFBEA",
          animation: "flashlight 0.8s ease-in-out infinite",
          cursor: "pointer",
        }}
        role="alert"
        aria-live="assertive"
        aria-label="Timer alarm"
        onClick={onDismiss}
      >
        <div
          className="bg-background rounded-lg p-8 shadow-2xl text-center"
          style={{
            border: "2px solid #F59E0B",
          }}
        >
          <Icon icon={Bell} className="w-16 h-16 mx-auto mb-4 animate-bounce text-amber-600" />
          <h2 className="text-2xl font-bold mb-2">Timer Complete!</h2>
          <p className="text-muted-foreground mb-4">Click anywhere or press any key to dismiss</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            style={{
              padding: "0.5rem 1.5rem",
              backgroundColor: "var(--color-sage)",
              color: "white",
              borderRadius: "0.375rem",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 500,
              outline: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px var(--color-sage-dark)")}
            onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            Dismiss Alarm
          </button>
        </div>
      </div>
    </>
  );
}
