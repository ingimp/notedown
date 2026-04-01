import { NextRequest, NextResponse } from "next/server";
import { updateDocument, updateDocumentTitle, deleteDocument } from "@/core/notedown/storage";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slug: string }> }
) {
  try {
    const { id, slug } = await params;
    const body = await request.json() as { markdown: string; title?: string };
    await updateDocument(id, slug, body.markdown);
    if (body.title !== undefined) {
      await updateDocumentTitle(id, slug, body.title || "Senza titolo");
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; slug: string }> }
) {
  try {
    const { id, slug } = await params;
    await deleteDocument(id, slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
