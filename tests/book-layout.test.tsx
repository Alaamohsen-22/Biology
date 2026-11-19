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
const { BookContentsDrawer } = await import(
  "../src/components/BookContentsDrawer"
);
const { ScientificScene } = await import(
  "../src/components/science/ScientificScene"
);
const { soundManager } = await import("../src/engine/sound");
soundManager.configure(false);
test("contents is outside the reading leaf, traps focus, dismisses with Escape and restores the opener", () => {
  let closed = 0;
  function Host() {
    const [open, setOpen] = React.useState(false);
    return (
      <main data-testid="leaf">
        <button onClick={() => setOpen(true)}>افتح الفهرس</button>
        <p>المحتوى لا ينتقل إلى عمود ضيق</p>
        {open && (
          <BookContentsDrawer
            title="الأيض"
            onClose={() => {
              closed++;
              setOpen(false);
            }}
          >
            <button>التنفس</button>
            <button>التخمر</button>
          </BookContentsDrawer>
        )}
      </main>
    );
  }
  const ui = render(<Host />);
  try {
    const opener = ui.getByText("افتح الفهرس");
    opener.focus();
    fireEvent.click(opener);
    const dialog = ui.getByRole("dialog");
    assert.equal(ui.getByTestId("leaf").contains(dialog), false);
    const close = ui.getByLabelText("إغلاق فهرس الدرس");
    assert.equal(document.activeElement, close);
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    assert.equal(document.activeElement, ui.getByText("التخمر"));
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    assert.equal(document.activeElement, close);
    fireEvent.keyDown(close, { key: "Escape" });
    assert.equal(closed, 1);
    assert.equal(ui.queryByRole("dialog"), null);
    assert.equal(document.activeElement, opener);
    assert.equal(document.body.style.overflow, "");
  } finally {
    cleanup();
  }
});
test("backdrop and close controls remove the drawer without changing the educational page", () => {
  function Host() {
    const [open, setOpen] = React.useState(true);
    return (
      <>
        <article data-testid="page">صفحة محفوظة</article>
        {open && (
          <BookContentsDrawer title="النمو" onClose={() => setOpen(false)}>
            <button>مفهوم النمو</button>
          </BookContentsDrawer>
        )}
      </>
    );
  }
  const ui = render(<Host />);
  try {
    const page = ui.getByTestId("page");
    fireEvent.click(document.querySelector(".book-contents-backdrop")!);
    assert.equal(ui.queryByRole("dialog"), null);
    assert.equal(ui.getByTestId("page"), page);
  } finally {
    cleanup();
  }
});
test("expanded science diagrams escape the book clipping and return without losing scientific state", () => {
  const ui = render(
    <div className="book-sheet">
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
