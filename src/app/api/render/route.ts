import { NextRequest, NextResponse } from "next/server";
import { createMarkdownRenderer } from "@/core/notedown/rendering";

const renderer = createMarkdownRenderer();

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { markdown?: string; content?: string };
    const md = body.markdown ?? body.content ?? "";
    const html = await renderer.render(md);
    return NextResponse.json({ html });
  } catch {
    return NextResponse.json({ html: "" });
  }
}
