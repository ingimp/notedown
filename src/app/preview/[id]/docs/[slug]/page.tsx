import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollection } from "@/core/notedown/storage";
import { renderCollection } from "@/core/notedown/rendering";

export default async function PreviewDocPage({
  params,
}: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  const rendered = await renderCollection(collection);
  const current = rendered.docs.find((doc) => doc.slug === slug);
  if (!current) notFound();

  const allDocs = rendered.docs;

  return (
    <div className="min-h-screen flex flex-col bg-gh-canvas">
      <header className="bg-gh-header border-b border-black/20 sticky top-0 z-10 flex-shrink-0">
        <div className="h-12 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 font-mono text-gh-xs min-w-0">
            <Link href="/" className="text-gh-header-muted hover:text-gh-header-text transition-colors flex-shrink-0">notedown</Link>
            <span className="text-gh-header-muted">/</span>
            <Link href={`/preview/${id}`} className="text-gh-header-muted hover:text-gh-header-text transition-colors truncate max-w-[120px]">
              {collection.manifest.title}
            </Link>
            <span className="text-gh-header-muted">/</span>
            <span className="text-gh-header-text truncate max-w-[140px]">{slug}.md</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/" className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6.906.664a1.749 1.749 0 0 1 2.187 0l5.25 4.2c.415.332.657.835.657 1.367v7.019A1.75 1.75 0 0 1 13.25 15h-3.5a.75.75 0 0 1-.75-.75V9H7v5.25a.75.75 0 0 1-.75.75h-3.5A1.75 1.75 0 0 1 1 13.25V6.23c0-.531.242-1.034.657-1.366l5.25-4.2Zm1.25 1.171a.25.25 0 0 0-.312 0l-5.25 4.2a.25.25 0 0 0-.094.196v7.019c0 .138.112.25.25.25H5.5V8.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v5.25h2.75a.25.25 0 0 0 .25-.25V6.23a.25.25 0 0 0-.094-.195Z"/>
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <Link href={`/collections/${id}?doc=${slug}`}
              className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors">
              ✎ <span className="hidden sm:inline">Modifica</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 flex" style={{ height: "calc(100vh - 48px)", overflow: "hidden" }}>
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0 bg-gh-canvas border-r border-gh-border overflow-y-auto hidden md:block">
          <div className="px-3 pt-4 pb-2">
            <p className="text-gh-xs font-semibold text-gh-fg-muted uppercase tracking-wider mb-1">Documenti</p>
            <Link href={`/preview/${id}`} className="text-gh-sm font-semibold text-gh-fg hover:text-gh-accent hover:underline block leading-tight transition-colors">
              {collection.manifest.title}
            </Link>
          </div>
          <nav className="mt-2">
            {allDocs.map((doc, i) => {
              const isActive = doc.slug === slug;
              return (
                <Link key={doc.slug} href={`/preview/${id}/docs/${doc.slug}`}
                  className={[
                    "flex items-start gap-2 px-3 py-2 text-sm leading-snug transition-colors",
                    isActive
                      ? "bg-gh-accent-subtle text-gh-accent-fg font-semibold border-r-2 border-gh-accent"
                      : "text-gh-fg-muted hover:text-gh-fg hover:bg-gh-canvas-subtle"
                  ].join(" ")}
                >
                  <span className="font-mono text-xs text-gh-fg-subtle mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <span className="truncate">{doc.title}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gh-canvas">
          {/* GitHub-style file header */}
          <div className="border-b border-gh-border px-6 py-2.5 bg-gh-canvas-subtle flex items-center justify-between sticky top-0">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gh-fg-muted" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688Z"/>
              </svg>
              <span className="font-mono text-sm font-semibold text-gh-fg">{slug}.md</span>
            </div>
            <span className="font-mono text-xs text-gh-fg-muted hidden sm:inline">{current.title}</span>
          </div>

          {/* Article — full width with generous padding, bigger font */}
          <div className="px-8 md:px-14 py-10">
            <article className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: current.html }} />

            {/* Prev / Next */}
            {(current.previous || current.next) && (
              <div className="mt-12 pt-6 border-t border-gh-border flex items-center justify-between gap-4">
                {current.previous ? (
                  <Link href={`/preview/${id}/docs/${current.previous.slug}`} className="flex items-center gap-2 text-sm text-gh-accent hover:underline group">
                    <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M9.78 12.78a.75.75 0 0 1-1.06 0L4.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L6.06 8l3.72 3.72a.75.75 0 0 1 0 1.06Z"/>
                    </svg>
                    <span>
                      <span className="block text-xs text-gh-fg-muted font-normal">Precedente</span>
                      {current.previous.title}
                    </span>
                  </Link>
                ) : <div />}
                {current.next ? (
                  <Link href={`/preview/${id}/docs/${current.next.slug}`} className="flex items-center gap-2 text-sm text-gh-accent hover:underline group text-right">
                    <span>
                      <span className="block text-xs text-gh-fg-muted font-normal">Successivo</span>
                      {current.next.title}
                    </span>
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"/>
                    </svg>
                  </Link>
                ) : <div />}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = await params;
  try {
    const collection = await getCollection(id);
    if (!collection) return {};
    const doc = collection.manifest.docs.find((d) => d.slug === slug);
    if (!doc) return {};
    return { title: `${doc.title} — ${collection.manifest.title}` };
  } catch { return {}; }
}
