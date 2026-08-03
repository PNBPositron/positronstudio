import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PanelId =
  | "templates"
  | "ai"
  | "text"
  | "components"
  | "shapes"
  | "uploads"
  | "design";

export const PANEL_LABELS: Record<PanelId, string> = {
  templates: "Templates",
  ai: "AI Edit",
  text: "Text",
  components: "Components",
  shapes: "Shapes",
  uploads: "Uploads",
  design: "Design",
};

type SettingsState = {
  aiEnabled: boolean;
  autoHidePanel: boolean;
  aiModel: string;
  panels: Record<PanelId, boolean>;
  setAiEnabled: (v: boolean) => void;
  setAutoHidePanel: (v: boolean) => void;
  setAiModel: (v: string) => void;
  togglePanel: (id: PanelId) => void;
  resetPanels: () => void;
};

export const AI_MODELS: Array<{ id: string; label: string; hint: string }> = [
  { id: "google/gemini-3.6-flash", label: "Gemini 3.6 Flash", hint: "fast · balanced (default)" },
  { id: "google/gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite", hint: "cheapest · quickest" },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", hint: "deepest reasoning" },
  { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", hint: "strong multimodal" },
  { id: "openai/gpt-5.6-terra", label: "GPT-5.6 Terra", hint: "balanced openai" },
  { id: "openai/gpt-5.6-luna", label: "GPT-5.6 Luna", hint: "fast openai" },
  { id: "openai/gpt-5.5", label: "GPT-5.5", hint: "frontier quality" },
  { id: "openai/gpt-5.4-mini", label: "GPT-5.4 Mini", hint: "cheap openai" },
];

export const DEFAULT_AI_MODEL = AI_MODELS[0].id;

const ALL_ON: Record<PanelId, boolean> = {
  templates: true,
  ai: true,
  text: true,
  components: true,
  shapes: true,
  uploads: true,
  design: true,
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      aiEnabled: true,
      autoHidePanel: false,
      aiModel: DEFAULT_AI_MODEL,
      panels: { ...ALL_ON },
      setAiEnabled: (aiEnabled) => set({ aiEnabled }),
      setAutoHidePanel: (autoHidePanel) => set({ autoHidePanel }),
      setAiModel: (aiModel) => set({ aiModel }),
      togglePanel: (id) =>
        set((s) => {
          const next = { ...s.panels, [id]: !s.panels[id] };
          // never let the user hide every panel
          if (!Object.values(next).some(Boolean)) return s;
          return { panels: next };
        }),
      resetPanels: () => set({ panels: { ...ALL_ON } }),
    }),
    { name: "positron.settings" },
  ),
);