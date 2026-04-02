export type BlockType = "title" | "heading" | "paragraph";

export type ParsedBlock = {
  type: BlockType;
  text: string;
  raw: string;
  start: number;
  end: number;
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
  const lineParts = markdown.match(/.*(?:\r?\n|$)/g) ?? [];
  const lines = lineParts
    .filter((part, index) => !(index === lineParts.length - 1 && part === ""))
    .map((part) => {
      const newlineMatch = part.match(/\r?\n$/);
      const newlineLength = newlineMatch ? newlineMatch[0].length : 0;
      return {
        text: newlineLength > 0 ? part.slice(0, -newlineLength) : part,
        fullLength: part.length,
      };
    });
  const blocks: ParsedBlock[] = [];
  const pathStack: string[] = [docTitle];

  let titleSeen = false;
  let paragraphStart = -1;
  let paragraphEnd = -1;

  let offset = 0;

  const flushParagraph = () => {
    if (paragraphStart < 0 || paragraphEnd <= paragraphStart) return;
    const raw = markdown.slice(paragraphStart, paragraphEnd);
    const text = normalizeSearchText(raw);
    if (text) {
      blocks.push({
        type: "paragraph",
        text,
        raw,
        start: paragraphStart,
        end: paragraphEnd,
        path: [...pathStack],
        weight: WEIGHTS.paragraph,
      });
    }
    paragraphStart = -1;
    paragraphEnd = -1;
  };

  for (const line of lines) {
    const lineStart = offset;
    const lineEnd = offset + line.fullLength;
    const trimmed = line.text.trim();

    const titleMatch = !titleSeen ? trimmed.match(/^#\s+(.+)/) : null;
    if (titleMatch) {
      flushParagraph();
      const raw = markdown.slice(lineStart, lineEnd);
      const text = normalizeSearchText(raw);
      if (text) {
        pathStack[0] = titleMatch[1].trim();
        blocks.push({
          type: "title",
          text,
          raw,
          start: lineStart,
          end: lineEnd,
          path: [...pathStack],
          weight: WEIGHTS.title,
        });
      }
      titleSeen = true;
      offset = lineEnd;
      continue;
    }

    const headingMatch = trimmed.match(/^(##|###)\s+(.+)/);
    if (headingMatch) {
      flushParagraph();
      const level = headingMatch[1].length;
      const raw = markdown.slice(lineStart, lineEnd);
      const text = normalizeSearchText(raw);
      if (text) {
        const headingText = headingMatch[2].trim();
        if (level === 2) {
          pathStack.splice(1, pathStack.length - 1, headingText);
        } else {
          pathStack.splice(2, pathStack.length - 2, headingText);
        }
        blocks.push({
          type: "heading",
          text,
          raw,
          start: lineStart,
          end: lineEnd,
          path: [...pathStack],
          weight: WEIGHTS.heading,
        });
      }
      offset = lineEnd;
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      offset = lineEnd;
      continue;
    }

    if (paragraphStart < 0) paragraphStart = lineStart;
    paragraphEnd = lineEnd;
    offset = lineEnd;
  }

  flushParagraph();

  return blocks;
}
