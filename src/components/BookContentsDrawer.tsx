import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, BookOpen } from "lucide-react";
export function BookContentsDrawer({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const panel = useRef<HTMLElement>(null),
    close = useRef<HTMLButtonElement>(null),
    dismiss = useRef(onClose);
  dismiss.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    close.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss.current();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = Array.from(
        panel.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),a[href],[tabindex="0"]',
        ) ?? [],
      );
      const first = nodes[0],
        last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return createPortal(
    <div
      className="book-contents-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={panel}
        id="concept-index"
        className="book-contents-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-contents-title"
        dir="rtl"
      >
        <header>
          <div>
            <BookOpen size={22} />
            <h2 id="book-contents-title">فهرس {title}</h2>
          </div>
          <button ref={close} aria-label="إغلاق فهرس الدرس" onClick={onClose}>
            <X size={21} />
          </button>
        </header>
        <nav className="book-contents-list" aria-label="فهرس مفاهيم الدرس">
          {children}
        </nav>
        <p className="drawer-note">اختر أي مفهوم؛ موضعك وإجاباتك محفوظة.</p>
      </section>
    </div>,
    document.body,
  );
}
