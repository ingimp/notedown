import { getCollection, listCollections } from "./storage";

export type IndexedBlock = {
  id: string;
  collectionId: string;
  docSlug: string;
  type: "title" | "heading" | "paragraph";
  text: string;
  raw: string;
  path: string[];
  weight: number;
};

export type BlockSearchIndex = {
  blocks: IndexedBlock[];
};

type BlockDocMeta = {
  collectionId: string;
  collectionTitle: string;
  docSlug: string;
  docTitle: string;
};

export type BlockMatch = {
  blockId: string;
  blockType: IndexedBlock["type"];
  path: string[];
  snippet: string;
  raw: string;
  score: number;
};

export type BlockSearchResult = {
  collectionId: string;
  collectionTitle: string;
  docSlug: string;
  title: string;
  matches: BlockMatch[];
  topScore: number;
};

let cachedIndexPromise: Promise<BlockSearchIndex> | null = null;
let cachedDocMeta: Map<string, BlockDocMeta> = new Map();

const WEIGHTS: Record<IndexedBlock["type"], number> = {
  title: 10,
  heading: 6,
  paragraph: 3,
};

const normalizeText = (input: string) =>
  input
    .toLowerCase()
    .replace(/[`*_~>#\-\[\]()!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const countOccurrences = (haystack: string, needle: string) => {
  if (!needle) return 0;
  let count = 0;
  let from = 0;
  while (from < haystack.length) {
    const idx = haystack.indexOf(needle, from);
    if (idx === -1) break;
    count += 1;
    from = idx + needle.length;
  }
  return count;
};

export const createBlockId = (meta: Pick<IndexedBlock, "collectionId" | "docSlug" | "type">, index: number) =>
  `${meta.collectionId}:${meta.docSlug}:${meta.type}:${index}`;

const buildSnippet = (text: string, query: string, maxLength = 140) => {
  if (!text) return "";
  const matchIndex = text.indexOf(query);
  if (matchIndex === -1) return text.slice(0, maxLength);

  const half = Math.floor(maxLength / 2);
  const start = Math.max(0, matchIndex - half);
  const end = Math.min(text.length, matchIndex + query.length + half);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";
  return `${prefix}${text.slice(start, end)}${suffix}`;
};

export function parseMarkdownToBlocks(markdown: string, docTitle: string): Pick<IndexedBlock, "type" | "text" | "raw" | "path" | "weight">[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: Pick<IndexedBlock, "type" | "text" | "raw" | "path" | "weight">[] = [];
  const pathStack: string[] = [docTitle];

  let titleSeen = false;
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const raw = paragraphBuffer.join("\n").trim();
    const text = normalizeText(raw);
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
      const text = normalizeText(raw);
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
      const text = normalizeText(raw);
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

const buildBlockSearchIndex = async (): Promise<BlockSearchIndex> => {
  const manifests = await listCollections();
  const blocks: IndexedBlock[] = [];
  const docMeta = new Map<string, BlockDocMeta>();

  for (const manifest of manifests) {
    const collection = await getCollection(manifest.id);
    if (!collection) continue;

    for (const doc of collection.docs) {
      const key = `${collection.manifest.id}:${doc.meta.slug}`;
      docMeta.set(key, {
        collectionId: collection.manifest.id,
        collectionTitle: collection.manifest.title,
        docSlug: doc.meta.slug,
        docTitle: doc.meta.title,
      });

      const parsed = parseMarkdownToBlocks(doc.markdown, doc.meta.title);
      parsed.forEach((block, index) => {
        blocks.push({
          id: createBlockId({ collectionId: collection.manifest.id, docSlug: doc.meta.slug, type: block.type }, index),
          collectionId: collection.manifest.id,
          docSlug: doc.meta.slug,
          ...block,
        });
      });
    }
  }

  cachedDocMeta = docMeta;
  return { blocks };
};

export const getBlockSearchIndex = async (): Promise<BlockSearchIndex> => {
  if (!cachedIndexPromise) cachedIndexPromise = buildBlockSearchIndex();
  return cachedIndexPromise;
};

export const searchBlocks = async (
  query: string,
  options?: { docSlug?: string; collectionId?: string }
): Promise<BlockSearchResult[]> => {
  const normalizedQuery = normalizeText(query);
  if (normalizedQuery.length < 2) return [];

  const index = await getBlockSearchIndex();
  const filtered = index.blocks.filter((block) => {
    if (options?.docSlug && block.docSlug !== options.docSlug) return false;
    if (options?.collectionId && block.collectionId !== options.collectionId) return false;
    return true;
  });

  const grouped = new Map<string, BlockSearchResult>();

  for (const block of filtered) {
    if (!block.text.includes(normalizedQuery)) continue;

    const occurrences = countOccurrences(block.text, normalizedQuery);
    const exactMatch = block.text === normalizedQuery;
    const score = block.weight * 10 + (exactMatch ? 50 : 0) + Math.min(occurrences, 5) * 5;

    const docKey = `${block.collectionId}:${block.docSlug}`;
    const meta = cachedDocMeta.get(docKey);
    if (!meta) continue;

    const entry = grouped.get(docKey) ?? {
      collectionId: meta.collectionId,
      collectionTitle: meta.collectionTitle,
      docSlug: meta.docSlug,
      title: meta.docTitle,
      matches: [],
      topScore: 0,
    };

    entry.matches.push({
      blockId: block.id,
      blockType: block.type,
      path: block.path,
      snippet: buildSnippet(block.text, normalizedQuery),
      raw: block.raw,
      score,
    });
    entry.topScore = Math.max(entry.topScore, score);
    grouped.set(docKey, entry);
  }

  return [...grouped.values()]
    .map((entry) => ({
      ...entry,
      matches: entry.matches.sort((a, b) => b.score - a.score).slice(0, 5),
      topScore: Math.max(entry.topScore, entry.matches[0]?.score ?? 0),
    }))
    .sort((a, b) => b.topScore - a.topScore);
};
