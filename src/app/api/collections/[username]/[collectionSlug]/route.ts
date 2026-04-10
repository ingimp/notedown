import { NextRequest, NextResponse } from "next/server";
import { deleteCollection } from "@/core/notedown/storage";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string; collectionSlug: string }> }
) {
  try {
    const { username, collectionSlug } = await params;
    await deleteCollection(username, collectionSlug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
