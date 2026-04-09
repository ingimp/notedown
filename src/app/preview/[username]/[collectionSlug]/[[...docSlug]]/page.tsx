import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCollection } from "@/core/notedown/storage";
import { renderCollection } from "@/core/notedown/rendering";
import { buildEditorDocumentPath, buildEditorCollectionPath, buildPreviewCollectionPath, buildPreviewDocumentPath } from "@/core/notedown/paths";

export default async function PreviewPage({
  params,
}: { params: Promise<{ username: string; collectionSlug: string; docSlug?: string[] }> }) {
  const { username, collectionSlug, docSlug } = await params;
  const collection = await getCollection(username, collectionSlug);
  if (!collection) notFound();

  const rendered = await renderCollection(collection);
  const docs = rendered.docs;
  const requestedSlug = docSlug?.[0];

  if (!requestedSlug && docs[0]) {
    redirect(buildPreviewDocumentPath(username, collectionSlug, docs[0].slug));
  }

  if (!requestedSlug) {
    return (
      <div className="min-h-screen flex flex-col bg-gh-canvas-subtle">
        <header className="bg-gh-header border-b border-black/20 sticky top-0 z-10 flex-shrink-0"><div className="h-12 px-4 flex items-center justify-between gap-4"><div className="flex items-center gap-1 font-mono text-gh-xs"><Link href="/" className="text-gh-header-muted hover:text-gh-header-text transition-colors">notedown</Link><span className="text-gh-header-muted">/</span><span className="text-gh-header-text font-semibold truncate max-w-[200px]">{collection.manifest.title}</span></div><div className="flex items-center gap-2"><Link href="/" className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors">Dashboard</Link><Link href={buildEditorCollectionPath(username, collectionSlug)} className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors">← Editor</Link></div></div></header>
        <div className="flex-1 flex" style={{ height: "calc(100vh - 48px)", overflow: "hidden" }}>
          <aside className="w-56 flex-shrink-0 bg-gh-canvas border-r border-gh-border overflow-y-auto hidden md:block"><div className="px-3 pt-4 pb-2"><p className="text-gh-xs font-semibold text-gh-fg-muted uppercase tracking-wider mb-1">Indice</p><Link href={buildPreviewCollectionPath(username, collectionSlug)} className="text-gh-sm font-semibold text-gh-accent hover:underline block leading-tight">{collection.manifest.title}</Link></div><nav className="mt-2">{docs.map((doc, i) => <Link key={doc.slug} href={buildPreviewDocumentPath(username, collectionSlug, doc.slug)} className="flex items-start gap-2 px-3 py-2 text-gh-sm text-gh-fg-muted hover:text-gh-fg hover:bg-gh-canvas-subtle transition-colors leading-snug"><span className="font-mono text-gh-xs text-gh-fg-subtle mt-0.5 flex-shrink-0">{i + 1}.</span><span className="truncate">{doc.title}</span></Link>)}</nav></aside>
          <main className="flex-1 overflow-y-auto"><div className="max-w-4xl mx-auto px-6 md:px-10 py-10"><div className="mb-8 pb-6 border-b border-gh-border"><h1 className="text-2xl font-semibold text-gh-fg">{collection.manifest.title}</h1>{collection.manifest.description && <p className="text-base text-gh-fg-muted mt-1">{collection.manifest.description}</p>}</div><div className="bg-gh-canvas border border-gh-border rounded-gh overflow-hidden shadow-gh-sm"><div className="px-4 py-2.5 bg-gh-canvas-subtle border-b border-gh-border"><span className="text-sm font-semibold text-gh-fg">Documenti</span></div><ul className="divide-y divide-gh-border">{docs.map((doc, i) => <li key={doc.slug}><Link href={buildPreviewDocumentPath(username, collectionSlug, doc.slug)} className="flex items-center gap-3 px-4 py-3 hover:bg-gh-canvas-subtle transition-colors group"><span className="font-mono text-xs text-gh-fg-subtle w-5 flex-shrink-0">{i + 1}.</span><span className="text-sm text-gh-accent group-hover:underline font-medium">{doc.title}</span><span className="ml-auto font-mono text-xs text-gh-fg-subtle">{doc.slug}.md</span></Link></li>)}</ul></div></div></main>
        </div>
      </div>
    );
  }

  const current = docs.find((doc) => doc.slug === requestedSlug);
  if (!current) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-gh-canvas">
      <header className="bg-gh-header border-b border-black/20 sticky top-0 z-10 flex-shrink-0"><div className="h-12 px-4 flex items-center justify-between gap-4"><div className="flex items-center gap-1 font-mono text-gh-xs min-w-0"><Link href="/" className="text-gh-header-muted hover:text-gh-header-text transition-colors flex-shrink-0">notedown</Link><span className="text-gh-header-muted">/</span><Link href={buildPreviewCollectionPath(username, collectionSlug)} className="text-gh-header-muted hover:text-gh-header-text transition-colors truncate max-w-[120px]">{collection.manifest.title}</Link><span className="text-gh-header-muted">/</span><span className="text-gh-header-text truncate max-w-[140px]">{requestedSlug}.md</span></div><div className="flex items-center gap-2 flex-shrink-0"><Link href="/" className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors">Dashboard</Link><Link href={buildEditorDocumentPath(username, collectionSlug, requestedSlug)} className="flex items-center gap-1 px-3 py-1 text-gh-xs font-semibold text-gh-header-text bg-white/10 border border-white/20 rounded-gh hover:bg-white/20 transition-colors">✎ <span className="hidden sm:inline">Modifica</span></Link></div></div></header>
      <div className="flex-1 flex" style={{ height: "calc(100vh - 48px)", overflow: "hidden" }}>
        <aside className="w-56 flex-shrink-0 bg-gh-canvas border-r border-gh-border overflow-y-auto hidden md:block"><div className="px-3 pt-4 pb-2"><p className="text-gh-xs font-semibold text-gh-fg-muted uppercase tracking-wider mb-1">Documenti</p><Link href={buildPreviewCollectionPath(username, collectionSlug)} className="text-gh-sm font-semibold text-gh-fg hover:text-gh-accent hover:underline block leading-tight transition-colors">{collection.manifest.title}</Link></div><nav className="mt-2">{docs.map((doc, i) => {const isActive = doc.slug === requestedSlug; return <Link key={doc.slug} href={buildPreviewDocumentPath(username, collectionSlug, doc.slug)} className={["flex items-start gap-2 px-3 py-2 text-sm leading-snug transition-colors", isActive ? "bg-gh-accent-subtle text-gh-accent-fg font-semibold border-r-2 border-gh-accent" : "text-gh-fg-muted hover:text-gh-fg hover:bg-gh-canvas-subtle"].join(" ")}><span className="font-mono text-xs text-gh-fg-subtle mt-0.5 flex-shrink-0">{i + 1}.</span><span className="truncate">{doc.title}</span></Link>;})}</nav></aside>
        <main className="flex-1 overflow-y-auto bg-gh-canvas"><div className="border-b border-gh-border px-6 py-2.5 bg-gh-canvas-subtle flex items-center justify-between sticky top-0"><span className="font-mono text-sm font-semibold text-gh-fg">{requestedSlug}.md</span><span className="font-mono text-xs text-gh-fg-muted hidden sm:inline">{current.title}</span></div><div className="px-8 md:px-14 py-10"><article className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: current.html }} />{(current.previous || current.next) && <div className="mt-12 pt-6 border-t border-gh-border flex items-center justify-between gap-4">{current.previous ? <Link href={buildPreviewDocumentPath(username, collectionSlug, current.previous.slug)} className="text-sm text-gh-accent hover:underline">{current.previous.title}</Link> : <div />}{current.next ? <Link href={buildPreviewDocumentPath(username, collectionSlug, current.next.slug)} className="text-sm text-gh-accent hover:underline">{current.next.title}</Link> : <div />}</div>}</div></main>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ username: string; collectionSlug: string; docSlug?: string[] }> }) {
  const { username, collectionSlug, docSlug } = await params;
  if (!docSlug?.[0]) return {};
  const collection = await getCollection(username, collectionSlug);
  if (!collection) return {};
  const doc = collection.manifest.docs.find((d) => d.slug === docSlug[0]);
  if (!doc) return {};
  return { title: `${doc.title} — ${collection.manifest.title}` };
}
