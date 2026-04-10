import type { RenderedSiteDoc } from "./types.ts";

export const buildPublicationMetadata = (input: { title: string; slug: string; username: string }) => ({
  formatVersion: "0.1",
  kind: "notedown-export",
  title: input.title,
  slug: input.slug,
  author: {
    username: input.username,
  },
  entrypoint: "index.html",
  documentsIndex: "documents.json",
});

export const buildDocumentsMetadata = (docs: Array<Pick<RenderedSiteDoc, "slug" | "title">>) => ({
  items: docs.map((doc, index) => ({
    slug: doc.slug,
    title: doc.title,
    path: `docs/${doc.slug}.html`,
    order: index + 1,
  })),
});
