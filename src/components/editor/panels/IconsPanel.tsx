import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, Loader2 } from "lucide-react";
import { useEditor, newIcon } from "@/store/editor";
import { PanelHeader } from "./TextPanel";
import * as LucideIcons from "lucide-react";
import { suggestIcons } from "@/lib/ai-templates.functions";

const CURATED = [
  "Star", "Heart", "Sparkles", "Zap", "Sun", "Moon", "Cloud", "Flame",
  "Rocket", "Crown", "Trophy", "Award", "Bell", "Bookmark", "Camera", "Music",
  "Play", "Pause", "Mic", "Headphones", "Image", "Video", "Map", "MapPin",
  "Compass", "Globe", "Plane", "Car", "Bike", "ShoppingBag", "ShoppingCart", "CreditCard",
  "Mail", "MessageCircle", "Phone", "Send", "Share2", "Link", "Wifi", "Bluetooth",
  "Lock", "Unlock", "Shield", "Key", "Search", "Filter", "Settings", "Sliders",
  "User", "Users", "Smile", "ThumbsUp", "Eye", "EyeOff", "Hand", "Brain",
  "Code", "Terminal", "Cpu", "Database", "Server",
  "Github", "Twitter", "Instagram", "Youtube", "Twitch", "Linkedin",
  "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ChevronRight", "Plus", "Minus", "Check", "X",
  "Circle", "Square", "Triangle", "Hexagon", "Diamond", "Atom", "Infinity", "Bolt",
  "Coffee", "Pizza", "IceCream", "Beer", "Cake", "Apple", "Cherry", "Carrot",
  "Leaf", "Flower2", "TreePine", "Mountain", "Waves", "Snowflake", "Umbrella", "Rainbow",
];

const NAMES = Array.from(new Set(CURATED));

const ALL_NAMES = Object.keys(LucideIcons).filter(
  (k) => /^[A-Z]/.test(k) && !["Icon", "createLucideIcon", "default"].includes(k),
);

export function IconsPanel() {
  const { add } = useEditor();
  const suggest = useServerFn(suggestIcons);
  const [q, setQ] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiIcons, setAiIcons] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return NAMES;
    return ALL_NAMES.filter((n) => n.toLowerCase().includes(term));
  }, [q]);

  const handleAi = async () => {
    if (!aiPrompt.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await suggest({ data: { prompt: aiPrompt, count: 16 } });
      const valid = res.icons.filter(
        (n) => (LucideIcons as unknown as Record<string, unknown>)[n] != null,
      );
      setAiIcons(valid);
      if (valid.length === 0) setError("No matching icons returned");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PanelHeader title="Icon Library" />

      <div className="brutal-border-2 space-y-2 bg-surface p-3">
        <div className="flex items-center gap-2 font-display text-[11px] tracking-[0.2em] text-teal">
          <Sparkles className="h-3.5 w-3.5" /> AI_SUGGEST
        </div>
        <input
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="theme · e.g. space exploration"
          className="w-full border border-teal/40 bg-ink px-2 py-1.5 font-mono text-[11px] text-teal placeholder:text-teal/30 focus:border-teal focus:outline-none"
        />
        <button
          onClick={handleAi}
          disabled={loading || !aiPrompt.trim()}
          className="brutal-border brutal-press flex w-full items-center justify-center gap-2 bg-blue px-3 py-1.5 font-display text-[11px] tracking-[0.2em] text-ink disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {loading ? "..." : "SUGGEST"}
        </button>
        {error && <p className="font-mono text-[10px] text-[#ff0080]">! {error}</p>}
        {aiIcons && aiIcons.length > 0 && (
          <div className="grid grid-cols-4 gap-1 pt-1">
            {aiIcons.map((name) => {
              const Comp = (LucideIcons as unknown as Record<string, React.ComponentType<LucideIcons.LucideProps>>)[name];
              if (!Comp) return null;
              return (
                <button
                  key={name}
                  title={name}
                  onClick={() => add(newIcon(name))}
                  className="brutal-border-2 grid h-12 place-items-center bg-ink text-teal hover:border-teal"
                >
                  <Comp className="h-5 w-5" strokeWidth={2} />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="search 1500+ icons…"
        className="brutal-border-2 w-full bg-surface px-2 py-2 font-mono text-xs text-teal placeholder:text-teal/40 focus:outline-none focus:border-teal"
      />
      <div className="grid grid-cols-4 gap-2">
        {filtered.slice(0, 80).map((name) => {
          const Comp = (LucideIcons as unknown as Record<string, React.ComponentType<LucideIcons.LucideProps>>)[name];
          if (!Comp) return null;
          return (
            <button
              key={name}
              title={name}
              onClick={() => add(newIcon(name))}
              className="brutal-border-2 brutal-press grid h-14 place-items-center bg-surface text-teal hover:bg-surface-2 hover:border-teal"
            >
              <Comp className="h-6 w-6" strokeWidth={2} />
            </button>
          );
        })}
      </div>
      <div className="font-mono text-[10px] text-teal/50">
        &gt; type to search the full lucide set
      </div>
    </div>
  );
}
