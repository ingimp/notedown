import { buildStaticSiteZip } from "@/core/notedown/export";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const buffer = await buildStaticSiteZip(id);
  const bytes = new Uint8Array(buffer);

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${id}-site.zip"`
    }
  });
}
