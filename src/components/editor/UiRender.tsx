import { UI_STYLE_THEMES, type UiElement } from "@/store/editor";

export function UiRender({ element, preview = false }: { element: UiElement; preview?: boolean }) {
  const t = UI_STYLE_THEMES[element.uiStyle];
  const accent = element.accentColor || t.accent;
  const s = preview ? 0.34 : 1;

  const shell: React.CSSProperties = {
    width: "100%",
    height: "100%",
    background: t.bg,
    color: t.fg,
    border: `${t.borderWidth}px solid ${t.border}`,
    borderRadius: t.radius,
    boxShadow: t.shadow,
    backdropFilter: t.backdrop,
    fontFamily: t.font,
    letterSpacing: t.letterSpacing,
    padding: 28 * s,
    display: "flex",
    flexDirection: "column",
    gap: 12 * s,
    overflow: "hidden",
    boxSizing: "border-box",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: 34 * s,
    fontWeight: 800,
    lineHeight: 1.15,
    textTransform: t.uppercase ? "uppercase" : "none",
  };
  const bodyStyle: React.CSSProperties = { fontSize: 20 * s, lineHeight: 1.4, color: t.muted };

  const xpTitleBar = element.uiStyle === "xp" && (
    <div
      style={{
        margin: -28 * s,
        marginBottom: 4 * s,
        padding: `${8 * s}px ${12 * s}px`,
        background: "linear-gradient(180deg,#3b7dea 0%,#245edb 50%,#1941a5 100%)",
        color: "#fff",
        fontSize: 18 * s,
        fontWeight: 700,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <span>{element.title || "Window"}</span>
      <span style={{ letterSpacing: "0.2em" }}>_ □ ✕</span>
    </div>
  );

  const K = element.kind;

  if (K === "badge") {
    return (
      <div
        style={{
          ...shell,
          alignItems: "center",
          justifyContent: "center",
          background: accent,
          color: element.uiStyle === "cyber" || element.uiStyle === "glass" ? "#0a0f1f" : t.fg,
          padding: 0,
        }}
      >
        <span style={{ ...titleStyle, fontSize: 30 * s, letterSpacing: t.letterSpacing }}>{element.title}</span>
      </div>
    );
  }

  if (K === "progress") {
    const pct = Math.max(0, Math.min(100, element.value));
    return (
      <div style={{ ...shell, justifyContent: "center" }}>
        {xpTitleBar}
        <div style={{ display: "flex", justifyContent: "space-between", ...bodyStyle, color: t.fg }}>
          <span>{element.body || element.title}</span>
          <span>{pct}%</span>
        </div>
        <div
          style={{
            height: 26 * s,
            background: "rgba(0,0,0,0.25)",
            border: `${Math.max(1, t.borderWidth - 1)}px solid ${t.border}`,
            borderRadius: t.radius ? t.radius / 2 : 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              background:
                element.uiStyle === "xp"
                  ? "repeating-linear-gradient(90deg,#3ec53e 0 12px, #ece9d8 12px 16px)"
                  : accent,
            }}
          />
        </div>
      </div>
    );
  }

  if (K === "stat") {
    return (
      <div style={{ ...shell, justifyContent: "center" }}>
        {xpTitleBar}
        <div style={{ ...bodyStyle, textTransform: t.uppercase ? "uppercase" : "none" }}>{element.title}</div>
        <div style={{ ...titleStyle, fontSize: 72 * s, color: accent }}>{element.value.toLocaleString()}</div>
        <div style={bodyStyle}>{element.body}</div>
      </div>
    );
  }

  if (K === "quote") {
    return (
      <div style={{ ...shell, justifyContent: "center" }}>
        <div style={{ fontSize: 64 * s, lineHeight: 0.6, color: accent }}>“</div>
        <div style={{ ...titleStyle, fontSize: 28 * s, fontWeight: 600, textTransform: "none" }}>{element.title}</div>
        <div style={{ ...bodyStyle, fontSize: 18 * s }}>— {element.body}</div>
      </div>
    );
  }

  if (K === "profile") {
    return (
      <div style={{ ...shell, flexDirection: "row", alignItems: "center", gap: 20 * s }}>
        <div
          style={{
            width: 88 * s,
            height: 88 * s,
            borderRadius: element.uiStyle === "neobrutalist" ? 0 : "50%",
            background: accent,
            border: `${t.borderWidth}px solid ${t.border}`,
            display: "grid",
            placeItems: "center",
            fontSize: 34 * s,
            fontWeight: 800,
            color: element.uiStyle === "cyber" ? "#0a0f1f" : "#fff",
            flexShrink: 0,
          }}
        >
          {(element.title || "?").slice(0, 1)}
        </div>
        <div>
          <div style={titleStyle}>{element.title}</div>
          <div style={bodyStyle}>{element.body}</div>
        </div>
      </div>
    );
  }

  if (K === "alert") {
    return (
      <div style={{ ...shell, borderLeft: `${8 * s}px solid ${accent}` }}>
        {xpTitleBar}
        <div style={{ ...titleStyle, fontSize: 26 * s, color: accent }}>! {element.title}</div>
        <div style={bodyStyle}>{element.body}</div>
      </div>
    );
  }

  if (K === "list" || K === "pricing") {
    return (
      <div style={shell}>
        {xpTitleBar}
        <div style={titleStyle}>{element.title}</div>
        {K === "pricing" && <div style={{ ...titleStyle, fontSize: 44 * s, color: accent }}>{element.body}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 * s }}>
          {element.items.map((it, i) => (
            <div key={i} style={{ ...bodyStyle, display: "flex", gap: 10 * s, alignItems: "center", color: t.fg }}>
              <span style={{ color: accent, fontWeight: 800 }}>{element.uiStyle === "cyber" ? "▸" : "✓"}</span>
              {it}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (K === "kbd") {
    return (
      <div style={{ ...shell, alignItems: "center", justifyContent: "center", gap: 8 * s }}>
        <span
          style={{
            ...titleStyle,
            fontSize: 30 * s,
            padding: `${8 * s}px ${18 * s}px`,
            border: `${Math.max(2, t.borderWidth)}px solid ${t.border}`,
            borderBottomWidth: Math.max(4, t.borderWidth * 2),
            borderRadius: t.radius || 6,
            background: "rgba(255,255,255,0.08)",
          }}
        >
          {element.title}
        </span>
        <span style={{ ...bodyStyle, fontSize: 16 * s }}>{element.body}</span>
      </div>
    );
  }

  // ---- Real UI chrome components ----
  const isXP = element.uiStyle === "xp";
  const barBg = isXP
    ? "linear-gradient(180deg,#3b7dea 0%,#245edb 50%,#1941a5 100%)"
    : element.uiStyle === "neobrutalist"
      ? accent
      : element.uiStyle === "glass"
        ? "rgba(255,255,255,0.22)"
        : element.uiStyle === "sketch"
          ? "rgba(27,27,27,0.06)"
          : "rgba(125,249,255,0.10)";
  const barFg = isXP || element.uiStyle === "neobrutalist" ? "#fff" : t.fg;
  const line = t.border;

  const chromeShell: React.CSSProperties = { ...shell, padding: 0, gap: 0 };
  const dots = (
    <div style={{ display: "flex", gap: 6 * s }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <span
          key={c}
          style={{
            width: 12 * s,
            height: 12 * s,
            borderRadius: element.uiStyle === "neobrutalist" ? 0 : "50%",
            background: c,
            border: element.uiStyle === "neobrutalist" ? `${2 * s}px solid ${line}` : "none",
            display: "inline-block",
          }}
        />
      ))}
    </div>
  );
  const bar = (label: string, right?: React.ReactNode) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10 * s,
        padding: `${10 * s}px ${14 * s}px`,
        background: barBg,
        color: barFg,
        borderBottom: `${t.borderWidth}px solid ${line}`,
        fontSize: 16 * s,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {isXP ? null : dots}
      <span style={{ flex: 1, textAlign: isXP ? "left" : "center", overflow: "hidden", whiteSpace: "nowrap" }}>{label}</span>
      {right ?? (isXP ? <span style={{ letterSpacing: "0.2em" }}>_ □ ✕</span> : <span style={{ width: 46 * s }} />)}
    </div>
  );
  const field = (text: string, extra: React.CSSProperties = {}) => (
    <div
      style={{
        flex: 1,
        padding: `${8 * s}px ${12 * s}px`,
        border: `${Math.max(1, t.borderWidth)}px solid ${line}`,
        borderRadius: element.uiStyle === "neobrutalist" ? 0 : (t.radius || 8) / 1.5 + 6 * s,
        background: isXP ? "#fff" : "rgba(255,255,255,0.08)",
        color: t.muted,
        fontSize: 16 * s,
        overflow: "hidden",
        whiteSpace: "nowrap",
        ...extra,
      }}
    >
      {text}
    </div>
  );

  if (K === "window") {
    return (
      <div style={chromeShell}>
        {bar(element.title || "Window")}
        <div style={{ display: "flex", gap: 16 * s, padding: `${8 * s}px ${14 * s}px`, borderBottom: `1px solid ${line}`, fontSize: 14 * s, color: t.muted }}>
          {element.items.map((it, i) => (
            <span key={i}>{it}</span>
          ))}
        </div>
        <div style={{ padding: 18 * s, ...bodyStyle, color: t.fg, flex: 1 }}>{element.body}</div>
      </div>
    );
  }

  if (K === "browser") {
    return (
      <div style={chromeShell}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 * s, padding: `${10 * s}px ${14 * s}px`, background: barBg, borderBottom: `${t.borderWidth}px solid ${line}` }}>
          {dots}
          <span style={{ color: barFg, fontSize: 15 * s, opacity: 0.8 }}>◀ ▶ ⟳</span>
          {field(element.body || "https://example.com", { borderRadius: 999 })}
        </div>
        <div style={{ display: "flex", gap: 18 * s, padding: `${10 * s}px ${16 * s}px`, borderBottom: `1px solid ${line}`, fontSize: 15 * s, color: t.muted }}>
          {element.items.map((it, i) => (
            <span key={i} style={i === 0 ? { color: accent, fontWeight: 700 } : undefined}>{it}</span>
          ))}
        </div>
        <div style={{ padding: 20 * s, flex: 1, display: "flex", flexDirection: "column", gap: 10 * s }}>
          <div style={{ ...titleStyle, fontSize: 28 * s }}>{element.title}</div>
          <div style={{ height: 10 * s, width: "80%", background: t.muted, opacity: 0.35 }} />
          <div style={{ height: 10 * s, width: "65%", background: t.muted, opacity: 0.35 }} />
          <div style={{ marginTop: "auto", height: 8 * s, width: "35%", background: accent }} />
        </div>
      </div>
    );
  }

  if (K === "search") {
    return (
      <div style={{ ...shell, flexDirection: "row", alignItems: "center", gap: 12 * s, padding: 16 * s }}>
        <span style={{ fontSize: 24 * s, color: accent }}>⌕</span>
        <span style={{ ...bodyStyle, flex: 1, fontSize: 22 * s }}>{element.title}</span>
        <span
          style={{
            fontSize: 15 * s,
            padding: `${6 * s}px ${12 * s}px`,
            border: `${Math.max(1, t.borderWidth)}px solid ${line}`,
            borderRadius: t.radius ? t.radius / 2 : 0,
            color: t.muted,
          }}
        >
          {element.body}
        </span>
      </div>
    );
  }

  if (K === "terminal") {
    return (
      <div style={{ ...chromeShell, background: element.uiStyle === "cyber" ? "#05080f" : t.bg }}>
        {bar(element.title || "terminal")}
        <div style={{ padding: 16 * s, fontFamily: "'JetBrains Mono', monospace", fontSize: 16 * s, lineHeight: 1.6, color: accent, flex: 1, overflow: "hidden" }}>
          {element.items.map((it, i) => (
            <div key={i} style={{ color: it.startsWith("$") ? accent : t.muted }}>{it}</div>
          ))}
          <div>
            <span style={{ color: accent }}>$ </span>
            {element.body}
            <span style={{ background: accent, marginLeft: 2 * s, display: "inline-block", width: 9 * s, height: 16 * s, verticalAlign: "middle" }} />
          </div>
        </div>
      </div>
    );
  }

  if (K === "phone") {
    return (
      <div style={{ ...chromeShell, borderRadius: element.uiStyle === "neobrutalist" ? 0 : 36 * s, borderWidth: Math.max(4, t.borderWidth * 2) }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: `${10 * s}px ${18 * s}px`, fontSize: 13 * s, color: t.muted, flexShrink: 0 }}>
          <span>9:41</span>
          <span>▮▮▮ ▮</span>
        </div>
        <div style={{ padding: `${6 * s}px ${18 * s}px`, ...titleStyle, fontSize: 26 * s }}>{element.title}</div>
        <div style={{ padding: `0 ${18 * s}px`, ...bodyStyle, fontSize: 16 * s }}>{element.body}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 * s, padding: 18 * s, flex: 1 }}>
          {element.items.map((it, i) => (
            <div
              key={i}
              style={{
                padding: `${12 * s}px ${14 * s}px`,
                border: `${Math.max(1, t.borderWidth)}px solid ${line}`,
                borderRadius: element.uiStyle === "neobrutalist" ? 0 : 14 * s,
                fontSize: 16 * s,
                color: t.fg,
              }}
            >
              {it}
            </div>
          ))}
          <div style={{ marginTop: "auto", height: 6 * s, width: "40%", alignSelf: "center", background: t.muted, borderRadius: 999 }} />
        </div>
      </div>
    );
  }

  if (K === "modal") {
    return (
      <div style={{ ...chromeShell }}>
        {bar(element.title || "Confirm")}
        <div style={{ padding: 22 * s, ...bodyStyle, color: t.fg, flex: 1 }}>{element.body}</div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 * s, padding: 16 * s, borderTop: `1px solid ${line}` }}>
          {element.items.map((it, i) => (
            <span
              key={i}
              style={{
                padding: `${10 * s}px ${20 * s}px`,
                fontSize: 16 * s,
                fontWeight: 700,
                border: `${Math.max(1, t.borderWidth)}px solid ${line}`,
                borderRadius: t.radius ? t.radius / 2 : 0,
                background: i === element.items.length - 1 ? accent : "transparent",
                color: i === element.items.length - 1 ? (element.uiStyle === "cyber" ? "#0a0f1f" : "#fff") : t.fg,
              }}
            >
              {it}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (K === "tabs") {
    return (
      <div style={chromeShell}>
        <div style={{ display: "flex", flexShrink: 0 }}>
          {element.items.map((it, i) => (
            <span
              key={i}
              style={{
                padding: `${12 * s}px ${18 * s}px`,
                fontSize: 16 * s,
                fontWeight: 700,
                borderBottom: `${3 * s}px solid ${i === 0 ? accent : "transparent"}`,
                color: i === 0 ? accent : t.muted,
                background: i === 0 ? "rgba(255,255,255,0.06)" : "transparent",
              }}
            >
              {it}
            </span>
          ))}
        </div>
        <div style={{ padding: 20 * s, flex: 1, display: "flex", flexDirection: "column", gap: 10 * s, borderTop: `1px solid ${line}` }}>
          <div style={{ ...titleStyle, fontSize: 26 * s }}>{element.title}</div>
          <div style={bodyStyle}>{element.body}</div>
        </div>
      </div>
    );
  }

  if (K === "toggle") {
    return (
      <div style={shell}>
        <div style={titleStyle}>{element.title}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 * s }}>
          {element.items.map((it, i) => {
            const on = i % 2 === 0;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...bodyStyle, color: t.fg }}>
                <span>{it}</span>
                <span
                  style={{
                    width: 56 * s,
                    height: 30 * s,
                    borderRadius: element.uiStyle === "neobrutalist" ? 0 : 999,
                    background: on ? accent : "rgba(128,128,128,0.4)",
                    border: `${Math.max(1, t.borderWidth)}px solid ${line}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: on ? "flex-end" : "flex-start",
                    padding: 3 * s,
                    boxSizing: "border-box",
                  }}
                >
                  <span style={{ width: 22 * s, height: 22 * s, borderRadius: element.uiStyle === "neobrutalist" ? 0 : "50%", background: "#fff" }} />
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (K === "login") {
    return (
      <div style={{ ...shell, justifyContent: "center", gap: 14 * s }}>
        <div style={{ ...titleStyle, fontSize: 32 * s }}>{element.title}</div>
        <div style={bodyStyle}>{element.body}</div>
        {element.items.map((it, i) => (
          <div key={i} style={{ display: "flex" }}>{field(it)}</div>
        ))}
        <div
          style={{
            marginTop: 6 * s,
            textAlign: "center",
            padding: `${12 * s}px 0`,
            background: accent,
            color: element.uiStyle === "cyber" ? "#0a0f1f" : "#fff",
            fontWeight: 800,
            fontSize: 18 * s,
            border: `${t.borderWidth}px solid ${line}`,
            borderRadius: t.radius ? t.radius / 2 : 0,
          }}
        >
          Continue
        </div>
      </div>
    );
  }

  if (K === "notification") {
    return (
      <div style={{ ...shell, flexDirection: "row", alignItems: "center", gap: 14 * s, padding: 18 * s }}>
        <span
          style={{
            width: 44 * s,
            height: 44 * s,
            flexShrink: 0,
            borderRadius: element.uiStyle === "neobrutalist" ? 0 : "50%",
            background: accent,
            display: "grid",
            placeItems: "center",
            color: element.uiStyle === "cyber" ? "#0a0f1f" : "#fff",
            fontSize: 22 * s,
            fontWeight: 800,
          }}
        >
          ✓
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ ...titleStyle, fontSize: 22 * s }}>{element.title}</div>
          <div style={{ ...bodyStyle, fontSize: 16 * s }}>{element.body}</div>
        </div>
        <span style={{ ...bodyStyle, fontSize: 18 * s }}>✕</span>
      </div>
    );
  }

  // card
  return (
    <div style={shell}>
      {xpTitleBar}
      <div style={titleStyle}>{element.title}</div>
      <div style={bodyStyle}>{element.body}</div>
      <div style={{ marginTop: "auto", height: 6 * s, width: "40%", background: accent }} />
    </div>
  );
}
