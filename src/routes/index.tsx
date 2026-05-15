import { createFileRoute } from "@tanstack/react-router";
import { Toolbar } from "@/components/editor/Toolbar";
import { Sidebar } from "@/components/editor/Sidebar";
import { Canvas } from "@/components/editor/Canvas";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { PresentationMode } from "@/components/editor/PresentationMode";
import { PagesBar } from "@/components/editor/PagesBar";
import { Timeline } from "@/components/editor/Timeline";

export const Route = createFileRoute("/")({
  component: Editor,
  head: () => ({
    meta: [
      { title: "Bruto Studio — Neobrutalist Design Editor" },
      {
        name: "description",
        content:
          "A loud, neobrutalist design editor for posters, social posts and graphics. Drag, drop, type, ship.",
      },
    ],
  }),
});

function Editor() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-ink">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="relative flex-1 overflow-hidden bg-paper scanlines">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            }}
          />
          <Canvas />
        </main>
        <PropertiesPanel />
      </div>
      <PagesBar />
      <Timeline />
      <PresentationMode />
    </div>
  );
}
