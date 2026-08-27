import { useEditor, type Page, type SlideTransition } from "@/store/editor";
import { useState } from "react";
import { Plus, Copy, Trash2, Play, X } from "lucide-react";

type WorkspaceSnapshot = { name: string; pages: Page[]; canvasW: number; canvasH: number; currentIndex: number };

export function PagesBar() {
 const { pages, currentIndex, setCurrentPage, addPage, duplicatePage, removePage, canvasW, canvasH, setTransition, setPresenting, loadPages, setCanvasSize, newDesign } =
 useEditor();
 const currentTransition: SlideTransition = pages[currentIndex]?.transition ?? "none";
 const [workspaces, setWorkspaces] = useState<WorkspaceSnapshot[]>([{ name: "Untitled workspace", pages, canvasW, canvasH, currentIndex }]);
 const [activeWorkspace, setActiveWorkspace] = useState(0);

 const snapshot = (): WorkspaceSnapshot => ({ name: workspaces[activeWorkspace]?.name ?? "Untitled workspace", pages: useEditor.getState().pages, canvasW: useEditor.getState().canvasW, canvasH: useEditor.getState().canvasH, currentIndex: useEditor.getState().currentIndex });
 const switchWorkspace = (index: number) => {
   if (index === activeWorkspace) return;
   const next = workspaces[index];
   if (!next) return;
   setWorkspaces((items) => items.map((item, i) => i === activeWorkspace ? snapshot() : item));
   loadPages(next.pages);
   setCanvasSize(next.canvasW, next.canvasH);
   setCurrentPage(Math.min(next.currentIndex, next.pages.length - 1));
   setActiveWorkspace(index);
 };
 const createWorkspace = () => {
   const nextIndex = workspaces.length;
   setWorkspaces((items) => [...items.map((item, i) => i === activeWorkspace ? snapshot() : item), { name: `Workspace ${nextIndex + 1}`, pages: [], canvasW: 1280, canvasH: 720, currentIndex: 0 }]);
   newDesign();
   setActiveWorkspace(nextIndex);
 };
  const ratio = canvasW / canvasH;
  const thumbW = ratio >= 1 ? 96 : 96 * ratio;
  const thumbH = ratio >= 1 ? 96 / ratio : 96;

  return (
    <div className="flex flex-col border-t border-teal/30 bg-ink">
      <div className="flex items-center gap-1 overflow-x-auto border-b border-teal/20 px-3 py-1.5">
        <span className="mr-2 shrink-0 font-display text-[9px] tracking-[0.2em] text-teal/50">WORKSPACES</span>
        {workspaces.map((workspace, index) => (
          <button
            key={`${workspace}-${index}`}
            onClick={() => switchWorkspace(index)}
            className={`group flex shrink-0 items-center gap-2 border px-3 py-1 font-mono text-[10px] transition-colors ${
              index === activeWorkspace ? "border-teal bg-surface text-teal" : "border-transparent text-teal/50 hover:border-teal/40 hover:text-teal"
            }`}
          >
{workspace.name}
            {workspaces.length > 1 && (
              <X
                className="h-3 w-3 opacity-50 hover:opacity-100"
                onClick={(event) => {
                  event.stopPropagation();
setWorkspaces((current) => current.filter((_, item) => item !== index));
 if (index === activeWorkspace) {
   const fallback = index > 0 ? index - 1 : 0;
   const next = workspaces[fallback === index ? 1 : fallback];
   if (next) {
     loadPages(next.pages);
     setCanvasSize(next.canvasW, next.canvasH);
     setCurrentPage(Math.min(next.currentIndex, next.pages.length - 1));
   }
   setActiveWorkspace(fallback);
 } else if (index < activeWorkspace) setActiveWorkspace((current) => current - 1);
                }}
              />
            )}
          </button>
        ))}
        <button
          title="New workspace"
onClick={createWorkspace}
          className="brutal-press flex shrink-0 items-center gap-1 border border-teal/30 px-2 py-1 font-display text-[9px] tracking-[0.12em] text-teal hover:border-teal"
        >
          <Plus className="h-3 w-3" /> NEW
        </button>
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
      <span className="font-display text-[10px] tracking-[0.2em] text-teal/70">PAGES</span>
      <div className="flex flex-1 items-center gap-2 overflow-x-auto py-1">
        {pages.map((p, i) => {
          const active = i === currentIndex;
          return (
            <div key={p.id} className="group relative shrink-0">
              <button
                onClick={() => setCurrentPage(i)}
                className={`brutal-border-2 relative overflow-hidden transition-all ${
                  active ? "border-teal glow-teal" : "border-teal/30 hover:border-teal/70"
                }`}
                style={{ width: thumbW + 6, height: thumbH + 6, background: p.bgColor }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
                    backgroundSize: "12px 12px",
                    opacity: 0.15,
                  }}
                />
                <span className="absolute bottom-0.5 left-1 font-mono text-[9px] text-ink mix-blend-difference">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </button>
              <div className="absolute -right-1 -top-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => duplicatePage(i)}
                  title="Duplicate"
                  className="grid h-5 w-5 place-items-center bg-blue text-ink"
                >
                  <Copy className="h-3 w-3" strokeWidth={3} />
                </button>
                {pages.length > 1 && (
                  <button
                    onClick={() => removePage(i)}
                    title="Delete"
                    className="grid h-5 w-5 place-items-center bg-[#ff0080] text-ink"
                  >
                    <Trash2 className="h-3 w-3" strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        <button
          onClick={addPage}
          className="brutal-border-2 brutal-press flex shrink-0 items-center gap-1 bg-surface px-3 font-display text-[10px] tracking-[0.2em] text-teal hover:bg-surface-2"
          style={{ height: thumbH + 6 }}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={3} /> ADD
        </button>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-mono text-[10px] text-teal/60">TRANS</span>
        <select
          value={currentTransition}
          onChange={(e) => setTransition(e.target.value as SlideTransition)}
          className="border border-teal/40 bg-surface px-1.5 py-1 font-mono text-[10px] text-teal focus:border-teal focus:outline-none"
        >
          <option value="none">none</option>
          <option value="fade">fade</option>
          <option value="slide">slide</option>
          <option value="zoom">zoom</option>
          <option value="flip">flip</option>
          <option value="glitch">glitch</option>
          <option value="morph">morph</option>
        </select>
      </div>
      <span className="font-mono text-[10px] text-teal/60">
        {currentIndex + 1}/{pages.length}
      </span>
      <button
        onClick={() => setPresenting(true)}
        className="brutal-border brutal-press flex shrink-0 items-center gap-2 bg-blue px-4 py-2 font-display text-xs tracking-[0.2em] text-ink"
      >
        <Play className="h-3.5 w-3.5 fill-ink" strokeWidth={3} />
        PRESENT
      </button>
      </div>
    </div>
  );
}
