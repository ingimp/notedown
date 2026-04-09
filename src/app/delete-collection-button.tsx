"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { buildCollectionApiPath } from "@/core/notedown/paths";

interface Props {
  username: string;
  collectionSlug: string;
  collectionTitle: string;
}

export function DeleteCollectionButton({ username, collectionSlug, collectionTitle }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(buildCollectionApiPath(username, collectionSlug), { method: "DELETE" });
      router.refresh();
    } catch {
      setDeleting(false);
      setConfirm(false);
    }
  }

  if (!confirm) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          setConfirm(true);
        }}
        className="flex items-center gap-1 px-2 py-1 text-gh-xs font-semibold text-gh-fg-muted border border-transparent rounded-gh hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors opacity-0 group-hover:opacity-100"
        title={`Elimina "${collectionTitle}"`}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
          <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15ZM6.5 1.75V3h3V1.75a.25.25 0 0 0-.25-.25h-2.5a.25.25 0 0 0-.25.25Z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 bg-red-50 border border-red-300 rounded-gh px-2 py-1" onClick={(e) => e.preventDefault()}>
      <span className="text-gh-xs text-red-700 font-semibold">Eliminare?</span>
      <button onClick={handleDelete} disabled={deleting} className="text-gh-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-2 py-0.5 rounded transition-colors disabled:opacity-60">
        {deleting ? "…" : "Sì"}
      </button>
      <button onClick={() => setConfirm(false)} className="text-gh-xs font-semibold text-gh-fg-muted hover:text-gh-fg px-1 py-0.5 rounded transition-colors">
        No
      </button>
    </div>
  );
}
