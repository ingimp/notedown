import { NextRequest, NextResponse } from "next/server";
import { updateDocument, deleteDocument } from "@/core/notedown/storage";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; collectionSlug: string; slug: string }> }
) {
  try {
    const { username, collectionSlug, slug } = await params;
    const body = (await request.json()) as { markdown: string };
    const result = await updateDocument(username, collectionSlug, slug, body.markdown);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: String(err).includes("CONFLICT") ? 409 : 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string; collectionSlug: string; slug: string }> }
) {
  try {
    const { username, collectionSlug, slug } = await params;
    await deleteDocument(username, collectionSlug, slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
