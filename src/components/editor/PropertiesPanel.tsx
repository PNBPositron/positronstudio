import { useEditor, DEFAULT_FILTERS, type ImageFilters, type ElementShadow } from "@/store/editor";
import { Copy, Trash2, ArrowUp, ArrowDown, Layers, RotateCcw } from "lucide-react";

const SWATCHES = [
  "#7df9ff", "#00d9ff", "#0ea5e9", "#4d7cff", "#1f3fb8",
  "#0a0f1f", "#ffffff", "#ff0080", "#00ff88",
];

export function PropertiesPanel() {
  const { elements, selectedId, update, remove, duplicate, bringForward, sendBackward } = useEditor();
  const el = elements.find((e) => e.id === selectedId);
  if (!el) {
    return (
      <div className="hidden w-72 border-l border-teal/30 bg-paper p-4 lg:block">
        <div className="brutal-border bg-ink px-3 py-2.5">
          <div className="font-display text-xs uppercase tracking-[0.25em] text-teal/60">
            ▌ No selection
          </div>
        </div>
        <div className="mt-4 space-y-2 font-mono text-[11px] text-teal/50">
          <p>&gt; awaiting input...</p>
          <p>&gt; click a layer to inspect</p>
          <p className="text-teal/30">&gt; _</p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-72 overflow-y-auto border-l border-teal/30 bg-paper">
      <div className="border-b border-teal/40 bg-blue-deep px-4 py-3 glow-blue">
        <div className="flex items-center gap-2 font-display text-xs uppercase tracking-[0.25em] text-teal">
          <Layers className="h-3.5 w-3.5" strokeWidth={2.5} />
          {el.type}_layer
        </div>
      </div>

      <div className="space-y-4 p-4">
        {el.type === "text" && (
          <>
            <Field label="Text">
              <textarea
                value={el.text}
                onChange={(e) => update(el.id, { text: e.target.value })}
                rows={3}
                className="brutal-border-2 w-full bg-surface p-2 font-mono text-xs text-teal focus:outline-none focus:border-teal focus:bg-surface-2"
              />
            </Field>
            <Field label="Font size">
              <input
                type="range"
                min={12}
                max={240}
                value={el.fontSize}
                onChange={(e) => update(el.id, { fontSize: +e.target.value })}
                className="w-full accent-teal"
              />
              <div className="font-mono text-[11px] text-teal/70">{el.fontSize}px</div>
            </Field>
            <Field label="Font family">
              <select
                value={el.fontFamily}
                onChange={(e) => update(el.id, { fontFamily: e.target.value })}
                className="brutal-border-2 w-full bg-surface px-2 py-1.5 font-mono text-xs text-teal focus:outline-none focus:border-teal"
              >
                {["Orbitron", "JetBrains Mono", "Inter", "Archivo Black", "Georgia"].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Field>
            <Field label="Color">
              <ColorRow value={el.color} onChange={(c) => update(el.id, { color: c })} />
            </Field>
            <Field label="Align">
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => update(el.id, { align: a })}
                    className={`brutal-border-2 flex-1 py-1.5 font-mono text-[10px] uppercase tracking-wider ${
                      el.align === a
                        ? "bg-blue text-ink border-teal"
                        : "bg-surface text-teal hover:border-teal"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Style">
              <div className="flex gap-1">
                {([
                  ["I", "italic", el.italic],
                  ["U", "underline", el.underline],
                  ["•", "bullet", el.bullet],
                ] as const).map(([lbl, key, on]) => (
                  <button
                    key={key}
                    onClick={() => update(el.id, { [key]: !on } as Partial<typeof el>)}
                    className={`brutal-border-2 flex-1 py-1.5 font-mono text-[11px] ${
                      on ? "bg-blue text-ink border-teal" : "bg-surface text-teal hover:border-teal"
                    }`}
                    style={{ fontStyle: key === "italic" ? "italic" : undefined, textDecoration: key === "underline" ? "underline" : undefined }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Hyperlink">
              <input
                type="url"
                placeholder="https://example.com"
                value={el.href ?? ""}
                onChange={(e) => update(el.id, { href: e.target.value })}
                className="brutal-border-2 w-full bg-surface px-2 py-1.5 font-mono text-xs text-teal focus:outline-none focus:border-teal"
              />
              <div className="font-mono text-[10px] text-teal/50">&gt; click opens link · shift+click to select</div>
            </Field>
          </>
        )}

        {el.type === "shape" && (
          <>
            <Field label="Fill">
              <ColorRow value={el.fill} onChange={(c) => update(el.id, { fill: c })} />
            </Field>
            <Field label="Stroke">
              <ColorRow value={el.stroke} onChange={(c) => update(el.id, { stroke: c })} />
            </Field>
            <Field label="Stroke width">
              <input
                type="range"
                min={0}
                max={32}
                value={el.strokeWidth}
                onChange={(e) => update(el.id, { strokeWidth: +e.target.value })}
                className="w-full accent-teal"
              />
            </Field>
            <Field label="Effect">
              <select
                value={el.effect ?? "none"}
                onChange={(e) => update(el.id, { effect: e.target.value as NonNullable<typeof el.effect> })}
                className="brutal-border-2 w-full bg-surface px-2 py-1.5 font-mono text-xs text-teal focus:outline-none focus:border-teal"
              >
                <option value="none">none</option>
                <option value="liquid_glass">liquid glass</option>
                <option value="neon">neon glow</option>
                <option value="soft_shadow">soft shadow</option>
                <option value="inner_glow">inner glow</option>
              </select>
            </Field>
            <ShadowEditor
              shadow={el.shadow}
              onChange={(s) => update(el.id, { shadow: s })}
            />
          </>
        )}

        {el.type === "icon" && (
          <>
            <Field label="Icon name">
              <input
                value={el.name}
                onChange={(e) => update(el.id, { name: e.target.value })}
                className="brutal-border-2 w-full bg-surface px-2 py-1.5 font-mono text-xs text-teal focus:outline-none focus:border-teal"
              />
              <div className="font-mono text-[10px] text-teal/50">&gt; lucide PascalCase, e.g. Sparkles</div>
            </Field>
            <Field label="Color">
              <ColorRow value={el.color} onChange={(c) => update(el.id, { color: c })} />
            </Field>
            <Field label="Stroke">
              <input
                type="range"
                min={0.5}
                max={4}
                step={0.25}
                value={el.strokeWidth}
                onChange={(e) => update(el.id, { strokeWidth: +e.target.value })}
                className="w-full accent-teal"
              />
              <div className="font-mono text-[11px] text-teal/70">{el.strokeWidth}</div>
            </Field>
          </>
        )}

        {el.type === "model3d" && (
          <>
            <div className="font-display text-[10px] uppercase tracking-[0.25em] text-teal/80">
              ▸ Sphere
            </div>
            <Field label="Color">
              <ColorRow value={el.color} onChange={(c) => update(el.id, { color: c })} />
            </Field>
            <Field label="Tilt X">
              <input
                type="range"
                min={-90}
                max={90}
                value={el.tiltX}
                onChange={(e) => update(el.id, { tiltX: +e.target.value })}
                className="w-full accent-teal"
              />
              <div className="font-mono text-[11px] text-teal/70">{el.tiltX}°</div>
            </Field>
            <Field label="Tilt Y">
              <input
                type="range"
                min={-180}
                max={180}
                value={el.tiltY}
                onChange={(e) => update(el.id, { tiltY: +e.target.value })}
                className="w-full accent-teal"
              />
              <div className="font-mono text-[11px] text-teal/70">{el.tiltY}°</div>
            </Field>
          </>
        )}

        {el.type === "image" && (() => {
          const f: ImageFilters = { ...DEFAULT_FILTERS, ...(el.filters ?? {}) };
          const set = (patch: Partial<ImageFilters>) =>
            update(el.id, { filters: { ...f, ...patch } });
          const FX: Array<[keyof ImageFilters, string, number, number, number, string]> = [
            ["brightness", "Brightness", 0, 200, 1, "%"],
            ["contrast", "Contrast", 0, 200, 1, "%"],
            ["saturate", "Saturation", 0, 200, 1, "%"],
            ["blur", "Blur", 0, 30, 0.5, "px"],
            ["grayscale", "Grayscale", 0, 100, 1, "%"],
            ["sepia", "Sepia", 0, 100, 1, "%"],
            ["hueRotate", "Hue", -180, 180, 1, "°"],
            ["invert", "Invert", 0, 100, 1, "%"],
          ];
          return (
            <>
              <div className="font-display text-[10px] uppercase tracking-[0.25em] text-teal/80">
                ▸ Image effects
              </div>
              {FX.map(([key, label, min, max, step, unit]) => (
                <Field key={key} label={label}>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={f[key]}
                    onChange={(e) => set({ [key]: +e.target.value } as Partial<ImageFilters>)}
                    className="w-full accent-teal"
                  />
                  <div className="font-mono text-[11px] text-teal/70">
                    {f[key]}{unit}
                  </div>
                </Field>
              ))}
              <button
                onClick={() => update(el.id, { filters: { ...DEFAULT_FILTERS } })}
                className="brutal-border-2 brutal-press flex w-full items-center justify-center gap-1 bg-surface py-2 font-mono text-[10px] uppercase tracking-wider text-teal hover:border-teal"
              >
                <RotateCcw className="h-3 w-3" strokeWidth={3} /> Reset effects
              </button>
              <ShadowEditor
                shadow={el.shadow}
                onChange={(s) => update(el.id, { shadow: s })}
              />
            </>
          );
        })()}


        <Field label="Rotation">
          <input
            type="range"
            min={-180}
            max={180}
            value={el.rotation}
            onChange={(e) => update(el.id, { rotation: +e.target.value })}
            className="w-full accent-teal"
          />
          <div className="font-mono text-[11px] text-teal/70">{el.rotation}°</div>
        </Field>

        <Field label="Entrance animation (present mode)">
          <select
            value={el.animation ?? "none"}
            onChange={(e) =>
              update(el.id, { animation: e.target.value as NonNullable<typeof el.animation> })
            }
            className="brutal-border-2 w-full bg-surface px-2 py-1.5 font-mono text-xs text-teal focus:outline-none focus:border-teal"
          >
            <option value="none">none</option>
            <option value="fade-up">fade up</option>
            <option value="pop">pop</option>
            <option value="glitch">glitch</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <ActionBtn onClick={() => bringForward(el.id)} icon={<ArrowUp className="h-3 w-3" strokeWidth={3} />}>
            Forward
          </ActionBtn>
          <ActionBtn onClick={() => sendBackward(el.id)} icon={<ArrowDown className="h-3 w-3" strokeWidth={3} />}>
            Backward
          </ActionBtn>
          <ActionBtn onClick={() => duplicate(el.id)} icon={<Copy className="h-3 w-3" strokeWidth={3} />}>
            Duplicate
          </ActionBtn>
          <ActionBtn
            onClick={() => remove(el.id)}
            icon={<Trash2 className="h-3 w-3" strokeWidth={3} />}
            danger
          >
            Delete
          </ActionBtn>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-display text-[10px] uppercase tracking-[0.2em] text-teal/80">
        ▸ {label}
      </label>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function ColorRow({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1">
        {SWATCHES.map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`brutal-border-2 h-7 w-7 transition-all ${
              value === s ? "border-teal scale-110 glow-teal" : "hover:border-teal"
            }`}
            style={{ background: s }}
          />
        ))}
      </div>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="brutal-border-2 h-9 w-full bg-surface"
      />
    </div>
  );
}

function ActionBtn({
  children,
  onClick,
  icon,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`brutal-border-2 brutal-press flex items-center justify-center gap-1 py-2 font-mono text-[10px] uppercase tracking-wider ${
        danger
          ? "bg-destructive text-white border-destructive hover:border-destructive"
          : "bg-surface text-teal hover:border-teal"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function ShadowEditor({
  shadow,
  onChange,
}: {
  shadow: ElementShadow | undefined;
  onChange: (s: ElementShadow | undefined) => void;
}) {
  const enabled = !!shadow;
  const s: ElementShadow = shadow ?? { x: 0, y: 12, blur: 24, color: "#000000" };
  return (
    <>
      <Field label="Drop shadow">
        <div className="flex gap-1">
          <button
            onClick={() => onChange(enabled ? undefined : s)}
            className={`brutal-border-2 flex-1 py-1.5 font-mono text-[10px] uppercase ${
              enabled ? "bg-blue text-ink border-teal" : "bg-surface text-teal hover:border-teal"
            }`}
          >
            {enabled ? "ON" : "OFF"}
          </button>
        </div>
      </Field>
      {enabled && (
        <>
          <Field label="Offset X">
            <input
              type="range"
              min={-60}
              max={60}
              value={s.x}
              onChange={(e) => onChange({ ...s, x: +e.target.value })}
              className="w-full accent-teal"
            />
            <div className="font-mono text-[11px] text-teal/70">{s.x}px</div>
          </Field>
          <Field label="Offset Y">
            <input
              type="range"
              min={-60}
              max={60}
              value={s.y}
              onChange={(e) => onChange({ ...s, y: +e.target.value })}
              className="w-full accent-teal"
            />
            <div className="font-mono text-[11px] text-teal/70">{s.y}px</div>
          </Field>
          <Field label="Blur">
            <input
              type="range"
              min={0}
              max={120}
              value={s.blur}
              onChange={(e) => onChange({ ...s, blur: +e.target.value })}
              className="w-full accent-teal"
            />
            <div className="font-mono text-[11px] text-teal/70">{s.blur}px</div>
          </Field>
          <Field label="Color">
            <input
              type="color"
              value={s.color}
              onChange={(e) => onChange({ ...s, color: e.target.value })}
              className="brutal-border-2 h-9 w-full bg-surface"
            />
          </Field>
        </>
      )}
    </>
  );
}
