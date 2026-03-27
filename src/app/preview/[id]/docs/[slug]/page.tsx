import Link from "next/link";
import { notFound } from "next/navigation";
import { renderCollection } from "@/core/notedown/rendering";
import { DOCUMENT_SITE_CSS } from "@/core/notedown/site-theme";
import { getCollection } from "@/core/notedown/storage";

export default async function PreviewDocPage({
  params
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  const rendered = await renderCollection(collection);
  const current = rendered.docs.find((doc) => doc.slug === slug);
  if (!current) notFound();

  return (
    <>
      <style>{DOCUMENT_SITE_CSS}</style>
      <main className="nd-page">
        <nav className="nd-nav">
          <Link href={`/preview/${id}`}>← Home</Link>
        </nav>
        <article className="markdown-body" dangerouslySetInnerHTML={{ __html: current.html }} />
        <div className="nd-nav-grid">
          {current.previous ? (
            <Link href={`/preview/${id}/docs/${current.previous.slug}`}>← {current.previous.title}</Link>
          ) : (
            <span />
          )}
          {current.next ? (
            <Link href={`/preview/${id}/docs/${current.next.slug}`}>{current.next.title} →</Link>
          ) : (
            <span />
          )}
        </div>
      </main>
    </>
  );
}
