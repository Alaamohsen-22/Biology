import { useEffect } from "react";
import { X } from "lucide-react";
import { SoundSettings } from "../components/SoundSystem";
import type { SettingsData } from "./storage";
export function SettingsDialog({
  settings: s,
  setSettings,
  close,
}: {
  settings: SettingsData;
  setSettings: (v: SettingsData) => void;
  close: () => void;
}) {
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const dialog = document.getElementById("settings-dialog")!;
    const elements = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]),input:not([disabled]),select:not([disabled]),summary,[tabindex="0"]',
        ),
      ).filter((element) => {
        if (element.closest("[hidden]")) return false;
        const closed = element.closest("details:not([open])");
        return !closed || closed.querySelector(":scope > summary") === element;
      });
    elements()[0]?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const list = elements();
        const first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  return (
    <section
      id="settings-dialog"
      className="settings-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="section-head">
        <h2 id="settings-title">اضبط رحلتك</h2>
        <button
          className="icon-button"
          aria-label="إغلاق الإعدادات"
          onClick={close}
        >
          <X />
        </button>
      </div>
      <label>
        حجم الخط
        <select
          value={s.font}
          onChange={(e) => setSettings({ ...s, font: +e.target.value })}
        >
          {[90, 100, 110, 120, 130].map((n) => (
            <option key={n} value={n}>
              {n}%
            </option>
          ))}
        </select>
      </label>
      {[
        ["dark", "الوضع الداكن"],
        ["contrast", "تباين مرتفع"],
        ["reduced", "تقليل الحركة"],
        ["sound", "الصوت والتسجيلات والمؤثرات"],
      ].map(([key, label]) => (
        <label className="toggle" key={key}>
          <span>{label}</span>
          <input
            type="checkbox"
            checked={s[key as keyof SettingsData] === true}
            onChange={(e) => setSettings({ ...s, [key]: e.target.checked })}
          />
        </label>
      ))}
      <SoundSettings
        enabled={s.sound}
        volume={s.volume}
        onVolume={(volume) => setSettings({ ...s, volume })}
      />{" "}
      <p className="muted">
        النصوص التعليمية ظاهرة دائمًا. الصوت لا يعمل تلقائيًا. جميع الأنشطة تدعم
        اللمس ولوحة المفاتيح.
      </p>
      <details>
        <summary>إعدادات المعلمة</summary>
        <p>أدوات محلية لهذا المتصفح؛ ليست لوحة حسابات محمية.</p>
        <label>
          معيار الإتقان: {s.threshold}%
          <input
            type="range"
            min="50"
            max="100"
            step="1"
            value={s.threshold}
            onChange={(e) => setSettings({ ...s, threshold: +e.target.value })}
          />
        </label>
        <small>
          التنقل مفتوح للجميع؛ تغيير المعيار يعيد احتساب الإتقان فقط.
        </small>
      </details>
    </section>
  );
}
