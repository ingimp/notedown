import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { addDocument, getCollection, updateDocument } from "@/core/notedown/storage";
import { WorkspaceClient } from "./workspace-client";

export default async function CollectionWorkspacePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ doc?: string }>;
}) {
  const { id } = await params;
  const { doc } = await searchParams;
  const collection = await getCollection(id);
  if (!collection) notFound();

  const selected = collection.docs.find((item) => item.meta.slug === doc) ?? collection.docs[0] ?? null;

  async function handleAddDoc(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    if (!title) return;
    const created = await addDocument(id, { title, initialMarkdown: `# ${title}\n\nWrite your content here.` });
    redirect(`/collections/${id}?doc=${created.slug}`);
  }

  async function handleSaveDoc(formData: FormData) {
    "use server";
    const slug = String(formData.get("slug") ?? "");
    const markdown = String(formData.get("markdown") ?? "");
    if (!slug) return;
    await updateDocument(id, slug, markdown);
    redirect(`/collections/${id}?doc=${slug}`);
  }

  return (
    <main className="mx-auto max-w-7xl p-6">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Workspace</p>
          <h1 className="text-2xl font-bold">{collection.manifest.title}</h1>
          <p className="text-sm text-slate-600">{collection.manifest.description}</p>
        </div>
        <div className="flex gap-2">
          <Link className="rounded border bg-white px-3 py-2" href={`/preview/${id}`}>
            Preview
          </Link>
          <a className="rounded bg-slate-900 px-3 py-2 text-white" href={`/collections/${id}/export`}>
            Export
          </a>
          <Link className="rounded border bg-white px-3 py-2" href="/">
            Dashboard
          </Link>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4 rounded-lg bg-white p-4">
          <h2 className="font-semibold">Documents</h2>
          <ul className="space-y-1 text-sm">
            {collection.manifest.docs.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/collections/${id}?doc=${item.slug}`}
                  className={`block rounded px-2 py-1 ${item.slug === selected?.meta.slug ? "bg-slate-200" : "hover:bg-slate-100"}`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
            {collection.manifest.docs.length === 0 && <li className="text-slate-500">No documents yet.</li>}
          </ul>
          <form action={handleAddDoc} className="space-y-2 border-t pt-3">
            <input className="w-full rounded border p-2 text-sm" name="title" placeholder="Add document" required />
            <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white" type="submit">
              Add document
            </button>
          </form>
        </aside>

        {selected ? (
          <section className="space-y-3">
            <form action={handleSaveDoc} className="space-y-3">
              <input type="hidden" name="slug" value={selected.meta.slug} />
              <p className="text-sm font-medium">Editing: {selected.meta.title}</p>
              <WorkspaceClient initialMarkdown={selected.markdown} />
              <button className="rounded bg-blue-700 px-4 py-2 text-white" type="submit">
                Save document
              </button>
            </form>
          </section>
        ) : (
          <section className="rounded-lg bg-white p-6 text-slate-500">Create your first document to start writing.</section>
        )}
      </div>
    </main>
  );
}
