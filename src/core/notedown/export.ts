import JSZip from "jszip";
import { renderCollection } from "./rendering";
import { getCollection } from "./storage";
import { DOCUMENT_SITE_CSS } from "./site-theme";
import { buildDocumentsMetadata, buildPublicationMetadata } from "./export-metadata";

// SVG icons (inline, no external dependency)
const ICON_FILE = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688Z"/></svg>`;
const ICON_BOOK = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z"/></svg>`;
const ICON_LIST = `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.75A.75.75 0 0 1 .75 1h14.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 1.75Zm0 4A.75.75 0 0 1 .75 5h14.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 5.75Zm0 4A.75.75 0 0 1 .75 9h10.5a.75.75 0 0 1 0 1.5H.75A.75.75 0 0 1 0 9.75Z"/></svg>`;

const shell = (title: string, body: string, assetPrefix = "") => `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="stylesheet" href="${assetPrefix}assets/site.css" />
  <link rel="stylesheet" href="${assetPrefix}assets/katex.min.css" />
</head>
<body>
${body}
</body>
</html>`;

const sidebar = (
  collectionTitle: string,
  allDocs: Array<{ slug: string; title: string }>,
  activeSlug: string | null,
  assetPrefix: string
) => `
<aside class="nd-sidebar">
  <div class="nd-sidebar-header">
    <p class="nd-sidebar-kicker">Documenti</p>
    <a href="${assetPrefix}index.html" class="nd-sidebar-title${activeSlug === null ? " accent" : ""}">${collectionTitle}</a>
  </div>
  <nav class="nd-sidebar-nav">
    ${allDocs
      .map(
        (d, i) => `
    <a href="${assetPrefix}docs/${d.slug}.html" class="nd-nav-link${d.slug === activeSlug ? " active" : ""}">
      <span class="nd-nav-num">${i + 1}.</span>
      <span>${d.title}</span>
    </a>`
      )
      .join("")}
  </nav>
</aside>`;

const buildIndexPage = (
  collectionTitle: string,
  description: string,
  docs: Array<{ slug: string; title: string }>,
  assetPrefix = ""
) =>
  shell(
    collectionTitle,
    `<div class="nd-shell">
  <header class="nd-header">
    <div class="nd-header-breadcrumb">
      <span>notedown</span>
      <span>/</span>
      <span class="current">${collectionTitle}</span>
    </div>
  </header>
  <div class="nd-body">
    ${sidebar(collectionTitle, docs, null, assetPrefix)}
    <main class="nd-main">
      <div class="nd-index-body">
        <div class="nd-repo-header">
          <div class="nd-repo-title">${ICON_BOOK} ${collectionTitle}</div>
          ${description ? `<p class="nd-repo-desc">${description}</p>` : ""}
          <div class="nd-repo-meta">${ICON_LIST} ${docs.length} document${docs.length !== 1 ? "i" : "o"}</div>
        </div>

        <div class="nd-file-list">
          <div class="nd-file-list-header">Documenti</div>
          ${docs
            .map(
              (d, i) => `
          <a href="${assetPrefix}docs/${d.slug}.html" class="nd-file-row">
            <span class="nd-file-icon">${ICON_FILE}</span>
            <span class="nd-file-num">${i + 1}.</span>
            <span class="nd-file-name">${d.title}</span>
            <span class="nd-file-slug">${d.slug}.md</span>
          </a>`
            )
            .join("")}
        </div>
      </div>
    </main>
  </div>
</div>`,
    assetPrefix
  );

const buildDocPage = (
  docTitle: string,
  collectionTitle: string,
  html: string,
  allDocs: Array<{ slug: string; title: string }>,
  currentSlug: string,
  prev: { slug: string; title: string } | null,
  next: { slug: string; title: string } | null,
  assetPrefix = ""
) =>
  shell(
    `${docTitle} — ${collectionTitle}`,
    `<div class="nd-shell">
  <header class="nd-header">
    <div class="nd-header-breadcrumb">
      <a href="${assetPrefix}index.html">notedown</a>
      <span>/</span>
      <a href="${assetPrefix}index.html">${collectionTitle}</a>
      <span>/</span>
      <span class="current">${currentSlug}.md</span>
    </div>
  </header>
  <div class="nd-body">
    ${sidebar(collectionTitle, allDocs, currentSlug, assetPrefix)}
    <main class="nd-main">
      <div class="nd-file-header">
        <div class="nd-file-header-left">${ICON_FILE} ${currentSlug}.md</div>
        <div class="nd-file-header-right">${docTitle}</div>
      </div>
      <div class="nd-content">
        <article class="prose">${html}</article>
        ${
          prev || next
            ? `
        <div class="nd-docnav">
          ${
            prev
              ? `<a href="${assetPrefix}docs/${prev.slug}.html" class="nd-docnav-prev">
                <span class="nd-docnav-arrow">←</span>
                <span class="nd-docnav-title">${prev.title}</span>
               </a>`
              : '<div class="nd-docnav-spacer" aria-hidden="true"></div>'
          }
          ${
            next
              ? `<a href="${assetPrefix}docs/${next.slug}.html" class="nd-docnav-next">
                <span class="nd-docnav-title">${next.title}</span>
                <span class="nd-docnav-arrow">→</span>
               </a>`
              : '<div class="nd-docnav-spacer" aria-hidden="true"></div>'
          }
        </div>`
            : ""
        }
      </div>
    </main>
  </div>
</div>`,
    assetPrefix
  );

export const buildStaticSiteZip = async (username: string, collectionSlug: string) => {
  const collection = await getCollection(username, collectionSlug);
  if (!collection) throw new Error("Collection not found");

  const rendered = await renderCollection(collection);
  const zip = new JSZip();
  const root = `${username}-${collectionSlug}-site`;
  const allDocs = rendered.docs.map((d) => ({ slug: d.slug, title: d.title }));

  zip.file(`${root}/index.html`, buildIndexPage(rendered.collection.title, rendered.collection.description, allDocs, ""));

  rendered.docs.forEach((doc) => {
    zip.file(
      `${root}/docs/${doc.slug}.html`,
      buildDocPage(doc.title, rendered.collection.title, doc.html, allDocs, doc.slug, doc.previous, doc.next, "../")
    );
  });

  const publicationMetadata = buildPublicationMetadata({
    title: rendered.collection.title,
    slug: rendered.collection.slug,
    username: rendered.collection.username,
  });
  zip.file(`${root}/publication.json`, JSON.stringify(publicationMetadata, null, 2));

  const documentsMetadata = buildDocumentsMetadata(rendered.docs);
  zip.file(`${root}/documents.json`, JSON.stringify(documentsMetadata, null, 2));

  zip.file(`${root}/assets/site.css`, DOCUMENT_SITE_CSS);

  const fs = await import("fs/promises");
  const path = await import("path");
  const candidates = [path.join(process.cwd(), "node_modules", "katex"), path.join(process.cwd(), ".next", "server", "node_modules", "katex")];

  let katexDist: string | null = null;
  for (const rootCandidate of candidates) {
    const dist = path.join(rootCandidate, "dist");
    try {
      await fs.access(path.join(dist, "katex.min.css"));
      katexDist = dist;
      break;
    } catch {}
  }
  if (!katexDist) throw new Error("KaTeX dist not found");

  zip.file(`${root}/assets/katex.min.css`, await fs.readFile(path.join(katexDist, "katex.min.css"), "utf8"));
  for (const font of await fs.readdir(path.join(katexDist, "fonts"))) {
    zip.file(`${root}/assets/fonts/${font}`, await fs.readFile(path.join(katexDist, "fonts", font)));
  }

  return zip.generateAsync({ type: "nodebuffer" });
};
