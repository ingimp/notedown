import { buildStaticSiteZip } from "@/core/notedown/export";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string; collectionSlug: string }> }
) {
  const { username, collectionSlug } = await params;
  const buffer = await buildStaticSiteZip(username, collectionSlug);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${username}-${collectionSlug}-site.zip"`,
    },
  });
}
