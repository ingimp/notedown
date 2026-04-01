import { notFound } from "next/navigation";
import { getCollection } from "@/core/notedown/storage";
import { WorkspaceShell } from "./workspace-shell";
import { SearchTrigger } from "@/components/search-trigger";
import Link from "next/link";

export default async function CollectionWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ doc?: string; hl?: string }>;
}) {
  const { id } = await params;
  const { doc, hl } = await searchParams;
  const collection = await getCollection(id);
  if (!collection) notFound();

  const sortedDocs = [...collection.manifest.docs].sort((a, b) => a.order - b.order);
  const selected = sortedDocs.find((d) => d.slug === doc) ?? sortedDocs[0] ?? null;
  const selectedDoc = selected
    ? collection.docs.find((d) => d.meta.slug === selected.slug)
    : null;

  return (
    <div className="h-screen flex flex-col bg-gh-canvas-subtle overflow-hidden">
      {/* Top nav */}
      <header className="bg-gh-header border-b border-black/20 h-12 flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-1 min-w-0 font-mono text-gh-xs">
          <Link href="/" className="text-gh-header-muted hover:text-gh-header-text transition-colors flex-shrink-0">
            notedown
          </Link>
          <span className="text-gh-header-muted">/</span>
          <span className="text-gh-header-muted truncate max-w-[160px]">{collection.manifest.title}</span>
          {selected && (
            <>
              <span className="text-gh-header-muted">/</span>
              <span className="text-gh-header-text truncate max-w-[140px]">{selected.slug}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <SearchTrigger compact />
          <Link
            href={`/preview/${id}${selected ? `/docs/${selected.slug}` : ""}`}
            className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z"/>
            </svg>
            <span className="hidden sm:inline">Preview</span>
          </Link>
          <a
            href={`/collections/${id}/export`}
            className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14Z"/><path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z"/>
            </svg>
            <span className="hidden sm:inline">Export</span>
          </a>
        </div>
      </header>

      {selected && selectedDoc ? (
        <WorkspaceShell
          collectionId={id}
          collectionTitle={collection.manifest.title}
          docs={sortedDocs}
          activeSlug={selected.slug}
          initialMarkdown={selectedDoc.markdown}
          highlight={hl}
        />
      ) : (
        /* No docs yet — show empty state inside shell layout */
        <WorkspaceShell
          collectionId={id}
          collectionTitle={collection.manifest.title}
          docs={sortedDocs}
          activeSlug=""
          initialMarkdown=""
        />
      )}
    </div>
  );
}
