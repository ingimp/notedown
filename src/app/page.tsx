import Link from "next/link";
import { redirect } from "next/navigation";
import { createCollection, listCollections } from "@/core/notedown/storage";
import { DEFAULT_USERNAME, buildEditorCollectionPath } from "@/core/notedown/paths";
import { DeleteCollectionButton } from "./delete-collection-button";

export default async function DashboardPage() {
  const collections = await listCollections();

  async function handleCreateCollection(formData: FormData) {
    "use server";
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    if (!title) return;
    const collection = await createCollection({ title, description, username: DEFAULT_USERNAME });
    redirect(buildEditorCollectionPath(collection.username, collection.slug));
  }

  return (
    <div className="min-h-screen bg-gh-canvas-subtle">
      <header className="bg-gh-header border-b border-black/20 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gh-header-text" viewBox="0 0 16 16" fill="currentColor">
              <path d="M0 1.75A.75.75 0 0 1 .75 1h14.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 1.75Zm0 4A.75.75 0 0 1 .75 5h14.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 5.75Zm0 4A.75.75 0 0 1 .75 9h14.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 9.75Zm0 4A.75.75 0 0 1 .75 13h14.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 13.75Z"/>
            </svg>
            <span className="text-gh-header-text font-semibold text-gh-md">Notedown</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gh-header-muted font-mono text-gh-xs">anonymous</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gh-fg">Le tue raccolte</h1>
          <p className="text-gh-fg-muted text-gh-md mt-1">Scrivi, organizza ed esporta le tue note in Markdown.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gh-canvas border border-gh-border rounded-gh shadow-gh-sm">
              <div className="px-4 py-3 border-b border-gh-border bg-gh-canvas-subtle rounded-t-gh">
                <h2 className="text-gh-sm font-semibold text-gh-fg">Nuova raccolta</h2>
              </div>
              <div className="p-4">
                <form action={handleCreateCollection} className="flex flex-col gap-3">
                  <div>
                    <label className="block text-gh-xs font-semibold text-gh-fg-muted mb-1 uppercase tracking-wide">Titolo</label>
                    <input name="title" placeholder="es. Analisi Matematica" required className="w-full px-3 py-1.5 text-gh-sm bg-gh-canvas border border-gh-border rounded-gh focus:outline-none focus:border-gh-accent focus:ring-2 focus:ring-blue-300/40 transition-all" />
                  </div>
                  <div>
                    <label className="block text-gh-xs font-semibold text-gh-fg-muted mb-1 uppercase tracking-wide">Descrizione</label>
                    <input name="description" placeholder="Breve descrizione (opzionale)" className="w-full px-3 py-1.5 text-gh-sm bg-gh-canvas border border-gh-border rounded-gh focus:outline-none focus:border-gh-accent focus:ring-2 focus:ring-blue-300/40 transition-all" />
                  </div>
                  <button type="submit" className="w-full px-4 py-1.5 text-gh-sm font-semibold text-white bg-gh-success border border-green-600 rounded-gh hover:bg-green-700 active:bg-green-800 transition-colors shadow-gh-sm">Crea raccolta</button>
                </form>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gh-canvas border border-gh-border rounded-gh shadow-gh-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gh-border bg-gh-canvas-subtle flex items-center justify-between">
                <h2 className="text-gh-sm font-semibold text-gh-fg">Raccolte</h2>
                <span className="text-gh-xs text-gh-fg-muted font-mono bg-gh-canvas-inset border border-gh-border rounded-full px-2 py-0.5">{collections.length}</span>
              </div>

              {collections.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-gh-fg-muted text-gh-sm">Nessuna raccolta ancora.</p>
                  <p className="text-gh-fg-subtle text-gh-xs mt-1">Creane una con il form a sinistra.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gh-border">
                  {collections.map((col) => (
                    <li key={col.id} className="flex items-center justify-between px-4 py-3 hover:bg-gh-canvas-subtle transition-colors group">
                      <Link href={buildEditorCollectionPath(col.username, col.slug)} className="flex-1 min-w-0 mr-3">
                        <span className="text-gh-md font-semibold text-gh-accent group-hover:underline block truncate">{col.title}</span>
                        {col.description && <span className="text-gh-xs text-gh-fg-muted block mt-0.5 truncate">{col.description}</span>}
                      </Link>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-gh-xs text-gh-fg-muted font-mono">{col.docs.length} doc{col.docs.length !== 1 ? "s" : ""}</span>
                        <DeleteCollectionButton username={col.username} collectionSlug={col.slug} collectionTitle={col.title} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
