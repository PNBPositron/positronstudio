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
  panelDurationMs: number;
  panelStiffness: number; // 0 = soft ease, 100 = springy overshoot
  reduceMotion: boolean; // force-disable panel motion
  setAiEnabled: (v: boolean) => void;
  setAutoHidePanel: (v: boolean) => void;
  setAiModel: (v: string) => void;
  setPanelDurationMs: (v: number) => void;
  setPanelStiffness: (v: number) => void;
  setReduceMotion: (v: boolean) => void;
  resetMotion: () => void;
  togglePanel: (id: PanelId) => void;
  resetPanels: () => void;
};

export const DEFAULT_PANEL_DURATION = 460;
export const DEFAULT_PANEL_STIFFNESS = 45;

/** maps a 0-100 stiffness to a cubic-bezier with increasing overshoot */
export const springEasing = (stiffness: number) => {
  const k = Math.max(0, Math.min(100, stiffness)) / 100;
  return `cubic-bezier(0.16, ${(1 + k * 0.85).toFixed(3)}, ${(0.4 - k * 0.15).toFixed(3)}, 1)`;
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

export const EDITOR_THEMES: Array<{ id: string; label: string; hint: string }> = [
  { id: "cyber", label: "Cyber", hint: "teal neon on ink (default)" },
  { id: "glass", label: "Glass", hint: "soft frosted greys" },
  { id: "neobrutalist", label: "Neobrutalist", hint: "paper white + hot accents" },
  { id: "sketch", label: "Sketch", hint: "pencil on notepaper" },
  { id: "xp", label: "XP", hint: "retro desktop blues" },
  { id: "aqua", label: "Aqua", hint: "glossy ocean" },
  { id: "pastel", label: "Pastel", hint: "light candy tones" },
  { id: "vapor", label: "Vapor", hint: "purple/pink synthwave" },
  { id: "matrix", label: "Matrix", hint: "green terminal" },
  { id: "midnight", label: "Midnight", hint: "deep indigo dark" },
  { id: "swiss", label: "Swiss", hint: "black, white, red" },
];

export const DEFAULT_EDITOR_THEME = "cyber";

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
      panelDurationMs: DEFAULT_PANEL_DURATION,
      panelStiffness: DEFAULT_PANEL_STIFFNESS,
      reduceMotion: false,
      setAiEnabled: (aiEnabled) => set({ aiEnabled }),
      setAutoHidePanel: (autoHidePanel) => set({ autoHidePanel }),
      setAiModel: (aiModel) => set({ aiModel }),
      setPanelDurationMs: (panelDurationMs) => set({ panelDurationMs }),
      setPanelStiffness: (panelStiffness) => set({ panelStiffness }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
      resetMotion: () =>
        set({
          panelDurationMs: DEFAULT_PANEL_DURATION,
          panelStiffness: DEFAULT_PANEL_STIFFNESS,
          reduceMotion: false,
        }),
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