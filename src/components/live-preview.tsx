"use client";

import { useEffect, useState } from "react";

export const LivePreview = ({ markdown }: { markdown: string }) => {
  const [html, setHtml] = useState<string>("<p>Loading preview...</p>");

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
        signal: controller.signal
      });

      if (response.ok) {
        const payload = (await response.json()) as { html: string };
        setHtml(payload.html);
      }
    }, 150);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [markdown]);

  return <article className="prose max-w-none rounded-md bg-white p-4" dangerouslySetInnerHTML={{ __html: html }} />;
};
