import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCollection } from "@/core/notedown/storage";
import {
  buildExportPath,
  buildPreviewDocumentPath,
  buildPreviewCollectionPath,
  buildEditorDocumentPath,
} from "@/core/notedown/paths";
import { WorkspaceShell } from "@/app/collections/_components/workspace-shell";

export default async function CollectionWorkspacePage({
  params,
}: {
  params: Promise<{ username: string; collectionSlug: string; docSlug?: string[] }>;
}) {
  const { username, collectionSlug, docSlug } = await params;
  const collection = await getCollection(username, collectionSlug);
  if (!collection) notFound();

  const sortedDocs = [...collection.manifest.docs].sort((a, b) => a.order - b.order);
  const requestedSlug = docSlug?.[0];

  if (!requestedSlug && sortedDocs[0]) {
    redirect(buildEditorDocumentPath(username, collectionSlug, sortedDocs[0].slug));
  }

  const selected = requestedSlug
    ? sortedDocs.find((d) => d.slug === requestedSlug) ?? null
    : null;

  if (requestedSlug && !selected) notFound();

  const selectedDoc = selected ? collection.docs.find((d) => d.meta.slug === selected.slug) : null;

  return (
    <div className="h-screen flex flex-col bg-gh-canvas-subtle overflow-hidden">
      <header className="bg-gh-header border-b border-black/20 h-12 flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-1 min-w-0 font-mono text-gh-xs">
          <Link href="/" className="text-gh-header-muted hover:text-gh-header-text transition-colors flex-shrink-0">notedown</Link>
          <span className="text-gh-header-muted">/</span>
          <span className="text-gh-header-muted truncate max-w-[160px]">{collection.manifest.title}</span>
          {selected && <><span className="text-gh-header-muted">/</span><span className="text-gh-header-text truncate max-w-[140px]">{selected.slug}</span></>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={selected ? buildPreviewDocumentPath(username, collectionSlug, selected.slug) : buildPreviewCollectionPath(username, collectionSlug)} className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors">Preview</Link>
          <a href={buildExportPath(username, collectionSlug)} className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors">Export</a>
        </div>
      </header>

      <WorkspaceShell
        username={username}
        collectionSlug={collectionSlug}
        collectionTitle={collection.manifest.title}
        docs={sortedDocs}
        activeSlug={selected?.slug ?? ""}
        initialMarkdown={selectedDoc?.markdown ?? ""}
      />
    </div>
  );
}
