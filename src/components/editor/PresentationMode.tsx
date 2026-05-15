import { useEffect, useRef, useState } from "react";
import { useEditor } from "@/store/editor";
import { CanvasElement } from "./CanvasElement";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function PresentationMode() {
  const { presenting, setPresenting, pages, currentIndex, setCurrentPage, canvasW, canvasH } =
    useEditor();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const page = pages[currentIndex];

  useEffect(() => {
    if (!presenting) return;
    const fit = () => {
      const el = wrapRef.current;
      if (!el) return;
      const sx = el.clientWidth / canvasW;
      const sy = el.clientHeight / canvasH;
      setScale(Math.min(sx, sy));
    };
    fit();
    const obs = new ResizeObserver(fit);
    if (wrapRef.current) obs.observe(wrapRef.current);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPresenting(false);
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        const { currentIndex: i, pages: ps, setCurrentPage: go } = useEditor.getState();
        if (i < ps.length - 1) go(i + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        const { currentIndex: i, setCurrentPage: go } = useEditor.getState();
        if (i > 0) go(i - 1);
      }
    };
    window.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      obs.disconnect();
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [presenting, canvasW, canvasH, setPresenting]);

  if (!presenting) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink scanlines">
      <div className="relative flex items-center justify-between border-b border-teal/40 bg-ink px-5 py-3">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal to-transparent" />
        <div className="font-display text-sm uppercase tracking-[0.25em] text-teal text-glow">
          ▶ presenting · <span className="font-mono text-xs text-teal/70">{canvasW}×{canvasH}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-teal/80">
            {currentIndex + 1} / {pages.length}
          </span>
          <button
            onClick={() => setPresenting(false)}
            className="brutal-border brutal-press flex items-center gap-2 bg-blue px-3 py-1.5 font-display text-xs uppercase tracking-[0.2em] text-ink"
          >
            <X className="h-4 w-4" strokeWidth={3} /> Exit · Esc
          </button>
        </div>
      </div>
      <div ref={wrapRef} className="relative flex flex-1 items-center justify-center overflow-hidden p-8">
        <button
          onClick={() => setCurrentPage(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="brutal-border absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center bg-surface text-teal disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={3} />
        </button>
        <button
          onClick={() => setCurrentPage(currentIndex + 1)}
          disabled={currentIndex === pages.length - 1}
          className="brutal-border absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center bg-surface text-teal disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={3} />
        </button>
        <div
          style={{ width: canvasW * scale, height: canvasH * scale }}
          className="brutal-shadow-lg relative shrink-0"
        >
          <div
            className="absolute left-0 top-0 overflow-hidden border border-teal"
            style={{
              width: canvasW,
              height: canvasH,
              backgroundColor: page.bgColor,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {page.elements.map((el) => (
              <CanvasElement key={el.id} element={el} scale={scale} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
