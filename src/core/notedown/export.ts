import JSZip from "jszip";
import { renderCollection } from "./rendering";
import { getCollection } from "./storage";
import { DOCUMENT_SITE_CSS } from "./site-theme";

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

const buildCollectionEmptyIndexPage = (collectionTitle: string, description: string) =>
  shell(
    collectionTitle,
    `<main><h1>${collectionTitle}</h1>${description ? `<p>${description}</p>` : ""}<p>Nessun documento.</p></main>`
  );

const buildCollectionRootRedirectPage = (collectionTitle: string, firstDocSlug: string) =>
  `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0; url=./${firstDocSlug}/index.html" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${collectionTitle}</title>
</head>
<body>
  <p>Redirecting to <a href="./${firstDocSlug}/index.html">${firstDocSlug}</a>…</p>
  <script>location.replace('./${firstDocSlug}/index.html');</script>
</body>
</html>`;

const buildDocPage = (
  docTitle: string,
  collectionTitle: string,
  html: string,
  prev: { slug: string; title: string } | null,
  next: { slug: string; title: string } | null
) =>
  shell(
    `${docTitle} — ${collectionTitle}`,
    `<main><p><a href="../index.html">${collectionTitle}</a></p><article class="prose">${html}</article><nav>${
      prev ? `<a href="../${prev.slug}/index.html">← ${prev.title}</a>` : ""
    } ${next ? `<a href="../${next.slug}/index.html">${next.title} →</a>` : ""}</nav></main>`,
    "../"
  );

export const buildStaticSiteZip = async (username: string, collectionSlug: string) => {
  const collection = await getCollection(username, collectionSlug);
  if (!collection) throw new Error("Collection not found");

  const rendered = await renderCollection(collection);
  const zip = new JSZip();
  const root = `${username}/${collectionSlug}`;
  const allDocs = rendered.docs.map((d) => ({ slug: d.slug, title: d.title }));

  if (allDocs[0]) {
    zip.file(`${root}/index.html`, buildCollectionRootRedirectPage(rendered.collection.title, allDocs[0].slug));
  } else {
    zip.file(`${root}/index.html`, buildCollectionEmptyIndexPage(rendered.collection.title, rendered.collection.description));
  }

  rendered.docs.forEach((doc) => {
    zip.file(`${root}/${doc.slug}/index.html`, buildDocPage(doc.title, rendered.collection.title, doc.html, doc.previous, doc.next));
  });

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
