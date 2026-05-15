import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useEditor } from "@/store/editor";
import {
  Undo2, Redo2, Trash2, Download, Play, Zap, Save, Cloud,
  FolderOpen, LogOut, FilePlus, Loader2, User as UserIcon, ChevronDown,
} from "lucide-react";
import { useAuth, signOut } from "@/hooks/use-auth";
import { saveDesign } from "@/lib/designs";
import { MyDesignsDialog } from "./MyDesignsDialog";
import { exportPNG, exportPDF, exportPPTX, exportVideo } from "@/lib/export";

export function Toolbar() {
  const {
    undo, redo, clear, setPresenting,
    designId, designName, setDesignName, setDesignMeta, newDesign,
  } = useEditor();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 2500);
    return () => clearTimeout(t);
  }, [savedAt]);

  const [exporting, setExporting] = useState<null | "png" | "pdf" | "pptx" | "mp4">(null);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const runExport = async (kind: "png" | "pdf" | "pptx" | "mp4") => {
    setExportOpen(false);
    setExporting(kind);
    try {
      const n = designName || "positron";
      if (kind === "png") await exportPNG(n);
      else if (kind === "pdf") await exportPDF(n);
      else if (kind === "pptx") await exportPPTX(n);
      else {
        const { ext } = await exportVideo(n);
        if (ext === "webm") {
          alert("Your browser couldn't encode MP4 directly — saved as .webm (same content). Use Chrome/Edge for native .mp4.");
        }
      }
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Export failed");
    } finally {
      setExporting(null);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { pages, canvasW, canvasH } = useEditor.getState();
      const saved = await saveDesign({
        id: designId,
        name: designName || "Untitled design",
        canvas_w: canvasW,
        canvas_h: canvasH,
        pages,
      });
      setDesignMeta({ id: saved.id, name: saved.name });
      setSavedAt(Date.now());
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <header className="relative flex items-center justify-between gap-4 border-b border-teal/40 bg-ink px-5 py-3">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal to-transparent opacity-80" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center bg-blue-deep brutal-border glow-blue">
            <Zap className="h-5 w-5 text-teal" strokeWidth={2.5} fill="currentColor" />
          </div>
          <div className="font-display text-xl tracking-[0.18em] text-teal text-glow">
            POSITRON<span className="text-blue text-glow-blue">//</span>STUDIO
          </div>
          <span className="hidden md:inline-block bg-teal/15 px-2 py-0.5 font-mono text-[10px] tracking-widest text-teal border border-teal/40">
            v2.0_NEO
          </span>
        </div>
        <div className="ml-4 hidden items-center gap-2 md:flex">
          <input
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            className="brutal-border-2 bg-surface px-3 py-1.5 font-mono text-xs text-teal focus:outline-none focus:border-teal focus:bg-surface-2"
          />
          {savedAt && (
            <span className="font-mono text-[10px] text-teal/70">✓ saved</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <IconBtn onClick={undo} title="Undo">
          <Undo2 className="h-4 w-4" strokeWidth={2.5} />
        </IconBtn>
        <IconBtn onClick={redo} title="Redo">
          <Redo2 className="h-4 w-4" strokeWidth={2.5} />
        </IconBtn>
        <IconBtn onClick={clear} title="Clear">
          <Trash2 className="h-4 w-4" strokeWidth={2.5} />
        </IconBtn>

        {user ? (
          <>
            <IconBtn onClick={newDesign} title="New design">
              <FilePlus className="h-4 w-4" strokeWidth={2.5} />
            </IconBtn>
            <IconBtn onClick={() => setOpen(true)} title="My designs">
              <FolderOpen className="h-4 w-4" strokeWidth={2.5} />
            </IconBtn>
            <button
              onClick={handleSave}
              disabled={saving}
              className="brutal-border brutal-press flex items-center gap-2 bg-surface px-4 py-2 font-display text-xs tracking-[0.2em] text-teal hover:bg-teal/10 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" strokeWidth={3} />
              )}
              SAVE
            </button>
            <UserMenu email={user.email ?? ""} />
          </>
        ) : (
          <Link
            to="/auth"
            className="brutal-border brutal-press flex items-center gap-2 bg-surface px-4 py-2 font-display text-xs tracking-[0.2em] text-teal hover:bg-teal/10"
          >
            <Cloud className="h-3.5 w-3.5" strokeWidth={3} />
            SIGN IN
          </Link>
        )}

        <button
          onClick={() => setPresenting(true)}
          className="brutal-border brutal-press flex items-center gap-2 bg-surface px-4 py-2 font-display text-xs tracking-[0.2em] text-teal hover:bg-teal/10"
        >
          <Play className="h-3.5 w-3.5 fill-teal" strokeWidth={3} />
          PRESENT
        </button>
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setExportOpen((v) => !v)}
            disabled={!!exporting}
            className="brutal-border brutal-shadow-sm brutal-press flex items-center gap-2 bg-blue px-4 py-2 font-display text-xs tracking-[0.2em] text-ink disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={3} />
            ) : (
              <Download className="h-3.5 w-3.5" strokeWidth={3} />
            )}
            {exporting ? exporting.toUpperCase() : "EXPORT"}
            <ChevronDown className="h-3 w-3" strokeWidth={3} />
          </button>
          {exportOpen && (
            <div className="brutal-border-2 absolute right-0 top-12 z-50 w-52 bg-ink p-1">
              {(["png", "pdf", "pptx", "mp4"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => runExport(k)}
                  className="flex w-full items-center justify-between px-3 py-2 font-display text-[11px] tracking-[0.2em] text-teal hover:bg-surface"
                >
                  <span>EXPORT .{k.toUpperCase()}</span>
                  <span className="font-mono text-[9px] text-teal/60">
                    {k === "png" ? "current" : k === "mp4" ? "video" : "all pages"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {open && <MyDesignsDialog onClose={() => setOpen(false)} />}
    </header>
  );
}

function UserMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={email}
        className="brutal-border-2 brutal-press grid h-10 w-10 place-items-center bg-blue-deep text-teal glow-blue"
      >
        <UserIcon className="h-4 w-4" strokeWidth={2.5} />
      </button>
      {open && (
        <div
          className="brutal-border-2 absolute right-0 top-12 z-50 w-56 bg-ink p-2"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="border-b border-teal/30 px-2 py-1.5 font-mono text-[10px] text-teal/70 truncate">
            {email}
          </div>
          <button
            onClick={() => signOut()}
            className="mt-1 flex w-full items-center gap-2 px-2 py-1.5 font-display text-[11px] tracking-[0.2em] text-teal hover:bg-surface"
          >
            <LogOut className="h-3.5 w-3.5" /> SIGN OUT
          </button>
        </div>
      )}
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="brutal-border-2 brutal-press grid h-10 w-10 place-items-center bg-surface text-teal hover:bg-surface-2 hover:text-teal hover:border-teal"
    >
      {children}
    </button>
  );
}
