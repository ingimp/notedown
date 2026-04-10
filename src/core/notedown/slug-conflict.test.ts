import test from "node:test";
import assert from "node:assert/strict";

import { hasConflictingSiblingSlug } from "./slug-conflict.ts";

test("hasConflictingSiblingSlug ignores the current document slug and detects sibling collisions", () => {
  const docs = [
    { slug: "teoria-degli-insiemi" },
    { slug: "analisi-1" },
  ];

  assert.equal(
    hasConflictingSiblingSlug(docs, "teoria-degli-insiemi", "teoria-degli-insiemi"),
    false
  );
  assert.equal(
    hasConflictingSiblingSlug(docs, "analisi-1", "teoria-degli-insiemi"),
    true
  );
});
