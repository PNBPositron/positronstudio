import { toPng } from "html-to-image";
import { useEditor } from "@/store/editor";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function captureAllPages(): Promise<string[]> {
  const { pages, currentIndex, setCurrentPage, canvasW, canvasH, select } = useEditor.getState();
  select(null);
  const original = currentIndex;
  const shots: string[] = [];
  for (let i = 0; i < pages.length; i++) {
    setCurrentPage(i);
    // wait for React paint + scale fit
    await wait(120);
    const node = document.getElementById("canvas-export");
    if (!node) continue;
    const dataUrl = await toPng(node, {
      width: canvasW,
      height: canvasH,
      pixelRatio: 2,
      style: { transform: "none", left: "0", top: "0", margin: "0" },
    });
    shots.push(dataUrl);
  }
  setCurrentPage(original);
  return shots;
}

export async function exportPNG(name: string) {
  const { canvasW, canvasH } = useEditor.getState();
  useEditor.getState().select(null);
  await wait(50);
  const node = document.getElementById("canvas-export");
  if (!node) return;
  const dataUrl = await toPng(node, {
    width: canvasW,
    height: canvasH,
    pixelRatio: 2,
    style: { transform: "none", left: "0", top: "0", margin: "0" },
  });
  const link = document.createElement("a");
  link.download = `${name || "positron"}-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();
}

export async function exportPDF(name: string) {
  const { canvasW, canvasH } = useEditor.getState();
  const shots = await captureAllPages();
  if (shots.length === 0) return;
  const { jsPDF } = await import("jspdf");
  const orientation = canvasW >= canvasH ? "landscape" : "portrait";
  const pdf = new jsPDF({ orientation, unit: "px", format: [canvasW, canvasH] });
  shots.forEach((src, i) => {
    if (i > 0) pdf.addPage([canvasW, canvasH], orientation);
    pdf.addImage(src, "PNG", 0, 0, canvasW, canvasH);
  });
  pdf.save(`${name || "positron"}-${Date.now()}.pdf`);
}

export async function exportPPTX(name: string) {
  const { canvasW, canvasH } = useEditor.getState();
  const shots = await captureAllPages();
  if (shots.length === 0) return;
  const PptxGenJS = (await import("pptxgenjs")).default;
  const pptx = new PptxGenJS();
  // Slide size in inches at 96dpi
  const wIn = canvasW / 96;
  const hIn = canvasH / 96;
  pptx.defineLayout({ name: "POS", width: wIn, height: hIn });
  pptx.layout = "POS";
  shots.forEach((src) => {
    const slide = pptx.addSlide();
    slide.addImage({ data: src, x: 0, y: 0, w: wIn, h: hIn });
  });
  await pptx.writeFile({ fileName: `${name || "positron"}-${Date.now()}.pptx` });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function pickMimeType(): { mime: string; ext: "mp4" | "webm" } {
  const mp4Candidates = [
    'video/mp4;codecs=avc1.42E01E',
    'video/mp4;codecs=h264',
    'video/mp4',
  ];
  for (const m of mp4Candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) {
      return { mime: m, ext: "mp4" };
    }
  }
  const webm = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ];
  for (const m of webm) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) {
      return { mime: m, ext: "webm" };
    }
  }
  return { mime: 'video/webm', ext: "webm" };
}

export async function exportVideo(
  name: string,
  onProgress?: (msg: string) => void,
): Promise<{ ext: "mp4" | "webm" }> {
  const state = useEditor.getState();
  const { pages, canvasW, canvasH } = state;
  if (pages.length === 0) throw new Error("No pages");

  onProgress?.("rendering pages…");
  const shots = await captureAllPages();
  if (shots.length === 0) throw new Error("Capture failed");

  onProgress?.("loading frames…");
  const images = await Promise.all(shots.map(loadImage));

  // Cap output dimensions for performance / encoder limits
  const MAX = 1920;
  const scale = Math.min(1, MAX / Math.max(canvasW, canvasH));
  const W = Math.round(canvasW * scale);
  const H = Math.round(canvasH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  const fps = 30;
  const stream = canvas.captureStream(fps);
  const { mime, ext } = pickMimeType();

  const recorder = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: 6_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  const done = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
  });

  recorder.start();
  // initial frame
  ctx.fillStyle = pages[0].bgColor;
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(images[0], 0, 0, W, H);

  onProgress?.("recording…");
  const startedAt = performance.now();
  let pageIdx = 0;
  let pageStart = startedAt;

  // animation loop drawing frames in real time
  await new Promise<void>((resolve) => {
    const tick = () => {
      const now = performance.now();
      const pageElapsed = (now - pageStart) / 1000;
      if (pageElapsed >= pages[pageIdx].duration) {
        pageIdx += 1;
        pageStart = now;
        if (pageIdx >= pages.length) { resolve(); return; }
      }
      ctx.fillStyle = pages[pageIdx].bgColor;
      ctx.fillRect(0, 0, W, H);
      ctx.drawImage(images[pageIdx], 0, 0, W, H);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  // ensure final frame is captured
  await new Promise((r) => setTimeout(r, 200));
  recorder.stop();
  const blob = await done;

  onProgress?.("saving…");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name || "positron"}-${Date.now()}.${ext}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { ext };
}
