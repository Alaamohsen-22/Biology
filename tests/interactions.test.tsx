import React from "react";
import { JSDOM } from "jsdom";
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "http://localhost/Biology/",
});
Object.defineProperty(globalThis, "window", {
  value: dom.window,
  configurable: true,
});
Object.defineProperty(globalThis, "document", {
  value: dom.window.document,
  configurable: true,
});
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
Object.assign(globalThis, {
  HTMLElement: dom.window.HTMLElement,
  IS_REACT_ACT_ENVIRONMENT: true,
});
beforeEach(() => {
  for (const key of Object.keys(dom.window.localStorage))
    if (key.startsWith("life-island-draft:")) dom.window.localStorage.removeItem(key);
});
const { render, fireEvent, cleanup } = await import("@testing-library/react");
const { Simulation } = await import("../src/components/Simulation");
const { Quiz } = await import("../src/components/Quiz");
const { Matching, Ordering, Formative } = await import(
  "../src/components/Activities"
);
const { lessons, bank } = await import("../src/data/lessons");
const { soundManager } = await import("../src/engine/sound");
soundManager.configure(false);
for (const lesson of lessons) {
  for (const scene of lesson.scenes) {
    test(`station ${lesson.id}, ${scene.id}: observation, changed variable, completion, conclusion`, () => {
      let watched = 0,
        experimented = 0;
      const ui = render(
        <Simulation
          scene={scene}
          reduced={true}
          watched={false}
          experimented={false}
          onWatch={() => watched++}
          onExperiment={() => experimented++}
        />,
      );
      try {
        assert.equal(
          ui.getByRole("button", { name: "تشغيل" }).hasAttribute("disabled"),
          false,
        );
        for (let i = 0; i < scene.stages.length; i++)
          fireEvent.click(ui.getByRole("button", { name: /خطوة تالية/ }));
        assert.equal(watched, 1);
        fireEvent.click(ui.getByRole("button", { name: /جرّب بنفسك/ }));
        assert.equal(
          ui
            .getByRole("button", { name: /تسجيل الملاحظة/ })
            .hasAttribute("disabled"),
          true,
        );
        const range = ui.getAllByRole("slider")[0];
        const variable = scene.variables[0];
        fireEvent.change(range, {
          target: {
            value:
              Number((range as HTMLInputElement).value) === variable.max
                ? variable.min
                : variable.max,
          },
        });
        fireEvent.click(ui.getByRole("button", { name: "تشغيل", exact: true }));
        for (let i = 0; i < scene.stages.length; i++)
          fireEvent.click(ui.getByRole("button", { name: /خطوة تالية/ }));
        fireEvent.click(ui.getByRole("button", { name: /تسجيل الملاحظة/ }));
        fireEvent.change(ui.getByLabelText("ما الاستنتاج المناسب؟"), {
          target: { value: "exact" },
        });
        fireEvent.click(ui.getByRole("button", { name: /اعتماد الاستنتاج/ }));
        assert.equal(experimented, 0);
        fireEvent.change(ui.getByLabelText("ما الاستنتاج المناسب؟"), {
          target: { value: "model" },
        });
        fireEvent.click(ui.getByRole("button", { name: /اعتماد الاستنتاج/ }));
        assert.equal(experimented, 1);
        assert.ok(ui.container.querySelector("svg"));
        assert.ok(ui.getByRole("img").children.length > 3);
      } finally {
        cleanup();
      }
    });
  }
  test(`station ${lesson.id}: pre and post scoring without omitted answers`, () => {
    for (const kind of ["pre", "post"] as const) {
      let result = -1;
      const qs = bank(lesson, kind);
      const ui = render(
        <Quiz
          questions={qs}
          title="فحص"
          pre={kind === "pre"}
          onFinish={(s) => (result = s)}
        />,
      );
      try {
        assert.equal(
          ui
            .getByRole("button", { name: /تصحيح الاختبار/ })
            .hasAttribute("disabled"),
          true,
        );
        for (const q of qs) {
          const inputs = ui.container.querySelectorAll<HTMLInputElement>(
            `input[name="${q.id}"]`,
          );
          fireEvent.click(inputs[q.answer]);
        }
        fireEvent.click(ui.getByRole("button", { name: /تصحيح الاختبار/ }));
        assert.equal(result, 100);
        assert.ok(ui.getByRole("status"));
      } finally {
        cleanup();
      }
    }
  });
  test(`station ${lesson.id}: matching and ordering only complete after correct answers`, () => {
    let matches = 0;
    let orders = 0;
    let formative = 0;
    const ui = render(
      <Matching lesson={lesson} done={false} onDone={() => matches++} />,
    );
    const selects = ui.getAllByRole("combobox");
    for (let i = 0; i < lesson.pairs.length; i++)
      fireEvent.change(selects[i], { target: { value: lesson.pairs[i][1] } });
    fireEvent.click(ui.getByRole("button", { name: /تحقق من المطابقة/ }));
    assert.equal(matches, 1);
    cleanup();
    const orderUI = render(
      <Ordering items={lesson.order} done={false} onDone={() => orders++} />,
    );
    for (const item of [...lesson.order].reverse())
      fireEvent.click(
        orderUI.getByRole("button", { name: new RegExp(item), exact: false }),
      );
    fireEvent.click(orderUI.getByRole("button", { name: /تحقق من الترتيب/ }));
    assert.equal(orders, 0);
    fireEvent.click(orderUI.getByRole("button", { name: "إعادة المحاولة" }));
    for (const item of lesson.order)
      fireEvent.click(
        orderUI.getByRole("button", { name: new RegExp(item), exact: false }),
      );
    fireEvent.click(orderUI.getByRole("button", { name: /تحقق من الترتيب/ }));
    assert.equal(orders, 1);
    cleanup();
    const question = lesson.questions[2];
    const f = render(
      <Formative question={question} done={false} onDone={() => formative++} />,
    );
    const radios = f.getAllByRole("radio");
    fireEvent.click(radios[(question.answer + 1) % question.options.length]);
    fireEvent.click(f.getByRole("button", { name: /تحقق وحاول/ }));
    assert.equal(formative, 0);
    fireEvent.click(radios[question.answer]);
    fireEvent.click(f.getByRole("button", { name: /تحقق وحاول/ }));
    assert.equal(formative, 1);
    cleanup();
  });
}
test("complete learner journey through seven stations, compost, final, certificate, and restored dashboard", async () => {
  const { within } = await import("@testing-library/react");
  Object.defineProperty(globalThis, "localStorage", {
    value: dom.window.localStorage,
    configurable: true,
  });
  dom.window.localStorage.clear();
  dom.window.localStorage.setItem(
    "life-island-settings-v1",
    JSON.stringify({ sound: false, reduced: true }),
  );
  Object.defineProperty(dom.window, "matchMedia", {
    value: () => ({ matches: true }),
    configurable: true,
  });
  Object.defineProperty(dom.window, "scrollTo", {
    value: () => {},
    configurable: true,
  });
  const { default: App } = await import("../src/App");
  const ui = render(<App />);
  const answerQuiz = (qs: ReturnType<typeof bank>) => {
    for (const q of qs) {
      const input = ui.container.querySelectorAll<HTMLInputElement>(
        `input[name="${q.id}"]`,
      )[q.answer];
      assert.ok(input);
      fireEvent.click(input);
    }
    fireEvent.click(ui.getByRole("button", { name: /تصحيح الاختبار/ }));
  };
  const sortItems = (items: string[]) => {
    if (ui.container.querySelector(".card-ordering")) {
      const scope = within(
        ui.container.querySelector<HTMLElement>(".card-ordering")!,
      );
      for (const item of items)
        fireEvent.click(scope.getByRole("button", { name: new RegExp(item) }));
      fireEvent.click(scope.getByRole("button", { name: /تحقق من الترتيب/ }));
      return;
    }
    for (let idx = 0; idx < items.length; idx++) {
      let current = Array.from(ui.container.querySelectorAll("li b")).findIndex(
        (x) => x.textContent === items[idx],
      );
      while (current > idx) {
        fireEvent.click(
          ui.getByRole("button", { name: `تقديم ${items[idx]}` }),
        );
        current--;
      }
    }
    fireEvent.click(ui.getByRole("button", { name: /تحقق من الترتيب/ }));
  };
  try {
    fireEvent.click(ui.getByRole("button", { name: /ابدأ المغامرة/ }));
    fireEvent.change(ui.getByLabelText("اسم المستكشف"), {
      target: { value: "مستكشف الاختبار" },
    });
    fireEvent.click(ui.getByRole("button", { name: /إلى الجزيرة/ }));
    fireEvent.click(ui.getByRole("button", { name: /المحطة 1 التغذية/ }));
    for (const lesson of lessons) {
      fireEvent.click(
        ui.getByRole("button", { name: /الاختبار القبلي/, exact: false }),
      );
      answerQuiz(bank(lesson, "pre"));
      fireEvent.click(
        ui.getByRole("button", { name: /المختبر/, exact: false }),
      );
      for (const simulation of ui.container.querySelectorAll<HTMLElement>(
        ".simulation",
      )) {
        const scope = within(simulation);
        const scene =
          lesson.scenes[
            Array.from(ui.container.querySelectorAll(".simulation")).indexOf(
              simulation,
            )
          ];
        for (let i = 0; i < scene.stages.length; i++)
          fireEvent.click(scope.getByRole("button", { name: /خطوة تالية/ }));
        fireEvent.click(scope.getByRole("button", { name: /جرّب بنفسك/ }));
        const variable = scene.variables[0];
        fireEvent.change(scope.getAllByRole("slider")[0], {
          target: {
            value:
              Number(
                (scope.getAllByRole("slider")[0] as HTMLInputElement).value,
              ) === variable.max
                ? variable.min
                : variable.max,
          },
        });
        fireEvent.click(
          scope.getByRole("button", { name: "تشغيل", exact: true }),
        );
        for (let i = 0; i < scene.stages.length; i++)
          fireEvent.click(scope.getByRole("button", { name: /خطوة تالية/ }));
        fireEvent.click(scope.getByRole("button", { name: /تسجيل الملاحظة/ }));
        fireEvent.change(scope.getByLabelText("ما الاستنتاج المناسب؟"), {
          target: { value: "model" },
        });
        fireEvent.click(
          scope.getByRole("button", { name: /اعتماد الاستنتاج/ }),
        );
      }
      fireEvent.click(
        ui.getByRole("button", { name: /الأنشطة/, exact: false }),
      );
      if (lesson.id === 5) {
        ["الكليتان", "الحالبان", "المثانة", "الإحليل"].forEach((x, i) =>
          fireEvent.change(ui.getByLabelText(`اسم العضو في الموضع ${i + 1}`), {
            target: { value: x },
          }),
        );
        fireEvent.click(
          ui.getByRole("button", { name: /تحقق من تركيب النموذج/ }),
        );
      }
      const selects = ui
        .getAllByRole("combobox")
        .filter((s) => !s.getAttribute("aria-label")?.startsWith("اسم العضو"));
      lesson.pairs.forEach((pair, i) =>
        fireEvent.change(selects[i], { target: { value: pair[1] } }),
      );
      fireEvent.click(ui.getByRole("button", { name: /تحقق من المطابقة/ }));
      sortItems(lesson.order);
      fireEvent.click(ui.getByRole("button", { name: /تقويم تكويني/ }));
      fireEvent.click(ui.getAllByRole("radio")[lesson.questions[2].answer]);
      fireEvent.click(ui.getByRole("button", { name: /تحقق وحاول/ }));
      fireEvent.click(ui.getByRole("button", { name: /الاختبار البعدي/ }));
      answerQuiz(bank(lesson, "post"));
      fireEvent.click(ui.getByRole("button", { name: /الغلق/ }));
      assert.ok(ui.getByText(`وسام مستكشف ${lesson.title}`));
      fireEvent.click(
        ui.getByRole("button", {
          name: lesson.id < 7 ? /إلى المحطة التالية/ : /إلى المهمة الكبرى/,
        }),
      );
    }
    fireEvent.click(ui.getByLabelText("قشور خضار"));
    fireEvent.click(ui.getByLabelText("أوراق جافة"));
    fireEvent.click(ui.getByRole("button", { name: /شغّل وقارن النتيجة/ }));
    sortItems([
      "تجهيز حاوية بفتحات تهوية",
      "إضافة طبقات من بقايا خضراء ومواد جافة",
      "ترطيب باعتدال وتقليب ومتابعة",
      "انتظار التحلل ومقارنة التغيرات",
    ]);
    fireEvent.change(ui.getByLabelText("لماذا تتغير البقايا؟"), {
      target: { value: "microbes" },
    });
    fireEvent.change(ui.getByLabelText("ما السلوك المناسب؟"), {
      target: { value: "safe" },
    });
    fireEvent.click(ui.getByRole("button", { name: /قيّم مشروعي/ }));
    fireEvent.click(ui.getByRole("button", { name: /تحدي الوحدة/ }));
    const { finalBank } = await import("../src/data/lessons");
    answerQuiz(finalBank());
    fireEvent.click(ui.getByRole("button", { name: /شهادتي/ }));
    assert.ok(ui.getByRole("heading", { name: "شهادة مستكشف أسرار الحياة" }));
    assert.ok(ui.getByRole("heading", { name: "مستكشف الاختبار" }));
    const saved = JSON.parse(
      dom.window.localStorage.getItem("life-island-progress-v1")!,
    );
    assert.equal(saved.final, 100);
    assert.equal(saved.project, 100);
    assert.equal(Object.keys(saved.lessons).length, 7);
    cleanup();
    const restored = render(<App />);
    fireEvent.click(restored.getByRole("button", { name: /رحلة إنجازي/ }));
    assert.ok(restored.getByText("رحلة مستكشف الاختبار"));
    assert.equal(
      restored
        .getByRole("button", { name: /شهادة المستكشف/ })
        .hasAttribute("disabled"),
      false,
    );
  } finally {
    cleanup();
  }
});
test("automatic playback, pause, replay and speed controls operate for every scientific scene", async () => {
  const { act } = await import("@testing-library/react");
  const originalSet = dom.window.setInterval;
  const originalClear = dom.window.clearInterval;
  const originalGlobalClear = globalThis.clearInterval;
  let tick: (() => void) | undefined;
  let cleared = 0;
  dom.window.setInterval = ((handler: () => void) => {
    tick = handler;
    return 123;
  }) as typeof dom.window.setInterval;
  dom.window.clearInterval = () => {
    cleared++;
    tick = undefined;
  };
  globalThis.clearInterval = dom.window
    .clearInterval as typeof globalThis.clearInterval;
  try {
    for (const l of lessons)
      for (const scene of l.scenes) {
        let watched = 0;
        const ui = render(
          <Simulation
            scene={scene}
            reduced={false}
            watched={false}
            experimented={false}
            onWatch={() => watched++}
            onExperiment={() => {}}
          />,
        );
        try {
          fireEvent.change(ui.getByLabelText("السرعة"), {
            target: { value: "2" },
          });
          fireEvent.click(ui.getByRole("button", { name: "تشغيل" }));
          assert.ok(tick);
          const initial = ui.getByRole("img").outerHTML;
          act(() => {
            tick?.();
          });
          assert.notEqual(ui.getByRole("img").outerHTML, initial);
          fireEvent.click(ui.getByRole("button", { name: "إيقاف مؤقت" }));
          assert.equal(tick, undefined);
          assert.ok(cleared > 0);
          fireEvent.click(ui.getByRole("button", { name: "استئناف" }));
          const advance = tick;
          act(() => {
            for (let i = 0; i < 100; i++) advance?.();
          });
          assert.equal(watched, 1);
          fireEvent.click(
            ui.getByRole("button", { name: "إعادة ضبط المحاكاة" }),
          );
          assert.equal((ui.getByRole("progressbar", {name:"تقدم التجربة"}) as HTMLProgressElement).value, 0);
          assert.equal(watched, 1);
        } finally {
          cleanup();
        }
      }
  } finally {
    dom.window.setInterval = originalSet;
    dom.window.clearInterval = originalClear;
    globalThis.clearInterval = originalGlobalClear;
  }
});
test("all seven stations and ten stages are open before any assessment; visiting never awards mastery", async () => {
  const { initialProgress, emptyLesson } = await import(
    "../src/engine/progress"
  );
  const { default: App } = await import("../src/App");
  const { stages } = await import("../src/data/lessons");
  const initial = {
    ...initialProgress(),
    name: "متعلم حر",
    lessons: {
      1: { ...emptyLesson(), pre: 42, post: 57, activities: ["match"] },
    },
  };
  dom.window.localStorage.setItem(
    "life-island-progress-v1",
    JSON.stringify(initial),
  );
  dom.window.localStorage.setItem(
    "life-island-settings-v1",
    JSON.stringify({ sound: false, reduced: true, unlock: false }),
  );
  const ui = render(<App />);
  try {
    fireEvent.click(ui.getByRole("button", { name: /أكمل مغامرتك/ }));
    for (const lesson of [...lessons].reverse()) {
      const pin = ui.getByRole("button", {
        name: `المحطة ${lesson.id} ${lesson.title}: متاحة`,
      });
      assert.equal(pin.hasAttribute("disabled"), false);
      fireEvent.click(pin);
      for (const index of [9, 0, 8, 1, 7, 2, 6, 3, 5, 4]) {
        fireEvent.click(
          ui.getByRole("button", {
            name: new RegExp(`^0?${index + 1}\\s*${stages[index]}$`),
          }),
        );
        const next = ui.getByRole("button", { name: /تابع الاستكشاف/ });
        const prev = ui.getByRole("button", { name: "المرحلة السابقة" });
        assert.equal(next.hasAttribute("disabled"), index === 9);
        assert.equal(prev.hasAttribute("disabled"), index === 0);
        if (index < 9) {
          fireEvent.click(next);
          assert.ok(ui.getByText(`${index + 2} / 10`));
          fireEvent.click(ui.getByRole("button", { name: "المرحلة السابقة" }));
        }
      }
      fireEvent.click(ui.getByRole("button", { name: /العودة للخريطة/ }));
    }
    fireEvent.click(ui.getByRole("button", { name: /مهمة الدبال/ }));
    assert.ok(ui.getByRole("heading", { name: /حاوية التحلل الافتراضية/ }));
    fireEvent.click(ui.getByRole("button", { name: /تحدي الوحدة/ }));
    assert.ok(ui.getByRole("heading", { name: "الاختبار البعدي الشامل" }));
    fireEvent.click(ui.getByRole("button", { name: /رحلة إنجازي/ }));
    assert.equal(
      ui
        .getByRole("button", { name: /شهادة المستكشف/ })
        .hasAttribute("disabled"),
      true,
    );
    assert.deepEqual(
      JSON.parse(dom.window.localStorage.getItem("life-island-progress-v1")!),
      initial,
    );
  } finally {
    cleanup();
  }
});

test("nutrition card ordering: select, undo, remove, retry, wrong and correct without duplicate celebration", async (t) => {
  const { CardOrdering, shuffledCards } = await import(
    "../src/components/CardOrdering"
  );
  const { act, within } = await import("@testing-library/react");
  const plays: string[] = [];
  let creates = 0;
  const originalAudio = globalThis.Audio;
  class FakeAudio {
    src = "";
    currentTime = 0;
    volume = 1;
    constructor() {
      creates++;
    }
    pause() {}
    play() {
      plays.push(this.src);
      return Promise.resolve();
    }
  }
  Object.defineProperty(globalThis, "Audio", {
    value: FakeAudio,
    writable: true,
    configurable: true,
  });
  soundManager.configure(true, 0.7);
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let completed = 0;
  const items = lessons[0].order;
  const ui = render(
    <CardOrdering
      items={items}
      done={true}
      sound={true}
      reduced={false}
      onDone={() => completed++}
    />,
  );
  const pick = (id: number) =>
    fireEvent.click(
      within(
        ui.getByRole("group", { name: "بطاقات المراحل المتاحة" }),
      ).getByRole("button", { name: new RegExp(items[id]) }),
    );
  try {
    const old = Array.from(
      ui
        .getByRole("group", { name: "بطاقات المراحل المتاحة" })
        .querySelectorAll("b"),
    ).map((x) => x.textContent);
    assert.ok(ui.getByText("✓ أُنجز النشاط"));
    assert.equal(completed, 0);
    assert.equal(plays.length, 0);
    pick(0);
    pick(1);
    fireEvent.click(ui.getByRole("button", { name: /تراجع عن آخر خطوة/ }));
    assert.equal(
      ui.getByRole("group", { name: "منطقة الإجابة" }).querySelectorAll("li")
        .length,
      1,
    );
    fireEvent.click(
      ui.getByRole("button", { name: `إلغاء اختيار ${items[0]}` }),
    );
    assert.equal(
      ui.getByRole("group", { name: "منطقة الإجابة" }).querySelectorAll("li")
        .length,
      0,
    );
    fireEvent.click(ui.getByRole("button", { name: "إعادة المحاولة" }));
    const next = Array.from(
      ui
        .getByRole("group", { name: "بطاقات المراحل المتاحة" })
        .querySelectorAll("b"),
    ).map((x) => x.textContent);
    assert.notDeepEqual(next, old);
    for (const id of [3, 2, 1, 0]) pick(id);
    fireEvent.click(ui.getByRole("button", { name: /تحقق من الترتيب/ }));
    assert.ok(ui.getByText("محاولة جميلة! جرّب مرة أخرى 💚"));
    act(() => t.mock.timers.tick(170));
    assert.equal(plays.filter((s) => s.endsWith("error.wav")).length, 1);
    assert.equal(completed, 0);
    fireEvent.click(ui.getByRole("button", { name: "إعادة المحاولة" }));
    for (const id of [0, 1, 2, 3]) pick(id);
    const verify = ui.getByRole("button", { name: /تحقق من الترتيب/ });
    fireEvent.click(verify);
    fireEvent.click(verify);
    assert.equal(completed, 1);
    assert.ok(ui.getByText("ممتاز! أنت عالم صغير مبدع! 🌟"));
    assert.ok(ui.getByTestId("activity-celebration"));
    act(() => t.mock.timers.tick(170));
    assert.equal(plays.filter((s) => s.endsWith("success.wav")).length, 1);
    assert.equal(creates, 1);
    act(() => t.mock.timers.tick(2500));
    assert.equal(ui.queryByTestId("activity-celebration"), null);
    fireEvent.click(ui.getByRole("button", { name: "إعادة المحاولة" }));
    assert.ok(ui.getByText("✓ أُنجز النشاط"));
    assert.equal(completed, 1);
    ui.rerender(
      <CardOrdering
        items={items}
        done={true}
        sound={false}
        reduced={true}
        onDone={() => completed++}
      />,
    );
    const before = plays.length;
    for (const id of [0, 1, 2, 3]) pick(id);
    fireEvent.click(ui.getByRole("button", { name: /تحقق من الترتيب/ }));
    act(() => t.mock.timers.tick(170));
    assert.equal(plays.length, before);
    assert.ok(
      ui.getByTestId("activity-celebration").classList.contains("still"),
    );
    for (let i = 0; i < 20; i++)
      assert.deepEqual([...shuffledCards(4)].sort(), [0, 1, 2, 3]);
  } finally {
    cleanup();
    t.mock.timers.reset();
    soundManager.configure(false);
    Object.defineProperty(globalThis, "Audio", {
      value: originalAudio,
      writable: true,
      configurable: true,
    });
  }
});
