import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import { useEditor, newShape, newModel3D, type ShapeKind, type AnyElement } from "@/store/editor";
import { PanelHeader } from "./TextPanel";
import { Model3DRender } from "../Model3DRender";
import { shapePathD } from "../ShapeRender";
import { generate3DScene } from "@/lib/ai-templates.functions";

const SHAPES: { kind: ShapeKind; label: string }[] = [
  { kind: "rect", label: "Rectangle" },
  { kind: "circle", label: "Circle" },
  { kind: "triangle", label: "Triangle" },
  { kind: "star", label: "Star" },
  { kind: "arrow", label: "Arrow" },
  { kind: "heart", label: "Heart" },
  { kind: "diamond", label: "Diamond" },
  { kind: "hexagon", label: "Hexagon" },
  { kind: "pentagon", label: "Pentagon" },
  { kind: "parallelogram", label: "Parallelogram" },
  { kind: "trapezoid", label: "Trapezoid" },
  { kind: "cross", label: "Cross" },
  { kind: "lightning", label: "Lightning" },
  { kind: "cloud", label: "Cloud" },
  { kind: "speech", label: "Speech" },
];

const FILLS = ["#7df9ff", "#ff0080"];

const SPHERE_PRESETS: Array<{ label: string; color: string }> = [
  { label: "Plasma", color: "#ff0080" },
  { label: "Cyan", color: "#7df9ff" },
  { label: "Cobalt", color: "#4d7cff" },
  { label: "Acid", color: "#ccff00" },
  { label: "Sun", color: "#ffd84a" },
  { label: "Violet", color: "#b16bff" },
];

export function ShapesPanel() {
  const { add, loadTemplate, canvasW, canvasH } = useEditor();
  const generate = useServerFn(generate3DScene);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generate({ data: { prompt, width: canvasW, height: canvasH } });
      const els: AnyElement[] = res.models.map((m) =>
        newModel3D("sphere", {
          x: m.x, y: m.y, width: m.width, height: m.height,
          color: m.color,
          spinSpeed: m.spinSpeed ?? 8,
          tiltX: m.tiltX ?? -20,
          tiltY: m.tiltY ?? 25,
        }),
      );
      loadTemplate(els, res.bg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PanelHeader title="Shapes" />

      <div className="font-display text-[10px] uppercase tracking-[0.2em] text-teal/80">▸ Shapes</div>
      <div className="grid grid-cols-3 gap-2">
        {SHAPES.flatMap((s) =>
          FILLS.map((fill) => (
            <button
              key={s.kind + fill}
              onClick={() =>
                add(
                  newShape(s.kind, {
                    fill,
                    stroke: fill === "#0a0f1f" ? "#7df9ff" : "#0a0f1f",
                  }),
                )
              }
              className="brutal-border-2 brutal-press grid h-20 place-items-center bg-surface hover:border-teal"
              title={s.label}
            >
              <ShapePreview kind={s.kind} fill={fill} />
            </button>
          )),
        )}
      </div>

      <div className="font-display text-[10px] uppercase tracking-[0.2em] text-teal/80">
        ▸ 3D Spheres
      </div>

      <div className="brutal-border-2 space-y-2 bg-surface p-3">
        <div className="flex items-center gap-2 font-display text-[11px] tracking-[0.2em] text-teal">
          <Sparkles className="h-3.5 w-3.5" /> AI_SPHERE_SCENE
        </div>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="theme · e.g. floating planets at sunset"
          className="w-full border border-teal/40 bg-ink px-2 py-1.5 font-mono text-[11px] text-teal placeholder:text-teal/30 focus:border-teal focus:outline-none"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="brutal-border brutal-press flex w-full items-center justify-center gap-2 bg-blue px-3 py-1.5 font-display text-[11px] tracking-[0.2em] text-ink disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? "GENERATING..." : "GENERATE SCENE"}
        </button>
        {error && <p className="font-mono text-[10px] text-[#ff0080]">! {error}</p>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {SPHERE_PRESETS.map((s) => (
          <button
            key={s.label}
            onClick={() => add(newModel3D("sphere", { color: s.color, spinSpeed: 0 }))}
            className="brutal-border-2 brutal-press group flex h-24 flex-col items-center justify-center gap-1 bg-surface p-1 text-teal hover:border-teal hover:bg-surface-2"
          >
            <div className="h-12 w-12">
              <Model3DRender
                element={{
                  id: `prev-${s.label}`,
                  type: "model3d",
                  x: 0, y: 0, width: 48, height: 48, rotation: 0,
                  shape: "sphere",
                  color: s.color,
                  spinSpeed: 0,
                  tiltX: -20,
                  tiltY: 25,
                }}
              />
            </div>
            <span className="font-display text-[9px] uppercase tracking-[0.15em]">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ShapePreview({ kind, fill }: { kind: ShapeKind; fill: string }) {
  const stroke = fill === "#0a0f1f" ? "#7df9ff" : "#0a0f1f";
  const sw = 3;
  if (kind === "rect")
    return (
      <svg width="44" height="44" viewBox="0 0 44 44">
        <rect x="3" y="3" width="38" height="38" fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
    );
  if (kind === "circle")
    return (
      <svg width="44" height="44" viewBox="0 0 44 44">
        <circle cx="22" cy="22" r="19" fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
    );
  if (kind === "triangle")
    return (
      <svg width="44" height="44" viewBox="0 0 44 44">
        <polygon points="22,4 40,40 4,40" fill={fill} stroke={stroke} strokeWidth={sw} />
      </svg>
    );
  if (kind === "star")
    return (
      <svg width="44" height="44" viewBox="0 0 44 44">
        <polygon
          points="22,4 27,17 41,17 30,26 34,40 22,32 10,40 14,26 3,17 17,17"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
    );
  if (kind === "arrow")
    return (
      <svg width="44" height="44" viewBox="0 0 44 44">
        <polygon
          points="3,17 28,17 28,8 41,22 28,36 28,27 3,27"
          fill={fill}
          stroke={stroke}
          strokeWidth={sw}
        />
      </svg>
    );
  const d = shapePathD(kind);
  if (!d) return null;
  return (
    <svg width="44" height="44" viewBox="0 0 100 100">
      <path d={d} fill={fill} stroke={stroke} strokeWidth={sw} />
    </svg>
  );
}
