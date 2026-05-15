import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, ImagePlus, X } from "lucide-react";
import {
  useEditor,
  newText,
  newShape,
  newIcon,
  newModel3D,
  type AnyElement,
  type ShapeElement,
} from "@/store/editor";
import { PanelHeader } from "./TextPanel";
import { generateAiTemplate, type AiElementInput, type AiStyle } from "@/lib/ai-templates.functions";

function buildFromAi(els: AiElementInput[]): AnyElement[] {
  return els
    .map((e): AnyElement | null => {
      if (e.type === "text") {
        return newText({
          text: e.text,
          x: e.x, y: e.y, width: e.width, height: e.height,
          fontSize: e.fontSize, color: e.color,
          fontFamily: e.fontFamily ?? "Archivo Black",
          fontWeight: e.fontWeight ?? 700,
          align: e.align ?? "left",
          italic: e.italic, underline: e.underline, bullet: e.bullet, href: e.href,
        });
      }
      if (e.type === "shape") {
        return newShape(e.shape, {
          x: e.x, y: e.y, width: e.width, height: e.height,
          fill: e.fill, stroke: e.stroke, strokeWidth: e.strokeWidth,
          effect: e.effect, shadow: e.shadow,
        });
      }
      if (e.type === "icon") {
        return newIcon(e.name, {
          x: e.x, y: e.y, width: e.width, height: e.height,
          color: e.color, strokeWidth: e.strokeWidth ?? 2,
        });
      }
      if (e.type === "model3d") {
        return newModel3D("sphere", {
          x: e.x, y: e.y, width: e.width, height: e.height,
          color: e.color,
          spinSpeed: e.spinSpeed ?? 8,
          tiltX: e.tiltX ?? -20,
          tiltY: e.tiltY ?? 25,
        });
      }
      return null;
    })
    .filter((e): e is AnyElement => e !== null);
}

// ---- canvas-aware templates ----
// Each builder receives canvas (W,H) and returns elements sized to fill it.

type TemplateDef = {
  name: string;
  bg: (W: number, H: number) => string;
  preview: (W: number, H: number) => React.ReactNode;
  build: (W: number, H: number) => AnyElement[];
};

const min = (W: number, H: number) => Math.min(W, H);

const TEMPLATES: TemplateDef[] = [
  {
    name: "Big Word",
    bg: () => "#0a0f1f",
    preview: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0a0f1f] p-2">
        <span className="font-display text-2xl text-[#7df9ff]">BOLD</span>
      </div>
    ),
    build: (W, H) => [
      newText({
        text: "BOLD",
        x: W * 0.05, y: H * 0.3, width: W * 0.9, height: H * 0.4,
        fontSize: min(W, H) * 0.42,
        color: "#7df9ff", align: "center", fontFamily: "Orbitron",
      }),
      newText({
        text: "// SHIP IT",
        x: W * 0.05, y: H * 0.78, width: W * 0.9, height: H * 0.08,
        fontSize: min(W, H) * 0.045,
        color: "#4d7cff", align: "center", fontFamily: "JetBrains Mono", fontWeight: 700,
      }),
    ],
  },
  {
    name: "Glass Hero",
    bg: () => "#1a0033",
    preview: () => (
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-[#1a0033] via-[#4d2a8e] to-[#7df9ff]">
        <div className="absolute inset-2 rounded-md border border-white/40 bg-white/20 backdrop-blur-sm" />
      </div>
    ),
    build: (W, H) => [
      newShape("circle", {
        x: -W * 0.15, y: -H * 0.2, width: W * 0.6, height: W * 0.6,
        fill: "#ff0080", stroke: "#ff0080", strokeWidth: 0,
      }),
      newShape("circle", {
        x: W * 0.55, y: H * 0.5, width: W * 0.55, height: W * 0.55,
        fill: "#7df9ff", stroke: "#7df9ff", strokeWidth: 0,
      }),
      newShape("rect", {
        x: W * 0.08, y: H * 0.15, width: W * 0.84, height: H * 0.7,
        fill: "#ffffff", stroke: "#ffffff", strokeWidth: 0,
        effect: "liquid_glass",
      }) as ShapeElement,
      newText({
        text: "FUTURE\nIS LIQUID",
        x: W * 0.12, y: H * 0.28, width: W * 0.76, height: H * 0.45,
        fontSize: min(W, H) * 0.16,
        color: "#ffffff", align: "center", fontFamily: "Archivo Black",
      }),
    ],
  },
  {
    name: "Sphere Drop",
    bg: () => "#101a2e",
    preview: () => (
      <div className="relative h-full w-full bg-[#101a2e]">
        <div
          className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(circle at 30% 25%, #ff80c0, #ff0080 60%, #4a0033)" }}
        />
      </div>
    ),
    build: (W, H) => {
      const s = min(W, H) * 0.55;
      return [
        newModel3D("sphere", {
          x: (W - s) / 2, y: (H - s) / 2, width: s, height: s,
          color: "#ff0080", spinSpeed: 12, tiltX: -20, tiltY: 25,
        }),
        newText({
          text: "ORBIT",
          x: 0, y: H * 0.06, width: W, height: H * 0.1,
          fontSize: min(W, H) * 0.065,
          color: "#7df9ff", align: "center", fontFamily: "JetBrains Mono", fontWeight: 700,
        }),
        newText({
          text: "// 2026",
          x: 0, y: H * 0.86, width: W, height: H * 0.06,
          fontSize: min(W, H) * 0.04,
          color: "#4d7cff", align: "center", fontFamily: "JetBrains Mono", fontWeight: 700,
        }),
      ];
    },
  },
  {
    name: "Quote Slab",
    bg: () => "#fafaf2",
    preview: () => (
      <div className="flex h-full w-full flex-col justify-center bg-[#fafaf2] p-2">
        <span className="font-display text-3xl leading-none text-[#0a0f1f]">"</span>
        <span className="text-[7px] text-[#0a0f1f]">— hero</span>
      </div>
    ),
    build: (W, H) => [
      newText({
        text: "\u201C",
        x: W * 0.06, y: -H * 0.05, width: W * 0.4, height: H * 0.5,
        fontSize: min(W, H) * 0.6,
        color: "#ff0080", fontFamily: "Archivo Black",
      }),
      newText({
        text: "Stay weird,\nstay loud,\nstay shipping.",
        x: W * 0.08, y: H * 0.32, width: W * 0.84, height: H * 0.5,
        fontSize: min(W, H) * 0.1,
        color: "#0a0f1f", fontFamily: "Archivo Black",
      }),
      newShape("rect", {
        x: W * 0.08, y: H * 0.86, width: W * 0.06, height: H * 0.008,
        fill: "#ff0080", stroke: "#ff0080", strokeWidth: 0,
      }),
      newText({
        text: "— UNKNOWN",
        x: W * 0.16, y: H * 0.84, width: W * 0.6, height: H * 0.05,
        fontSize: min(W, H) * 0.032,
        color: "#0a0f1f", fontFamily: "JetBrains Mono", fontWeight: 700,
      }),
    ],
  },
  {
    name: "Glass Stat",
    bg: () => "#0a0f1f",
    preview: () => (
      <div className="relative h-full w-full bg-gradient-to-br from-[#0a0f1f] via-[#1f3fb8] to-[#7df9ff]">
        <div className="absolute inset-3 rounded border border-white/40 bg-white/20" />
      </div>
    ),
    build: (W, H) => [
      newShape("circle", {
        x: W * 0.5, y: -H * 0.2, width: W * 0.7, height: W * 0.7,
        fill: "#7df9ff", stroke: "#7df9ff", strokeWidth: 0,
      }),
      newShape("circle", {
        x: -W * 0.2, y: H * 0.55, width: W * 0.65, height: W * 0.65,
        fill: "#4d7cff", stroke: "#4d7cff", strokeWidth: 0,
      }),
      newShape("rect", {
        x: W * 0.1, y: H * 0.25, width: W * 0.8, height: H * 0.5,
        fill: "#ffffff", stroke: "#ffffff", strokeWidth: 0,
        effect: "liquid_glass",
      }) as ShapeElement,
      newText({
        text: "+128%",
        x: W * 0.1, y: H * 0.32, width: W * 0.8, height: H * 0.25,
        fontSize: min(W, H) * 0.18,
        color: "#ffffff", align: "center", fontFamily: "Archivo Black",
      }),
      newText({
        text: "REVENUE / Q3",
        x: W * 0.1, y: H * 0.6, width: W * 0.8, height: H * 0.08,
        fontSize: min(W, H) * 0.05,
        color: "#ffffff", align: "center", fontFamily: "JetBrains Mono", fontWeight: 700,
      }),
    ],
  },
  {
    name: "Neon Sale",
    bg: () => "#0a0f1f",
    preview: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#0a0f1f]">
        <span className="font-display text-2xl text-[#ff0080]" style={{ textShadow: "0 0 8px #ff0080" }}>50%</span>
      </div>
    ),
    build: (W, H) => [
      newShape("circle", {
        x: W * 0.18, y: H * 0.18, width: W * 0.64, height: H * 0.64,
        fill: "#ff0080", stroke: "#ff0080", strokeWidth: 0,
        effect: "neon",
      }) as ShapeElement,
      newText({
        text: "50%",
        x: 0, y: H * 0.32, width: W, height: H * 0.4,
        fontSize: min(W, H) * 0.34,
        color: "#ffffff", align: "center", fontFamily: "Archivo Black",
      }),
      newText({
        text: "TODAY ONLY",
        x: 0, y: H * 0.84, width: W, height: H * 0.06,
        fontSize: min(W, H) * 0.045,
        color: "#7df9ff", align: "center", fontFamily: "JetBrains Mono", fontWeight: 700,
      }),
    ],
  },
  {
    name: "Editorial",
    bg: () => "#f8f4ec",
    preview: () => (
      <div className="flex h-full w-full flex-col justify-between bg-[#f8f4ec] p-2 text-[#1a1a1a]">
        <span className="text-[7px] font-mono">N°01</span>
        <span className="font-serif text-lg leading-none italic">paper</span>
        <span className="text-[7px] font-mono">2026</span>
      </div>
    ),
    build: (W, H) => [
      newText({
        text: "N° 01 / 2026",
        x: W * 0.06, y: H * 0.06, width: W * 0.88, height: H * 0.05,
        fontSize: min(W, H) * 0.028,
        color: "#1a1a1a", fontFamily: "JetBrains Mono", fontWeight: 700,
      }),
      newShape("rect", {
        x: W * 0.06, y: H * 0.12, width: W * 0.88, height: H * 0.003,
        fill: "#c9a84c", stroke: "#c9a84c", strokeWidth: 0,
      }),
      newText({
        text: "the\nslow\npaper",
        x: W * 0.06, y: H * 0.2, width: W * 0.88, height: H * 0.6,
        fontSize: min(W, H) * 0.2,
        color: "#1a1a1a", italic: true, fontFamily: "Georgia",
      }),
      newText({
        text: "an editorial on craft",
        x: W * 0.06, y: H * 0.86, width: W * 0.88, height: H * 0.05,
        fontSize: min(W, H) * 0.028,
        color: "#c9a84c", fontFamily: "JetBrains Mono", fontWeight: 700,
      }),
    ],
  },
  {
    name: "Ticket",
    bg: () => "#ff0080",
    preview: () => (
      <div className="flex h-full w-full flex-col justify-between bg-[#ff0080] p-2 text-[#fafaf2]">
        <span className="font-display text-[8px]">LIVE</span>
        <span className="font-display text-xl leading-none">SHOW</span>
        <span className="text-[7px]">26.05</span>
      </div>
    ),
    build: (W, H) => [
      newShape("rect", {
        x: W * 0.08, y: H * 0.08, width: W * 0.84, height: H * 0.06,
        fill: "#0a0f1f", stroke: "#0a0f1f", strokeWidth: 0,
      }),
      newText({
        text: "LIVE / IN PERSON",
        x: W * 0.1, y: H * 0.085, width: W * 0.8, height: H * 0.05,
        fontSize: min(W, H) * 0.032,
        color: "#ffd84a", fontFamily: "JetBrains Mono", fontWeight: 700,
      }),
      newText({
        text: "SHOW\n/UP",
        x: W * 0.06, y: H * 0.22, width: W * 0.88, height: H * 0.55,
        fontSize: min(W, H) * 0.26,
        color: "#fafaf2", fontFamily: "Archivo Black",
      }),
      newShape("circle", {
        x: W * 0.62, y: H * 0.7, width: min(W, H) * 0.22, height: min(W, H) * 0.22,
        fill: "#ffd84a", stroke: "#0a0f1f", strokeWidth: min(W, H) * 0.008,
      }),
      newText({
        text: "26\n05",
        x: W * 0.62, y: H * 0.72, width: min(W, H) * 0.22, height: min(W, H) * 0.18,
        fontSize: min(W, H) * 0.075,
        color: "#0a0f1f", align: "center", fontFamily: "Archivo Black",
      }),
    ],
  },
  {
    name: "Twin Orbs",
    bg: () => "#0a0f1f",
    preview: () => (
      <div className="relative h-full w-full bg-[#0a0f1f]">
        <div
          className="absolute left-2 top-3 h-5 w-5 rounded-full"
          style={{ background: "radial-gradient(circle at 30% 25%, #80c8ff, #4d7cff 60%, #001a4a)" }}
        />
        <div
          className="absolute bottom-2 right-2 h-7 w-7 rounded-full"
          style={{ background: "radial-gradient(circle at 30% 25%, #ffb0e0, #ff0080 60%, #4a0033)" }}
        />
      </div>
    ),
    build: (W, H) => {
      const sA = min(W, H) * 0.32;
      const sB = min(W, H) * 0.46;
      return [
        newModel3D("sphere", {
          x: W * 0.06, y: H * 0.1, width: sA, height: sA,
          color: "#4d7cff", spinSpeed: 10,
        }),
        newModel3D("sphere", {
          x: W - sB - W * 0.06, y: H - sB - H * 0.08, width: sB, height: sB,
          color: "#ff0080", spinSpeed: 16,
        }),
        newText({
          text: "DUAL\nFORCE",
          x: W * 0.05, y: H * 0.42, width: W * 0.9, height: H * 0.3,
          fontSize: min(W, H) * 0.16,
          color: "#7df9ff", align: "center", fontFamily: "Orbitron",
        }),
      ];
    },
  },
  {
    name: "Soft Card",
    bg: () => "#f5f0e8",
    preview: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#f5f0e8]">
        <div className="h-3/4 w-3/4 rounded-md bg-white shadow-[0_8px_16px_rgba(0,0,0,0.15)]" />
      </div>
    ),
    build: (W, H) => [
      newShape("rect", {
        x: W * 0.1, y: H * 0.12, width: W * 0.8, height: H * 0.76,
        fill: "#ffffff", stroke: "#ffffff", strokeWidth: 0,
        effect: "soft_shadow",
      }) as ShapeElement,
      newText({
        text: "calm",
        x: W * 0.1, y: H * 0.32, width: W * 0.8, height: H * 0.25,
        fontSize: min(W, H) * 0.22,
        color: "#4a6741", italic: true, align: "center", fontFamily: "Georgia",
      }),
      newText({
        text: "a quiet morning · 06:00",
        x: W * 0.1, y: H * 0.62, width: W * 0.8, height: H * 0.06,
        fontSize: min(W, H) * 0.035,
        color: "#87a878", align: "center", fontFamily: "JetBrains Mono", fontWeight: 700,
      }),
    ],
  },
];

const STYLE_OPTIONS: { id: AiStyle; label: string }[] = [
  { id: "cyberpunk", label: "Cyberpunk" },
  { id: "liquid_glass", label: "Liquid Glass" },
  { id: "minimal", label: "Minimal" },
  { id: "editorial", label: "Editorial" },
  { id: "brutalist", label: "Brutalist" },
  { id: "retro_80s", label: "Retro 80s" },
  { id: "organic", label: "Organic" },
  { id: "art_deco", label: "Art Deco" },
  { id: "memphis", label: "Memphis" },
  { id: "y2k", label: "Y2K" },
];

export function TemplatesPanel() {
  const { loadTemplate, canvasW, canvasH } = useEditor();
  const generate = useServerFn(generateAiTemplate);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<AiStyle>("cyberpunk");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickImage = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("Image too large (max 5MB)");
      return;
    }
    const r = new FileReader();
    r.onload = () => setImageDataUrl(r.result as string);
    r.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if ((!prompt.trim() && !imageDataUrl) || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generate({
        data: {
          prompt: prompt.trim() || "Use the attached image as the brief",
          width: canvasW,
          height: canvasH,
          style,
          imageDataUrl: imageDataUrl ?? undefined,
        },
      });
      loadTemplate(buildFromAi(res.elements), res.bg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PanelHeader title="Templates" />

      <div className="brutal-border-2 space-y-2 bg-surface p-3">
        <div className="flex items-center gap-2 font-display text-[11px] tracking-[0.2em] text-teal">
          <Sparkles className="h-3.5 w-3.5" /> AI_GENERATOR
        </div>

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as AiStyle)}
          className="w-full border border-teal/40 bg-ink px-2 py-1.5 font-mono text-[11px] text-teal focus:border-teal focus:outline-none"
        >
          {STYLE_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. midnight rave poster · or leave blank if using image"
          rows={3}
          className="w-full resize-none border border-teal/40 bg-ink p-2 font-mono text-[11px] text-teal placeholder:text-teal/30 focus:border-teal focus:outline-none"
        />

        {imageDataUrl ? (
          <div className="relative">
            <img src={imageDataUrl} alt="ref" className="h-20 w-full border border-teal/40 object-cover" />
            <button
              onClick={() => setImageDataUrl(null)}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center bg-ink/90 text-teal hover:text-[#ff0080]"
              title="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 border border-dashed border-teal/40 bg-ink px-2 py-2 font-mono text-[10px] text-teal/70 hover:border-teal hover:text-teal"
          >
            <ImagePlus className="h-3.5 w-3.5" /> reference image (optional)
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPickImage(f);
            e.target.value = "";
          }}
        />

        <button
          onClick={handleGenerate}
          disabled={loading || (!prompt.trim() && !imageDataUrl)}
          className="brutal-border brutal-press flex w-full items-center justify-center gap-2 bg-blue px-3 py-2 font-display text-[11px] tracking-[0.2em] text-ink disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? "GENERATING..." : "GENERATE"}
        </button>
        {error && (
          <p className="font-mono text-[10px] text-[#ff0080]">! {error}</p>
        )}
      </div>

      <p className="font-mono text-[10px] text-teal/60">&gt; templates auto-fit to your canvas · {canvasW}×{canvasH}</p>
      <div className="grid grid-cols-2 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.name}
            onClick={() => loadTemplate(t.build(canvasW, canvasH), t.bg(canvasW, canvasH))}
            className="brutal-border-2 brutal-press overflow-hidden bg-surface text-left hover:border-teal"
          >
            <div
              className="w-full overflow-hidden border-b border-teal/30"
              style={{ aspectRatio: `${canvasW} / ${canvasH}` }}
            >
              {t.preview(canvasW, canvasH)}
            </div>
            <div className="bg-ink px-2 py-1 font-display text-[10px] uppercase tracking-[0.15em] text-teal">
              {t.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
