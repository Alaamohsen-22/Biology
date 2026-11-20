import { initialProgress, parseProgress } from "../engine/progress";
import { lessonPages } from "../engine/lessonFlow";
import { curriculum } from "../data/curriculum";
export const PROGRESS_KEY = "life-island-progress-v1",
  SETTINGS_KEY = "life-island-settings-v1",
  LOCATION_KEY = "life-island-draft:classroom-location-v1";
export type SettingsData = {
  dark: boolean;
  contrast: boolean;
  reduced: boolean;
  font: number;
  sound: boolean;
  volume: number;
  threshold: number;
};
export type Destination = {
  page: "home" | "lesson" | "progress" | "help" | "final";
  lesson: number;
  section: "intro" | "pre" | "concept" | "review" | "post" | "award";
  topic: number;
  scene?: string;
};
export const home: Destination = {
  page: "home",
  lesson: 1,
  section: "intro",
  topic: 0,
};
export function readProgress() {
  try {
    return parseProgress(
      JSON.parse(localStorage.getItem(PROGRESS_KEY) || "null"),
    );
  } catch {
    return initialProgress();
  }
}
export function readSettings(): SettingsData {
  const fallback: SettingsData = {
    dark: false,
    contrast: false,
    reduced:
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    font: 100,
    sound: true,
    volume: 70,
    threshold: 70,
  };
  try {
    const v = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "null");
    if (!v) return fallback;
    return {
      ...fallback,
      dark: v.dark === true,
      contrast: v.contrast === true,
      reduced: typeof v.reduced === "boolean" ? v.reduced : fallback.reduced,
      font: [90, 100, 110, 120, 130].includes(v.font) ? v.font : 100,
      sound: v.sound !== false,
      volume:
        Number.isFinite(v.volume) && v.volume >= 0 && v.volume <= 100
          ? v.volume
          : 70,
      threshold:
        Number.isFinite(v.threshold) && v.threshold >= 50 && v.threshold <= 100
          ? v.threshold
          : 70,
    };
  } catch {
    return fallback;
  }
}
export function validLocation(v: unknown): v is Destination {
  if (!v || typeof v !== "object") return false;
  const r = v as Destination;
  return (
    r.page === "lesson" &&
    Number.isInteger(r.lesson) &&
    r.lesson >= 1 &&
    r.lesson <= 7 &&
    ["intro", "pre", "concept", "review", "post", "award"].includes(
      r.section,
    ) &&
    Number.isInteger(r.topic) &&
    r.topic >= 0 &&
    r.topic < curriculum[r.lesson - 1].topics.length &&
    (r.scene === undefined ||
      curriculum[r.lesson - 1].topics[r.topic].scenes.includes(r.scene))
  );
}
export function readLocation(): Destination | null {
  try {
    const v = JSON.parse(localStorage.getItem(LOCATION_KEY) || "null");
    if (validLocation(v)) return v;
    const old = JSON.parse(
      localStorage.getItem("life-island-draft:concept-book-location-v1") ||
        "null",
    );
    if (
      !old?.saved ||
      !Number.isInteger(old.lesson) ||
      old.lesson < 1 ||
      old.lesson > 7 ||
      !Number.isInteger(old.index)
    )
      return null;
    const p = lessonPages(old.lesson)[old.index];
    if (!p) return null;
    return {
      ...home,
      page: "lesson",
      lesson: old.lesson,
      topic: p.concept ?? 0,
      section:
        p.concept !== undefined
          ? "concept"
          : p.kind === "pre"
            ? "pre"
            : p.kind === "post"
              ? "post"
              : p.kind === "certificate"
                ? "award"
                : ["summary", "infographic"].includes(p.kind)
                  ? "review"
                  : "intro",
      ...(p.scene ? { scene: p.scene } : {}),
    };
  } catch {
    return null;
  }
}
