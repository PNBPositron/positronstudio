import { useEffect, useState } from "react";
import { useEditor } from "@/store/editor";
import { useSettings, type PanelId } from "@/store/settings";
import { LayoutTemplate, Type, Shapes, Upload, SlidersHorizontal, Bot, Blocks, Settings } from "lucide-react";
import { TemplatesPanel } from "./panels/TemplatesPanel";
import { TextPanel } from "./panels/TextPanel";
import { ShapesPanel } from "./panels/ShapesPanel";
import { UploadsPanel } from "./panels/UploadsPanel";
import { DesignPanel } from "./panels/DesignPanel";
import { AiChatPanel } from "./panels/AiChatPanel";
import { ComponentsPanel } from "./panels/ComponentsPanel";
import { SettingsDialog } from "./SettingsDialog";

const TOOLS = [
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "ai", label: "AI Edit", icon: Bot },
  { id: "text", label: "Text", icon: Type },
  { id: "components", label: "Components", icon: Blocks },
  { id: "shapes", label: "Shapes", icon: Shapes },
  { id: "uploads", label: "Uploads", icon: Upload },
  { id: "design", label: "Design", icon: SlidersHorizontal },
] as const;

export function Sidebar() {
  const { tool, setTool } = useEditor();
  const { panels, aiEnabled } = useSettings();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const panelOpen = hovering;

  const visible = TOOLS.filter(
    (t) => panels[t.id as PanelId] !== false && !(t.id === "ai" && !aiEnabled),
  );

  const visibleKey = visible.map((t) => t.id).join(",");
  useEffect(() => {
    const ids = visibleKey.split(",").filter(Boolean);
    if (ids.length && !ids.includes(tool)) {
      setTool(ids[0] as typeof tool);
    }
  }, [visibleKey, tool, setTool]);

  return (
    <aside
      className="relative flex h-full"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <nav className="flex w-20 flex-col gap-2 border-r border-teal/30 bg-ink p-2">
        {visible.map((t) => {
          const Icon = t.icon;
          const active = tool === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setTool(t.id);
                setHovering(true);
              }}
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
        <button
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          aria-label="Settings"
          className="mt-auto flex flex-col items-center gap-1 border border-teal/20 bg-surface px-1 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-teal/70 transition-colors duration-200 hover:border-teal/60 hover:bg-surface-2 hover:text-teal"
        >
          <Settings className="h-5 w-5" strokeWidth={2} />
          Settings
        </button>
      </nav>
      <div
        aria-hidden={!panelOpen}
        className={`absolute left-20 top-0 z-40 h-full w-72 origin-left overflow-y-auto border-r border-teal/30 bg-paper p-4 shadow-2xl will-change-[transform,opacity,filter] [transition:transform_460ms_cubic-bezier(0.16,1,0.3,1),opacity_280ms_cubic-bezier(0.16,1,0.3,1),filter_320ms_ease-out] motion-reduce:transition-none ${
          panelOpen
            ? "translate-x-0 scale-x-100 opacity-100 blur-0"
            : "pointer-events-none -translate-x-[106%] scale-x-[0.97] opacity-0 blur-[2px]"
        }`}
      >
        {tool === "templates" && <TemplatesPanel />}
        {tool === "ai" && aiEnabled && <AiChatPanel />}
        {tool === "text" && <TextPanel />}
        {tool === "components" && <ComponentsPanel />}
        {tool === "shapes" && <ShapesPanel />}
        {tool === "uploads" && <UploadsPanel />}
        {tool === "design" && <DesignPanel />}
      </div>
      {settingsOpen && <SettingsDialog onClose={() => setSettingsOpen(false)} />}
    </aside>
  );
}
