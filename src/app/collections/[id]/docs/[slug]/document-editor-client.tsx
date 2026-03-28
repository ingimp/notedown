"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { LivePreview } from "@/components/live-preview";

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const STATUS_LABELS: Record<SaveState, string> = {
  idle: "Saved",
  dirty: "Unsaved changes",
  saving: "Saving...",
  saved: "Saved",
  error: "Error",
};

export function DocumentEditorClient({
  collectionId,
  slug,
  initialMarkdown,
  onSave,
}: {
  collectionId: string;
  slug: string;
  initialMarkdown: string;
  onSave: (formData: FormData) => Promise<void>;
}) {
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isManualSaving, startManualSaveTransition] = useTransition();

  const lastSavedMarkdownRef = useRef(initialMarkdown);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRequestIdRef = useRef(0);

  useEffect(() => {
    setMarkdown(initialMarkdown);
    setSaveState("idle");
    setLastSavedAt(null);
    lastSavedMarkdownRef.current = initialMarkdown;
  }, [initialMarkdown, slug]);

  useEffect(() => {
    if (markdown === lastSavedMarkdownRef.current) {
      if (saveState !== "idle" && saveState !== "saved") {
        setSaveState("idle");
      }
      return;
    }

    setSaveState((current) => (current === "saving" ? current : "dirty"));

    if (pendingTimerRef.current) {
      clearTimeout(pendingTimerRef.current);
    }

    pendingTimerRef.current = setTimeout(async () => {
      const requestId = ++saveRequestIdRef.current;
      setSaveState("saving");

      try {
        const response = await fetch(`/api/collections/${collectionId}/docs/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ markdown }),
        });

        if (!response.ok) {
          throw new Error(`Autosave failed (${response.status})`);
        }

        const payload = (await response.json()) as { updatedAt: string };

        if (requestId === saveRequestIdRef.current) {
          lastSavedMarkdownRef.current = markdown;
          setSaveState("saved");
          setLastSavedAt(payload.updatedAt);
        }
      } catch {
        if (requestId === saveRequestIdRef.current) {
          setSaveState("error");
        }
      }
    }, 800);

    return () => {
      if (pendingTimerRef.current) {
        clearTimeout(pendingTimerRef.current);
      }
    };
  }, [collectionId, markdown, saveState, slug]);

  const effectiveState: SaveState = isManualSaving ? "saving" : saveState;

  const statusDetail = useMemo(() => {
    if (effectiveState === "saved" || effectiveState === "idle") {
      return lastSavedAt ? `Last saved at ${new Date(lastSavedAt).toLocaleTimeString()}` : "All changes are saved";
    }

    if (effectiveState === "dirty") {
      return "Changes detected. Autosave will run shortly.";
    }

    if (effectiveState === "error") {
      return "Autosave failed. You can retry with Save now.";
    }

    return "Saving latest changes…";
  }, [effectiveState, lastSavedAt]);

  const statusTone =
    effectiveState === "error"
      ? "text-red-700 bg-red-50 border-red-200"
      : effectiveState === "saving"
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : effectiveState === "dirty"
          ? "text-slate-700 bg-slate-100 border-slate-200"
          : "text-emerald-700 bg-emerald-50 border-emerald-200";

  const manualSave = (formData: FormData) => {
    formData.set("markdown", markdown);
    startManualSaveTransition(async () => {
      try {
        await onSave(formData);
        lastSavedMarkdownRef.current = markdown;
        setSaveState("saved");
        setLastSavedAt(new Date().toISOString());
      } catch {
        setSaveState("error");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Document status</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusTone}`}>
              {STATUS_LABELS[effectiveState]}
            </span>
            {effectiveState === "saving" ? <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" /> : null}
          </div>
          <p className="mt-2 text-sm text-slate-600">{statusDetail}</p>
        </div>

        <form action={manualSave}>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isManualSaving || effectiveState === "saving"}
            aria-busy={isManualSaving}
          >
            {isManualSaving ? "Saving..." : "Save now"}
          </button>
        </form>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Editor</p>
          <textarea
            name="markdown"
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            className="min-h-[74vh] w-full rounded-xl border border-slate-200 bg-white p-5 font-mono text-sm leading-7 text-slate-900 shadow-inner outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            spellCheck={false}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Live preview</p>
          <LivePreview markdown={markdown} publicationLike />
        </div>
      </div>
    </section>
  );
}
