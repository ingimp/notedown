import { NextRequest, NextResponse } from "next/server";
import { searchBlocks } from "@/core/notedown/searchBlocks";

const MAX_RESULTS = 30;

export interface BlockMatch {
  blockId: string;
  blockType: string;
  path: string[];
  snippet: string;
  raw: string;
  score: number;
}

export interface SearchResult {
  collectionId: string;
  collectionTitle: string;
  docSlug: string;
  docTitle: string;
  snippet: string;
  matches: BlockMatch[];
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const results = await searchBlocks(q);

    const response: SearchResult[] = results.slice(0, MAX_RESULTS).map((result) => ({
      collectionId: result.collectionId,
      collectionTitle: result.collectionTitle,
      docSlug: result.docSlug,
      docTitle: result.title,
      snippet: result.matches[0]?.snippet ?? "",
      matches: result.matches,
    }));

    return NextResponse.json({ results: response });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
