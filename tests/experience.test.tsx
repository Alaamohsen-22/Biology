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
}))
  Object.defineProperty(globalThis, key, { value, configurable: true });
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const { render, fireEvent, cleanup, within } = await import(
  "@testing-library/react"
);
const { LearningHub } = await import("../src/components/LearningHub");
const { Simulation } = await import("../src/components/Simulation");
const { lessons } = await import("../src/data/lessons");
const { initialProgress } = await import("../src/engine/progress");
const { soundManager } = await import("../src/engine/sound");
soundManager.configure(false);
test("learning hub searches all seven available lessons, offers a useful empty state and resumes an existing location", () => {
  let selected = 0,
    resumed = 0;
  const props = {
    progress: initialProgress(),
    mastered: [],
    threshold: 70,
    welcome: false,
    sound: false,
    reading: { lesson: 4, index: 6, saved: true },
    onStart: () => {},
    onLesson: (id: number) => {
      selected = id;
    },
    onResume: () => resumed++,
    onGuide: () => {},
  };
  const ui = render(<LearningHub {...props} />);
  try {
    for (const l of lessons) {
      fireEvent.click(
        ui.getByRole("button", { name: `المحطة ${l.id} ${l.title}: متاحة` }),
      );
      assert.equal(selected, l.id);
    }
    fireEvent.click(ui.getByRole("button", { name: /تابع تعلمك/ }));
    assert.equal(resumed, 1);
    fireEvent.change(ui.getByLabelText("ابحث عن درس"), {
      target: { value: "الإخراج" },
    });
    assert.equal(ui.queryAllByRole("button", { name: /المحطة/ }).length, 1);
    fireEvent.change(ui.getByLabelText("ابحث عن درس"), {
      target: { value: "xyz" },
    });
    assert.ok(ui.getByText("لم نجد هذا الدرس"));
    fireEvent.click(ui.getByText("عرض جميع الدروس"));
    assert.equal(ui.queryAllByRole("button", { name: /المحطة/ }).length, 7);
    fireEvent.click(
      within(ui.getByRole("group", { name: "طريقة عرض الدروس" })).getByText(
        "خريطة الجزيرة",
      ),
    );
    assert.equal(
      ui.container.querySelectorAll(".hub-island-pins button").length,
      7,
    );
  } finally {
    cleanup();
  }
});
test("all 23 experiments compare genuine saved variables against a new run, retain the reference after remount and do not award mastery for saving", () => {
  for (const lesson of lessons)
    for (const scene of lesson.scenes) {
      dom.window.localStorage.clear();
      let earned = 0;
      const props = {
        scene,
        reduced: true,
        watched: false,
        experimented: false,
        onWatch: () => {},
        onExperiment: () => earned++,
      };
      let ui = render(<Simulation {...props} />);
      try {
        fireEvent.click(ui.getByRole("button", { name: "جرّب بنفسك" }));
        const save = ui.getByRole("button", {
          name: "احفظ هذه النتيجة للمقارنة",
        });
        assert.equal(save.hasAttribute("disabled"), true);
        for (let i = 0; i < scene.stages.length; i++)
          fireEvent.click(ui.getByRole("button", { name: "خطوة تالية" }));
        assert.equal(save.hasAttribute("disabled"), false);
        fireEvent.click(save);
        const reference = JSON.parse(
          dom.window.localStorage.getItem(
            `life-island-draft:comparison-${scene.id}`,
          )!,
        );
        assert.equal(reference.saved, true);
        assert.equal(reference.t, 1);
        const first = ui.container.querySelector<HTMLInputElement>(
          '.variables input[type="range"]',
        )!;
        const variable = scene.variables[0];
        const changed =
          Number(first.value) === variable.max ? variable.min : variable.max;
        fireEvent.change(first, { target: { value: String(changed) } });
        fireEvent.click(
          ui.getByRole("button", { name: "قارن بالنتيجة المحفوظة" }),
        );
        const panel = ui.getByRole("region", { name: "مقارنة التجارب" });
        assert.equal(panel.querySelectorAll('svg[role="img"]').length, 2);
        assert.equal(
          JSON.parse(
            dom.window.localStorage.getItem(
              `life-island-draft:comparison-${scene.id}`,
            )!,
          ).vars[variable.key],
          reference.vars[variable.key],
        );
        assert.equal(earned, 0);
        cleanup();
        ui = render(<Simulation {...props} />);
        assert.ok(ui.getByRole("button", { name: "قارن بالنتيجة المحفوظة" }));
      } finally {
        cleanup();
      }
    }
});
test("scientific detail magnification remains inside its dialog and Escape restores the diagram", async () => {
  const { ScientificScene } = await import(
    "../src/components/science/ScientificScene"
  );
  const ui = render(
    <ScientificScene id="urine" t={0.5} value={0.5} vars={{ time: 100 }} />,
  );
  try {
    fireEvent.click(ui.getByText("تكبير الرسم"));
    for (let n = 0; n < 3; n++)
      fireEvent.click(ui.getByText("تكبير التفاصيل +"));
    const dialog = ui.getByRole("dialog");
    assert.equal(
      (dialog.querySelector("svg[role=img]") as SVGElement).style.width,
      "250%",
    );
    assert.ok(ui.getByText("تكبير التفاصيل +").hasAttribute("disabled"));
    fireEvent.click(ui.getByText("تصغير التفاصيل −"));
    assert.equal(
      (dialog.querySelector("svg[role=img]") as SVGElement).style.width,
      "200%",
    );
    fireEvent.keyDown(dialog, { key: "Escape" });
    assert.equal(ui.queryByRole("dialog"), null);
    assert.ok(ui.getByRole("img"));
  } finally {
    cleanup();
  }
});
