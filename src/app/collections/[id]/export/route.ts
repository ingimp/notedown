import { buildStaticSiteZip } from "@/core/notedown/export";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const buffer = await buildStaticSiteZip(id);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${id}-site.zip"`
    }
  });
}
