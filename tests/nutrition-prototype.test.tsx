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
});
dom.window.HTMLMediaElement.prototype.pause = () => {};
const { render, fireEvent, cleanup, act } = await import(
  "@testing-library/react"
);
const { VisualLesson, ProcessDiagram } = await import(
  "../src/nutrition/VisualLesson"
);
const { NutritionInfographic } = await import("../src/nutrition/Infographic");
const { NutritionIntro } = await import("../src/nutrition/Intro");
const { NutritionGuide } = await import("../src/nutrition/NutritionGuide");
const { curriculum } = await import("../src/data/curriculum");
const { soundManager } = await import("../src/engine/sound");
soundManager.configure(false, 0);
function concept(id: string) {
  return curriculum[0].topics.find((c) => c.id === id)!;
}
function reset() {
  cleanup();
  localStorage.clear();
}
test("classification requires all organisms, persists choices and awards once; wrong answers give feedback", () => {
  reset();
  let awards = 0;
  let ui = render(
    <VisualLesson
      concept={concept("nutrition")}
      done={false}
      onDone={() => awards++}
      reduced
    />,
  );
  try {
    fireEvent.click(
      ui.getByRole("button", { name: "غير ذاتية التغذية", exact: true }),
    );
    fireEvent.click(ui.getByRole("button", { name: "تحقق", exact: true }));
    assert.equal(awards, 0);
    assert.ok(ui.getByText(/حاول مرة أخرى/));
    fireEvent.click(
      ui.getByRole("button", { name: "ذاتية التغذية", exact: true }),
    );
    fireEvent.click(ui.getByRole("button", { name: "تحقق", exact: true }));
    assert.equal(awards, 0);
    for (const label of ["الأرنب", "الفطر"]) {
      fireEvent.click(ui.getByRole("button", { name: label, exact: true }));
      fireEvent.click(
        ui.getByRole("button", { name: "غير ذاتية التغذية", exact: true }),
      );
      fireEvent.click(ui.getByRole("button", { name: "تحقق", exact: true }));
    }
    assert.equal(awards, 1);
    assert.ok(ui.getByTestId("activity-celebration"));
    fireEvent.click(ui.getByRole("button", { name: "تحقق", exact: true }));
    assert.equal(awards, 1);
    cleanup();
    ui = render(
      <VisualLesson
        concept={concept("nutrition")}
        done
        onDone={() => awards++}
        reduced
      />,
    );
    assert.equal(
      ui
        .getByRole("button", { name: "ذاتية التغذية", exact: true })
        .getAttribute("aria-pressed"),
      "true",
    );
    assert.equal(ui.getAllByLabelText("إجابة صحيحة").length, 3);
    fireEvent.click(ui.getByRole("button", { name: /أعد المحاولة/ }));
    assert.equal(
      ui
        .getByRole("button", { name: "تحقق", exact: true })
        .hasAttribute("disabled"),
      true,
    );
  } finally {
    cleanup();
  }
});
test("scientific process diagram follows selected water, light and gases with unique accessible SVG", () => {
  reset();
  const ui = render(<ProcessDiagram />);
  try {
    assert.ok(ui.getByRole("img", { name: "مدخلات البناء الضوئي ونواتجه" }));
    fireEvent.click(ui.getByRole("button", { name: "الضوء", exact: true }));
    assert.ok(ui.getByText("يوفر الضوء الطاقة اللازمة لصنع الغذاء."));
    fireEvent.click(ui.getByRole("button", { name: "الغازات", exact: true }));
    assert.ok(ui.getByText(/يدخل ثاني أكسيد الكربون، وينطلق الأكسجين/));
  } finally {
    cleanup();
  }
});
test("Lugol outcome is hidden until reagent addition completes and distinguishes starch from the water control", async () => {
  reset();
  let awards = 0;
  const ui = render(
    <VisualLesson
      concept={concept("starch")}
      done={false}
      onDone={() => awards++}
      reduced
    />,
  );
  try {
    assert.equal(ui.queryByText("ما الذي يدل عليه اللون؟"), null);
    fireEvent.click(ui.getByRole("button", { name: "أضف لوغول" }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 2150));
    });
    assert.ok(ui.getByText("ما الذي يدل عليه اللون؟"));
    fireEvent.click(ui.getByRole("button", { name: "كُشف عن نشا" }));
    fireEvent.click(ui.getByRole("button", { name: "تحقق من استنتاجك" }));
    assert.equal(awards, 1);
    fireEvent.click(ui.getByRole("button", { name: "تحقق من استنتاجك" }));
    assert.equal(awards, 1);
    fireEvent.click(ui.getByRole("button", { name: "عينة ماء" }));
    assert.equal(ui.queryByText("ما الذي يدل عليه اللون؟"), null);
    fireEvent.click(ui.getByRole("button", { name: "أضف لوغول" }));
    await act(async () => {
      await new Promise((r) => setTimeout(r, 2150));
    });
    fireEvent.click(ui.getByRole("button", { name: "لم يُكشف نشا" }));
    fireEvent.click(ui.getByRole("button", { name: "تحقق من استنتاجك" }));
    assert.equal(awards, 1);
    assert.ok(ui.getByText(/ممتاز!/));
    fireEvent.click(ui.getByRole("button", { name: "أعد التجربة" }));
    assert.equal(ui.queryByText("ما الذي يدل عليه اللون؟"), null);
  } finally {
    cleanup();
  }
});
test("all five infographic panels contain scientific drawings and no audio controls", () => {
  reset();
  const visited: number[] = [];
  const ui = render(
    <NutritionInfographic onConcept={(i) => visited.push(i)} />,
  );
  try {
    for (const [i, title] of [
      "التغذية",
      "صنع الغذاء",
      "الكشف عن النشا",
      "ترمم وتطفل",
      "غذاء الحيوانات",
    ].entries()) {
      fireEvent.click(ui.getByRole("button", { name: title, exact: true }));
      assert.ok(ui.container.querySelector("svg[role=img]"));
      assert.equal(ui.container.querySelectorAll("audio").length, 0);
      assert.equal(ui.queryByRole("button", { name: /استمع/ }), null);
      fireEvent.click(ui.getByRole("button", { name: "راجع الفكرة" }));
      assert.equal(visited.at(-1), i);
    }
  } finally {
    cleanup();
  }
});
test("intro prediction is retained, ungraded and does not block either destination; unavailable narration has no pretend player", async () => {
  reset();
  let starts = 0,
    pres = 0;
  let ui = render(
    <NutritionIntro
      sound={false}
      onStart={() => starts++}
      onPre={() => pres++}
    />,
  );
  try {
    fireEvent.click(ui.getByRole("button", { name: "هيا نستكشف!" }));
    fireEvent.click(
      ui.getByRole("button", { name: "معرفتي السابقة", exact: true }),
    );
    assert.equal(starts, 1);
    assert.equal(pres, 1);
    fireEvent.click(ui.getByText("ما توقعك؟"));
    fireEvent.click(ui.getByRole("radio", { name: "من التربة غذاءً جاهزًا." }));
    assert.ok(ui.getByText("سنختبر فكرتك معًا."));
    fireEvent.click(ui.getByRole("button", { name: "الجذور", exact: true }));
    assert.ok(ui.getByText("تمتص الجذور الماء والأملاح من التربة."));
    assert.equal(localStorage.getItem("life-island-progress-v1"), null);
    cleanup();
    ui = render(
      <NutritionIntro sound={false} onStart={() => {}} onPre={() => {}} />,
    );
    assert.equal(
      (
        ui.getByRole("radio", {
          name: "من التربة غذاءً جاهزًا.",
          hidden: true,
        }) as HTMLInputElement
      ).checked,
      true,
    );
    assert.equal(ui.queryByRole("button", { name: "استمع إلى المرشدة" }), null);
    fireEvent.click(ui.getByRole("button", { name: "إغلاق التلميح" }));
    assert.equal(
      ui.queryByText("ما رأيك؟ من أين يأتي غذاء شجرة الزيتون؟"),
      null,
    );
  } finally {
    cleanup();
  }
});
test("guide changes hint context and can be hidden without covering the lesson", () => {
  reset();
  const ui = render(<NutritionGuide context="starch" />);
  try {
    fireEvent.click(ui.getByRole("button", { name: "اسأل المرشدة" }));
    assert.ok(ui.getByText("راقب لون العينة والماء الضابط."));
    fireEvent.click(ui.getByRole("button", { name: "تلميح آخر" }));
    assert.ok(ui.getByText("قارن قبل إضافة لوغول وبعده."));
    ui.rerender(<NutritionGuide context="feeding" />);
    fireEvent.click(ui.getByRole("button", { name: "اسأل المرشدة" }));
    assert.ok(ui.getByText("هل الغذاء من بقايا ميتة أم مضيف حي؟"));
  } finally {
    cleanup();
  }
});
