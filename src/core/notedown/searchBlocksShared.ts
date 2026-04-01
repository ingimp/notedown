export type BlockType = "title" | "heading" | "paragraph";

export type ParsedBlock = {
  type: BlockType;
  text: string;
  raw: string;
  path: string[];
  weight: number;
};

const WEIGHTS: Record<BlockType, number> = {
  title: 10,
  heading: 6,
  paragraph: 3,
};

export const normalizeSearchText = (input: string) =>
  input
    .toLowerCase()
    .replace(/[`*_~>#\-\[\]()!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const createBlockId = (meta: { collectionId: string; docSlug: string; type: BlockType }, index: number) =>
  `${meta.collectionId}:${meta.docSlug}:${meta.type}:${index}`;

export function parseMarkdownToBlocks(markdown: string, docTitle: string): ParsedBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: ParsedBlock[] = [];
  const pathStack: string[] = [docTitle];

  let titleSeen = false;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const raw = paragraphBuffer.join("\n").trim();
    const text = normalizeSearchText(raw);
    if (text) {
      blocks.push({
        type: "paragraph",
        text,
        raw,
        path: [...pathStack],
        weight: WEIGHTS.paragraph,
      });
    }
    paragraphBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    const titleMatch = !titleSeen ? trimmed.match(/^#\s+(.+)/) : null;
    if (titleMatch) {
      flushParagraph();
      const raw = titleMatch[1].trim();
      const text = normalizeSearchText(raw);
      if (text) {
        pathStack[0] = raw;
        blocks.push({
          type: "title",
          text,
          raw,
          path: [...pathStack],
          weight: WEIGHTS.title,
        });
      }
      titleSeen = true;
      continue;
    }

    const headingMatch = trimmed.match(/^(##|###)\s+(.+)/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      const raw = headingMatch[2].trim();
      const text = normalizeSearchText(raw);
      if (text) {
        if (level === 2) {
          pathStack.splice(1, pathStack.length - 1, raw);
        } else {
          pathStack.splice(2, pathStack.length - 2, raw);
        }
        blocks.push({
          type: "heading",
          text,
          raw,
          path: [...pathStack],
          weight: WEIGHTS.heading,
        });
      }
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    paragraphBuffer.push(trimmed);
  }

  flushParagraph();

  return blocks;
}
