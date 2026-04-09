"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildCreateDocumentApiPath, buildDocumentApiPath, buildEditorCollectionPath, buildEditorDocumentPath } from "@/core/notedown/paths";
import { extractH1 } from "@/core/notedown/slug";

type SaveState = "saved" | "saving" | "unsaved" | "error";

interface DocItem {
  slug: string;
  title: string;
  order: number;
  fileName: string;
}

interface Props {
  username: string;
  collectionSlug: string;
  collectionTitle: string;
  docs: DocItem[];
  activeSlug: string;
  initialMarkdown: string;
}

export function WorkspaceShell({
  username,
  collectionSlug,
  collectionTitle,
  docs: initialDocs,
  activeSlug,
  initialMarkdown,
}: Props) {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [addTitle, setAddTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const [content, setContent] = useState(initialMarkdown);
  const [rawHtml, setRawHtml] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [showPreview, setShowPreview] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const renderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const renderRequestIdRef = useRef(0);
  const currentDocRef = useRef(activeSlug);

  const renderContent = useCallback(async (md: string, slug: string) => {
    renderRequestIdRef.current += 1;
    const requestId = renderRequestIdRef.current;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: md }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (requestId === renderRequestIdRef.current && slug === currentDocRef.current) {
        setRawHtml(data.html ?? "");
      }
    } catch (e: unknown) {
      if ((e as Error)?.name !== "AbortError" && requestId === renderRequestIdRef.current && slug === currentDocRef.current) {
        setRawHtml("");
      }
    }
  }, []);

  useEffect(() => {
    setDocs(initialDocs);
  }, [initialDocs]);

  useEffect(() => {
    currentDocRef.current = activeSlug;
    setContent(initialMarkdown);
    setRawHtml("");
    setSaveState("saved");

    if (renderTimer.current) {
      clearTimeout(renderTimer.current);
      renderTimer.current = null;
    }
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (abortRef.current) abortRef.current.abort();

    if (activeSlug) renderContent(initialMarkdown, activeSlug);
  }, [activeSlug, initialMarkdown, initialDocs, renderContent]);

  useEffect(() => {
    return () => {
      if (renderTimer.current) clearTimeout(renderTimer.current);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const saveContent = useCallback(
    async (slug: string, md: string) => {
      if (!slug || slug !== currentDocRef.current) return;
      setSaveState("saving");
      try {
        const res = await fetch(buildDocumentApiPath(username, collectionSlug, slug), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown: md }),
        });
        const data = await res.json();
        if (slug !== currentDocRef.current) return;

        if (!res.ok) {
          setSaveState("error");
          return;
        }

        const nextSlug = data.slug as string;
        const nextTitle = data.title as string;
        const nextFileName = data.fileName as string;

        setDocs((prev) => prev.map((d) => (d.slug === slug ? { ...d, slug: nextSlug, title: nextTitle, fileName: nextFileName } : d)));
        setSaveState("saved");

        if (nextSlug !== slug) {
          currentDocRef.current = nextSlug;
          router.replace(buildEditorDocumentPath(username, collectionSlug, nextSlug));
        }
      } catch {
        if (slug === currentDocRef.current) setSaveState("error");
      }
    },
    [collectionSlug, router, username]
  );

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    setSaveState("unsaved");

    if (renderTimer.current) clearTimeout(renderTimer.current);
    const docSlug = currentDocRef.current;
    renderTimer.current = setTimeout(() => renderContent(value, docSlug), 300);

    const title = extractH1(value) || "Senza titolo";
    setDocs((prev) => prev.map((d) => (d.slug === currentDocRef.current ? { ...d, title } : d)));

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveContent(docSlug, value), 1500);
  }, [renderContent, saveContent]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveContent(currentDocRef.current, content);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [content, saveContent]);

  async function handleDeleteDoc(slug: string) {
    setDeletingSlug(slug);
    await fetch(buildDocumentApiPath(username, collectionSlug, slug), { method: "DELETE" });
    const remaining = docs.filter((d) => d.slug !== slug);
    setDocs(remaining);
    setConfirmDelete(null);
    setDeletingSlug(null);
    if (slug === activeSlug) {
      router.push(
        remaining.length > 0
          ? buildEditorDocumentPath(username, collectionSlug, remaining[0].slug)
          : buildEditorCollectionPath(username, collectionSlug)
      );
    }
  }

  async function handleAddDoc(e: React.FormEvent) {
    e.preventDefault();
    const title = addTitle.trim();
    if (!title) return;
    setAdding(true);
    const res = await fetch(buildCreateDocumentApiPath(username, collectionSlug), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, initialMarkdown: `# ${title}\n\nScrivi qui il contenuto.\n` }),
    });
    const data = await res.json();
    setAdding(false);
    if (!res.ok) {
      setSaveState("error");
      return;
    }
    setAddTitle("");
    if (data.slug) {
      setDocs((prev) => [...prev, { slug: data.slug, title, order: prev.length, fileName: data.fileName ?? "" }]);
      router.push(buildEditorDocumentPath(username, collectionSlug, data.slug));
    }
  }

  const activeDoc = docs.find((d) => d.slug === activeSlug);

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <button onClick={() => setSidebarOpen((v) => !v)} className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-5 h-10 bg-gh-canvas border border-gh-border rounded-r-gh text-gh-fg-muted hover:text-gh-fg hover:bg-gh-canvas-subtle transition-all shadow-gh-sm" style={{ left: sidebarOpen ? "207px" : "0px", transition: "left 0.2s ease" }} title={sidebarOpen ? "Chiudi sidebar" : "Apri sidebar"}>
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">{sidebarOpen ? <path d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z" /> : <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z" />}</svg>
      </button>

      <aside className="flex-shrink-0 bg-gh-canvas border-r border-gh-border transition-all duration-200 flex flex-col" style={{ width: sidebarOpen ? "208px" : "0px", overflow: "hidden" }}>
        <div style={{ width: "208px" } } className="flex flex-col h-full">
          <div className="px-3 pt-3 pb-2 flex-shrink-0"><p className="text-gh-xs font-semibold text-gh-fg-muted uppercase tracking-wider mb-1">Documenti</p><p className="text-gh-sm font-semibold text-gh-fg leading-tight">{collectionTitle}</p></div>
          <nav className="flex-1 overflow-y-auto">
            {docs.map((item, i) => {
              const isActive = item.slug === activeSlug;
              const isConfirming = confirmDelete === item.slug;
              const isDeleting = deletingSlug === item.slug;
              return (
                <div key={item.slug} className="group/row relative">
                  <Link href={buildEditorDocumentPath(username, collectionSlug, item.slug)} className={["flex items-start gap-1.5 pl-3 pr-8 py-2 text-gh-sm leading-snug transition-colors", isActive ? "bg-gh-accent-subtle text-gh-accent-fg font-semibold border-r-2 border-gh-accent" : "text-gh-fg-muted hover:text-gh-fg hover:bg-gh-canvas-subtle"].join(" ")}>
                    <span className="font-mono text-gh-xs text-gh-fg-subtle mt-0.5 flex-shrink-0 w-4">{i + 1}.</span>
                    <span className="truncate">{item.title}</span>
                  </Link>
                  {!isConfirming && <button onClick={() => setConfirmDelete(item.slug)} className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded text-gh-fg-subtle hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover/row:opacity-100" title="Elimina documento"><svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" /></svg></button>}
                  {isConfirming && <div className="absolute inset-0 flex items-center justify-end gap-1 pr-1.5 bg-red-50 border-r border-red-200 z-10"><span className="text-gh-xs text-red-700 font-semibold flex-1 pl-2 truncate">Eliminare?</span><button onClick={() => handleDeleteDoc(item.slug)} disabled={isDeleting} className="text-gh-xs font-bold text-white bg-red-600 hover:bg-red-700 px-1.5 py-0.5 rounded disabled:opacity-60">{isDeleting ? "…" : "Sì"}</button><button onClick={() => setConfirmDelete(null)} className="text-gh-xs font-semibold text-gh-fg-muted hover:text-gh-fg px-1 py-0.5 rounded">No</button></div>}
                </div>
              );
            })}
            {docs.length === 0 && <p className="px-3 py-2 text-gh-xs text-gh-fg-subtle">Nessun documento.</p>}
          </nav>
          <div className="border-t border-gh-border p-2 flex-shrink-0"><form onSubmit={handleAddDoc} className="flex items-center gap-1.5"><input value={addTitle} onChange={(e) => setAddTitle(e.target.value)} placeholder="Nuovo documento…" required className="flex-1 min-w-0 px-2 py-1.5 text-gh-xs bg-gh-canvas border border-gh-border rounded-gh focus:outline-none focus:border-gh-accent focus:ring-1 focus:ring-blue-300/40 transition-all" /><button type="submit" disabled={adding} className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-white bg-gh-success border border-green-600 rounded-gh hover:bg-green-700 transition-colors disabled:opacity-60 text-sm font-bold">{adding ? "…" : "+"}</button></form></div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">{!activeSlug ? <div className="flex-1 flex items-center justify-center text-gh-fg-muted text-gh-sm">Crea il tuo primo documento per iniziare a scrivere.</div> : <><div className="flex items-center justify-between px-4 py-2 bg-gh-canvas-subtle border-b border-gh-border flex-shrink-0 gap-2"><div className="flex items-center gap-3 min-w-0"><span className="font-mono text-gh-xs font-semibold text-gh-fg-muted uppercase tracking-wider hidden sm:inline truncate max-w-[180px]">{activeDoc?.title || "Markdown"}</span><span className="font-mono text-gh-xs text-gh-fg-subtle hidden lg:inline">· $…$ · $$…$$ · Cmd+S</span></div><div className="flex items-center gap-2 flex-shrink-0"><SaveIndicator state={saveState} /><button onClick={() => setShowPreview((v) => !v)} className={["flex items-center gap-1.5 px-2.5 py-1 text-gh-xs font-semibold rounded-gh border transition-colors", showPreview ? "bg-gh-accent-subtle text-gh-accent-fg border-gh-accent/30" : "bg-gh-canvas text-gh-fg-muted border-gh-border hover:bg-gh-canvas-subtle"].join(" ")}><svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M8 2C4.691 2 1.75 4.109 1.75 8S4.691 14 8 14s6.25-2.109 6.25-6S11.309 2 8 2Zm0 11C5.239 13 2.75 11.225 2.75 8S5.239 3 8 3s5.25 1.775 5.25 5S10.761 13 8 13Zm0-8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM5.5 8a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" /></svg><span className="hidden sm:inline">{showPreview ? "Preview on" : "Preview off"}</span></button></div></div><div className={`flex-1 overflow-hidden grid ${showPreview ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}><div className={`flex flex-col overflow-hidden ${showPreview ? "border-b md:border-b-0 md:border-r border-gh-border" : ""}`}><textarea ref={textareaRef} value={content} onChange={(e) => handleContentChange(e.target.value)} spellCheck={false} className="flex-1 w-full resize-none border-none outline-none bg-gh-canvas p-4 text-gh-fg leading-relaxed" style={{ tabSize: 2, fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace", fontSize: "13px", lineHeight: "1.75" }} placeholder={PLACEHOLDER} /></div>{showPreview && <div className="flex flex-col overflow-hidden bg-gh-canvas"><div ref={previewScrollRef} className="flex-1 overflow-auto p-6">{rawHtml ? <div className="prose" dangerouslySetInnerHTML={{ __html: rawHtml }} /> : <div className="h-full flex items-center justify-center text-gh-fg-subtle text-gh-sm">Inizia a scrivere per vedere l'anteprima</div>}</div></div>}</div></>}</div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const configs: Record<SaveState, { label: string; dot: string; text: string }> = {
    saved: { label: "Salvato", dot: "bg-green-500", text: "text-green-700" },
    saving: { label: "Salvataggio…", dot: "bg-yellow-400", text: "text-gh-fg-muted" },
    unsaved: { label: "Non salvato", dot: "bg-gh-fg-subtle", text: "text-gh-fg-muted" },
    error: { label: "Errore", dot: "bg-red-500", text: "text-red-600" },
  };
  const { label, dot, text } = configs[state];
  return (
    <span className={`flex items-center gap-1.5 font-mono text-gh-xs ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

const PLACEHOLDER = `# Titolo del documento

Scrivi in **Markdown** con supporto LaTeX completo.

## Sezione

Paragrafo con matematica inline $E = mc^2$.

**grassetto**, *corsivo*, \`codice inline\`

> Citazione in blocco

Salva con Cmd+S — autosalvataggio dopo 1.5 s.
`;
