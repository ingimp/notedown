import test from "node:test";
import assert from "node:assert/strict";
import { slugifyCollectionTitle, slugifyDocumentTitle } from "./slug.ts";
import { buildEditorCollectionPath, buildEditorDocumentPath, buildPreviewDocumentPath } from "./paths.ts";

test("slug helpers do not append random or numeric suffixes", () => {
  assert.equal(slugifyCollectionTitle("Appunti di Analisi Matematica"), "appunti-di-analisi-matematica");
  assert.equal(slugifyDocumentTitle("Teoria degli insiemi"), "teoria-degli-insiemi");
});

test("routing helpers produce canonical editor/preview paths", () => {
  assert.equal(buildEditorCollectionPath("anonymous", "appunti-di-analisi-matematica"), "/collections/anonymous/appunti-di-analisi-matematica");
  assert.equal(buildEditorDocumentPath("anonymous", "appunti-di-analisi-matematica", "teoria-degli-insiemi"), "/collections/anonymous/appunti-di-analisi-matematica/teoria-degli-insiemi");
  assert.equal(buildPreviewDocumentPath("anonymous", "appunti-di-analisi-matematica", "teoria-degli-insiemi"), "/preview/anonymous/appunti-di-analisi-matematica/teoria-degli-insiemi");
});
