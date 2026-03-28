import { NextRequest, NextResponse } from "next/server";
import { updateDocument } from "@/core/notedown/storage";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; slug: string }> }
) {
  const { id, slug } = await params;

  try {
    const body = (await request.json()) as { markdown?: string };
    const result = await updateDocument(id, slug, body.markdown ?? "");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update document" },
      { status: 400 }
    );
  }
}
