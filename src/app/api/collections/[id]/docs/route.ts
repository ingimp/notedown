import { NextRequest, NextResponse } from "next/server";
import { addDocument } from "@/core/notedown/storage";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json() as { title: string; initialMarkdown?: string };
    const meta = await addDocument(id, { title: body.title, initialMarkdown: body.initialMarkdown });
    return NextResponse.json({ ok: true, slug: meta.slug, fileName: meta.fileName });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
