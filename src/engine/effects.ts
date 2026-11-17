export type Effect = "select" | "check" | "success" | "error";
export interface EffectAudio {
  src: string;
  currentTime: number;
  volume: number;
  pause: () => void;
  play: () => Promise<void>;
}
// A single reusable channel prevents overlapping effects and unhandled play rejections.
export function createEffectPlayer(
  factory: () => EffectAudio = () => new Audio(),
  base = import.meta.env?.BASE_URL ?? "/Biology/",
) {
  let audio: EffectAudio | undefined;
  return {
    play(effect: Effect, enabled: boolean) {
      if (!enabled) {
        audio?.pause();
        return;
      }
      try {
        audio ??= factory();
        audio.pause();
        audio.currentTime = 0;
        audio.src = `${base}audio/effects/${effect}.wav`;
        audio.volume = 0.35;
        void audio.play().catch(() => {});
      } catch {
        /* Audio availability never blocks learning. */
      }
    },
    stop() {
      audio?.pause();
      if (audio) audio.currentTime = 0;
    },
  };
}
