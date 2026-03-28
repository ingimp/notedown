import type { ReactNode } from "react";

export type PublicationLayoutMeta = {
  title: string;
};

export type PublicationLayoutDoc = {
  slug: string;
  title: string;
  html: string;
};

export type PublicationLinkStrategy = {
  rootHref: string;
  docHref: (slug: string) => string;
};

type PublicationLayoutLinkComponent = (props: {
  href: string;
  children: ReactNode;
  className?: string;
}) => ReactNode;

export type PublicationLayoutModel = {
  publication: PublicationLayoutMeta;
  rootHref: string;
  current: PublicationLayoutDoc;
  docs: Array<PublicationLayoutDoc & { href: string; isActive: boolean }>;
  previous: (PublicationLayoutDoc & { href: string }) | null;
  next: (PublicationLayoutDoc & { href: string }) | null;
};

export const buildPublicationLayoutModel = ({
  publication,
  orderedDocuments,
  currentDocument,
  linkStrategy,
}: {
  publication: PublicationLayoutMeta;
  orderedDocuments: PublicationLayoutDoc[];
  currentDocument: PublicationLayoutDoc;
  linkStrategy: PublicationLinkStrategy;
}): PublicationLayoutModel => {
  const docs = orderedDocuments.map((doc) => ({
    ...doc,
    href: doc.slug === orderedDocuments[0]?.slug ? linkStrategy.rootHref : linkStrategy.docHref(doc.slug),
    isActive: doc.slug === currentDocument.slug,
  }));

  const currentIndex = docs.findIndex((doc) => doc.slug === currentDocument.slug);

  return {
    publication,
    rootHref: linkStrategy.rootHref,
    current: currentDocument,
    docs,
    previous: currentIndex > 0 ? docs[currentIndex - 1] : null,
    next: currentIndex >= 0 && currentIndex < docs.length - 1 ? docs[currentIndex + 1] : null,
  };
};

const defaultLinkComponent: PublicationLayoutLinkComponent = ({ href, children, className }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

export const PublicationLayout = ({
  model,
  LinkComponent = defaultLinkComponent,
}: {
  model: PublicationLayoutModel;
  LinkComponent?: PublicationLayoutLinkComponent;
}) => (
  <main className="nd-shell">
    <aside className="nd-sidebar">
      <h1 className="nd-sidebar-title">
        <LinkComponent href={model.rootHref}>{model.publication.title}</LinkComponent>
      </h1>
      <ol className="nd-sidebar-list">
        {model.docs.map((doc) => (
          <li key={doc.slug}>
            <LinkComponent href={doc.href} className={doc.isActive ? "is-active" : undefined}>
              {doc.title}
            </LinkComponent>
          </li>
        ))}
      </ol>
    </aside>
    <section className="nd-main">
      <article className="markdown-body" dangerouslySetInnerHTML={{ __html: model.current.html }} />
      <nav className="nd-nav-grid" aria-label="Document navigation">
        {model.previous ? (
          <LinkComponent href={model.previous.href}>← {model.previous.title}</LinkComponent>
        ) : (
          <span />
        )}
        {model.next ? <LinkComponent href={model.next.href}>{model.next.title} →</LinkComponent> : <span />}
      </nav>
    </section>
  </main>
);

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderLink = (href: string, label: string, className?: string) =>
  `<a href="${escapeHtml(href)}"${className ? ` class="${escapeHtml(className)}"` : ""}>${escapeHtml(label)}</a>`;

export const renderPublicationLayoutHtml = (model: PublicationLayoutModel) => `
<main class="nd-shell">
  <aside class="nd-sidebar">
    <h1 class="nd-sidebar-title">${renderLink(model.rootHref, model.publication.title)}</h1>
    <ol class="nd-sidebar-list">
      ${model.docs
        .map(
          (doc) =>
            `<li>${renderLink(doc.href, doc.title, doc.isActive ? "is-active" : undefined)}</li>`
        )
        .join("")}
    </ol>
  </aside>
  <section class="nd-main">
    <article class="markdown-body">${model.current.html}</article>
    <nav class="nd-nav-grid" aria-label="Document navigation">
      ${model.previous ? renderLink(model.previous.href, `← ${model.previous.title}`) : "<span></span>"}
      ${model.next ? renderLink(model.next.href, `${model.next.title} →`) : "<span></span>"}
    </nav>
  </section>
</main>`;
