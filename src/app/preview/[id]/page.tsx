import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/core/notedown/storage";

export default async function CollectionPreviewHome({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  return (
    <main className="mx-auto max-w-4xl bg-white p-8">
      <nav className="mb-4 text-sm">
        <Link className="text-blue-700" href={`/collections/${id}`}>
          ← Back to workspace
        </Link>
      </nav>
      <h1 className="text-3xl font-bold">{collection.manifest.title}</h1>
      <p className="mb-6 mt-2 text-slate-600">{collection.manifest.description}</p>
      <ol className="list-decimal space-y-2 pl-6">
        {collection.manifest.docs.map((doc) => (
          <li key={doc.slug}>
            <Link className="text-blue-700" href={`/preview/${id}/docs/${doc.slug}`}>
              {doc.title}
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
