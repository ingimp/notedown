import type { RenderedSiteDoc } from "./types.ts";

export const buildPublicationMetadata = (input: {
  title: string;
  slug: string;
  username: string;
  generatedAt: string;
}) => ({
  formatVersion: "0.1",
  kind: "publication",
  title: input.title,
  slug: input.slug,
  author: {
    username: input.username,
  },
  entrypoint: "index.html",
  documentsIndex: "documents.json",
  generatedAt: input.generatedAt,
});

export const buildDocumentsMetadata = (docs: Array<Pick<RenderedSiteDoc, "slug" | "title">>) => ({
  items: docs.map((doc, index) => ({
    slug: doc.slug,
    title: doc.title,
    path: `docs/${doc.slug}.html`,
    order: index + 1,
  })),
});
