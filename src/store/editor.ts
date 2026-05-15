import { create } from "zustand";

export type ElementBase = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export type TextElement = ElementBase & {
  type: "text";
  text: string;
  fontSize: number;
  color: string;
  fontWeight: number;
  fontFamily: string;
  align: "left" | "center" | "right";
  italic?: boolean;
  underline?: boolean;
  bullet?: boolean;
  href?: string;
};

export type ShapeKind = "rect" | "circle" | "triangle" | "star" | "arrow";
export type ShapeEffect = "none" | "liquid_glass" | "neon" | "soft_shadow" | "inner_glow";
export type ElementShadow = {
  x: number;
  y: number;
  blur: number;
  color: string;
};
export type ShapeElement = ElementBase & {
  type: "shape";
  shape: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  effect?: ShapeEffect;
  shadow?: ElementShadow;
};

export type ImageFilters = {
  brightness: number; // %
  contrast: number; // %
  saturate: number; // %
  blur: number; // px
  grayscale: number; // %
  sepia: number; // %
  hueRotate: number; // deg
  invert: number; // %
};

export const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  invert: 0,
};

export type ImageElement = ElementBase & {
  type: "image";
  src: string;
  filters?: ImageFilters;
  shadow?: ElementShadow;
};

export type IconElement = ElementBase & {
  type: "icon";
  name: string; // lucide icon name in PascalCase
  color: string;
  strokeWidth: number;
};

export type Model3DKind = "sphere";
export type Model3DElement = ElementBase & {
  type: "model3d";
  shape: Model3DKind;
  color: string;
  spinSpeed: number; // seconds per full revolution; 0 = static
  tiltX: number; // deg
  tiltY: number; // deg
};

export type AnyElement = TextElement | ShapeElement | ImageElement | IconElement | Model3DElement;

export type Page = {
  id: string;
  elements: AnyElement[];
  bgColor: string;
  duration: number; // seconds
};

export const DEFAULT_W = 1920;
export const DEFAULT_H = 1080;
const DEFAULT_BG = "#fafaf2";
export const DEFAULT_PAGE_DURATION = 3;

export const CANVAS_PRESETS = [
  { name: "Square", w: 1080, h: 1080 },
  { name: "Story", w: 1080, h: 1920 },
  { name: "Post 4:5", w: 1080, h: 1350 },
  { name: "Landscape", w: 1920, h: 1080 },
  { name: "A4", w: 1240, h: 1754 },
  { name: "Slide 16:9", w: 1920, h: 1080 },
] as const;

type Tool = "templates" | "text" | "shapes" | "uploads" | "color" | "size" | "icons" | "3d";

type HistorySnap = { pages: Page[]; currentIndex: number };

type State = {
  pages: Page[];
  currentIndex: number;
  // derived mirror of current page (kept in sync)
  elements: AnyElement[];
  bgColor: string;
  selectedId: string | null;
  tool: Tool;
  canvasW: number;
  canvasH: number;
  history: HistorySnap[];
  future: HistorySnap[];
  presenting: boolean;
  // cloud-saved design metadata
  designId: string | null;
  designName: string;
  setTool: (t: Tool) => void;
  select: (id: string | null) => void;
  add: (el: AnyElement) => void;
  update: (id: string, patch: Partial<AnyElement>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  setBg: (c: string) => void;
  setCanvasSize: (w: number, h: number) => void;
  setPresenting: (v: boolean) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  loadTemplate: (els: AnyElement[], bg?: string) => void;
  // pages
  addPage: () => void;
  removePage: (index: number) => void;
  duplicatePage: (index: number) => void;
  setCurrentPage: (index: number) => void;
  movePage: (from: number, to: number) => void;
  setPageDuration: (index: number, seconds: number) => void;
  // cloud
  setDesignMeta: (meta: { id: string | null; name: string }) => void;
  setDesignName: (name: string) => void;
  loadDesign: (input: { id: string; name: string; pages: Page[]; canvasW: number; canvasH: number }) => void;
  newDesign: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export const newText = (overrides: Partial<TextElement> = {}): TextElement => ({
  id: uid(),
  type: "text",
  x: 120,
  y: 120,
  width: 520,
  height: 120,
  rotation: 0,
  text: "Edit me",
  fontSize: 72,
  color: "#0a0f1f",
  fontWeight: 900,
  fontFamily: "Archivo Black",
  align: "left",
  ...overrides,
});

export const newShape = (
  shape: ShapeKind,
  overrides: Partial<ShapeElement> = {},
): ShapeElement => ({
  id: uid(),
  type: "shape",
  x: 200,
  y: 200,
  width: 320,
  height: 320,
  rotation: 0,
  shape,
  fill: "#ffd84a",
  stroke: "#0a0f1f",
  strokeWidth: 6,
  ...overrides,
});

export const newImage = (src: string, overrides: Partial<ImageElement> = {}): ImageElement => ({
  id: uid(),
  type: "image",
  x: 200,
  y: 200,
  width: 480,
  height: 480,
  rotation: 0,
  src,
  ...overrides,
});

export const newIcon = (name: string, overrides: Partial<IconElement> = {}): IconElement => ({
  id: uid(),
  type: "icon",
  x: 240,
  y: 240,
  width: 240,
  height: 240,
  rotation: 0,
  name,
  color: "#0a0f1f",
  strokeWidth: 2,
  ...overrides,
});

export const newModel3D = (
  shape: Model3DKind,
  overrides: Partial<Model3DElement> = {},
): Model3DElement => ({
  id: uid(),
  type: "model3d",
  x: 240,
  y: 240,
  width: 320,
  height: 320,
  rotation: 0,
  shape,
  color: "#4d7cff",
  spinSpeed: 8,
  tiltX: -20,
  tiltY: 25,
  ...overrides,
});

const newPage = (overrides: Partial<Page> = {}): Page => ({
  id: uid(),
  elements: [],
  bgColor: DEFAULT_BG,
  duration: DEFAULT_PAGE_DURATION,
  ...overrides,
});

const initialPage = newPage();

export const useEditor = create<State>((set, get) => {
  const snap = (): HistorySnap => ({
    pages: JSON.parse(JSON.stringify(get().pages)),
    currentIndex: get().currentIndex,
  });
  const pushHistory = () => {
    set({ history: [...get().history, snap()].slice(-50), future: [] });
  };
  const syncCurrent = (pages: Page[], currentIndex: number) => {
    const p = pages[currentIndex];
    return { pages, currentIndex, elements: p.elements, bgColor: p.bgColor };
  };
  const updateCurrentPage = (mut: (p: Page) => Page) => {
    const { pages, currentIndex } = get();
    const next = pages.map((p, i) => (i === currentIndex ? mut(p) : p));
    set(syncCurrent(next, currentIndex));
  };

  return {
    pages: [initialPage],
    currentIndex: 0,
    elements: initialPage.elements,
    bgColor: initialPage.bgColor,
    selectedId: null,
    tool: "templates",
    canvasW: DEFAULT_W,
    canvasH: DEFAULT_H,
    history: [],
    future: [],
    presenting: false,
    designId: null,
    designName: "untitled.design",

    setTool: (tool) => set({ tool }),
    setCanvasSize: (canvasW, canvasH) => set({ canvasW, canvasH }),
    setPresenting: (presenting) => set({ presenting }),
    select: (selectedId) => set({ selectedId }),

    add: (el) => {
      pushHistory();
      updateCurrentPage((p) => ({ ...p, elements: [...p.elements, el] }));
      set({ selectedId: el.id });
    },
    update: (id, patch) =>
      updateCurrentPage((p) => ({
        ...p,
        elements: p.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as AnyElement) : e)),
      })),
    remove: (id) => {
      pushHistory();
      updateCurrentPage((p) => ({ ...p, elements: p.elements.filter((e) => e.id !== id) }));
      if (get().selectedId === id) set({ selectedId: null });
    },
    duplicate: (id) => {
      const el = get().elements.find((e) => e.id === id);
      if (!el) return;
      pushHistory();
      const clone = { ...el, id: uid(), x: el.x + 30, y: el.y + 30 } as AnyElement;
      updateCurrentPage((p) => ({ ...p, elements: [...p.elements, clone] }));
      set({ selectedId: clone.id });
    },
    bringForward: (id) => {
      updateCurrentPage((p) => {
        const arr = [...p.elements];
        const i = arr.findIndex((e) => e.id === id);
        if (i < 0 || i === arr.length - 1) return p;
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        return { ...p, elements: arr };
      });
    },
    sendBackward: (id) => {
      updateCurrentPage((p) => {
        const arr = [...p.elements];
        const i = arr.findIndex((e) => e.id === id);
        if (i <= 0) return p;
        [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
        return { ...p, elements: arr };
      });
    },
    setBg: (bgColor) => {
      pushHistory();
      updateCurrentPage((p) => ({ ...p, bgColor }));
    },
    undo: () => {
      const { history, future } = get();
      if (history.length === 0) return;
      const prev = history[history.length - 1];
      set({
        ...syncCurrent(prev.pages, Math.min(prev.currentIndex, prev.pages.length - 1)),
        history: history.slice(0, -1),
        future: [snap(), ...future].slice(0, 50),
        selectedId: null,
      });
    },
    redo: () => {
      const { future, history } = get();
      if (future.length === 0) return;
      const [next, ...rest] = future;
      set({
        ...syncCurrent(next.pages, Math.min(next.currentIndex, next.pages.length - 1)),
        future: rest,
        history: [...history, snap()].slice(-50),
        selectedId: null,
      });
    },
    clear: () => {
      pushHistory();
      updateCurrentPage((p) => ({ ...p, elements: [] }));
      set({ selectedId: null });
    },
    loadTemplate: (els, bg) => {
      pushHistory();
      updateCurrentPage((p) => ({ ...p, elements: els, bgColor: bg ?? p.bgColor }));
      set({ selectedId: null });
    },

    addPage: () => {
      pushHistory();
      const { pages, currentIndex, bgColor } = get();
      const created = newPage({ bgColor });
      const next = [...pages.slice(0, currentIndex + 1), created, ...pages.slice(currentIndex + 1)];
      set({ ...syncCurrent(next, currentIndex + 1), selectedId: null });
    },
    removePage: (index) => {
      const { pages, currentIndex } = get();
      if (pages.length <= 1) return;
      pushHistory();
      const next = pages.filter((_, i) => i !== index);
      const newIdx = Math.min(currentIndex > index ? currentIndex - 1 : currentIndex, next.length - 1);
      set({ ...syncCurrent(next, newIdx), selectedId: null });
    },
    duplicatePage: (index) => {
      pushHistory();
      const { pages } = get();
      const src = pages[index];
      const clone: Page = {
        id: uid(),
        bgColor: src.bgColor,
        duration: src.duration,
        elements: src.elements.map((e) => ({ ...e, id: uid() })),
      };
      const next = [...pages.slice(0, index + 1), clone, ...pages.slice(index + 1)];
      set({ ...syncCurrent(next, index + 1), selectedId: null });
    },
    setCurrentPage: (index) => {
      const { pages } = get();
      if (index < 0 || index >= pages.length) return;
      set({ ...syncCurrent(pages, index), selectedId: null });
    },
    movePage: (from, to) => {
      const { pages, currentIndex } = get();
      if (from === to || from < 0 || to < 0 || from >= pages.length || to >= pages.length) return;
      pushHistory();
      const arr = [...pages];
      const [m] = arr.splice(from, 1);
      arr.splice(to, 0, m);
      const newIdx = currentIndex === from ? to : currentIndex;
      set(syncCurrent(arr, newIdx));
    },
    setPageDuration: (index, seconds) => {
      const { pages, currentIndex } = get();
      if (index < 0 || index >= pages.length) return;
      const d = Math.max(0.2, Math.min(60, seconds));
      const next = pages.map((p, i) => (i === index ? { ...p, duration: d } : p));
      set(syncCurrent(next, currentIndex));
    },

    setDesignMeta: ({ id, name }) => set({ designId: id, designName: name }),
    setDesignName: (designName) => set({ designName }),
    loadDesign: ({ id, name, pages, canvasW, canvasH }) => {
      const normalized = pages.map((p) => ({ ...p, duration: p.duration ?? DEFAULT_PAGE_DURATION }));
      const safePages = normalized.length > 0 ? normalized : [newPage()];
      set({
        ...syncCurrent(safePages, 0),
        canvasW,
        canvasH,
        designId: id,
        designName: name,
        history: [],
        future: [],
        selectedId: null,
      });
    },
    newDesign: () => {
      const fresh = newPage();
      set({
        ...syncCurrent([fresh], 0),
        canvasW: DEFAULT_W,
        canvasH: DEFAULT_H,
        designId: null,
        designName: "untitled.design",
        history: [],
        future: [],
        selectedId: null,
      });
    },
  };
});
