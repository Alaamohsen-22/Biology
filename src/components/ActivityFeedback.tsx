import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Star } from "lucide-react";
import { useSound } from "./SoundSystem";
export function useActivityFeedback(enabled = true) {
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [celebrating, setCelebrating] = useState(false);
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sound = useSound();
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return {
    status,
    celebrating,
    check(correct: boolean, onSuccess?: () => void) {
      if (locked.current) return;
      if (correct) {
        locked.current = true;
        setStatus("correct");
        setCelebrating(true);
        if (enabled) sound.play("success");
        onSuccess?.();
        timer.current = setTimeout(() => setCelebrating(false), 2500);
      } else {
        setStatus("wrong");
        if (enabled) sound.play("error");
      }
    },
    reset() {
      locked.current = false;
      if (timer.current) clearTimeout(timer.current);
      setStatus("idle");
      setCelebrating(false);
    },
  };
}
export function ActivityFeedback({
  status,
  celebrating,
  reduced = false,
}: {
  status: "idle" | "correct" | "wrong";
  celebrating: boolean;
  reduced?: boolean;
}) {
  return (
    <>
      <div
        role="status"
        aria-live="polite"
        className={`ordering-feedback ${status}`}
      >
        {status === "correct" ? (
          <>
            <CheckCircle2 size={42} />
            <strong>ممتاز! أنت عالم صغير مبدع! 🌟</strong>
          </>
        ) : status === "wrong" ? (
          <strong>محاولة جميلة! جرّب مرة أخرى 💚</strong>
        ) : null}
      </div>
      {celebrating && (
        <div
          className={`ordering-celebration ${reduced ? "still" : ""}`}
          data-testid="activity-celebration"
          aria-hidden="true"
        >
          {Array.from({ length: 16 }, (_, i) => (
            <i
              key={i}
              style={
                {
                  "--x": `${(i * 31) % 100}%`,
                  "--delay": `${(i % 4) * 0.06}s`,
                  "--turn": `${i % 2 ? 140 : -140}deg`,
                  "--color": ["#d7ad4a", "#719a74", "#bd756a", "#72a6b4"][
                    i % 4
                  ],
                } as React.CSSProperties
              }
            >
              {i % 3 === 0 ? <Star size={23} fill="currentColor" /> : <span />}
            </i>
          ))}
        </div>
      )}
    </>
  );
}
