import { NextRequest, NextResponse } from "next/server";
import { createMarkdownRenderer } from "@/core/notedown/rendering";

const renderer = createMarkdownRenderer();

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { markdown?: string };
  const html = await renderer.render(body.markdown ?? "");
  return NextResponse.json({ html });
}
