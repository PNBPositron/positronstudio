import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import { useEditor, newModel3D, type AnyElement } from "@/store/editor";
import { PanelHeader } from "./TextPanel";
import { Model3DRender } from "../Model3DRender";
import { generate3DScene } from "@/lib/ai-templates.functions";

const SPHERE_PRESETS: Array<{ label: string; color: string }> = [
  { label: "Plasma", color: "#ff0080" },
  { label: "Cyan", color: "#7df9ff" },
  { label: "Cobalt", color: "#4d7cff" },
  { label: "Acid", color: "#ccff00" },
  { label: "Sun", color: "#ffd84a" },
  { label: "Violet", color: "#b16bff" },
];

export function ThreeDPanel() {
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
      <PanelHeader title="3D Spheres" />

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
        <p className="font-mono text-[10px] text-teal/50">&gt; replaces canvas with floating spheres</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SPHERE_PRESETS.map((s) => (
          <button
            key={s.label}
            onClick={() => add(newModel3D("sphere", { color: s.color, spinSpeed: 0 }))}
            className="brutal-border-2 brutal-press group flex h-32 flex-col items-center justify-center gap-2 bg-surface p-2 text-teal hover:border-teal hover:bg-surface-2"
          >
            <div className="h-16 w-16">
              <Model3DRender
                element={{
                  id: `prev-${s.label}`,
                  type: "model3d",
                  x: 0, y: 0, width: 64, height: 64, rotation: 0,
                  shape: "sphere",
                  color: s.color,
                  spinSpeed: 0,
                  tiltX: -20,
                  tiltY: 25,
                }}
              />
            </div>
            <span className="font-display text-[10px] uppercase tracking-[0.2em]">{s.label}</span>
          </button>
        ))}
      </div>
      <div className="font-mono text-[10px] text-teal/50">
        &gt; tweak color & spin in the right panel.
      </div>
    </div>
  );
}
