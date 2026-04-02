import assert from "node:assert/strict";
import test from "node:test";

import { getPreviewMatchText, parseMarkdownToBlocks } from "./searchBlocksShared.ts";

test("parseMarkdownToBlocks keeps markdown raw but exposes visible plainText for title and headings", () => {
  const markdown = "# Title Example\n\n## Heading Example\nParagraph body\n";
  const blocks = parseMarkdownToBlocks(markdown, "Fallback");

  const title = blocks.find((block) => block.type === "title");
  const heading = blocks.find((block) => block.type === "heading");

  assert.ok(title);
  assert.ok(heading);

  assert.equal(title.raw, "# Title Example\n");
  assert.equal(title.plainText, "Title Example");

  assert.equal(heading.raw, "## Heading Example\n");
  assert.equal(heading.plainText, "Heading Example");
});

test("preview matching text uses visible text for headings/titles instead of markdown markers", () => {
  const markdown = "# Main Title\n\n## Heading Example\nParagraph body\n";
  const blocks = parseMarkdownToBlocks(markdown, "Fallback");

  const heading = blocks.find((block) => block.type === "heading");
  const title = blocks.find((block) => block.type === "title");

  assert.ok(heading);
  assert.ok(title);

  assert.equal(getPreviewMatchText(heading), "Heading Example");
  assert.equal(getPreviewMatchText(title), "Main Title");
  assert.equal(getPreviewMatchText(heading).includes("##"), false);
  assert.equal(getPreviewMatchText(title).includes("#"), false);
});

test("paragraph preview matching stays unchanged", () => {
  const markdown = "# T\n\nParagraph **body** text\n";
  const blocks = parseMarkdownToBlocks(markdown, "T");
  const paragraph = blocks.find((block) => block.type === "paragraph");

  assert.ok(paragraph);
  assert.equal(getPreviewMatchText(paragraph), paragraph.raw);
});
