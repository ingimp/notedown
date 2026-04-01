"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { SearchResult } from "@/app/api/search/route";

export function SearchModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Debounced search
  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setSelected(0);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (value.trim().length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    searchTimer.current = setTimeout(() => search(value), 200);
  }

  // Flatten results into navigable items
  const items = results.flatMap((r) =>
    r.matches.map((m, mi) => ({ result: r, match: m, matchIndex: mi }))
  );

  function navigate(idx: number) {
    const item = items[idx];
    if (!item) return;
    setOpen(false);
    const hl = encodeURIComponent(query.trim());
    router.push(`/collections/${item.result.collectionId}?doc=${item.result.docSlug}&hl=${hl}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, items.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter")     { e.preventDefault(); navigate(selected); }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gh-fg/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl bg-gh-canvas border border-gh-border rounded-gh shadow-gh-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gh-border">
          <svg className="w-4 h-4 text-gh-fg-muted flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Cerca in tutte le raccolte…"
            className="flex-1 bg-transparent outline-none text-gh-md text-gh-fg placeholder:text-gh-fg-subtle"
          />
          {loading && (
            <span className="font-mono text-gh-xs text-gh-fg-subtle flex-shrink-0">ricerca…</span>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-gh-xs font-mono text-gh-fg-subtle bg-gh-canvas-subtle border border-gh-border rounded">
            Esc
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-[60vh] overflow-y-auto">
            {results.map((result) => (
              <div key={`${result.collectionId}-${result.docSlug}`}>
                {/* Doc header */}
                <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                  <svg className="w-3.5 h-3.5 text-gh-fg-muted flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688Z"/>
                  </svg>
                  <span className="text-gh-xs font-semibold text-gh-fg truncate">{result.docTitle}</span>
                  <span className="text-gh-xs text-gh-fg-muted mx-1">·</span>
                  <span className="text-gh-xs text-gh-fg-muted truncate">{result.collectionTitle}</span>
                </div>

                {/* Match snippets */}
                {result.matches.map((match, mi) => {
                  const globalIdx = items.findIndex(
                    (it) => it.result.docSlug === result.docSlug &&
                             it.result.collectionId === result.collectionId &&
                             it.matchIndex === mi
                  );
                  const isSelected = globalIdx === selected;
                  return (
                    <button
                      key={mi}
                      onClick={() => navigate(globalIdx)}
                      onMouseEnter={() => setSelected(globalIdx)}
                      className={[
                        "w-full text-left px-4 py-2 text-gh-sm transition-colors flex items-start gap-2",
                        isSelected ? "bg-gh-accent-subtle" : "hover:bg-gh-canvas-subtle",
                      ].join(" ")}
                    >
                      <span className="font-mono text-gh-xs text-gh-fg-subtle mt-0.5 flex-shrink-0">¶</span>
                      <span className="text-gh-fg-muted leading-relaxed">
                        {match.before}
                        <mark className="bg-yellow-200 text-gh-fg font-semibold rounded px-0.5">
                          {match.term}
                        </mark>
                        {match.after}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && query.trim().length >= 2 && results.length === 0 && (
          <div className="px-4 py-8 text-center text-gh-fg-muted text-gh-sm">
            Nessun risultato per <span className="font-semibold text-gh-fg">"{query}"</span>
          </div>
        )}

        {/* Hint when empty */}
        {query.trim().length < 2 && (
          <div className="px-4 py-4 flex items-center justify-between text-gh-xs text-gh-fg-subtle border-t border-gh-border">
            <span>Cerca parole, titoli, equazioni LaTeX…</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono bg-gh-canvas-subtle border border-gh-border rounded">↑↓</kbd>
                naviga
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-mono bg-gh-canvas-subtle border border-gh-border rounded">↵</kbd>
                apri
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
