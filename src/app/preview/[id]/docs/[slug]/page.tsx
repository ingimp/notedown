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

export default async function PreviewDocPage({
  params,
}: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id, slug } = await params;
  const collection = await getCollection(id);
  if (!collection) notFound();

  const rendered = await renderCollection(collection);
  const current = rendered.docs.find((doc) => doc.slug === slug);
  if (!current) notFound();

  const model = buildPublicationLayoutModel({
    publication: { title: rendered.collection.title },
    orderedDocuments: rendered.docs.map((doc) => ({ slug: doc.slug, title: doc.title, html: doc.html })),
    currentDocument: { slug: current.slug, title: current.title, html: current.html },
    linkStrategy: {
      rootHref: `/preview/${id}`,
      docHref: (currentSlug) => `/preview/${id}/docs/${currentSlug}`,
    },
  });

  return (
    <>
      <link rel="stylesheet" href="/assets/site.css" />
      <PublicationLayout model={model} LinkComponent={NextLinkComponent} />
    </>
  );
}
