import { useEffect, useState } from "react";
import { soundManager } from "../engine/sound";
export type VoiceClip = { src: string; transcript: string };
let clips: Record<string, VoiceClip> = {},
  loading: Promise<void> | undefined;
export function loadNutritionVoice() {
  return (loading ??= fetch(
    `${import.meta.env?.BASE_URL ?? "/Biology/"}config/nutrition-voice.json`,
  )
    .then((r) => (r.ok ? r.json() : {}))
    .then((data: unknown) => {
      if (!data || typeof data !== "object") return;
      for (const [id, c] of Object.entries(data)) {
        if (
          c &&
          typeof c === "object" &&
          typeof c.src === "string" &&
          /^audio\/nutrition\/[a-z0-9/_-]+\.(mp3|wav|ogg)$/i.test(c.src) &&
          !c.src.includes("..") &&
          typeof c.transcript === "string"
        )
          clips[id] = c;
      }
    })
    .catch(() => {}));
}
let current: HTMLAudioElement | undefined,
  lastAt = 0,
  phrase = 0;
export async function playNutritionVoice(id: string) {
  const clip = clips[id];
  if (
    !clip ||
    !soundManager.getSnapshot().enabled ||
    soundManager.getSnapshot().volume === 0
  )
    return false;
  if (id.startsWith("correct") || id.startsWith("retry")) {
    if (Date.now() - lastAt < 2500 || soundManager.isNarrating()) return false;
    lastAt = Date.now();
  }
  if (current) soundManager.releaseMedia(current);
  current = new Audio(`${import.meta.env?.BASE_URL ?? "/Biology/"}${clip.src}`);
  return soundManager.playMedia(current, "narration");
}
export function reinforcement(kind: "correct" | "retry") {
  const candidates = Object.keys(clips).filter((id) =>
    id.startsWith(`${kind}.`),
  );
  if (!candidates.length) return false;
  void playNutritionVoice(candidates[phrase++ % candidates.length]);
  return true;
}
export function stopNutritionVoice() {
  if (current) {
    soundManager.releaseMedia(current);
    current = undefined;
  }
}
export function useNutritionVoice(id: string) {
  const [clip, setClip] = useState<VoiceClip | null>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setClip(null);
    setError(false);
    void loadNutritionVoice().then(async () => {
      const c = clips[id];
      if (!c) return;
      try {
        const r = await fetch(
          `${import.meta.env?.BASE_URL ?? "/Biology/"}${c.src}`,
          { method: "HEAD", signal: controller.signal },
        );
        if (
          !cancelled &&
          r.ok &&
          /audio|octet-stream/i.test(r.headers.get("content-type") || "")
        )
          setClip(c);
      } catch {
        /* No unavailable player is shown. */
      }
    });
    return () => {
      cancelled = true;
      controller.abort();
      stopNutritionVoice();
    };
  }, [id]);
  return {
    clip,
    error,
    play: async () => {
      setError(!(await playNutritionVoice(id)));
    },
    stop: stopNutritionVoice,
  };
}
