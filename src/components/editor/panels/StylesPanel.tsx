import { useEditor, type AnyElement } from "@/store/editor";

type StyleId = "neobrutal" | "glass" | "neon" | "minimal" | "retro";

const STYLES: { id: StyleId; label: string; blurb: string; swatch: string[] }[] = [
  { id: "neobrutal", label: "Neobrutal", blurb: "Hard edges, thick ink borders", swatch: ["#ffd84a", "#0a0f1f"] },
  { id: "glass", label: "Glass", blurb: "Soft, translucent, rounded", swatch: ["#d8ecff", "#4d7cff"] },
  { id: "neon", label: "Neon", blurb: "Dark base, glowing accents", swatch: ["#0a0f1f", "#7df9ff"] },
  { id: "minimal", label: "Minimal", blurb: "Thin lines, muted, airy", swatch: ["#fafaf2", "#111111"] },
  { id: "retro", label: "Retro", blurb: "Warm pop, chunky shadows", swatch: ["#ff0080", "#ffb347"] },
];

function patchFor(style: StyleId, el: AnyElement): Partial<AnyElement> {
  const P = {
    neobrutal: { fg: "#0a0f1f", accent: "#ffd84a", bg: "#fafaf2", stroke: "#0a0f1f", sw: 6, radius: 0 },
    glass: { fg: "#0a2540", accent: "#d8ecff", bg: "#eef6ff", stroke: "#4d7cff", sw: 2, radius: 32 },
    neon: { fg: "#7df9ff", accent: "#0a0f1f", bg: "#0a0f1f", stroke: "#7df9ff", sw: 3, radius: 12 },
    minimal: { fg: "#111111", accent: "#ffffff", bg: "#fafaf2", stroke: "#111111", sw: 1, radius: 4 },
    retro: { fg: "#2b1a00", accent: "#ffb347", bg: "#fff3e0", stroke: "#ff0080", sw: 5, radius: 20 },
  }[style];

  const shadow =
    style === "neobrutal"
      ? { x: 10, y: 10, blur: 0, color: "#0a0f1f" }
      : style === "retro"
        ? { x: 8, y: 8, blur: 0, color: "#ff0080" }
        : style === "glass"
          ? { x: 0, y: 12, blur: 30, color: "rgba(77,124,255,0.35)" }
          : style === "neon"
            ? { x: 0, y: 0, blur: 24, color: "#7df9ff" }
            : { x: 0, y: 2, blur: 6, color: "rgba(0,0,0,0.12)" };

  const fontFamily =
    style === "neobrutal" ? "Archivo Black" : style === "neon" ? "Orbitron" : style === "retro" ? "Bebas Neue" : "Inter";

  switch (el.type) {
    case "text":
      return { color: P.fg, fontFamily, fontWeight: style === "minimal" || style === "glass" ? 600 : 900 };
    case "shape":
      return {
        fill: P.accent,
        stroke: P.stroke,
        strokeWidth: P.sw,
        cornerRadius: P.radius,
        effect: style === "glass" ? "liquid_glass" : style === "neon" ? "neon" : style === "minimal" ? "none" : "soft_shadow",
        shadow,
        gradient: style === "retro" ? { from: "#ffb347", to: "#ff0080", angle: 135 } : undefined,
      };
    case "icon":
      return { color: P.fg, strokeWidth: style === "minimal" ? 1.5 : style === "neobrutal" ? 3 : 2 };
    case "button":
      return {
        bgColor: P.accent,
        fgColor: P.fg,
        borderColor: P.stroke,
        borderWidth: P.sw,
        cornerRadius: P.radius,
        fontFamily,
        fontWeight: style === "minimal" ? 600 : 900,
        shadow,
      };
    case "quiz":
      return { bgColor: P.bg, fgColor: P.fg, accentColor: P.stroke };
    case "chart":
      return {
        bgColor: P.bg,
        fgColor: P.fg,
        colors:
          style === "neon"
            ? ["#7df9ff", "#b16bff", "#00ff88", "#ff0080"]
            : style === "minimal"
              ? ["#111111", "#666666", "#999999", "#cccccc"]
              : style === "glass"
                ? ["#4d7cff", "#7db8ff", "#a8d3ff", "#d8ecff"]
                : style === "retro"
                  ? ["#ff0080", "#ffb347", "#ffd84a", "#2b1a00"]
                  : ["#ffd84a", "#7df9ff", "#ff0080", "#0a0f1f"],
      };
    case "image":
      return { shadow };
    default:
      return {};
  }
}

export function StylesPanel() {
  const { elements, selectedId, update, setBg } = useEditor();
  const el = elements.find((e) => e.id === selectedId);

  const apply = (style: StyleId, all: boolean) => {
    const targets = all ? elements : el ? [el] : [];
    targets.forEach((t) => update(t.id, patchFor(style, t)));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink">Styles</h3>
        <p className="mt-1 text-[11px] text-ink/60">
          {el ? `Restyle the selected ${el.type}` : "Select a component, or restyle the whole slide"}
        </p>
      </div>

      <div className="space-y-2">
        {STYLES.map((s) => (
          <div key={s.id} className="border border-teal/30 bg-surface/40 p-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 overflow-hidden border border-ink/20">
                {s.swatch.map((c) => (
                  <span key={c} className="h-full w-1/2" style={{ background: c }} />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] font-bold uppercase tracking-[0.15em] text-ink">{s.label}</div>
                <div className="truncate text-[10px] text-ink/55">{s.blurb}</div>
              </div>
            </div>
            <div className="mt-2 flex gap-1">
              <button
                onClick={() => apply(s.id, false)}
                disabled={!el}
                className="flex-1 border border-ink/70 bg-ink px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-paper disabled:opacity-40"
              >
                Selected
              </button>
              <button
                onClick={() => apply(s.id, true)}
                className="flex-1 border border-ink/40 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-ink hover:bg-ink/10"
              >
                Whole slide
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-teal/20" />
      <div>
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/70">Slide background</div>
        <div className="flex gap-1">
          {["#fafaf2", "#eef6ff", "#0a0f1f", "#ffffff", "#fff3e0"].map((c) => (
            <button
              key={c}
              aria-label={`Set background ${c}`}
              onClick={() => setBg(c)}
              className="h-7 flex-1 border border-ink/30"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}