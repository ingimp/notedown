import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection, updateDocument } from "@/core/notedown/storage";
import { DocumentEditorClient } from "./document-editor-client";

export default async function DocumentEditorPage({
  params
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  const orderedDocs = [...collection.docs].sort((a, b) => a.meta.order - b.meta.order);
  const selectedDoc = orderedDocs.find((item) => item.meta.slug === slug);
  if (!selectedDoc) notFound();

  const docIndex = orderedDocs.findIndex((item) => item.meta.slug === slug);
  const previousDoc = docIndex > 0 ? orderedDocs[docIndex - 1].meta : null;
  const nextDoc = docIndex < orderedDocs.length - 1 ? orderedDocs[docIndex + 1].meta : null;

  async function handleManualSave(formData: FormData) {
    "use server";
    const markdown = String(formData.get("markdown") ?? "");
    await updateDocument(id, slug, markdown);
  }

  return (
    <main className="mx-auto max-w-[1400px] space-y-4 p-4 md:p-6">
      <header className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Document editor</p>
            <h1 className="text-2xl font-bold">{selectedDoc.meta.title}</h1>
            <p className="text-sm text-slate-600">{collection.manifest.title}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded border bg-white px-3 py-2 text-sm" href={`/collections/${id}`}>
              Collection
            </Link>
            <Link
              className="rounded border bg-white px-3 py-2 text-sm"
              href={`/preview/${id}/docs/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Public doc preview
            </Link>
          </div>
        </div>
      </header>

      <DocumentEditorClient
        collectionId={id}
        slug={slug}
        initialMarkdown={selectedDoc.markdown}
        onSave={handleManualSave}
      />

      <footer className="flex justify-between rounded-xl bg-white p-4 text-sm shadow-sm">
        {previousDoc ? (
          <Link className="text-blue-700" href={`/collections/${id}/docs/${previousDoc.slug}`}>
            ← {previousDoc.title}
          </Link>
        ) : (
          <span className="text-slate-400">Start of publication</span>
        )}
        {nextDoc ? (
          <Link className="text-blue-700" href={`/collections/${id}/docs/${nextDoc.slug}`}>
            {nextDoc.title} →
          </Link>
        ) : (
          <span className="text-slate-400">End of publication</span>
        )}
      </footer>
    </main>
  );
}
