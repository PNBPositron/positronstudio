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
  panels: Record<PanelId, boolean>;
  setAiEnabled: (v: boolean) => void;
  togglePanel: (id: PanelId) => void;
  resetPanels: () => void;
};

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
      panels: { ...ALL_ON },
      setAiEnabled: (aiEnabled) => set({ aiEnabled }),
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