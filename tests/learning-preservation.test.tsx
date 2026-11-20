import React from "react";
import { JSDOM } from "jsdom";
import { test, beforeEach } from "node:test";
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
Object.defineProperty(dom.window, "AnimationEvent", {
  value: dom.window.Event,
  configurable: true,
});
const { render, fireEvent, cleanup } = await import("@testing-library/react");
const { nutritionDiagnostic, diagnosticScore, nutritionOpeningGoals } =
  await import("../src/data/nutritionOpening");
const { NutritionDiagnostic } = await import(
  "../src/components/NutritionDiagnostic"
);
const { NutritionGoals } = await import("../src/components/NutritionGoals");
const { Simulation } = await import("../src/components/Simulation");
const { Quiz } = await import("../src/components/Quiz");
const { lessons, bank } = await import("../src/data/lessons");
const { soundManager } = await import("../src/engine/sound");
soundManager.configure(false);
beforeEach(() => dom.window.localStorage.clear());
test("approved diagnostic wording and stable answer ids remain correct if option order changes", () => {
  assert.deepEqual(
    nutritionDiagnostic.map((q) => q.text),
    [
      "ماذا يحتاج الإنسان ليعيش وينمو؟",
      "أيّ مما يأتي كائن حي؟",
      "ماذا يحدث للنبات إذا لم يحصل على الماء مدة طويلة؟",
      "لماذا يحتاج الإنسان إلى تناول الطعام؟",
      "أيّ مما يأتي يُعدّ غذاءً للأرنب؟",
    ],
  );
  const answers = Object.fromEntries(
    nutritionDiagnostic.map((q) => {
      const reversed = [...q.options].reverse();
      const correct = reversed.find((o) => o.id === q.correctId)!;
      assert.ok(correct);
      return [q.id, correct.id];
    }),
  );
  assert.deepEqual(diagnosticScore(answers), {
    correct: 5,
    percent: 100,
    complete: true,
  });
  assert.deepEqual(
    bank(lessons[0], "pre").map((q) => q.options[q.answer]),
    ["الغذاء.", "شجرة الزيتون.", "يذبل.", "للحصول على الطاقة.", "الأعشاب."],
  );
});
test("diagnostic displays one question, warns on missing answers, preserves editing and permits learning after zero", () => {
  let finishes = 0,
    score = -1,
    learned = 0;
  const props = {
    onFinish: (n: number) => {
      finishes++;
      score = n;
    },
    onLearn: () => learned++,
    onIntro: () => {},
    onPage: () => {},
  };
  let ui = render(<NutritionDiagnostic {...props} />);
  try {
    assert.equal(ui.getAllByRole("radio").length, 3);
    fireEvent.click(ui.getByText("إنهاء الاختبار"));
    assert.match(ui.getByRole("alert").textContent!, /دون إجابة/);
    assert.equal(finishes, 0);
    for (let i = 0; i < 5; i++) {
      const q = nutritionDiagnostic[i];
      assert.ok(ui.getByText(q.text));
      assert.equal(ui.queryByText("إجابة صحيحة"), null);
      const wrong = q.options.find((o) => o.id !== q.correctId)!;
      fireEvent.click(ui.getByText(wrong.text));
      if (i < 4)
        fireEvent.click(
          ui.getByRole("button", { name: "التالي", exact: true }),
        );
    }
    fireEvent.click(ui.getByLabelText("انتقل إلى السؤال 1"));
    assert.equal(
      (ui.getByRole("radio", { name: /الألعاب/ }) as HTMLInputElement).checked,
      true,
    );
  } finally {
    cleanup();
  }
  ui = render(<NutritionDiagnostic {...props} />);
  try {
    assert.equal(
      (ui.getByRole("radio", { name: /الألعاب/ }) as HTMLInputElement).checked,
      true,
    );
    fireEvent.click(ui.getByText("إنهاء الاختبار"));
    assert.equal(finishes, 1);
    assert.equal(score, 0);
    assert.ok(ui.getByRole("heading", { name: "اكتشفت نقطة انطلاقك!" }));
    assert.equal(ui.queryByText(/راسب|فاشل/), null);
    fireEvent.click(ui.getByText("ابدأ رحلة التعلم"));
    assert.equal(learned, 1);
  } finally {
    cleanup();
  }
});
test("six concise goals are presented without developer alignment notes", () => {
  const ui = render(<NutritionGoals />);
  try {
    assert.equal(ui.container.querySelectorAll(".nutrition-goal").length, 6);
    for (const goal of nutritionOpeningGoals) assert.ok(ui.getByText(goal));
    assert.equal(ui.queryByText(/جدول مواءمة|ترتبط بالشرح|يقيس الهدف/), null);
  } finally {
    cleanup();
  }
});
test("returning to a lesson restores simulation position, variables and mode without awarding observation by restoring", () => {
  const scene = lessons[0].scenes[0];
  let watched = 0;
  const props = {
    scene,
    reduced: true,
    watched: false,
    experimented: false,
    onWatch: () => watched++,
    onExperiment: () => {},
  };
  let ui = render(<Simulation {...props} />);
  fireEvent.click(ui.getByRole("button", { name: /جرّب بنفسك/ }));
  fireEvent.change(ui.getAllByRole("slider")[0], { target: { value: "1" } });
  fireEvent.click(ui.getByRole("button", { name: "خطوة تالية", exact: true }));
  const t = (ui.getByRole("progressbar") as HTMLProgressElement).value;
  cleanup();
  ui = render(<Simulation {...props} />);
  try {
    assert.equal((ui.getByRole("progressbar") as HTMLProgressElement).value, t);
    assert.equal((ui.getAllByRole("slider")[0] as HTMLInputElement).value, "1");
    assert.equal(ui.queryByRole("button", { name: "إيقاف مؤقت" }), null);
    assert.equal(watched, 0);
  } finally {
    cleanup();
  }
});
test("submitted quizzes keep results when returning and do not rescore until an explicit retry", () => {
  const questions = bank(lessons[1], "pre");
  let finished = 0;
  const props = {
    title: "اختبار محفوظ",
    questions,
    onFinish: () => finished++,
  };
  let ui = render(<Quiz {...props} />);
  for (const q of questions)
    fireEvent.click(
      ui.container.querySelectorAll<HTMLInputElement>(`input[name="${q.id}"]`)[
        q.answer
      ],
    );
  fireEvent.click(ui.getByRole("button", { name: /تصحيح الاختبار/ }));
  assert.equal(finished, 1);
  cleanup();
  ui = render(<Quiz {...props} />);
  try {
    assert.ok(ui.getByText("100%"));
    assert.equal(ui.queryByRole("button", { name: /تصحيح الاختبار/ }), null);
    assert.equal(finished, 1);
    fireEvent.click(ui.getByText("إعادة الاختبار"));
    assert.ok(ui.getByRole("button", { name: /تصحيح الاختبار/ }));
  } finally {
    cleanup();
  }
});
test("inline concept checks save attempts, require a correct action and do not repeat success", async () => {
  const { ConceptCheck } = await import("../src/components/ConceptCheck");
  const { curriculum } = await import("../src/data/curriculum");
  const q = curriculum[0].topics[1].check;
  const original = soundManager.play;
  const effects: string[] = [];
  soundManager.play = async (e) => {
    effects.push(e);
    return true;
  };
  let awards = 0,
    hints = 0;
  let ui = render(
    <ConceptCheck
      question={q}
      done={false}
      onDone={() => awards++}
      onHint={() => hints++}
    />,
  );
  try {
    fireEvent.click(
      ui.getAllByRole("radio")[(q.answer + 1) % q.options.length],
    );
    fireEvent.click(ui.getByText("تحقق من فهمي"));
    assert.equal(awards, 0);
    assert.equal(hints, 1);
    assert.equal(effects.at(-1), "error");
  } finally {
    cleanup();
  }
  ui = render(
    <ConceptCheck
      question={q}
      done={false}
      onDone={() => awards++}
      onHint={() => hints++}
    />,
  );
  try {
    assert.equal(
      (
        ui.getAllByRole("radio")[
          (q.answer + 1) % q.options.length
        ] as HTMLInputElement
      ).checked,
      true,
    );
    fireEvent.click(ui.getAllByRole("radio")[q.answer]);
    fireEvent.click(ui.getByText("تحقق من فهمي"));
    fireEvent.click(ui.getByText("تحقق من فهمي"));
    assert.equal(awards, 1);
    assert.equal(effects.filter((e) => e === "success").length, 1);
  } finally {
    cleanup();
    soundManager.play = original;
  }
});
test("each infographic is silent and the same teacher character supplies contextual hints across lessons", async () => {
  const { LessonInfographic } = await import(
    "../src/components/LessonInfographic"
  );
  const { StageGuide } = await import("../src/components/StageGuide");
  const { curriculum } = await import("../src/data/curriculum");
  for (const l of curriculum) {
    const ui = render(<LessonInfographic lesson={l} />);
    try {
      assert.equal(ui.getAllByRole("figure").length, l.topics.length);
      assert.equal(ui.queryByRole("button"), null);
      assert.equal(ui.container.querySelector("audio,video"), null);
    } finally {
      cleanup();
    }
  }
  const ui = render(
    <StageGuide
      context="test-book-1"
      text="تأمل الشجرة"
      hints={["حدد ما تحتاج إليه", "غيّر عاملًا واحدًا"]}
    />,
  );
  try {
    const before = ui.getByRole("img").getAttribute("aria-label");
    fireEvent.click(ui.getByText("أعطني تلميحًا"));
    assert.ok(ui.getByText("حدد ما تحتاج إليه"));
    fireEvent.click(ui.getByText("إغلاق الفقاعة"));
    assert.equal(ui.queryByText("حدد ما تحتاج إليه"), null);
    ui.rerender(
      <StageGuide
        context="test-book-2"
        text="قارن ماء الجير"
        hints={["ثبت ظروف المقارنة"]}
      />,
    );
    assert.ok(ui.getByText("قارن ماء الجير"));
    assert.equal(ui.getByRole("img").getAttribute("aria-label"), before);
  } finally {
    cleanup();
  }
});
