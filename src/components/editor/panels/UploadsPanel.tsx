import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useEditor, newImage } from "@/store/editor";
import { PanelHeader } from "./TextPanel";
import { Upload, Sparkles, Loader2, Search } from "lucide-react";
import { generateAiAsset } from "@/lib/ai-templates.functions";

export function UploadsPanel() {
  const { add } = useEditor();
  const [uploads, setUploads] = useState<string[]>([]);
  const gen = useServerFn(generateAiAsset);
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<"1024x1024" | "1024x1536" | "1536x1024">("1024x1024");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockQuery, setStockQuery] = useState("abstract");
  const [stockSeed, setStockSeed] = useState(0);

  const stockImages = (() => {
    const q = encodeURIComponent(stockQuery.trim() || "abstract");
    return Array.from({ length: 12 }, (_, i) => ({
      thumb: `https://source.unsplash.com/200x200/?${q}&sig=${stockSeed * 100 + i}`,
      full: `https://source.unsplash.com/1600x1200/?${q}&sig=${stockSeed * 100 + i}`,
      key: `${stockSeed}-${i}`,
    }));
  })();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        setUploads((u) => [src, ...u]);
      };
      reader.readAsDataURL(f);
    });
  };

  const onGenerate = async () => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await gen({ data: { prompt: prompt.trim(), size } });
      setUploads((u) => [res.dataUrl, ...u]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <PanelHeader title="Uploads" />
      <label className="brutal-border brutal-press flex cursor-pointer flex-col items-center gap-2 bg-blue-deep p-4 text-teal glow-blue">
        <Upload className="h-6 w-6" strokeWidth={2.5} />
        <span className="font-display text-[11px] uppercase tracking-[0.2em]">▸ Upload image</span>
        <span className="font-mono text-[9px] text-teal/60">PNG · JPG · SVG</span>
        <input type="file" accept="image/*" multiple onChange={onFile} className="hidden" />
      </label>

      <div className="brutal-border-2 space-y-2 bg-surface p-3">
        <div className="flex items-center gap-2 font-display text-[11px] tracking-[0.2em] text-teal">
          <Sparkles className="h-3.5 w-3.5" /> AI_ASSET
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. holographic skull on black, studio lighting"
          rows={2}
          className="w-full resize-none border border-teal/40 bg-ink p-2 font-mono text-[11px] text-teal placeholder:text-teal/30 focus:border-teal focus:outline-none"
        />
        <select
          value={size}
          onChange={(e) => setSize(e.target.value as typeof size)}
          className="w-full border border-teal/40 bg-ink px-2 py-1.5 font-mono text-[11px] text-teal focus:border-teal focus:outline-none"
        >
          <option value="1024x1024">Square 1024</option>
          <option value="1024x1536">Portrait 1024×1536</option>
          <option value="1536x1024">Landscape 1536×1024</option>
        </select>
        <button
          onClick={onGenerate}
          disabled={busy || !prompt.trim()}
          className="brutal-border brutal-press flex w-full items-center justify-center gap-2 bg-blue px-3 py-2 font-display text-[11px] tracking-[0.2em] text-ink disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {busy ? "GENERATING..." : "GENERATE IMAGE"}
        </button>
        {error && <p className="font-mono text-[10px] text-[#ff0080]">! {error}</p>}
      </div>

      <div className="brutal-border-2 space-y-2 bg-surface p-3">
        <div className="flex items-center gap-2 font-display text-[11px] tracking-[0.2em] text-teal">
          <Search className="h-3.5 w-3.5" /> STOCK_PHOTOS
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStockSeed((s) => s + 1);
          }}
          className="flex gap-2"
        >
          <input
            value={stockQuery}
            onChange={(e) => setStockQuery(e.target.value)}
            placeholder="nature, city, people..."
            className="flex-1 border border-teal/40 bg-ink px-2 py-1.5 font-mono text-[11px] text-teal placeholder:text-teal/30 focus:border-teal focus:outline-none"
          />
          <button
            type="submit"
            className="brutal-border brutal-press bg-blue px-2 py-1.5 font-display text-[10px] tracking-[0.2em] text-ink"
          >
            GO
          </button>
        </form>
        <div className="grid grid-cols-2 gap-2">
          {stockImages.map((img) => (
            <button
              key={img.key}
              onClick={() => add(newImage(img.full))}
              className="brutal-border-2 brutal-press overflow-hidden bg-ink hover:border-teal"
            >
              <img
                src={img.thumb}
                alt={`${stockQuery} stock photo`}
                className="h-20 w-full object-cover"
                draggable={false}
                loading="lazy"
              />
            </button>
          ))}
        </div>
        <p className="font-mono text-[9px] text-teal/50">via Unsplash · free to use</p>
      </div>

      {uploads.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {uploads.map((src, i) => (
            <button
              key={i}
              onClick={() => add(newImage(src))}
              className="brutal-border-2 brutal-press overflow-hidden bg-surface hover:border-teal"
            >
              <img src={src} alt="" className="h-24 w-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      ) : (
        <div className="brutal-border-2 bg-surface p-4 font-mono text-[11px] text-teal/50">
          &gt; no uploads in buffer
          <br />
          &gt; drop files above_
        </div>
      )}
    </div>
  );
}
