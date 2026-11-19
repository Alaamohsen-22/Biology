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
const { render, fireEvent, cleanup } = await import("@testing-library/react");
const { ScientificScene } = await import(
  "../src/components/science/ScientificScene"
);
const { soundManager } = await import("../src/engine/sound");
soundManager.configure(false);
test("expanded science diagrams escape the classroom containment and return without losing scientific state", () => {
  const ui = render(
    <div className="classroom-content">
      <ScientificScene id="urine" t={0.7} value={0.7} vars={{ time: 100 }} />
    </div>,
  );
  try {
    const initial = ui.getByRole("img").getAttribute("aria-label");
    fireEvent.click(ui.getByText("تكبير الرسم"));
    const dialog = ui.getByRole("dialog");
    assert.equal(ui.container.contains(dialog), false);
    assert.equal(
      dialog.querySelector('svg[role="img"]')?.getAttribute("aria-label"),
      initial,
    );
    fireEvent.keyDown(dialog, { key: "Escape" });
    assert.equal(ui.queryByRole("dialog"), null);
    assert.equal(ui.getByRole("img").getAttribute("aria-label"), initial);
  } finally {
    cleanup();
  }
});
test("the inline lesson sidebar collapses without a modal and keeps direct concept navigation in every lesson", async () => {
  const { LessonSidebar } = await import("../src/components/LessonSidebar");
  const { lessons } = await import("../src/data/lessons");
  const { lessonPages, lessonIndex } = await import("../src/engine/lessonFlow");
  const { emptyLesson } = await import("../src/engine/progress");
  for (const lesson of lessons) {
    let selected = -1;
    const props = {
      lesson,
      progress: emptyLesson(),
      currentIndex: 3,
      onSelect: (i: number) => {
        selected = i;
      },
    };
    const ui = render(<LessonSidebar {...props} open={false} />);
    try {
      assert.equal(ui.queryByRole("navigation"), null);
      assert.equal(ui.queryByRole("dialog"), null);
      ui.rerender(<LessonSidebar {...props} open />);
      for (const { page, index } of lessonIndex(lesson.id)) {
        fireEvent.click(
          ui.getByRole("button", { name: page.title, exact: true }),
        );
        assert.equal(selected, index);
      }
      assert.equal(
        ui.queryByRole("button", { name: "الأنشطة", exact: true }),
        null,
      );
      assert.equal(
        ui.queryByRole("button", { name: "تقويم تكويني", exact: true }),
        null,
      );
      assert.ok(ui.getByRole("button", { name: "الشرح", exact: true }));
      fireEvent.click(
        ui.getByRole("button", { name: "تحقق من فهمك", exact: true }),
      );
      assert.equal(lessonPages(lesson.id)[selected].kind, "check");
      ui.rerender(<LessonSidebar {...props} open={false} />);
      assert.equal(ui.queryByRole("navigation"), null);
    } finally {
      cleanup();
    }
  }
});
