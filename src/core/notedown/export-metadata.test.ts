import test from "node:test";
import assert from "node:assert/strict";

import { buildDocumentsMetadata, buildPublicationMetadata } from "./export-metadata.ts";

test("buildPublicationMetadata keeps title and slug collection-local and sets index references", () => {
  const publication = buildPublicationMetadata({
    title: "Appunti di Analisi Matematica",
    slug: "appunti-di-analisi-matematica",
    username: "anonymous",
  });

  assert.deepEqual(publication, {
    formatVersion: "0.1",
    kind: "notedown-export",
    title: "Appunti di Analisi Matematica",
    slug: "appunti-di-analisi-matematica",
    author: {
      username: "anonymous",
    },
    entrypoint: "index.html",
    documentsIndex: "documents.json",
  });
});

test("buildDocumentsMetadata maps export docs to docs/*.html and preserves export order", () => {
  const documents = buildDocumentsMetadata([
    { slug: "teoria-ingenua-degli-insiemi", title: "Teoria ingenua degli insiemi" },
    { slug: "successioni", title: "Successioni" },
  ]);

  assert.deepEqual(documents, {
    items: [
      {
        slug: "teoria-ingenua-degli-insiemi",
        title: "Teoria ingenua degli insiemi",
        path: "docs/teoria-ingenua-degli-insiemi.html",
        order: 1,
      },
      {
        slug: "successioni",
        title: "Successioni",
        path: "docs/successioni.html",
        order: 2,
      },
    ],
  });
});
