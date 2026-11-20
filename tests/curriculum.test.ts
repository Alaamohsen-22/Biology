import { test } from "node:test";
import assert from "node:assert/strict";
import { curriculum } from "../src/data/curriculum";
import { lessons, bank } from "../src/data/lessons";
import {
  lessonPages,
  lessonIndex,
  validReadingLocation,
} from "../src/engine/lessonFlow";
import { diagnostics } from "../src/data/diagnostics";
import { simulationCue } from "../src/data/labProtocols";
test("all seven concept sequences assign each scientific simulation exactly once, with inline checks", () => {
  for (const l of curriculum) {
    const pages = lessonPages(l.id);
    assert.deepEqual(
      pages.slice(0, 3).map((p) => p.kind),
      ["intro", "pre", "goals"],
    );
    assert.deepEqual(
      pages.slice(-4).map((p) => p.kind),
      ["summary", "infographic", "post", "certificate"],
    );
    assert.equal(new Set(pages.map((p) => p.id)).size, pages.length);
    assert.deepEqual(
      pages
        .filter((p) => p.kind === "experiment")
        .map((p) => p.scene)
        .sort(),
      lessons[l.id - 1].scenes.map((s) => s.id).sort(),
    );
    for (const [i, c] of l.topics.entries()) {
      assert.ok(
        c.definition &&
          c.teacher &&
          c.example &&
          c.goal &&
          c.hints.length === 2,
      );
      const index = pages.findIndex((p) => p.concept === i);
      assert.equal(pages[index].kind, "explain");
      assert.equal(pages[index + c.scenes.length + 1].kind, "check");
      assert.ok(c.check.options[c.check.answer]);
    }
    const entries = lessonIndex(l.id);
    assert.equal(
      entries.filter((p) => p.page.concept !== undefined).length,
      l.topics.length,
    );
    assert.equal(
      entries.some(({ page }) =>
        ["الأنشطة", "المختبر", "الاستكشاف", "تقويم تكويني"].includes(
          page.title,
        ),
      ),
      false,
    );
  }
});
test("35 diagnostic questions are distinct from the posttests and use stable answer ids", () => {
  for (const lesson of lessons) {
    const pre = diagnostics[lesson.id];
    assert.equal(pre.length, 5);
    assert.equal(new Set(pre.map((q) => q.id)).size, 5);
    assert.deepEqual(
      bank(lesson, "pre").map((q) => q.text),
      pre.map((q) => q.text),
    );
    for (const q of pre) {
      assert.ok(q.options.some((o) => o.id === q.correctId));
      assert.ok(!bank(lesson, "post").some((p) => p.text === q.text));
    }
  }
});
test("saved lesson locations stay valid across all seven lessons; invalid locations are rejected", () => {
  assert.equal(
    validReadingLocation({ lesson: 7, index: lessonPages(7).length - 1 }),
    true,
  );
  for (const v of [
    { lesson: 0, index: 0 },
    { lesson: 8, index: 0 },
    { lesson: 1, index: 999 },
    { lesson: 1, index: -1 },
    null,
  ])
    assert.equal(validReadingLocation(v), false);
});
test("scientific sound cues distinguish yeast bubbles and unit assembly, from ordinary navigation", () => {
  assert.equal(simulationCue("yeast", 0.4), "bubble");
  assert.equal(simulationCue("metabolism", 0.2), "combine");
  assert.equal(simulationCue("metabolism", 0.7), "separate");
  assert.equal(simulationCue("iodine", 0.4), "drop");
  assert.equal(simulationCue("yeast", 1), "discover");
});

test("unit sounds follow the chosen build/break operation rather than elapsed time", () => {
  assert.equal(simulationCue("metabolism", 0.8, { build: 1 }), "combine");
  assert.equal(simulationCue("metabolism", 0.2, { build: 0 }), "separate");
});
