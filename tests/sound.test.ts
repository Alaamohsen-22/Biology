import { test } from "node:test";
import assert from "node:assert/strict";
import { SoundManager, effectNames } from "../src/engine/sound.ts";
import { readFile } from "node:fs/promises";
function environment({
  blocked = false,
  badFile = false,
}: { blocked?: boolean; badFile?: boolean } = {}) {
  const events = {
    contexts: 0,
    resumes: 0,
    starts: 0,
    stops: 0,
    requests: 0,
    decodes: 0,
    gain: 0,
  };
  class Context {
    state = "suspended";
    destination = {};
    constructor() {
      events.contexts++;
    }
    resume() {
      events.resumes++;
      if (blocked)
        return Promise.reject(new DOMException("blocked", "NotAllowedError"));
      this.state = "running";
      return Promise.resolve();
    }
    createGain() {
      return {
        gain: {
          get value() {
            return events.gain;
          },
          set value(n: number) {
            events.gain = n;
          },
        },
        connect() {},
      };
    }
    createBufferSource() {
      return {
        buffer: null,
        connect() {},
        start() {
          events.starts++;
        },
        stop() {
          events.stops++;
        },
      };
    }
    decodeAudioData() {
      events.decodes++;
      return Promise.resolve({ duration: 0.2 });
    }
  }
  const oldWindow = (globalThis as any).window,
    oldFetch = globalThis.fetch;
  (globalThis as any).window = { AudioContext: Context };
  globalThis.fetch = (async () => {
    events.requests++;
    return {
      ok: !badFile,
      status: badFile ? 404 : 200,
      arrayBuffer: async () => new ArrayBuffer(8),
    };
  }) as typeof fetch;
  return {
    events,
    restore() {
      (globalThis as any).window = oldWindow;
      globalThis.fetch = oldFetch;
    },
  };
}
test("audio starts only after user-triggered play, resumes once and caches decoded resources", async () => {
  const env = environment();
  try {
    const manager = new SoundManager("/Biology/");
    assert.equal(env.events.contexts, 0);
    await manager.play("select");
    await manager.play("step");
    await manager.play("select");
    assert.equal(env.events.contexts, 1);
    assert.equal(env.events.resumes, 1);
    assert.equal(env.events.starts, 3);
    assert.equal(env.events.requests, 2);
    assert.equal(env.events.decodes, 2);
    assert.ok(env.events.stops >= 2);
    assert.equal(manager.getSnapshot().status, "ready");
  } finally {
    env.restore();
  }
});
test("mute and master volume stop the shared channel without coupling to reduced motion", async () => {
  const env = environment();
  try {
    const manager = new SoundManager();
    manager.configure(false, 0.5);
    assert.equal(await manager.play("start"), false);
    assert.equal(env.events.contexts, 0);
    manager.configure(true, 0.4);
    await manager.play("water");
    assert.ok(Math.abs(env.events.gain - 0.36) < 0.0001);
    manager.configure(false);
    assert.ok(env.events.stops > 0);
    assert.equal(await manager.play("success"), false);
    manager.configure(true, 0);
    assert.equal(await manager.play("tool"), false);
    assert.equal(env.events.starts, 1);
  } finally {
    env.restore();
  }
});
test("repeated success is debounced and only the newest pending effect can start", async () => {
  const env = environment();
  try {
    const manager = new SoundManager();
    const a = manager.play("click"),
      b = manager.play("success");
    await Promise.all([a, b]);
    assert.equal(env.events.starts, 1);
    await manager.play("success");
    assert.equal(env.events.starts, 1);
  } finally {
    env.restore();
  }
});
test("browser policy and missing files surface actionable errors rather than silently succeeding", async () => {
  for (const options of [{ blocked: true }, { badFile: true }]) {
    const env = environment(options);
    try {
      const manager = new SoundManager();
      assert.equal(await manager.play("click"), false);
      assert.equal(
        manager.getSnapshot().status,
        options.blocked ? "blocked" : "error",
      );
      assert.ok(manager.getSnapshot().message.length > 10);
      assert.equal(env.events.starts, 0);
    } finally {
      env.restore();
    }
  }
});
test("all seventeen effects are local, lightweight nonempty PCM WAV files", async () => {
  assert.equal(effectNames.length, 17);
  for (const name of effectNames) {
    const bytes = await readFile(
      new URL(`../public/audio/effects/${name}.wav`, import.meta.url),
    );
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WAVE");
    assert.ok(bytes.byteLength > 1000 && bytes.byteLength < 60000);
    assert.ok(bytes.subarray(44).some((x) => x !== 0));
  }
});

test("volume changes apply immediately to the active effect", async () => {
  const env = environment();
  try {
    const manager = new SoundManager();
    await manager.play("water");
    manager.configure(true, 0.2);
    assert.ok(Math.abs(env.events.gain - 0.18) < 0.00001);
  } finally { env.restore(); }
});

function pendingMedia() {
  let resolve!: () => void;
  let reject!: (reason: Error) => void;
  let pauses = 0;
  const audio = {
    paused: true, muted: false, volume: 1,
    play() {
      this.paused = false;
      return new Promise<void>((yes, no) => { resolve = yes; reject = no; });
    },
    pause() { this.paused = true; pauses++; },
  };
  return { audio: audio as unknown as HTMLAudioElement,
    resolve: () => resolve(), reject: () => reject(Error("old request")), pauses: () => pauses };
}

test("a late media start cannot overlap the recording selected afterward", async () => {
  const manager = new SoundManager();
  const first = pendingMedia(), second = pendingMedia();
  const a = manager.playMedia(first.audio, "music");
  const b = manager.playMedia(second.audio, "narration");
  second.resolve();
  assert.equal(await b, true);
  first.resolve();
  assert.equal(await a, false);
  assert.equal(first.audio.paused, true);
  assert.equal(second.audio.paused, false);
});

test("muting during a pending recording prevents late playback and ignores stale errors", async () => {
  const manager = new SoundManager();
  const first = pendingMedia();
  const pending = manager.playMedia(first.audio, "narration");
  manager.configure(false);
  first.reject();
  assert.equal(await pending, false);
  assert.equal(first.audio.paused, true);
  assert.equal(manager.getSnapshot().status, "idle");
});

test("zero volume prevents media start and cancels a pending start", async () => {
  const manager = new SoundManager();
  const first = pendingMedia();
  const pending = manager.playMedia(first.audio, "narration");
  manager.configure(true, 0);
  first.resolve();
  assert.equal(await pending, false);
  assert.equal(first.audio.paused, true);
  const second = pendingMedia();
  assert.equal(await manager.playMedia(second.audio, "music"), false);
  assert.equal(second.audio.paused, true);
});

test("long recordings own the channel and release on leaving their stage", async () => {
  const env = environment();
  try {
    const manager = new SoundManager();
    const media = pendingMedia();
    const pending = manager.playMedia(media.audio, "narration");
    media.resolve(); await pending;
    assert.equal(await manager.play("water"), false);
    assert.equal(env.events.starts, 0);
    manager.releaseMedia(media.audio);
    assert.equal(media.audio.paused, true);
    assert.equal(await manager.play("water"), true);
  } finally { env.restore(); }
});

test("orchard background ducks for teacher narration and restores after pause without changing other playback",async()=>{
 const manager=new SoundManager();
 const media=()=>{
  const events=new EventTarget();
  return {paused:true,volume:1,muted:false,addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events),play(){this.paused=false;events.dispatchEvent(new Event('play'));return Promise.resolve();},pause(){this.paused=true;events.dispatchEvent(new Event('pause'));}} as unknown as HTMLAudioElement;
 };
 const bed=media(),voice=media();
 assert.equal(await manager.playBed(bed),true);
 const ordinary=bed.volume;
 await manager.playMedia(voice,'narration');
 assert.ok(bed.volume<ordinary/4);
 assert.equal(bed.paused,false);
 voice.pause();assert.equal(bed.volume,ordinary);
 manager.configure(false);assert.equal(bed.paused,true);assert.equal(bed.volume,0);
 manager.releaseMedia(voice);manager.releaseBed(bed);
});
