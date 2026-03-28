import { DOCUMENT_SITE_CSS } from "@/core/notedown/site-theme";

export async function GET() {
  return new Response(DOCUMENT_SITE_CSS, {
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, max-age=31536000"
    }
  });
}
