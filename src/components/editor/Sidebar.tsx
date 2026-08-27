import { useEffect, useState } from "react";
import { useEditor } from "@/store/editor";
import { useSettings, springEasing, type PanelId } from "@/store/settings";
import { useUi } from "@/store/ui";
import { LayoutTemplate, Type, SlidersHorizontal, Bot, Blocks, Settings } from "lucide-react";
import { TemplatesPanel } from "./panels/TemplatesPanel";
import { TextPanel } from "./panels/TextPanel";

import { DesignPanel } from "./panels/DesignPanel";
import { AiChatPanel } from "./panels/AiChatPanel";
import { ComponentsPanel } from "./panels/ComponentsPanel";
import { ElementsPanel } from "./panels/ElementsPanel";
import { SettingsDialog } from "./SettingsDialog";

const TOOLS = [
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "ai", label: "AI Edit", icon: Bot },
  { id: "text", label: "Text", icon: Type },
  { id: "presets", label: "Presets", icon: Blocks },
  { id: "elements", label: "Elements", icon: LayoutTemplate },
  { id: "design", label: "Design", icon: SlidersHorizontal },
] as const;

export function Sidebar() {
  const { tool, setTool } = useEditor();
  const setSettingsOpen = useUi((s) => s.setSettingsOpen);
  const { panels, aiEnabled, panelDurationMs, panelStiffness, reduceMotion, editorTheme } = useSettings();
  const [hovering, setHovering] = useState(false);
  const panelOpen = hovering;
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.editorTheme = editorTheme;
  }, [editorTheme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setSystemReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const noMotion = reduceMotion || systemReduced;
  const dur = noMotion ? 0 : panelDurationMs;
  const ease = springEasing(panelStiffness);
  const panelTransition = `transform ${dur}ms ${ease}, opacity ${Math.round(dur * 0.62)}ms ${ease}, filter ${Math.round(dur * 0.7)}ms ease-out`;

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
              className={`group relative flex flex-col items-center gap-0.5 px-1 py-2 text-[9px] font-bold uppercase tracking-[0.1em] transition-all ${
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
    type="button"
    onClick={() => setSettingsOpen(true)}
    title="Settings"
    aria-label="Settings"
    className="mt-auto flex flex-col items-center gap-0.5 border border-teal/20 bg-surface px-1 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-teal/70 hover:border-teal/60 hover:bg-surface-2 hover:text-teal"
  >
    <Settings className="h-4 w-4" strokeWidth={2} />
    SETTINGS
  </button>
  </nav>
  <div
        aria-hidden={!panelOpen}
        style={{ transition: panelTransition }}
        className={`absolute left-20 top-0 z-40 h-full w-72 origin-left overflow-y-auto border-r border-teal/30 bg-paper p-4 shadow-2xl will-change-[transform,opacity,filter] ${
          panelOpen
            ? `translate-x-0 opacity-100 ${noMotion ? "" : "scale-x-100 blur-0"}`
            : `pointer-events-none -translate-x-[106%] opacity-0 ${noMotion ? "" : "scale-x-[0.97] blur-[2px]"}`
        }`}
      >
        {tool === "templates" && <TemplatesPanel />}
        {tool === "ai" && aiEnabled && <AiChatPanel />}
        {tool === "text" && <TextPanel />}
        {tool === "presets" && <ComponentsPanel />}
        {tool === "elements" && <ElementsPanel />}
        {tool === "design" && <DesignPanel />}
      </div>
    </aside>
  );
}
