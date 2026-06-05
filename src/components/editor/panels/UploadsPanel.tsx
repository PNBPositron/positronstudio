import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useEditor, newImage } from "@/store/editor";
import { PanelHeader } from "./TextPanel";
import { Upload, Sparkles, Loader2, Search } from "lucide-react";
import { generateAiAsset, stockSearch, type StockImage } from "@/lib/ai-templates.functions";

export function UploadsPanel() {
  const { add } = useEditor();
  const [uploads, setUploads] = useState<string[]>([]);
  const gen = useServerFn(generateAiAsset);
  const stock = useServerFn(stockSearch);
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<"1024x1024" | "1024x1536" | "1536x1024">("1024x1024");
  const [model, setModel] = useState<string>("openai/gpt-image-2");
  const [quality, setQuality] = useState<"low" | "medium" | "high">("low");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockQuery, setStockQuery] = useState("abstract");
  const [stockResults, setStockResults] = useState<StockImage[]>([]);
  const [stockBusy, setStockBusy] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [stockPage, setStockPage] = useState(1);

  const runStockSearch = async (page = 1) => {
    if (stockBusy) return;
    setStockBusy(true);
    setStockError(null);
    try {
      const res = await stock({ data: { query: stockQuery, page } });
      setStockResults(res.results);
      setStockPage(page);
    } catch (e) {
      setStockError(e instanceof Error ? e.message : "Search failed");
      setStockResults([]);
    } finally {
      setStockBusy(false);
    }
  };

  const insertStock = async (img: StockImage) => {
    // Fetch and inline as data URL so the canvas/export keep the image even if the source disappears.
    try {
      const res = await fetch(img.full);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onload = () => add(newImage(reader.result as string));
      reader.readAsDataURL(blob);
    } catch {
      // fall back to direct URL if CORS blocks the fetch
      add(newImage(img.full));
    }
  };

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
      const res = await gen({ data: { prompt: prompt.trim(), size, model, quality } });
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
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full border border-teal/40 bg-ink px-2 py-1.5 font-mono text-[11px] text-teal focus:border-teal focus:outline-none"
        >
          <optgroup label="OpenAI">
            <option value="openai/gpt-image-2">GPT Image 2 (default)</option>
            <option value="openai/gpt-image-1-mini">GPT Image 1 Mini (cheap)</option>
          </optgroup>
          <optgroup label="Google Gemini">
            <option value="google/gemini-2.5-flash-image">Nano Banana (fast)</option>
            <option value="google/gemini-3.1-flash-image-preview">Nano Banana 2</option>
            <option value="google/gemini-3-pro-image-preview">Gemini 3 Pro Image</option>
          </optgroup>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as typeof size)}
            className="w-full border border-teal/40 bg-ink px-2 py-1.5 font-mono text-[11px] text-teal focus:border-teal focus:outline-none"
          >
            <option value="1024x1024">Square</option>
            <option value="1024x1536">Portrait</option>
            <option value="1536x1024">Landscape</option>
          </select>
          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value as typeof quality)}
            disabled={model.startsWith("google/")}
            title={model.startsWith("google/") ? "Quality only applies to OpenAI models" : ""}
            className="w-full border border-teal/40 bg-ink px-2 py-1.5 font-mono text-[11px] text-teal focus:border-teal focus:outline-none disabled:opacity-40"
          >
            <option value="low">Low quality</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
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
            runStockSearch(1);
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
            disabled={stockBusy}
            className="brutal-border brutal-press bg-blue px-2 py-1.5 font-display text-[10px] tracking-[0.2em] text-ink"
          >
            {stockBusy ? "..." : "GO"}
          </button>
        </form>
        {stockError && <p className="font-mono text-[10px] text-[#ff0080]">! {stockError}</p>}
        {stockResults.length === 0 && !stockBusy && !stockError && (
          <p className="font-mono text-[10px] text-teal/50">&gt; search to load creative-commons photos</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {stockResults.map((img) => (
            <button
              key={img.id}
              onClick={() => insertStock(img)}
              title={img.title ? `${img.title}${img.author ? ` · ${img.author}` : ""}` : undefined}
              className="brutal-border-2 brutal-press overflow-hidden bg-ink hover:border-teal"
            >
              <img
                src={img.thumb}
                alt={img.title || `${stockQuery} stock photo`}
                className="h-20 w-full object-cover"
                draggable={false}
                loading="lazy"
              />
            </button>
          ))}
        </div>
        {stockResults.length > 0 && (
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => runStockSearch(Math.max(1, stockPage - 1))}
              disabled={stockBusy || stockPage <= 1}
              className="brutal-border-2 bg-surface px-2 py-1 font-mono text-[10px] text-teal hover:border-teal disabled:opacity-40"
            >
              ← prev
            </button>
            <span className="font-mono text-[10px] text-teal/60">page {stockPage}</span>
            <button
              onClick={() => runStockSearch(stockPage + 1)}
              disabled={stockBusy}
              className="brutal-border-2 bg-surface px-2 py-1 font-mono text-[10px] text-teal hover:border-teal disabled:opacity-40"
            >
              next →
            </button>
          </div>
        )}
        <p className="font-mono text-[9px] text-teal/50">via Openverse · CC-licensed for commercial use</p>
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
