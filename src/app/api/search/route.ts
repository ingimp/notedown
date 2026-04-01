import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_ROOT = path.join(process.cwd(), "data", "notes");
const CONTEXT_CHARS = 90; // chars of context around each match
const MAX_MATCHES_PER_DOC = 3;
const MAX_RESULTS = 30;

export interface SearchResult {
  collectionId: string;
  collectionTitle: string;
  docSlug: string;
  docTitle: string;
  matches: SearchMatch[];
}

export interface SearchMatch {
  before: string;
  term: string;
  after: string;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const results: SearchResult[] = [];
  let totalMatches = 0;

  try {
    const collections = await fs.readdir(DATA_ROOT, { withFileTypes: true });

    for (const col of collections) {
      if (!col.isDirectory()) continue;
      if (totalMatches >= MAX_RESULTS) break;

      // Read manifest
      let manifest: { id: string; title: string; docs: Array<{ slug: string; title: string; fileName: string }> };
      try {
        const raw = await fs.readFile(path.join(DATA_ROOT, col.name, "manifest.json"), "utf8");
        manifest = JSON.parse(raw);
      } catch { continue; }

      for (const doc of manifest.docs) {
        if (totalMatches >= MAX_RESULTS) break;

        let content: string;
        try {
          content = await fs.readFile(
            path.join(DATA_ROOT, col.name, "docs", doc.fileName), "utf8"
          );
        } catch { continue; }

        const matches = findMatches(content, q, MAX_MATCHES_PER_DOC);
        if (matches.length === 0) continue;

        results.push({
          collectionId: manifest.id,
          collectionTitle: manifest.title,
          docSlug: doc.slug,
          docTitle: doc.title,
          matches,
        });
        totalMatches += matches.length;
      }
    }
  } catch {
    return NextResponse.json({ results: [] });
  }

  return NextResponse.json({ results });
}

function findMatches(content: string, query: string, maxMatches: number): SearchMatch[] {
  const matches: SearchMatch[] = [];
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(escaped, "gi");
  let m: RegExpExecArray | null;

  while ((m = re.exec(content)) !== null && matches.length < maxMatches) {
    const start = Math.max(0, m.index - CONTEXT_CHARS);
    const end = Math.min(content.length, m.index + query.length + CONTEXT_CHARS);

    // Clean up: strip markdown syntax, collapse whitespace
    const clean = (s: string) =>
      s.replace(/[#*_`\[\]]/g, "").replace(/\s+/g, " ").trim();

    matches.push({
      before: (start > 0 ? "…" : "") + clean(content.slice(start, m.index)),
      term: content.slice(m.index, m.index + m[0].length),
      after: clean(content.slice(m.index + m[0].length, end)) + (end < content.length ? "…" : ""),
    });
  }

  return matches;
}
