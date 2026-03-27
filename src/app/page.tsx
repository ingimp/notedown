import Link from "next/link";
import { redirect } from "next/navigation";
import { createCollection, listCollections } from "@/core/notedown/storage";

export default async function DashboardPage() {
  const collections = await listCollections();

  async function handleCreateCollection(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    if (!title) return;

    const collection = await createCollection({ title, description });
    redirect(`/collections/${collection.id}`);
  }

  return (
    <main className="mx-auto max-w-5xl p-8">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">From Markdown to Notedown</p>
          <h1 className="text-3xl font-bold">Notes Dashboard</h1>
        </div>
      </header>

      <section className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-xl font-semibold">Create notes</h2>
        <form action={handleCreateCollection} className="grid gap-3 md:grid-cols-2">
          <input name="title" placeholder="Title" className="rounded border p-2" required />
          <input name="description" placeholder="Short description" className="rounded border p-2" />
          <button type="submit" className="rounded bg-slate-900 px-4 py-2 text-white md:col-span-2 md:w-fit">
            Create notes
          </button>
        </form>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Collections</h2>
        <ul className="space-y-3">
          {collections.map((collection) => (
            <li key={collection.id} className="rounded border p-3">
              <Link className="font-semibold text-blue-700" href={`/collections/${collection.id}`}>
                {collection.title}
              </Link>
              <p className="text-sm text-slate-600">{collection.description || "No description"}</p>
            </li>
          ))}
          {collections.length === 0 && <li className="text-slate-500">No collections yet.</li>}
        </ul>
      </section>
    </main>
  );
}
