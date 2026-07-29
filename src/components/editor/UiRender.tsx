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
          color: t.uiStyleContrast ?? (element.uiStyle === "cyber" ? "#0a0f1f" : t.fg),
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
