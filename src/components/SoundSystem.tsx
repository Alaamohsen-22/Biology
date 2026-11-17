import { useSyncExternalStore, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { soundManager, type SoundEffect } from "../engine/sound";
export function useSound() {
  const state = useSyncExternalStore(
    soundManager.subscribe,
    soundManager.getSnapshot,
    soundManager.getSnapshot,
  );
  return {
    ...state,
    play: (effect: SoundEffect) => {
      void soundManager.play(effect);
    },
    stop: () => soundManager.stop(),
  };
}
export function SoundNotice() {
  const sound = useSound();
  if (sound.status !== "error" && sound.status !== "blocked") return null;
  return (
    <div className="sound-notice" role="status">
      <VolumeX size={18} />
      <span>{sound.message}</span>
      <button data-sound="handled" onClick={() => sound.play("click")}>
        تفعيل الصوت
      </button>
    </div>
  );
}
export function SoundSettings({
  enabled,
  volume,
  onVolume,
}: {
  enabled: boolean;
  volume: number;
  onVolume: (n: number) => void;
}) {
  const sound = useSound();
  return (
    <div className="sound-settings">
      <label>
        مستوى الصوت: {volume}%
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={volume}
          onChange={(e) => onVolume(+e.target.value)}
        />
      </label>
      <button
        disabled={!enabled || volume === 0}
        data-sound="handled"
        onClick={() => sound.play("success")}
      >
        <Volume2 size={18} />
        تفعيل الصوت وتجربة النغمة
      </button>
      <p role="status">
        {!enabled
          ? "الصوت مكتوم"
          : volume === 0
            ? "مستوى الصوت صفر"
            : sound.status === "ready"
              ? "الصوت جاهز بعد تفاعلك"
              : sound.status === "loading"
                ? "يجري تحميل المؤثر…"
                : "تبدأ الأصوات بعد الضغط؛ يمكنك تجربة النغمة."}
      </p>
    </div>
  );
}
export function SoundPreferences({
  enabled,
  volume,
}: {
  enabled: boolean;
  volume: number;
}) {
  useEffect(() => {
    soundManager.configure(enabled, volume / 100);
  }, [enabled, volume]);
  return null;
}
export function interfaceClick(target: EventTarget | null) {
  const element = target as Element | null;
  if (!element || typeof element.closest !== "function") return;
  const button = element.closest<HTMLButtonElement>("button,summary");
  if (
    !button ||
    button.disabled ||
    button.closest('[data-sound-scope="custom"]') ||
    button.hasAttribute("data-sound")
  )
    return;
  void soundManager.play("click");
}
