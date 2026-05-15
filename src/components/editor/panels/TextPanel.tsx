import { useEditor, newText } from "@/store/editor";

const PRESETS = [
  { label: "+ Add heading", fontSize: 120, fontWeight: 900, fontFamily: "Orbitron", text: "HEADING" },
  { label: "+ Add subheading", fontSize: 64, fontWeight: 700, fontFamily: "Inter", text: "Subheading" },
  { label: "+ Add body text", fontSize: 32, fontWeight: 500, fontFamily: "JetBrains Mono", text: "Body text goes here" },
];

const QUICK = [
  { text: "NEURAL\nDROP", fontSize: 180, color: "#7df9ff" },
  { text: "SYSTEM\nONLINE", fontSize: 140, color: "#4d7cff" },
  { text: "404 LOVE", fontSize: 120, color: "#7df9ff" },
  { text: "GLITCH//\nMODE", fontSize: 160, color: "#4d7cff" },
];

export function TextPanel() {
  const { add } = useEditor();
  return (
    <div className="space-y-4">
      <PanelHeader title="Text" />
      <div className="space-y-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() =>
              add(
                newText({
                  text: p.text,
                  fontSize: p.fontSize,
                  fontWeight: p.fontWeight,
                  fontFamily: p.fontFamily,
                  height: p.fontSize * 1.4,
                  color: "#7df9ff",
                }),
              )
            }
            className="brutal-border-2 brutal-press w-full bg-surface px-3 py-3 text-left text-teal hover:bg-surface-2 hover:border-teal"
          >
            <span style={{ fontFamily: p.fontFamily, fontWeight: p.fontWeight, fontSize: 16 }}>
              {p.label}
            </span>
          </button>
        ))}
      </div>
      <div>
        <div className="mb-2 font-display text-[10px] uppercase tracking-[0.2em] text-teal/70">
          ▸ Style packs
        </div>
        <div className="grid grid-cols-2 gap-2">
          {QUICK.map((q, i) => (
            <button
              key={i}
              onClick={() =>
                add(newText({ text: q.text, fontSize: 72, color: q.color, height: 200, width: 480 }))
              }
              className="brutal-border-2 brutal-press flex h-24 items-center justify-center bg-surface p-2 text-center hover:border-teal"
            >
              <span
                style={{
                  fontFamily: "Orbitron",
                  fontWeight: 900,
                  fontSize: 13,
                  color: q.color,
                  whiteSpace: "pre-line",
                  lineHeight: 1,
                  letterSpacing: "0.05em",
                }}
              >
                {q.text}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PanelHeader({ title }: { title: string }) {
  return (
    <div className="relative brutal-border bg-ink px-3 py-2.5">
      <div className="font-display text-xs uppercase tracking-[0.25em] text-teal text-glow">
        ▌ {title}
      </div>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 h-2 w-2 bg-teal glow-teal" />
    </div>
  );
}
