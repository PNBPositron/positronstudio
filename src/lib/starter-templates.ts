import { newText, newShape, DEFAULT_PAGE_DURATION, type Page, type SlideTransition } from "@/store/editor";

type Pal = {
  id: string;
  name: string;
  hint: string;
  bg: string;
  alt: string;
  ink: string;
  accent: string;
  accent2: string;
  display: string;
  body: string;
  transition: SlideTransition;
  radius?: number;
};

export const STARTER_STYLES: Pal[] = [
  { id: "cyber", name: "Cyber Deck", hint: "neon teal on ink", bg: "#05070f", alt: "#0a1430", ink: "#7df9ff", accent: "#00e5ff", accent2: "#ff0080", display: "Archivo Black", body: "JetBrains Mono", transition: "glitch" },
  { id: "editorial", name: "Editorial", hint: "serif, paper, calm", bg: "#f6f1e7", alt: "#e7ded0", ink: "#1a1a1a", accent: "#b3402f", accent2: "#1a1a1a", display: "Playfair Display", body: "Lora", transition: "fade" },
  { id: "brutalist", name: "Brutalist", hint: "black borders, hot yellow", bg: "#fdf6e3", alt: "#ffd84a", ink: "#000000", accent: "#ff5c00", accent2: "#000000", display: "Archivo Black", body: "Space Mono", transition: "slide" },
  { id: "minimal", name: "Minimal", hint: "white, thin, spacious", bg: "#ffffff", alt: "#f2f2f2", ink: "#111111", accent: "#2563eb", accent2: "#9ca3af", display: "Inter", body: "Inter", transition: "fade", radius: 12 },
  { id: "vapor", name: "Vapor", hint: "synthwave purple/pink", bg: "#160b2e", alt: "#2a1250", ink: "#f7d6ff", accent: "#ff6ec7", accent2: "#7b5cff", display: "Bebas Neue", body: "Space Grotesk", transition: "zoom", radius: 18 },
  { id: "swiss", name: "Swiss", hint: "grid, red, helvetica-ish", bg: "#ffffff", alt: "#111111", ink: "#111111", accent: "#e10600", accent2: "#111111", display: "Archivo", body: "Archivo", transition: "slide" },
];

const page = (bgColor: string, elements: Page["elements"], transition: SlideTransition): Page => ({
  id: Math.random().toString(36).slice(2, 10),
  bgColor,
  elements,
  duration: DEFAULT_PAGE_DURATION,
  transition,
});

/** Builds a 5-slide structured deck (cover, agenda, content, stat, summary) in the given style. */
export function buildStarterDeck(p: Pal, w: number, h: number): Page[] {
  const m = Math.round(w * 0.08);
  const cw = w - m * 2;
  const t = (text: string, o: Parameters<typeof newText>[0] = {}) =>
    newText({ text, x: m, width: cw, color: p.ink, fontFamily: p.display, ...o });
  const body = (text: string, o: Parameters<typeof newText>[0] = {}) =>
    newText({ text, x: m, width: cw, color: p.ink, fontFamily: p.body, fontWeight: 400, fontSize: Math.round(h * 0.035), ...o });
  const bar = (y: number, hh: number, fill: string, o = {}) =>
    newShape("rect", { x: m, y, width: Math.round(cw * 0.28), height: hh, fill, cornerRadius: p.radius ?? 0, ...o });

  return [
    // cover
    page(p.bg, [
      bar(Math.round(h * 0.22), Math.round(h * 0.012), p.accent),
      t("YOUR TITLE HERE", { y: Math.round(h * 0.28), fontSize: Math.round(h * 0.13), height: Math.round(h * 0.2) }),
      body("Subtitle · presenter · date", { y: Math.round(h * 0.52), height: Math.round(h * 0.08), color: p.accent }),
    ], p.transition),
    // agenda
    page(p.alt, [
      t("AGENDA", { y: m, fontSize: Math.round(h * 0.07), height: Math.round(h * 0.1), color: p.accent }),
      body("01 — Context\n02 — Problem\n03 — Approach\n04 — Results\n05 — Next steps", {
        y: Math.round(h * 0.3), height: Math.round(h * 0.45), fontSize: Math.round(h * 0.05),
        color: p.id === "swiss" ? p.bg : p.ink,
      }),
    ], p.transition),
    // content, two columns
    page(p.bg, [
      t("THE POINT", { y: m, fontSize: Math.round(h * 0.07), height: Math.round(h * 0.1) }),
      newShape("rect", { x: m, y: Math.round(h * 0.28), width: Math.round(cw * 0.46), height: Math.round(h * 0.5), fill: p.alt, cornerRadius: p.radius ?? 0 }),
      body("Left column — describe the situation in one or two short sentences.", {
        x: m + Math.round(w * 0.02), y: Math.round(h * 0.33), width: Math.round(cw * 0.42), height: Math.round(h * 0.35),
      }),
      newShape("rect", { x: m + Math.round(cw * 0.54), y: Math.round(h * 0.28), width: Math.round(cw * 0.46), height: Math.round(h * 0.5), fill: p.accent, cornerRadius: p.radius ?? 0 }),
      body("Right column — the takeaway, in the reader's language.", {
        x: m + Math.round(cw * 0.56), y: Math.round(h * 0.33), width: Math.round(cw * 0.42), height: Math.round(h * 0.35), color: p.bg,
      }),
    ], p.transition),
    // big stat
    page(p.accent, [
      t("92%", { y: Math.round(h * 0.24), fontSize: Math.round(h * 0.32), height: Math.round(h * 0.36), color: p.bg, align: "center" }),
      body("of the story fits in one number", { y: Math.round(h * 0.66), height: Math.round(h * 0.1), color: p.bg, align: "center" }),
    ], p.transition),
    // summary
    page(p.bg, [
      t("SUMMARY", { y: m, fontSize: Math.round(h * 0.07), height: Math.round(h * 0.1), color: p.accent }),
      body("• One sentence per idea\n• Keep the promise you made on slide one\n• End with a clear ask", {
        y: Math.round(h * 0.3), height: Math.round(h * 0.4), fontSize: Math.round(h * 0.048),
      }),
      bar(Math.round(h * 0.82), Math.round(h * 0.012), p.accent2),
    ], p.transition),
  ];
}
