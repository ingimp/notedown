"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { LivePreview } from "@/components/live-preview";

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

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

  const statusText = useMemo(() => {
    if (isManualSaving) return "Saving manually…";
    switch (saveState) {
      case "dirty":
        return "Unsaved changes";
      case "saving":
        return "Autosaving…";
      case "saved":
        return lastSavedAt ? `Saved at ${new Date(lastSavedAt).toLocaleTimeString()}` : "Saved";
      case "error":
        return "Autosave failed — use Save now";
      default:
        return "All changes saved";
    }
  }, [isManualSaving, lastSavedAt, saveState]);

  const manualSave = (formData: FormData) => {
    formData.set("markdown", markdown);
    startManualSaveTransition(async () => {
      await onSave(formData);
      lastSavedMarkdownRef.current = markdown;
      setSaveState("saved");
      setLastSavedAt(new Date().toISOString());
    });
  };

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">{statusText}</p>
        <form action={manualSave}>
          <button
            type="submit"
            className="rounded bg-blue-700 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={isManualSaving}
          >
            Save now
          </button>
        </form>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <textarea
          name="markdown"
          value={markdown}
          onChange={(event) => setMarkdown(event.target.value)}
          className="min-h-[72vh] w-full rounded-md border bg-slate-50 p-4 font-mono text-sm leading-6"
          spellCheck={false}
        />
        <LivePreview markdown={markdown} publicationLike />
      </div>
    </section>
  );
}
