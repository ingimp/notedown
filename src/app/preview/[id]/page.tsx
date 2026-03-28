import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicationLayout, buildPublicationLayoutModel } from "@/core/notedown/layout";
import { renderCollection } from "@/core/notedown/rendering";
import { getCollection } from "@/core/notedown/storage";

const NextLinkComponent = ({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) => (
  <Link href={href} className={className}>
    {children}
  </Link>
);

export default async function CollectionPreviewHome({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  const rendered = await renderCollection(collection);
  const firstDoc = rendered.docs[0];
  if (!firstDoc) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <link rel="stylesheet" href="/assets/site.css" />
        <p>This publication has no documents yet.</p>
      </main>
    );
  }

  const model = buildPublicationLayoutModel({
    publication: { title: rendered.collection.title },
    orderedDocuments: rendered.docs.map((doc) => ({ slug: doc.slug, title: doc.title, html: doc.html })),
    currentDocument: { slug: firstDoc.slug, title: firstDoc.title, html: firstDoc.html },
    linkStrategy: {
      rootHref: `/preview/${id}`,
      docHref: (slug) => `/preview/${id}/docs/${slug}`,
    },
  });

  return (
    <>
      <link rel="stylesheet" href="/assets/site.css" />
      <PublicationLayout model={model} LinkComponent={NextLinkComponent} />
    </>
  );
}
