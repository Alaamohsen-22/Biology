import { test } from "node:test";
import assert from "node:assert/strict";
import { simulate, compost } from "../src/engine/models.ts";
import {
  isMastered,
  emptyLesson,
  parseProgress,
  initialProgress,
  score,
} from "../src/engine/progress.ts";
import { lessons, bank, finalBank } from "../src/data/lessons.ts";
test("photosynthesis requires all three inputs; no production before time progresses", () => {
  assert.equal(simulate("photo", { light: 1, water: 1, co2: 1 }, 0).value, 0);
  assert.equal(simulate("photo", { light: 1, water: 1, co2: 1 }, 1).value, 1);
  for (const key of ["light", "water", "co2"])
    assert.equal(
      simulate("photo", { light: 1, water: 1, co2: 1, [key]: 0 }, 1).value,
      0,
    );
});
test("iodine reacts only with starch and reagent", () => {
  assert.equal(simulate("iodine", { starch: 1, iodine: 1 }, 1).value, 1);
  assert.equal(simulate("iodine", { starch: 0, iodine: 1 }, 1).value, 0);
  assert.equal(simulate("iodine", { starch: 1, iodine: 0 }, 1).value, 0);
});
test("yeast requires sugar and viable yeast; warm and lethal temperature differ", () => {
  const v = { sugar: 1, yeast: 1, temperature: 30 };
  assert.equal(simulate("yeast", v, 1).value, 1);
  assert.equal(simulate("yeast", { ...v, yeast: 0 }, 1).value, 0);
  assert.equal(simulate("yeast", { ...v, sugar: 0 }, 1).value, 0);
  assert.equal(simulate("yeast", { ...v, temperature: 65 }, 1).value, 0);
  assert.ok(
    simulate("yeast", { ...v, temperature: 5 }, 1).value <
      simulate("yeast", v, 1).value,
  );
});
test("mold refrigerated condition slows rather than sterilizes", () => {
  const v = { moisture: 80, temperature: 24, days: 8 };
  const cold = simulate("mold", { ...v, temperature: 4 }, 1).value;
  assert.ok(cold > 0);
  assert.ok(cold < simulate("mold", v, 1).value);
});
test("transpiration control excludes plant signal; uncovered soil confounds", () => {
  assert.equal(
    simulate("transpiration", { plant: 0, covered: 1, time: 100 }, 1).value,
    0,
  );
  assert.ok(
    simulate("transpiration", { plant: 0, covered: 0, time: 100 }, 1).value > 0,
  );
  assert.ok(
    simulate("transpiration", { plant: 1, covered: 1, time: 100 }, 1).value > 0,
  );
});
test("mastery requires assessment AND observed and performed work; opening never awards", () => {
  assert.equal(isMastered(emptyLesson(), 70, ["photo"]), false);
  const p = {
    ...emptyLesson(),
    pre: 20,
    post: 72,
    activities: ["match", "order"],
    watched: ["photo"],
    experimented: ["photo"],
    formative: true,
  };
  assert.equal(isMastered(p, 70, ["photo"]), true);
  assert.equal(isMastered(p, 80, ["photo"]), false);
  assert.equal(isMastered({ ...p, experimented: [] }, 70, ["photo"]), false);
  assert.equal(isMastered({ ...p, formative: false }, 70, ["photo"]), false);
  assert.equal(
    isMastered({ ...p, watched: ["urine"], experimented: ["urine"] }, 70, [
      "urine",
    ]),
    false,
  );
  assert.equal(
    isMastered(
      {
        ...p,
        activities: ["match", "order", "assemble"],
        watched: ["urine"],
        experimented: ["urine"],
      },
      70,
      ["urine"],
    ),
    true,
  );
  assert.equal(score(5, 7), 71);
  assert.equal(score(4, 7), 57);
});
test("compost excludes hazardous and unsuitable materials and rewards balance", () => {
  const valid = ["قشور خضار", "أوراق جافة"];
  assert.equal(compost(valid, 60, 55, 60).value, 1);
  assert.equal(compost([...valid, "بطاريات"], 60, 55, 60).value, 0);
  assert.ok(compost(valid, 0, 55, 60).value < 1);
  assert.ok(compost(["قشور خضار"], 60, 55, 60).value < 1);
});
test("seven disjoint pre/post banks with correct and unique items, all goals assessed", () => {
  assert.equal(lessons.length, 7);
  for (const l of lessons) {
    const pre = bank(l, "pre"),
      post = bank(l, "post");
    assert.equal(pre.length, 5);
    assert.equal(post.length, 7);
    assert.equal(new Set([...pre, ...post].map((q) => q.text)).size, 12);
    for (const q of [...pre, ...post, ...bank(l, "post", 1)]) {
      assert.ok(q.answer >= 0 && q.answer < q.options.length);
      assert.equal(new Set(q.options).size, q.options.length);
    }
    for (let i = 0; i < l.goals.length; i++)
      assert.ok(l.questions.some((q) => q.goal === i));
    assert.ok(l.scenes.length >= 1);
  }
});
test("final covers all seven lessons in 15 items", () => {
  const qs = finalBank();
  assert.equal(qs.length, 15);
  assert.equal(new Set(qs.map((q) => q.id)).size, 15);
  for (let i = 0; i < 7; i++) assert.ok(qs.some((q) => q.goal === i));
});
test("untrusted backup data is rejected", () => {
  assert.deepEqual(parseProgress(initialProgress()), initialProgress());
  assert.throws(() =>
    parseProgress({ version: 1, name: "x", lessons: { 1: { post: 999 } } }),
  );
  assert.throws(() => parseProgress({ version: 1, name: 12, lessons: {} }));
  assert.throws(() =>
    parseProgress({ version: 1, name: "x", lessons: { 8: emptyLesson() } }),
  );
});
