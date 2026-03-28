import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { addDocument, getCollection, reorderDocument } from "@/core/notedown/storage";

export default async function CollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  const orderedDocs = [...collection.manifest.docs].sort((a, b) => a.order - b.order);

  async function handleAddDoc(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;

    await addDocument(id, { title, initialMarkdown: `# ${title}\n\nWrite your content here.` });
    redirect(`/collections/${id}`);
  }

  async function handleReorder(formData: FormData) {
    "use server";
    const slug = String(formData.get("slug") ?? "");
    const directionValue = String(formData.get("direction") ?? "");
    if (!slug || (directionValue !== "up" && directionValue !== "down")) return;

    await reorderDocument(id, slug, directionValue);
    redirect(`/collections/${id}`);
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-6 md:p-8" aria-live="polite">
      <header className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Publication</p>
            <h1 className="text-3xl font-bold">{collection.manifest.title}</h1>
            <p className="mt-2 text-sm text-slate-600">{collection.manifest.description || "No description"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="rounded border bg-white px-3 py-2"
              href={`/preview/${id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Public preview
            </Link>
            <a className="rounded bg-slate-900 px-3 py-2 text-white" href={`/collections/${id}/export`}>
              Export static site
            </a>
            <Link className="rounded border bg-white px-3 py-2" href="/">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <section className="rounded-xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Documents</h2>
          <p className="text-sm text-slate-500">Manage structure here, edit in dedicated page.</p>
        </div>

        <ul className="space-y-2">
          {orderedDocs.map((doc, index) => (
            <li key={doc.slug} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
              <div>
                <p className="font-medium">
                  {doc.title}{" "}
                  {index === 0 ? (
                    <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                      First document
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-slate-500">/{doc.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <form action={handleReorder}>
                  <input type="hidden" name="slug" value={doc.slug} />
                  <input type="hidden" name="direction" value="up" />
                  <PendingSubmitButton
                    idleLabel="↑"
                    pendingLabel="…"
                    disabled={index === 0}
                    className="rounded border px-2 py-1 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </form>
                <form action={handleReorder}>
                  <input type="hidden" name="slug" value={doc.slug} />
                  <input type="hidden" name="direction" value="down" />
                  <PendingSubmitButton
                    idleLabel="↓"
                    pendingLabel="…"
                    disabled={index === orderedDocs.length - 1}
                    className="rounded border px-2 py-1 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </form>
                <Link className="rounded bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 active:scale-[0.99]" href={`/collections/${id}/docs/${doc.slug}`}>
                  Open editor
                </Link>
              </div>
            </li>
          ))}
          {orderedDocs.length === 0 && <li className="rounded-lg border border-dashed p-4 text-slate-500">No documents yet.</li>}
        </ul>

        <form action={handleAddDoc} className="mt-5 grid gap-3 border-t pt-4 md:grid-cols-[1fr_auto]">
          <input className="rounded border p-2" name="title" placeholder="New document title" required />
          <PendingSubmitButton
            idleLabel="Add document"
            pendingLabel="Adding..."
            className="rounded bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>
      </section>
    </main>
  );
}
