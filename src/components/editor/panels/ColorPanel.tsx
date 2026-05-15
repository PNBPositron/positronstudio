import { useEditor } from "@/store/editor";
import { PanelHeader } from "./TextPanel";

const PALETTES: { name: string; colors: string[] }[] = [
  {
    name: "Cyber Ink",
    colors: ["#0a0f1f", "#101a2e", "#1a2742", "#0f3460", "#16213e", "#1b1b2f"],
  },
  {
    name: "Neon",
    colors: ["#7df9ff", "#00d9ff", "#0ea5e9", "#4d7cff", "#1f3fb8", "#a855f7"],
  },
  {
    name: "Hot",
    colors: ["#ff0080", "#ff4081", "#ff6b35", "#ffd84a", "#fbbf24", "#f97316"],
  },
  {
    name: "Acid",
    colors: ["#39ff14", "#84cc16", "#22c55e", "#10b981", "#06b6d4", "#14b8a6"],
  },
  {
    name: "Pastel",
    colors: ["#fef3c7", "#fce7f3", "#dbeafe", "#dcfce7", "#ede9fe", "#ffe4e6"],
  },
  {
    name: "Mono",
    colors: ["#000000", "#1f1f1f", "#404040", "#737373", "#d4d4d4", "#ffffff"],
  },
];

export function ColorPanel() {
  const { bgColor, setBg } = useEditor();
  return (
    <div className="space-y-4">
      <PanelHeader title="Background" />

      {PALETTES.map((p) => (
        <div key={p.name}>
          <label className="mb-1.5 block font-display text-[10px] uppercase tracking-[0.2em] text-teal/80">
            ▸ {p.name}
          </label>
          <div className="grid grid-cols-6 gap-1.5">
            {p.colors.map((c) => (
              <button
                key={c}
                onClick={() => setBg(c)}
                title={c}
                className={`brutal-border-2 h-9 transition-all ${
                  bgColor === c ? "border-teal scale-110 glow-teal" : "hover:border-teal"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      ))}

      <div>
        <label className="mb-1.5 block font-display text-[10px] uppercase tracking-[0.2em] text-teal/80">
          ▸ Custom
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBg(e.target.value)}
            className="brutal-border-2 h-12 w-16 bg-surface"
          />
          <input
            type="text"
            value={bgColor}
            onChange={(e) => setBg(e.target.value)}
            className="brutal-border-2 h-12 flex-1 bg-surface px-2 font-mono text-xs text-teal focus:border-teal focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
