import { createServerFn } from "@tanstack/react-start";

export type AiShadow = { x: number; y: number; blur: number; color: string };

export type AiElementInput =
  | {
      type: "text";
      text: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
      color: string;
      fontFamily?: string;
      fontWeight?: number;
      align?: "left" | "center" | "right";
      italic?: boolean;
      underline?: boolean;
      bullet?: boolean;
      href?: string;
    }
  | {
      type: "shape";
      shape: "rect" | "circle" | "triangle" | "star" | "arrow";
      x: number;
      y: number;
      width: number;
      height: number;
      fill: string;
      stroke: string;
      strokeWidth: number;
      effect?: "none" | "liquid_glass" | "neon" | "soft_shadow" | "inner_glow";
      shadow?: AiShadow;
    }
  | {
      type: "icon";
      name: string; // lucide PascalCase
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
      strokeWidth?: number;
    }
  | {
      type: "model3d";
      shape: "sphere";
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
      spinSpeed?: number;
      tiltX?: number;
      tiltY?: number;
    };

export type AiTemplate = {
  bg: string;
  elements: AiElementInput[];
};

export type AiPage = { bg: string; elements: AiElementInput[] };
export type AiDeck = { pages: AiPage[] };

export type AiStyle =
  | "auto"
  | "cyberpunk"
  | "liquid_glass"
  | "minimal"
  | "editorial"
  | "brutalist"
  | "retro_80s"
  | "organic"
  | "art_deco"
  | "memphis"
  | "y2k";

const STYLE_GUIDES: Record<AiStyle, string> = {
  auto:
    "AUTO-DETECT STYLE. Read the user's prompt (and reference image if provided) carefully, then pick the single most appropriate visual style from this list: cyberpunk, liquid_glass, minimal, editorial, brutalist, retro_80s, organic, art_deco, memphis, y2k — or invent a closely related one if none fits. Treat keywords as required signals: 'corporate/clean/SaaS' → minimal; 'magazine/editorial/serif' → editorial; 'rave/neon/synthwave/cyber' → cyberpunk or retro_80s; 'glass/translucent/dreamy/iOS' → liquid_glass; 'raw/print/zine/punk' → brutalist; 'nature/wellness/calm/earth' → organic; 'luxury/gold/gatsby' → art_deco; 'playful/90s/squiggle/kids' → memphis; 'chrome/holographic/bubblegum/futuristic 2000s' → y2k. Commit to one direction with conviction — palette, type, shapes must all reinforce it. Use real hex codes and at least one shape effect (liquid_glass/neon/soft_shadow/inner_glow) appropriate to the chosen style. State the chosen style implicitly through the design — do NOT mention it in any text element.",
  cyberpunk:
    "CYBERPUNK / NEOBRUTALIST. Palette: ink #0a0f1f, surface #101a2e, neon teal #7df9ff, electric blue #4d7cff, hot magenta #ff0080. Heavy display type, dramatic scale contrast, geometric shapes, mono labels. Use shape effect 'neon' on key shapes.",
  liquid_glass:
    "LIQUID GLASS / GLASSMORPHISM. Palette: deep gradient backgrounds (indigo→violet→cyan), translucent surfaces, soft pastels (#a78bfa, #67e8f9, #f0abfc, #ffffff). Use overlapping circles/blobs as 'glass orbs' and ALWAYS set shape effect to 'liquid_glass' on at least 2 shapes. Soft, airy, refined typography.",
  minimal:
    "SWISS MINIMALIST. Palette: paper #f5f3ee, ink #0d0d0d, single accent (#ff3b30 OR #1a73e8). Massive negative space, tiny labels, one giant headline, hairline strokes only. Use 'soft_shadow' sparingly.",
  editorial:
    "EDITORIAL / MAGAZINE. Palette: warm off-white #f8f4ec, deep ink #1a1a1a, gold accent #c9a84c. Mixing serif headlines with mono details. Asymmetric grid, generous margins, refined.",
  brutalist:
    "RAW BRUTALIST. Palette: stark white #ffffff, pure black #000000, single saturated accent (lime #ccff00 OR red #ff0000). Heavy borders, exposed grid, raw hierarchy. Use 'soft_shadow' on key blocks.",
  retro_80s:
    "RETRO 80s / SYNTHWAVE. Palette: deep purple #1a0033, hot pink #ff006e, cyan #00f0ff, sun yellow #ffe600. Sunset gradients, bold display, chrome-style headlines. Use 'neon' effect on shapes.",
  organic:
    "ORGANIC / NATURAL. Palette: cream #f5f0e8, sage #87a878, terracotta #c4654a, mossy #4a6741. Soft rounded shapes, hand-feel, gentle hierarchy.",
  art_deco:
    "ART DECO. Palette: black #0a0a0a, gold #d4a017, ivory #f5e6c8. Symmetric geometric ornament, tall display type, gilded accents.",
  memphis:
    "MEMPHIS DESIGN. Palette: hot pink #ff5d8f, electric blue #1e88e5, lemon #ffeb3b, mint #4ecdc4, black on white. Squiggles, dots, zigzags, playful chaos.",
  y2k:
    "Y2K FUTURISM. Palette: chrome silver, holographic pastels (#c4b5fd, #67e8f9, #f0abfc), candy pink. Translucent bubble shapes — use 'liquid_glass' effect heavily — glossy feel, futuristic display.",
};

const buildSystem = (W: number, H: number, style: AiStyle, hasImage: boolean) => `You are an elite graphic designer generating a MULTI-SLIDE deck for a ${W}×${H}px canvas.
Aspect ratio: ${(W / H).toFixed(3)} (${W >= H ? "landscape/wide" : "portrait/tall"}). Compose every slide for this exact shape — fill the full ${W}px width and ${H}px height.

DECK STRUCTURE — output 4-6 cohesive slides in this order:
  1. TITLE slide — huge headline + short subtitle/byline. Bold, no body copy.
  2-4. CONTENT slides — each one has a clear role (intro / point / example / data). Use distinct layouts; never repeat the title slide format.
  5. SUMMARY slide — recap of key points (bulleted or numbered) OR a closing call-to-action.
All slides MUST share the same palette, typographic system, and visual motifs so the deck feels like ONE designed artifact.

STYLE BRIEF: ${STYLE_GUIDES[style]}

${hasImage ? "An IMAGE has been attached as creative reference — extract its palette, mood, subject, and composition cues. Match the dominant colors precisely (use real hex sampled from the image). Echo the layout/feel.\n\n" : ""}AVAILABLE FONTS: "Orbitron", "JetBrains Mono", "Archivo Black", "Inter", "Georgia".

AVAILABLE ELEMENT TYPES (mix freely — use icons, 3D spheres, shape effects to amplify the style):
- text: { type:"text", text, x, y, width, height, fontSize, color, fontFamily?, fontWeight?, align?, italic?, underline?, bullet? }
- shape: { type:"shape", shape:"rect"|"circle"|"triangle"|"star"|"arrow", x, y, width, height, fill, stroke, strokeWidth, effect?:"none"|"liquid_glass"|"neon"|"soft_shadow"|"inner_glow", shadow?:{ x,y,blur,color } }
- icon: { type:"icon", name, x, y, width, height, color, strokeWidth? } — name MUST be a valid lucide-react icon in PascalCase (e.g. "Sparkles", "Zap", "Heart", "Rocket", "Star", "Sun", "Moon", "Cloud", "Flame", "Crown", "Globe", "Atom", "Infinity", "Bolt", "Leaf", "Mountain", "Waves", "Snowflake", "Music", "Camera", "ShoppingBag", "Mail", "Lock", "User", "Code", "Cpu", "Brain", "Eye", "Hand").
- model3d: { type:"model3d", shape:"sphere", x, y, width, height, color, spinSpeed?, tiltX?, tiltY? } — only spheres are supported.

SHAPE EFFECTS (use to add depth):
- "liquid_glass": frosted, translucent glassmorphism panel — gorgeous over colorful backgrounds or behind text.
- "neon": glowing outer halo using the fill color — perfect for cyberpunk/synthwave.
- "soft_shadow": realistic drop shadow under the shape — adds depth on light backgrounds.
- "inner_glow": inner color glow — use for accent badges.

Coordinates are absolute pixels within ${W}×${H}. Keep all elements inside bounds (0 ≤ x, x+width ≤ ${W}; 0 ≤ y, y+height ≤ ${H}).

Return ONLY valid JSON, no markdown, no commentary:
{
  "pages": Array<{ "bg": "#hex", "elements": Array<element> }>
}

Each slide aims for 5-12 elements. Across the deck, include at least one shape with an effect (liquid_glass or neon) when the style supports it. Make it visually striking, deliberate, and unmistakably in the requested style.`;

export const generateAiTemplate = createServerFn({ method: "POST" })
  .inputValidator((data: { prompt: string; width?: number; height?: number; style?: AiStyle; imageDataUrl?: string }) => {
    if (!data || typeof data.prompt !== "string") throw new Error("Prompt is required");
    if (!data.prompt.trim() && !data.imageDataUrl) throw new Error("Provide a prompt or an image");
    const clamp = (n: unknown, def: number) => {
      const v = typeof n === "number" && Number.isFinite(n) ? Math.round(n) : def;
      return Math.max(320, Math.min(4096, v));
    };
    const validStyles: AiStyle[] = [
      "auto", "cyberpunk", "liquid_glass", "minimal", "editorial", "brutalist",
      "retro_80s", "organic", "art_deco", "memphis", "y2k",
    ];
    const style: AiStyle = (data.style && validStyles.includes(data.style)) ? data.style : "auto";
    const img = typeof data.imageDataUrl === "string" && data.imageDataUrl.startsWith("data:image/")
      ? data.imageDataUrl.slice(0, 8_000_000)
      : undefined;
    return {
      prompt: data.prompt.slice(0, 1000),
      width: clamp(data.width, 1920),
      height: clamp(data.height, 1080),
      style,
      imageDataUrl: img,
    };
  })
  .handler(async ({ data }): Promise<AiDeck> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const userContent: Array<Record<string, unknown>> = [
      { type: "text", text: `Design concept: ${data.prompt || "(use the attached image as the brief)"}` },
    ];
    if (data.imageDataUrl) {
      userContent.push({ type: "image_url", image_url: { url: data.imageDataUrl } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: buildSystem(data.width, data.height, data.style, !!data.imageDataUrl) },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) throw new Error("Rate limit hit. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
    if (!res.ok) throw new Error(`AI gateway error ${res.status}: ${await res.text()}`);

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    let parsed: AiDeck | AiTemplate;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned invalid JSON");
      parsed = JSON.parse(match[0]);
    }
    // Normalize: accept either { pages: [...] } or legacy { bg, elements }
    let pages: AiPage[];
    if ("pages" in parsed && Array.isArray(parsed.pages)) {
      pages = parsed.pages.filter((p) => p && Array.isArray(p.elements));
    } else if ("elements" in parsed && Array.isArray(parsed.elements)) {
      pages = [{ bg: parsed.bg ?? "#0a0f1f", elements: parsed.elements }];
    } else {
      throw new Error("AI response missing pages/elements");
    }
    if (pages.length === 0) throw new Error("AI returned an empty deck");
    return { pages };
  });

// ---------------- Icon set generator ----------------

export const suggestIcons = createServerFn({ method: "POST" })
  .inputValidator((data: { prompt: string; count?: number }) => {
    if (!data?.prompt?.trim()) throw new Error("Prompt is required");
    const count = Math.max(4, Math.min(24, typeof data.count === "number" ? data.count : 12));
    return { prompt: data.prompt.slice(0, 300), count };
  })
  .handler(async ({ data }): Promise<{ icons: string[] }> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `Return ${data.count} lucide-react icon names (PascalCase) that best fit the user's theme. Use only real lucide icons. Return JSON: { "icons": string[] }. No commentary.`,
          },
          { role: "user", content: `Theme: ${data.prompt}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (res.status === 429) throw new Error("Rate limit hit. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) throw new Error(`AI gateway error ${res.status}`);
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed: { icons?: unknown };
    try { parsed = JSON.parse(content); } catch {
      const m = content.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    }
    const icons = Array.isArray(parsed.icons)
      ? (parsed.icons as unknown[]).filter((n): n is string => typeof n === "string")
      : [];
    return { icons };
  });

// ---------------- 3D sphere scene generator ----------------

export type Ai3DScene = {
  bg?: string;
  models: Array<{
    shape: "sphere";
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    spinSpeed?: number;
    tiltX?: number;
    tiltY?: number;
  }>;
};

export const generate3DScene = createServerFn({ method: "POST" })
  .inputValidator((data: { prompt: string; width?: number; height?: number }) => {
    if (!data?.prompt?.trim()) throw new Error("Prompt is required");
    const clamp = (n: unknown, def: number) =>
      Math.max(320, Math.min(4096, typeof n === "number" && Number.isFinite(n) ? Math.round(n) : def));
    return {
      prompt: data.prompt.slice(0, 500),
      width: clamp(data.width, 1920),
      height: clamp(data.height, 1080),
    };
  })
  .handler(async ({ data }): Promise<Ai3DScene> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const sys = `Design a 3D composition on a ${data.width}×${data.height}px canvas using ONLY spheres (planets, orbs, bubbles).
Compose 3-7 spheres, varied sizes (80-700px), thoughtful color harmony.
Coordinates absolute, must stay inside bounds.
Return JSON only: { "bg": "#hex", "models": Array<{ "shape":"sphere", "x", "y", "width", "height", "color", "spinSpeed"?, "tiltX"?, "tiltY"? }> }.
spinSpeed: 0-30 seconds (0 = static). Always set "shape" to "sphere".`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: `Theme: ${data.prompt}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (res.status === 429) throw new Error("Rate limit hit.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) throw new Error(`AI gateway error ${res.status}`);
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed: Ai3DScene;
    try { parsed = JSON.parse(content); } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI returned invalid JSON");
      parsed = JSON.parse(m[0]);
    }
    if (!Array.isArray(parsed.models)) throw new Error("Missing models array");
    // force sphere
    parsed.models = parsed.models.map((m) => ({ ...m, shape: "sphere" as const }));
    return parsed;
  });
