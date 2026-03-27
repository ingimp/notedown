"use client";

import { useEffect, useState } from "react";
import { LivePreview } from "@/components/live-preview";

export function WorkspaceClient({ initialMarkdown }: { initialMarkdown: string }) {
  const [markdown, setMarkdown] = useState(initialMarkdown);

  useEffect(() => {
    setMarkdown(initialMarkdown);
  }, [initialMarkdown]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <textarea
        name="markdown"
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        className="min-h-[70vh] w-full rounded-md border bg-white p-3 font-mono text-sm"
      />
      <LivePreview markdown={markdown} />
    </div>
  );
}
