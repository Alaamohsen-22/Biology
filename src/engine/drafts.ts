import { useEffect, useState } from "react";
export function useDraft<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(`life-island-draft:${key}`);
      if (!raw) return initial;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return initial;
      const restored = { ...initial };
      for (const field of Object.keys(initial as object)) {
        const old = (initial as Record<string, unknown>)[field], value = parsed[field];
        const valid = Array.isArray(old) ? Array.isArray(value) && value.every(v => typeof v === "string" || typeof v === "number") : old !== null && typeof old === "object" ? value !== null && typeof value === "object" && !Array.isArray(value) : typeof value === typeof old;
        if (valid) (restored as Record<string, unknown>)[field] = value;
      }
      return restored;
    }
    catch { return initial; }
  });
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    try { window.localStorage.setItem(`life-island-draft:${key}`, JSON.stringify(value)); setFailed(false); }
    catch { setFailed(true); }
  }, [key, value]);
  return [value, setValue, failed] as const;
}

export function useDraftState<T>(key: string, initial: T) {
  const [draft,setDraft] = useDraft(key, {value:initial});
  const setValue = (value: T | ((previous:T)=>T)) => setDraft(d=>({value: typeof value === "function" ? (value as (previous:T)=>T)(d.value) : value}));
  return [draft.value,setValue] as const;
}
