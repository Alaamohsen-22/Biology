import React from "react";
import { JSDOM } from "jsdom";
import { test } from "node:test";
import assert from "node:assert/strict";
const dom = new JSDOM("<html><body></body></html>", {
  url: "http://localhost/Biology/",
});
for (const [key, value] of Object.entries({
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  localStorage: dom.window.localStorage,
}))
  Object.defineProperty(globalThis, key, { value, configurable: true });
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
Object.defineProperty(dom.window, "matchMedia", {
  value: () => ({ matches: true }),
  configurable: true,
});
Object.defineProperty(dom.window, "scrollTo", {
  value: () => {},
  configurable: true,
});
const { render, fireEvent, cleanup, within } = await import(
  "@testing-library/react"
);
const { default: App } = await import("../src/App");
const { lessons, bank, finalBank } = await import("../src/data/lessons");
const { curriculum } = await import("../src/data/curriculum");
const { initialProgress } = await import("../src/engine/progress");
const { readLocation, LOCATION_KEY } = await import("../src/classroom/storage");
function prepare() {
  dom.window.history.replaceState(null, "", "/Biology/");
  dom.window.localStorage.clear();
  dom.window.localStorage.setItem(
    "life-island-settings-v1",
    JSON.stringify({ sound: false, reduced: true }),
  );
}
test("complete student journey: all seven integrated lessons, 23 watch and try simulations, feedback, posttests and unit certificate survive remount", async () => {
  prepare();
  let ui = render(<App />);
  const select = (label: string) =>
    fireEvent.click(
      within(ui.getByRole("complementary", { name: "مسار الدرس" }))
        .getByText(label, { exact: true })
        .closest("button")!,
    );
  const answers = (qs: ReturnType<typeof bank>, pre = false) => {
    qs.forEach((q, i) => {
      const choice = ui.container.querySelectorAll<HTMLInputElement>(
        `input[name="${q.id}"]`,
      )[q.answer];
      assert.ok(choice, q.id);
      fireEvent.click(choice);
      if (i < qs.length - 1)
        fireEvent.click(
          ui.getByRole("button", {
            name: pre ? "التالي" : "السؤال التالي",
            exact: true,
          }),
        );
    });
    fireEvent.click(
      ui.getByRole("button", {
        name: pre ? "إنهاء الاختبار" : /تصحيح الاختبار/,
        exact: pre,
      }),
    );
  };
  try {
    fireEvent.click(ui.getByRole("button", { name: "تقدمي", exact: true }));
    fireEvent.change(ui.getByLabelText("اسم الطالب"), {
      target: { value: "مستكشف العلوم" },
    });
    fireEvent.click(ui.getByRole("button", { name: "حفظ الاسم" }));
    fireEvent.click(ui.getByRole("button", { name: "الدروس", exact: true }));
    for (const lesson of lessons) {
      fireEvent.click(
        ui.getByRole("button", { name: `افتح درس ${lesson.title}` }),
      );
      if (lesson.id === 1) {
        fireEvent.click(ui.getByText("ماذا سأتعلم في هذا الدرس؟"));
        assert.equal(
          ui.container.querySelectorAll(".goals-disclosure li").length,
          6,
        );
      }
      select("معرفتي السابقة");
      answers(bank(lesson, "pre"), true);
      assert.ok(ui.getByText("اكتشفت نقطة انطلاقك!"));
      for (const c of curriculum[lesson.id - 1].topics) {
        select(c.title);
        assert.ok(ui.getByText(c.definition));
        if (c.scenes.length)
          fireEvent.click(
            ui.getByRole("button", { name: "استكشف بالتجربة", exact: true }),
          );
        for (const id of c.scenes) {
          const scene = lesson.scenes.find((s) => s.id === id)!;
          if (c.scenes.length > 1)
            fireEvent.change(
              ui.getByRole("combobox", { name: "اختر التجربة" }),
              { target: { value: id } },
            );
          await ui.findByRole("region", { name: scene.title, exact: true });
          fireEvent.click(ui.getByRole("button", { name: /شاهد المحاكاة/ }));
          for (let i = 0; i < scene.stages.length; i++)
            fireEvent.click(ui.getByRole("button", { name: "خطوة تالية" }));
          fireEvent.click(ui.getByRole("button", { name: /جرّب بنفسك/ }));
          const v = scene.variables[0],
            range = ui.container.querySelector<HTMLInputElement>(
              ".variables input[type=range]",
            )!;
          fireEvent.change(range, {
            target: {
              value: String(Number(range.value) === v.min ? v.max : v.min),
            },
          });
          for (let i = 0; i < scene.stages.length; i++)
            fireEvent.click(ui.getByRole("button", { name: "خطوة تالية" }));
          fireEvent.click(ui.getByRole("button", { name: "تسجيل الملاحظة" }));
          fireEvent.change(
            ui.getByRole("combobox", { name: "ما الاستنتاج المناسب؟" }),
            { target: { value: "model" } },
          );
          fireEvent.click(ui.getByRole("button", { name: "اعتماد الاستنتاج" }));
        }
        fireEvent.click(
          ui.container.querySelectorAll<HTMLInputElement>(
            `input[name="${c.check.id}"]`,
          )[c.check.answer],
        );
        fireEvent.click(
          ui.getByRole("button", { name: "تحقق من فهمي", exact: true }),
        );
        assert.ok(ui.getByText(c.check.why, { exact: false }));
      }
      select("ملخص بصري");
      assert.equal(
        ui.container.querySelectorAll(".lesson-infographic audio").length,
        0,
      );
      select("اختبر فهمك");
      answers(bank(lesson, "post"));
      select("إنجازي");
      assert.ok(
        ui.getByRole("heading", { name: `شهادة مستكشف ${lesson.title}` }),
      );
      const stored = JSON.parse(
        dom.window.localStorage.getItem("life-island-progress-v1")!,
      );
      assert.equal(stored.lessons[lesson.id].post, 100);
      assert.equal(
        stored.lessons[lesson.id].experimented.length,
        lesson.scenes.length,
      );
      fireEvent.click(ui.getByRole("button", { name: "اختر درسًا آخر" }));
    }
    fireEvent.click(ui.getByRole("button", { name: "تقدمي", exact: true }));
    fireEvent.click(
      ui.getByRole("button", { name: "اختبار الوحدة", exact: true }),
    );
    answers(finalBank(0));
    assert.ok(ui.getByRole("heading", { name: "شهادة مستكشف أسرار الحياة" }));
    fireEvent.click(
      ui.getByRole("button", { name: "حديقة أسرار الحياة، الرئيسية" }),
    );
    const before = dom.window.localStorage.getItem("life-island-progress-v1");
    cleanup();
    ui = render(<App />);
    assert.equal(
      dom.window.localStorage.getItem("life-island-progress-v1"),
      before,
    );
    assert.ok(ui.getByText("من حيث توقفت"));
  } finally {
    cleanup();
  }
});
test("all lessons and sections stay open and visiting does not create mastery; migration retains the prior concept and experiment", () => {
  prepare();
  const prior = {
    ...initialProgress(),
    name: "طالب",
    lessons: {
      2: {
        activities: [],
        watched: [],
        experimented: [],
        formative: false,
        attempts: 0,
        post: 43,
      },
    },
  };
  dom.window.localStorage.setItem(
    "life-island-progress-v1",
    JSON.stringify(prior),
  );
  const { lessonPages } = requireFlow();
  const oldIndex = lessonPages(2).findIndex((p) => p.scene === "yeast");
  dom.window.localStorage.setItem(
    "life-island-draft:concept-book-location-v1",
    JSON.stringify({ lesson: 2, index: oldIndex, saved: true }),
  );
  assert.equal(readLocation()?.scene, "yeast");
  const ui = render(<App />);
  try {
    for (const l of lessons) {
      fireEvent.click(ui.getByRole("button", { name: `افتح درس ${l.title}` }));
      for (const entry of Array.from(
        ui.container.querySelectorAll<HTMLButtonElement>(
          ".lesson-rail nav button",
        ),
      )) {
        assert.equal(entry.disabled, false);
        fireEvent.click(entry);
      }
      assert.ok(ui.getByText("خطوتك التالية نحو الإتقان"));
      fireEvent.click(ui.getByRole("button", { name: "اختر درسًا آخر" }));
    }
    assert.deepEqual(
      JSON.parse(dom.window.localStorage.getItem("life-island-progress-v1")!),
      prior,
    );
  } finally {
    cleanup();
  }
});
const flow = await import("../src/engine/lessonFlow");
function requireFlow() {
  return flow;
}
test("invalid saved location falls back safely and incorrect concept answers explain the science without awarding progress", () => {
  prepare();
  dom.window.localStorage.setItem(
    LOCATION_KEY,
    JSON.stringify({
      page: "lesson",
      lesson: 99,
      section: "concept",
      topic: 0,
    }),
  );
  assert.equal(readLocation(), null);
  const ui = render(<App />);
  try {
    fireEvent.click(ui.getByRole("button", { name: "افتح درس التغذية" }));
    fireEvent.click(
      within(ui.getByRole("complementary", { name: "مسار الدرس" }))
        .getByText("التغذية وأنواعها", { exact: true })
        .closest("button")!,
    );
    const c = curriculum[0].topics[0];
    fireEvent.click(
      ui.container.querySelectorAll<HTMLInputElement>(
        `input[name="${c.check.id}"]`,
      )[1],
    );
    fireEvent.click(ui.getByRole("button", { name: "تحقق من فهمي" }));
    assert.ok(ui.getByText(c.check.why, { exact: false }));
    const stored = JSON.parse(
      dom.window.localStorage.getItem("life-island-progress-v1")!,
    );
    assert.equal(stored.lessons[1], undefined);
    assert.ok(ui.getByRole("button", { name: "تشغيل الصوت" }));
  } finally {
    cleanup();
  }
});
test("concept presentation removes only an identical leading definition and keeps the rest of the approved teacher explanation", async () => {
  const { teacherExplanation } = await import("../src/classroom/content");
  for (const lesson of curriculum)
    for (const c of lesson.topics) {
      const text = teacherExplanation(c);
      assert.ok(text.trim());
      if (c.teacher.startsWith(c.definition))
        assert.equal(text, c.teacher.slice(c.definition.length).trim());
      else assert.equal(text, c.teacher);
    }
});
test("hash routing opens every concept and scene directly and bounds invalid destinations", async () => {
  const { routeFromHash, routeHash, lessonDestination } = await import(
    "../src/classroom/router"
  );
  for (const l of curriculum)
    for (let i = 0; i < l.topics.length; i++) {
      const r = lessonDestination(l.id, "concept", i);
      assert.deepEqual(routeFromHash(routeHash(r)), r);
      for (const scene of l.topics[i].scenes) {
        const lab = lessonDestination(l.id, "concept", i, scene);
        assert.deepEqual(routeFromHash(routeHash(lab)), lab);
      }
    }
  assert.equal(routeFromHash("#lesson/90/concept/0").page, "home");
  assert.equal(lessonDestination(1, "concept", -1).topic, 0);
  assert.equal(
    lessonDestination(1, "concept", 999, "nonexistent").scene,
    undefined,
  );
});
test("settings keyboard focus skips disabled and collapsed controls, wraps at visible ends and Escape restores the trigger", () => {
  prepare();
  const ui = render(<App />);
  try {
    const trigger = ui.getByRole("button", { name: "إعدادات العرض والصوت" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = ui.getByRole("dialog"),
      close = within(dialog).getByRole("button", { name: "إغلاق الإعدادات" }),
      summary = dialog.querySelector<HTMLElement>("summary")!;
    summary.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    assert.equal(document.activeElement, close);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    assert.equal(document.activeElement, summary);
    fireEvent.keyDown(document, { key: "Escape" });
    assert.equal(ui.queryByRole("dialog"), null);
    assert.equal(document.activeElement, trigger);
  } finally {
    cleanup();
  }
});
