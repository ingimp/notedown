import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/core/notedown/storage";
import { createMarkdownRenderer } from "@/core/notedown/rendering";

export default async function PreviewDocPage({
  params
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  const currentIndex = collection.docs.findIndex((doc) => doc.meta.slug === slug);
  if (currentIndex === -1) notFound();

  const current = collection.docs[currentIndex];
  const prev = collection.docs[currentIndex - 1];
  const next = collection.docs[currentIndex + 1];
  const renderer = createMarkdownRenderer();
  const html = await renderer.render(current.markdown);

  return (
    <main className="mx-auto max-w-4xl bg-white p-8">
      <nav className="mb-4 text-sm">
        <Link className="text-blue-700" href={`/preview/${id}`}>
          ← Home
        </Link>
      </nav>
      <article className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="mt-8 flex justify-between text-sm">
        {prev ? (
          <Link className="text-blue-700" href={`/preview/${id}/docs/${prev.meta.slug}`}>
            ← {prev.meta.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="text-blue-700" href={`/preview/${id}/docs/${next.meta.slug}`}>
            {next.meta.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </main>
  );
}
