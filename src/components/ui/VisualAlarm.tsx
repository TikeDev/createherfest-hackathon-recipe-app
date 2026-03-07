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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-red-500/20 animate-pulse"
      role="alert"
      aria-live="assertive"
      aria-label="Timer alarm"
      onClick={onDismiss}
    >
      <div className="bg-background border-2 border-red-500 rounded-lg p-8 shadow-2xl text-center">
        <Icon icon={Bell} className="w-16 h-16 mx-auto mb-4 text-red-500 animate-bounce" />
        <h2 className="text-2xl font-bold mb-2">Timer Complete!</h2>
        <p className="text-muted-foreground mb-4">Click anywhere or press any key to dismiss</p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Dismiss Alarm
        </button>
      </div>
    </div>
  );
}
