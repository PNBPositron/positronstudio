import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send, Sparkles } from "lucide-react";
import {
  useEditor,
  newText,
  newShape,
  newIcon,
  newModel3D,
  type AnyElement,
} from "@/store/editor";
import { PanelHeader } from "./TextPanel";
import { editCurrentSlide, type AiElementInput } from "@/lib/ai-templates.functions";

function buildFromAi(els: AiElementInput[]): AnyElement[] {
  return els
    .map((e): AnyElement | null => {
      if (e.type === "text") {
        return newText({
          text: e.text, x: e.x, y: e.y, width: e.width, height: e.height,
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

// Convert current page elements back to AI shape for context
function toAi(els: AnyElement[]): AiElementInput[] {
  return els.map((e): AiElementInput | null => {
    if (e.type === "text") return {
      type: "text", text: e.text, x: e.x, y: e.y, width: e.width, height: e.height,
      fontSize: e.fontSize, color: e.color, fontFamily: e.fontFamily,
      fontWeight: e.fontWeight, align: e.align, italic: e.italic, underline: e.underline,
      bullet: e.bullet, href: e.href,
    };
    if (e.type === "shape") return {
      type: "shape", shape: e.shape, x: e.x, y: e.y, width: e.width, height: e.height,
      fill: e.fill, stroke: e.stroke, strokeWidth: e.strokeWidth, effect: e.effect, shadow: e.shadow,
    };
    if (e.type === "icon") return {
      type: "icon", name: e.name, x: e.x, y: e.y, width: e.width, height: e.height,
      color: e.color, strokeWidth: e.strokeWidth,
    };
    if (e.type === "model3d") return {
      type: "model3d", shape: "sphere", x: e.x, y: e.y, width: e.width, height: e.height,
      color: e.color, spinSpeed: e.spinSpeed, tiltX: e.tiltX, tiltY: e.tiltY,
    };
    return null;
  }).filter((x): x is AiElementInput => x !== null);
}

type ChatMsg = { role: "user" | "assistant"; text: string };

const QUICK_PROMPTS = [
  "Make the headline bigger and bolder",
  "Add a glowing accent shape behind the title",
  "Switch palette to deep purple + neon pink",
  "Add bullet points summarizing the slide",
  "Center align everything",
];

export function AiChatPanel() {
  const { elements, bgColor, canvasW, canvasH, loadTemplate } = useEditor();
  const edit = useServerFn(editCurrentSlide);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [error, setError] = useState<string | null>(null);

  const run = async (prompt: string) => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError(null);
    setMsgs((m) => [...m, { role: "user", text: prompt }]);
    setInput("");
    try {
      const res = await edit({
        data: {
          prompt,
          width: canvasW,
          height: canvasH,
          page: { bg: bgColor, elements: toAi(elements) },
        },
      });
      loadTemplate(buildFromAi(res.elements), res.bg);
      setMsgs((m) => [...m, { role: "assistant", text: "Done — slide updated." }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Edit failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <PanelHeader title="AI Edit" />
      <p className="font-mono text-[10px] text-teal/60">
        &gt; Chat to edit the CURRENT slide. Restyle, add elements, rewrite copy.
      </p>

      <div className="brutal-border-2 max-h-64 min-h-24 space-y-2 overflow-y-auto bg-surface p-2">
        {msgs.length === 0 ? (
          <p className="font-mono text-[10px] text-teal/40">&gt; no messages yet_</p>
        ) : (
          msgs.map((m, i) => (
            <div
              key={i}
              className={`font-mono text-[10px] ${
                m.role === "user" ? "text-teal" : "text-[#7df9ff]/80"
              }`}
            >
              <span className="opacity-50">{m.role === "user" ? "▸ you: " : "▹ ai:  "}</span>
              {m.text}
            </div>
          ))
        )}
        {busy && (
          <div className="flex items-center gap-1 font-mono text-[10px] text-teal/60">
            <Loader2 className="h-3 w-3 animate-spin" /> thinking…
          </div>
        )}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run(input);
        }}
        placeholder="e.g. make headline neon green, add 3 bullet points…"
        rows={3}
        className="w-full resize-none border border-teal/40 bg-ink p-2 font-mono text-[11px] text-teal placeholder:text-teal/30 focus:border-teal focus:outline-none"
      />
      <button
        onClick={() => run(input)}
        disabled={busy || !input.trim()}
        className="brutal-border brutal-press flex w-full items-center justify-center gap-2 bg-blue px-3 py-2 font-display text-[11px] tracking-[0.2em] text-ink disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        {busy ? "EDITING..." : "APPLY EDIT"}
      </button>
      {error && <p className="font-mono text-[10px] text-[#ff0080]">! {error}</p>}

      <div className="space-y-1 pt-2">
        <div className="font-display text-[10px] uppercase tracking-[0.2em] text-teal/80">
          ▸ Quick prompts
        </div>
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            onClick={() => run(q)}
            disabled={busy}
            className="flex w-full items-center gap-2 border border-teal/30 bg-ink px-2 py-1.5 text-left font-mono text-[10px] text-teal/80 hover:border-teal hover:text-teal disabled:opacity-40"
          >
            <Sparkles className="h-3 w-3 shrink-0" /> {q}
          </button>
        ))}
      </div>
    </div>
  );
}