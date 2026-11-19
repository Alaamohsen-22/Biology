export const effectNames = [
  "click",
  "select",
  "move",
  "check",
  "start",
  "step",
  "tool",
  "water",
  "success",
  "error",
  "drop",
  "discover",
  "time",
  "diagnostic-result",
  "bubble",
  "combine",
  "separate",
] as const;
export type SoundEffect = (typeof effectNames)[number];
type AudioContextConstructor = new () => AudioContext;
export type SoundSnapshot = {
  enabled: boolean;
  volume: number;
  status: "idle" | "loading" | "ready" | "blocked" | "error";
  message: string;
};
export class SoundManager {
  private state: SoundSnapshot = {
    enabled: true,
    volume: 0.7,
    status: "idle",
    message: "",
  };
  private listeners = new Set<() => void>();
  private context?: AudioContext;
  private gain?: GainNode;
  private source?: AudioBufferSourceNode;
  private fallback?: HTMLAudioElement;
  private buffers = new Map<string, Promise<AudioBuffer>>();
  private sequence = 0;
  private lastAt = 0;
  private lastEffect = "";
  private media?: HTMLMediaElement;
  private mediaSequence = 0;
  private bed?: HTMLAudioElement;
  private bedSequence = 0;
  private mediaEvents?: () => void;
  private mediaKind: "narration" | "music" = "narration";
  constructor(private base = import.meta.env?.BASE_URL ?? "/Biology/") {}
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getSnapshot = () => this.state;
  private update(patch: Partial<SoundSnapshot>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => fn());
  }
  configure(enabled: boolean, volume = this.state.volume) {
    const level = Math.max(0, Math.min(1, volume));
    if (enabled === this.state.enabled && level === this.state.volume) return;
    this.update({
      enabled,
      volume: level,
      ...(!enabled || level === 0
        ? { status: "idle" as const, message: "" }
        : {}),
    });
    if (!enabled || level === 0) {
      this.stop();
      this.mediaSequence++;
      this.media?.pause();
    }
    if (this.gain) {
      const narrationPlaying = this.media && !this.media.paused && this.mediaKind === "narration";
      this.gain.gain.value = level * (narrationPlaying ? 0.18 : 0.9);
    }
    if (this.fallback) this.fallback.volume = level * 0.9;
    if (this.bed && (!enabled || level === 0)) { this.bedSequence++; this.bed.pause(); }
    this.applyBedVolume();
    if (this.media) {
      if (!enabled) this.media.pause();
      this.media.muted = !enabled;
      this.media.volume = level * (this.mediaKind === "music" ? 0.22 : 1);
    }
  }
  private initialize() {
    if (this.context) return;
    const scope = window as Window & {
      AudioContext?: AudioContextConstructor;
      webkitAudioContext?: AudioContextConstructor;
    };
    const Constructor = scope.AudioContext ?? scope.webkitAudioContext;
    if (Constructor) {
      const context = new Constructor();
      const gain = context.createGain();
      gain.connect(context.destination);
      this.context = context;
      this.gain = gain;
    }
  }
  stop() {
    this.sequence++;
    try {
      this.source?.stop();
    } catch {
      /* Already finished. */
    }
    this.source = undefined;
    this.fallback?.pause();
  }
  async play(effect: SoundEffect) {
    if (!this.state.enabled || this.state.volume === 0) return false;
    // Long recordings own the channel until paused or released.
    if (this.media && !this.media.paused) return false;
    const now = Date.now();
    if (
      effect === this.lastEffect &&
      now - this.lastAt < (["tool", "water"].includes(effect) ? 180 : 65)
    )
      return false;
    this.lastAt = now;
    this.lastEffect = effect;
    this.stop();
    const token = this.sequence;
    this.update({ status: "loading", message: "" });
    try {
      this.initialize();
      if (this.context && this.gain) {
        // resume is invoked synchronously in the click/change handler, before fetching/decoding.
        const resume =
          this.context.state === "suspended"
            ? this.context.resume()
            : Promise.resolve();
        const path = `${this.base}audio/effects/${effect}.wav`;
        let pending = this.buffers.get(path);
        if (!pending) {
          pending = fetch(path)
            .then((r) => {
              if (!r.ok) throw Error(`audio ${r.status}`);
              return r.arrayBuffer();
            })
            .then((bytes) => this.context!.decodeAudioData(bytes));
          this.buffers.set(path, pending);
          pending.catch(() => this.buffers.delete(path));
        }
        const [buffer] = await Promise.all([pending, resume]);
        if (
          token !== this.sequence ||
          !this.state.enabled ||
          this.state.volume === 0
        )
          return false;
        if (this.context.state !== "running")
          throw new DOMException("تحتاج إلى تفعيل الصوت", "NotAllowedError");
        this.source = this.context.createBufferSource();
        this.source.buffer = buffer;
        this.source.connect(this.gain);
        const narrationPlaying =
          this.media && !this.media.paused && this.mediaKind === "narration";
        this.gain.gain.value =
          this.state.volume * (narrationPlaying ? 0.18 : 0.9);
        this.source.start();
      } else {
        this.fallback ??= new Audio();
        this.fallback.src = `${this.base}audio/effects/${effect}.wav`;
        this.fallback.currentTime = 0;
        this.fallback.volume = this.state.volume * 0.9;
        await this.fallback.play();
      }
      if (token === this.sequence)
        this.update({ status: "ready", message: "الصوت جاهز" });
      return true;
    } catch (error) {
      if (token !== this.sequence) return false;
      const blocked =
        error instanceof DOMException && error.name === "NotAllowedError";
      this.update({
        status: blocked ? "blocked" : "error",
        message: blocked
          ? "اضغط «تفعيل الصوت» ثم حاول مجددًا."
          : "تعذر تحميل أو تشغيل المؤثر. تحقق من الاتصال وأعد تفعيل الصوت.",
      });
      return false;
    }
  }
  private applyBedVolume = () => {
    if (!this.bed) return;
    const narrating = this.mediaKind === "narration" && this.media && !this.media.paused;
    this.bed.muted = !this.state.enabled;
    this.bed.volume = this.state.enabled ? this.state.volume * (narrating ? 0.025 : 0.22) : 0;
  };
  async playBed(audio: HTMLAudioElement) {
    if (!this.state.enabled || this.state.volume === 0) return false;
    if(this.bed && this.bed !== audio) this.bed.pause();
    this.bed = audio;
    const token = ++this.bedSequence;
    this.applyBedVolume();
    try {
      await audio.play();
      if(token !== this.bedSequence || this.bed !== audio || !this.state.enabled || this.state.volume === 0) {
        if(this.bed !== audio || !this.state.enabled || this.state.volume === 0) audio.pause();
        return false;
      }
      return true;
    } catch { return false; }
  }
  releaseBed(audio: HTMLAudioElement) {
    audio.pause();
    if(this.bed === audio) { this.bedSequence++; this.bed = undefined; }
  }
  releaseMedia(audio: HTMLMediaElement) {
    audio.pause();
    if (this.media === audio) {
      this.mediaSequence++;
      this.media = undefined;
      this.mediaEvents?.();
      this.mediaEvents = undefined;
      this.applyBedVolume();
    }
  }
  async playMedia(audio: HTMLMediaElement, kind: "narration" | "music", reportError = true) {
    if (!this.state.enabled || this.state.volume === 0) return false;
    const token = ++this.mediaSequence;
    this.stop();
    if (this.media && this.media !== audio) this.media.pause();
    this.mediaEvents?.();
    this.media = audio;
    this.mediaKind = kind;
    audio.addEventListener?.("play", this.applyBedVolume);
    audio.addEventListener?.("pause", this.applyBedVolume);
    audio.addEventListener?.("ended", this.applyBedVolume);
    this.mediaEvents = () => {
      audio.removeEventListener?.("play", this.applyBedVolume);
      audio.removeEventListener?.("pause", this.applyBedVolume);
      audio.removeEventListener?.("ended", this.applyBedVolume);
    };
    audio.muted = false;
    audio.volume = this.state.volume * (kind === "music" ? 0.22 : 1);
    try {
      await audio.play();
      if (token !== this.mediaSequence || !this.state.enabled || this.state.volume === 0) {
        if (this.media !== audio || !this.state.enabled || this.state.volume === 0) audio.pause();
        return false;
      }
      this.applyBedVolume();
      this.update({status: "ready", message: "الصوت جاهز"});
      return true;
    } catch {
      if (token !== this.mediaSequence || !reportError) return false;
      this.update({
        status: "blocked",
        message: "تعذر تشغيل التسجيل. اضغط تشغيل مجددًا أو تحقق من الملف.",
      });
      return false;
    }
  }
}
export const soundManager = new SoundManager();
