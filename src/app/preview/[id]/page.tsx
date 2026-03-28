import Link from "next/link";
import { notFound } from "next/navigation";
import { renderCollection } from "@/core/notedown/rendering";
import { DOCUMENT_SITE_CSS } from "@/core/notedown/site-theme";
import { getCollection } from "@/core/notedown/storage";

export default async function CollectionPreviewHome({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  const rendered = await renderCollection(collection);

  return (
    <>
      <style>{DOCUMENT_SITE_CSS}</style>
      <main className="nd-page">
        <nav className="nd-nav">
          <Link href={`/collections/${id}`}>← Back to collection</Link>
        </nav>
        <h1>{rendered.collection.title}</h1>
        <p>{rendered.collection.description}</p>
        <ol className="nd-doc-list">
          {rendered.docs.map((doc) => (
            <li key={doc.slug}>
              <Link href={`/preview/${id}/docs/${doc.slug}`}>{doc.title}</Link>
            </li>
          ))}
        </ol>
      </main>
    </>
  );
}
