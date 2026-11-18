import React from "react";
import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
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
const { render, fireEvent, cleanup, act } = await import(
  "@testing-library/react"
);
const { lessons } = await import("../src/data/lessons");
const { scienceCatalog, ScientificScene } = await import(
  "../src/components/science/ScientificScene"
);
const { Simulation } = await import("../src/components/Simulation");
const { Project } = await import("../src/components/Project");
const { soundManager } = await import("../src/engine/sound");
soundManager.configure(false);
const geometry = (svg: HTMLElement) =>
  Array.from(svg.querySelectorAll("g,path,circle,ellipse,rect"))
    .map((e) =>
      [
        e.tagName,
        ...Array.from(e.attributes).map((a) => `${a.name}=${a.value}`),
      ].join("|"),
    )
    .join("\n");
for (const lesson of lessons)
  for (const scene of lesson.scenes) {
    test(`${scene.id}: dedicated artwork, visible geometry change, previous step and replay`, () => {
      assert.ok(scienceCatalog[scene.id]);
      let viewed = 0;
      const ui = render(
        <Simulation
          scene={scene}
          reduced={true}
          watched={false}
          experimented={false}
          onWatch={() => viewed++}
          onExperiment={() => {}}
        />,
      );
      try {
        assert.equal(
          ui
            .getByRole("button", { name: "تشغيل", exact: true })
            .hasAttribute("disabled"),
          false,
        );
        const start = geometry(ui.getByRole("img"));
        fireEvent.click(ui.getByRole("button", { name: /خطوة تالية/ }));
        assert.notEqual(
          geometry(ui.getByRole("img")),
          start,
          "scientific shapes must change, not only labels",
        );
        fireEvent.click(ui.getByRole("button", { name: /خطوة سابقة/ }));
        assert.equal(geometry(ui.getByRole("img")), start);
        for (let i = 0; i < scene.stages.length; i++)
          fireEvent.click(ui.getByRole("button", { name: /خطوة تالية/ }));
        assert.equal(viewed, 1);
        fireEvent.click(ui.getByRole("button", { name: /إعادة ضبط المحاكاة/ }));
        assert.equal(viewed, 1);
        assert.equal(geometry(ui.getByRole("img")), start);
        assert.equal(
          ui
            .getAllByRole("button")
            .filter((b) => b.getAttribute("aria-pressed") !== null).length >= 2,
          true,
        );
      } finally {
        cleanup();
      }
    });
  }
test("all 23 scenes play and pause in reduced motion as discrete stages, independent of sound", () => {
  const oldSet = dom.window.setInterval,
    oldClear = dom.window.clearInterval;
  let callback: (() => void) | undefined;
  let interval = 0;
  dom.window.setInterval = ((fn: () => void, ms: number) => {
    callback = fn;
    interval = ms;
    return 45;
  }) as typeof dom.window.setInterval;
  dom.window.clearInterval = () => {
    callback = undefined;
  };
  try {
    for (const scene of lessons.flatMap((l) => l.scenes)) {
      let viewed = 0;
      const ui = render(
        <Simulation
          scene={scene}
          reduced={true}
          watched={false}
          experimented={false}
          onWatch={() => viewed++}
          onExperiment={() => {}}
        />,
      );
      try {
        fireEvent.click(ui.getByRole("button", { name: "تشغيل", exact: true }));
        assert.ok(interval >= 1000);
        assert.ok(callback);
        act(() => callback?.());
        assert.equal((ui.getByRole("progressbar", {name:"تقدم التجربة"}) as HTMLProgressElement).value, .25);
        fireEvent.click(ui.getByRole("button", { name: "إيقاف مؤقت" }));
        assert.equal(callback, undefined);
        fireEvent.click(ui.getByRole("button", { name: "استئناف" }));
        const tick = callback;
        for (let i = 0; i < 3; i++) act(() => tick?.());
        assert.equal(viewed, 1);
        assert.equal(soundManager.getSnapshot().enabled, false);
      } finally {
        cleanup();
      }
    }
  } finally {
    dom.window.setInterval = oldSet;
    dom.window.clearInterval = oldClear;
  }
});
test("all visual instances use unique SVG references and the compost is redesigned too", () => {
  const ui = render(
    <>
      <ScientificScene id="urine" vars={{ time: 100 }} t={0.3} value={0.3} />
      <ScientificScene id="urine" vars={{ time: 100 }} t={0.7} value={0.7} />
      <ScientificScene id="compost" vars={{ days: 60 }} t={0.7} value={0.7} />
    </>,
  );
  try {
    const ids = Array.from(ui.container.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(ui.getAllByRole("img").length, 3);
  } finally {
    cleanup();
  }
});
test("compost automatic control is enabled in reduced motion and produces visible change", () => {
  let tick: (() => void) | undefined;
  const old = dom.window.setInterval,
    oldClear = dom.window.clearInterval;
  dom.window.setInterval = ((fn: () => void) => {
    tick = fn;
    return 99;
  }) as typeof dom.window.setInterval;
  dom.window.clearInterval = () => {
    tick = undefined;
  };
  const ui = render(<Project reduced onFinish={() => {}} />);
  try {
    fireEvent.click(ui.getByLabelText("قشور خضار"));
    fireEvent.click(ui.getByLabelText("أوراق جافة"));
    const initial = geometry(ui.getByRole("img"));
    fireEvent.click(ui.getByRole("button", { name: /شاهد التحلل بزمن مسرع/ }));
    assert.ok(tick);
    act(() => tick?.());
    assert.notEqual(geometry(ui.getByRole("img")), initial);
    fireEvent.click(ui.getByRole("button", { name: /إيقاف تقدم الزمن/ }));
    assert.equal(tick, undefined);
  } finally {
    cleanup();
    dom.window.setInterval = old;
    dom.window.clearInterval = oldClear;
  }
});
