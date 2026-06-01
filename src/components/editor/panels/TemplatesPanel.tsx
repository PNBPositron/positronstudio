import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2, ImagePlus, X } from "lucide-react";
import {
  useEditor,
  newText,
  newShape,
  newIcon,
  newModel3D,
  DEFAULT_PAGE_DURATION,
  type AnyElement,
  type Page,
} from "@/store/editor";
import { PanelHeader } from "./TextPanel";
import { generateAiTemplate, type AiElementInput, type AiStyle } from "@/lib/ai-templates.functions";
import { listPublicTemplates, type PublicTemplate } from "@/lib/designs";

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

const STYLE_OPTIONS: { id: AiStyle; label: string }[] = [
  { id: "auto", label: "Auto (detect from prompt)" },
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
  const { canvasW, canvasH } = useEditor();
  const generate = useServerFn(generateAiTemplate);
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<AiStyle>("auto");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [community, setCommunity] = useState<PublicTemplate[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);

  useEffect(() => {
    setCommunityLoading(true);
    listPublicTemplates()
      .then(setCommunity)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setCommunityLoading(false));
  }, []);

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
      const newPages: Page[] = res.pages.map((p) => ({
        id: Math.random().toString(36).slice(2, 10),
        bgColor: p.bg,
        elements: buildFromAi(p.elements),
        duration: DEFAULT_PAGE_DURATION,
      }));
      useEditor.getState().loadPages(newPages);
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

      <div className="font-display text-[10px] uppercase tracking-[0.2em] text-teal/80">
        ▸ Community templates
      </div>

      {communityLoading ? (
        <div className="flex items-center gap-2 font-mono text-[11px] text-teal/70">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> loading…
        </div>
      ) : community.length === 0 ? (
        <p className="font-mono text-[10px] text-teal/50">
          &gt; no community templates yet. Be the first — sign in and click the share icon in the toolbar.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {community.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                if (!window.confirm(`Load "${c.name}" — this replaces your current pages.`)) return;
                useEditor.getState().loadPages(c.pages as Page[]);
                useEditor.getState().setCanvasSize(c.canvas_w, c.canvas_h);
              }}
              className="brutal-border-2 brutal-press overflow-hidden bg-surface text-left hover:border-teal"
            >
              <div
                className="w-full overflow-hidden border-b border-teal/30"
                style={{
                  aspectRatio: `${c.canvas_w} / ${c.canvas_h}`,
                  background: (c.pages?.[0] as Page | undefined)?.bgColor ?? "#0a0f1f",
                }}
              />
              <div className="bg-ink px-2 py-1 font-display text-[10px] uppercase tracking-[0.15em] text-teal truncate">
                {c.name}
              </div>
              <div className="bg-ink px-2 pb-1 font-mono text-[9px] text-teal/50">
                {c.pages?.length ?? 0} slides
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}