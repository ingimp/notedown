"use client";

import { useEffect, useRef, useState } from "react";
import { DOCUMENT_SITE_CSS } from "@/core/notedown/site-theme";

export const LivePreview = ({
  markdown,
  publicationLike = false,
}: {
  markdown: string;
  publicationLike?: boolean;
}) => {
  const [html, setHtml] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastRenderedMarkdownRef = useRef<string | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (markdown === lastRenderedMarkdownRef.current) {
      return;
    }

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    setStatus("loading");
    setErrorMessage(null);

    const timeoutId = setTimeout(() => {
      (async () => {
        try {
          const response = await fetch("/api/render", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ markdown }),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(`Preview request failed (${response.status})`);
          }

          const payload = (await response.json()) as { html: string };
          if (requestId === requestIdRef.current) {
            setHtml(payload.html);
            setStatus("idle");
            lastRenderedMarkdownRef.current = markdown;
          }
        } catch (error) {
          if ((error as Error).name === "AbortError") {
            return;
          }
          if (requestId === requestIdRef.current) {
            setStatus("error");
            setErrorMessage("Unable to render preview right now.");
          }
        }
      })();
    }, 220);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [markdown]);

  return (
    <section className="space-y-2">
      {status === "loading" && <p className="text-xs text-slate-500">Rendering preview…</p>}
      {status === "error" && <p className="text-xs text-red-600">{errorMessage}</p>}
      {publicationLike ? (
        <>
          <style>{DOCUMENT_SITE_CSS}</style>
          <article className="max-h-[72vh] overflow-auto rounded-md border bg-white">
            <div className="nd-page">
              <article
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: html || "<p>Start typing to see a live preview.</p>" }}
              />
            </div>
          </article>
        </>
      ) : (
        <article
          className="prose max-w-none rounded-md bg-white p-4"
          dangerouslySetInnerHTML={{ __html: html || "<p>Start typing to see a live preview.</p>" }}
        />
      )}
    </section>
  );
};
