import { useEffect, useRef, useState } from "react";
import { useEditor } from "@/store/editor";
import { CanvasElement } from "./CanvasElement";

export function Canvas() {
  const { elements, bgColor, select, selectedId, remove, canvasW, canvasH } = useEditor();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const fit = () => {
      const el = wrapRef.current;
      if (!el) return;
      const padding = 80;
      const sx = (el.clientWidth - padding) / canvasW;
      const sy = (el.clientHeight - padding) / canvasH;
      setScale(Math.min(sx, sy, 1));
    };
    fit();
    const obs = new ResizeObserver(fit);
    if (wrapRef.current) obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, [canvasW, canvasH]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        remove(selectedId);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) useEditor.getState().redo();
        else useEditor.getState().undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, remove]);

  return (
    <div
      ref={wrapRef}
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) select(null);
      }}
    >
      <div
        className="brutal-shadow-lg relative shrink-0"
        style={{ width: canvasW * scale, height: canvasH * scale }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) select(null);
        }}
      >
        <div
          id="canvas-export"
          className="absolute left-0 top-0 overflow-hidden border-[3px] border-ink"
          style={{
            width: canvasW,
            height: canvasH,
            backgroundColor: bgColor,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {elements.map((el) => (
            <CanvasElement key={el.id} element={el} scale={scale} />
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 brutal-border-2 bg-ink px-3 py-1.5 font-mono text-[10px] tracking-wider text-teal glow-teal">
        ◆ {Math.round(scale * 100)}% · {canvasW}×{canvasH}
      </div>
    </div>
  );
}
