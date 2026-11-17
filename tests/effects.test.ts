import { test } from "node:test";
import assert from "node:assert/strict";
import { createEffectPlayer } from "../src/engine/effects.ts";
test("sound channel is lazy, muted, exclusive and handles browser play rejection", async () => {
  let factories = 0,
    plays = 0,
    pauses = 0;
  const audio = {
    src: "",
    currentTime: 12,
    volume: 1,
    pause() {
      pauses++;
    },
    play() {
      plays++;
      return Promise.reject(Error("not allowed"));
    },
  };
  const player = createEffectPlayer(() => {
    factories++;
    return audio;
  }, "/Biology/");
  player.play("select", false);
  assert.equal(factories, 0);
  player.play("select", true);
  assert.equal(audio.src, "/Biology/audio/effects/select.wav");
  assert.equal(audio.currentTime, 0);
  player.play("success", true);
  assert.equal(factories, 1);
  assert.equal(plays, 2);
  assert.ok(pauses >= 2);
  player.play("error", false);
  assert.equal(plays, 2);
  player.stop();
  await Promise.resolve();
});
