import { NextRequest, NextResponse } from "next/server";
import { createMarkdownRenderer } from "@/core/notedown/rendering";

const renderer = createMarkdownRenderer();

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { markdown?: string };
    const html = await renderer.render(body.markdown ?? "");
    return NextResponse.json({ html });
  } catch (error) {
    console.warn("Render API failed", error);
    return NextResponse.json({ html: "" }, { status: 500 });
  }
}
