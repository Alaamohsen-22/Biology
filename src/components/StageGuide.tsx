import { useCallback, useEffect, useRef, useState } from "react";
import { TeacherCharacter } from "./PalestinianGuide";
import { GuideMedia } from "./GuideMedia";
import assets from "../data/assets.json";
import { welcomedStages } from "../engine/guideWelcome";
export function StageGuide({
  context,
  text,
  className = "",
  hints = [],
  notice = "",
  autoOpen = true,
}: {
  context: string;
  text: string;
  className?: string;
  hints?: string[];
  notice?: string;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(false),
    [cue, setCue] = useState("");
  const [level, setLevel] = useState(0);
  const previous = useRef<string | null>(null);
  useEffect(() => {
    if (previous.current === context) return;
    previous.current = context;
    const first = !welcomedStages.has(context);
    welcomedStages.add(context);
    setOpen(first && autoOpen);
    setCue("");
  }, [context]);
  useEffect(() => {
    setLevel(0);
  }, [context]);
  useEffect(() => {
    if (notice) setOpen(true);
  }, [notice]);
  const receiveCue = useCallback((text: string) => setCue(text), []);
  return (
    <aside
      className={`stage-guide ${className}`}
      aria-label="المرشدة الفلسطينية"
    >
      <button
        className="stage-guide-avatar"
        aria-label="فتح فقاعة المرشدة"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {assets.companion ? (
          <img
            className="teacher-character"
            src={`${import.meta.env?.BASE_URL ?? "/Biology/"}${assets.companion}`}
            alt="المرشدة الفلسطينية"
          />
        ) : (
          <TeacherCharacter />
        )}
      </button>
      {!open && !autoOpen && (
        <button className="guide-request" onClick={() => setOpen(true)}>
          أحتاج تلميحًا
        </button>
      )}
      {open && (
        <div className="stage-guide-bubble">
          <p aria-live="polite">
            {cue ||
              (level > 0
                ? hints[Math.min(level - 1, hints.length - 1)] || text
                : text)}
          </p>
          {hints.length > 0 && (
            <button
              className="text-button"
              onClick={() => setLevel((n) => Math.min(n + 1, hints.length))}
            >
              أعطني تلميحًا
            </button>
          )}
          <button className="text-button" onClick={() => setOpen(false)}>
            إغلاق الفقاعة
          </button>
          <GuideMedia context={context} onCue={receiveCue} />
        </div>
      )}
    </aside>
  );
}
