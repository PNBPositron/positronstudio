import { useEditor } from "@/store/editor";
import { LayoutTemplate, Type, Shapes, Upload, Palette, Maximize2, Sparkles, Box } from "lucide-react";
import { TemplatesPanel } from "./panels/TemplatesPanel";
import { TextPanel } from "./panels/TextPanel";
import { ShapesPanel } from "./panels/ShapesPanel";
import { UploadsPanel } from "./panels/UploadsPanel";
import { ColorPanel } from "./panels/ColorPanel";
import { SizePanel } from "./panels/SizePanel";
import { IconsPanel } from "./panels/IconsPanel";
import { ThreeDPanel } from "./panels/ThreeDPanel";

const TOOLS = [
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "text", label: "Text", icon: Type },
  { id: "shapes", label: "Shapes", icon: Shapes },
  { id: "icons", label: "Icons", icon: Sparkles },
  { id: "3d", label: "3D", icon: Box },
  { id: "uploads", label: "Uploads", icon: Upload },
  { id: "color", label: "Color", icon: Palette },
  { id: "size", label: "Size", icon: Maximize2 },
] as const;

export function Sidebar() {
  const { tool, setTool } = useEditor();
  return (
    <aside className="flex h-full">
      <nav className="flex w-20 flex-col gap-2 border-r border-teal/30 bg-ink p-2">
        {TOOLS.map((t) => {
          const Icon = t.icon;
          const active = tool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              className={`group relative flex flex-col items-center gap-1 px-1 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                active
                  ? "bg-blue-deep text-teal border border-teal glow-blue"
                  : "border border-teal/20 bg-surface text-teal/70 hover:text-teal hover:border-teal/60 hover:bg-surface-2"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 h-full w-[3px] bg-teal glow-teal" />
              )}
              <Icon className="h-5 w-5" strokeWidth={2} />
              {t.label}
            </button>
          );
        })}
      </nav>
      <div className="w-72 overflow-y-auto border-r border-teal/30 bg-paper p-4">
        {tool === "templates" && <TemplatesPanel />}
        {tool === "text" && <TextPanel />}
        {tool === "shapes" && <ShapesPanel />}
        {tool === "icons" && <IconsPanel />}
        {tool === "3d" && <ThreeDPanel />}
        {tool === "uploads" && <UploadsPanel />}
        {tool === "color" && <ColorPanel />}
        {tool === "size" && <SizePanel />}
      </div>
    </aside>
  );
}
