import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useSound } from "./SoundSystem";
export function BookFrame({
  pageKey,
  contentKey,
  pageNumber,
  title,
  cover,
  reduced,
  resultPage = false,
  onNext,
  onPrevious,
  onIndex,
  children,
}: {
  pageKey: string;
  contentKey?: string;
  pageNumber: number;
  title: string;
  cover: boolean;
  reduced: boolean;
  resultPage?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;
  onIndex: () => void;
  children: ReactNode;
}) {
  const previous = useRef({ key: pageKey, number: pageNumber, cover });
  const [turn, setTurn] = useState("none");
  const sound = useSound();
  const touch = useRef<{ x: number; y: number; id: number } | null>(null);
  useLayoutEffect(() => {
    if (previous.current.key === pageKey) return;
    const opening = previous.current.cover && !cover;
    const direction = opening
      ? "opening"
      : pageNumber >= previous.current.number
        ? "forward"
        : "backward";
    previous.current = { key: pageKey, number: pageNumber, cover };
    setTurn(direction);
    sound.play(
      opening ? "book-open" : resultPage ? "diagnostic-result" : "page-turn",
    );
  }, [pageKey, pageNumber, cover, resultPage]);
  const edge = (side: "left" | "right") => (
    <div
      className={`book-turn-edge ${side}`}
      aria-hidden="true"
      onPointerDown={(e) => {
        touch.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        e.currentTarget.setPointerCapture?.(e.pointerId);
      }}
      onPointerCancel={() => {
        touch.current = null;
      }}
      onPointerUp={(e) => {
        const start = touch.current;
        touch.current = null;
        if (!start || start.id !== e.pointerId) return;
        const delta = e.clientX - start.x;
        if (Math.abs(delta) <= Math.abs(e.clientY - start.y)) return;
        if (delta > 55) onNext?.();
        else if (delta < -55) onPrevious?.();
      }}
    />
  );
  return (
    <div
      className={`single-book ${cover ? "is-cover" : ""}`}
      data-reduced={reduced}
    >
      {!cover && (
        <div className="book-toolbar">
          <div className="book-toolbar-navigation">
            <button className="text-button" onClick={onIndex}>
              الفهرس
            </button>
            {onPrevious && (
              <button
                aria-label="الصفحة السابقة في الكتاب"
                onClick={onPrevious}
              >
                <ArrowRight size={18} />
              </button>
            )}
            {onNext && (
              <button aria-label="الصفحة التالية في الكتاب" onClick={onNext}>
                <ArrowLeft size={18} />
              </button>
            )}
          </div>
          <span>{title}</span>
          <span
            className="book-page-number"
            aria-label={`صفحة الكتاب ${pageNumber}`}
          >
            صفحة {pageNumber}
          </span>
        </div>
      )}
      <div
        className={`book-sheet turn-${turn}`}
        key={contentKey ?? pageKey}
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) setTurn("none");
        }}
        data-testid="single-book-page"
      >
        {!cover && edge("left")}
        <div className="book-page-content">{children}</div>
        {!cover && edge("right")}
      </div>
    </div>
  );
}
