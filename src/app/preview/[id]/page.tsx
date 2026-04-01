import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/core/notedown/storage";
import { renderCollection } from "@/core/notedown/rendering";

export default async function CollectionPreviewHome({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  const rendered = await renderCollection(collection);
  const docs = rendered.docs;

  return (
    <div className="min-h-screen flex flex-col bg-gh-canvas-subtle">
      <header className="bg-gh-header border-b border-black/20 sticky top-0 z-10 flex-shrink-0">
        <div className="h-12 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 font-mono text-gh-xs">
            <Link href="/" className="text-gh-header-muted hover:text-gh-header-text transition-colors">notedown</Link>
            <span className="text-gh-header-muted">/</span>
            <span className="text-gh-header-text font-semibold truncate max-w-[200px]">{collection.manifest.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.906.664a1.749 1.749 0 0 1 2.187 0l5.25 4.2c.415.332.657.835.657 1.367v7.019A1.75 1.75 0 0 1 13.25 15h-3.5a.75.75 0 0 1-.75-.75V9H7v5.25a.75.75 0 0 1-.75.75h-3.5A1.75 1.75 0 0 1 1 13.25V6.23c0-.531.242-1.034.657-1.366l5.25-4.2Zm1.25 1.171a.25.25 0 0 0-.312 0l-5.25 4.2a.25.25 0 0 0-.094.196v7.019c0 .138.112.25.25.25H5.5V8.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v5.25h2.75a.25.25 0 0 0 .25-.25V6.23a.25.25 0 0 0-.094-.195Z"/>
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link href={`/collections/${id}`} className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors">
              ← Editor
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex" style={{ height: "calc(100vh - 48px)", overflow: "hidden" }}>
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 bg-gh-canvas border-r border-gh-border overflow-y-auto hidden md:block">
          <div className="px-3 pt-4 pb-2">
            <p className="text-gh-xs font-semibold text-gh-fg-muted uppercase tracking-wider mb-1">Indice</p>
            <Link href={`/preview/${id}`} className="text-gh-sm font-semibold text-gh-accent hover:underline block leading-tight">
              {collection.manifest.title}
            </Link>
          </div>
          <nav className="mt-2">
            {docs.map((doc, i) => (
              <Link key={doc.slug} href={`/preview/${id}/docs/${doc.slug}`}
                className="flex items-start gap-2 px-3 py-2 text-gh-sm text-gh-fg-muted hover:text-gh-fg hover:bg-gh-canvas-subtle transition-colors leading-snug">
                <span className="font-mono text-gh-xs text-gh-fg-subtle mt-0.5 flex-shrink-0">{i + 1}.</span>
                <span className="truncate">{doc.title}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 md:px-10 py-10">
            {/* Repo-style header */}
            <div className="mb-8 pb-6 border-b border-gh-border">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-gh-fg-muted" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/>
                </svg>
                <h1 className="text-2xl font-semibold text-gh-fg">{collection.manifest.title}</h1>
              </div>
              {collection.manifest.description && (
                <p className="text-base text-gh-fg-muted mt-1">{collection.manifest.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center gap-1 text-sm text-gh-fg-muted">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M0 1.75A.75.75 0 0 1 .75 1h14.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 1.75Zm0 4A.75.75 0 0 1 .75 5h14.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 5.75Zm0 4A.75.75 0 0 1 .75 9h10.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 9.75Z"/>
                  </svg>
                  {docs.length} document{docs.length !== 1 ? "i" : "o"}
                </span>
              </div>
            </div>

            {/* File list */}
            <div className="bg-gh-canvas border border-gh-border rounded-gh overflow-hidden shadow-gh-sm">
              <div className="px-4 py-2.5 bg-gh-canvas-subtle border-b border-gh-border">
                <span className="text-sm font-semibold text-gh-fg">Documenti</span>
              </div>
              <ul className="divide-y divide-gh-border">
                {docs.map((doc, i) => (
                  <li key={doc.slug}>
                    <Link href={`/preview/${id}/docs/${doc.slug}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gh-canvas-subtle transition-colors group">
                      <svg className="w-4 h-4 text-gh-fg-muted flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688Z"/>
                      </svg>
                      <span className="font-mono text-xs text-gh-fg-subtle w-5 flex-shrink-0">{i + 1}.</span>
                      <span className="text-sm text-gh-accent group-hover:underline font-medium">{doc.title}</span>
                      <span className="ml-auto font-mono text-xs text-gh-fg-subtle">{doc.slug}.md</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
