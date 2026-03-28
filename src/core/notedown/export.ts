import JSZip from "jszip";
import { buildPublicationLayoutModel, renderPublicationLayoutHtml } from "./layout";
import { renderCollection } from "./rendering";
import { getCollection } from "./storage";
import { DOCUMENT_SITE_CSS } from "./site-theme";

const htmlDocument = (title: string, body: string, assetPrefix = "") => `<!doctype html>
<html lang="en">
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

export const buildStaticSiteZip = async (collectionId: string) => {
  const collection = await getCollection(collectionId);
  if (!collection) throw new Error("Collection not found");

  const rendered = await renderCollection(collection);
  const orderedDocuments = rendered.docs.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    html: doc.html,
  }));

  if (orderedDocuments.length === 0) {
    throw new Error("Cannot export an empty publication");
  }

  const zip = new JSZip();
  const firstDoc = orderedDocuments[0];

  const renderPage = (currentSlug: string, assetPrefix = "") => {
    const currentDocument = orderedDocuments.find((doc) => doc.slug === currentSlug) ?? firstDoc;
    const model = buildPublicationLayoutModel({
      publication: { title: rendered.collection.title },
      orderedDocuments,
      currentDocument,
      linkStrategy: {
        rootHref: `${assetPrefix}index.html`,
        docHref: (slug) => `${assetPrefix}docs/${slug}.html`,
      },
    });

    return htmlDocument(
      currentDocument.title,
      renderPublicationLayoutHtml(model),
      assetPrefix
    );
  };

  zip.file("index.html", renderPage(firstDoc.slug));

  rendered.docs.forEach((doc) => {
    zip.file(`docs/${doc.slug}.html`, renderPage(doc.slug, "../"));
  });

  zip.file("assets/site.css", DOCUMENT_SITE_CSS);

  const fs = await import("fs/promises");
  const path = await import("path");

  const candidateKatexRoots = [
    path.join(process.cwd(), "node_modules", "katex"),
    path.join(process.cwd(), ".next", "server", "node_modules", "katex"),
  ];

  let katexDistDir: string | null = null;
  for (const candidateRoot of candidateKatexRoots) {
    const distCandidate = path.join(candidateRoot, "dist");
    try {
      await fs.access(path.join(distCandidate, "katex.min.css"));
      await fs.access(path.join(distCandidate, "fonts"));
      katexDistDir = distCandidate;
      break;
    } catch {
      // try next location
    }
  }

  if (!katexDistDir) {
    throw new Error("KaTeX dist assets not found in known node_modules locations");
  }

  const katexCssPath = path.join(katexDistDir, "katex.min.css");
  const katexFontsDir = path.join(katexDistDir, "fonts");
  zip.file("assets/katex.min.css", await fs.readFile(katexCssPath, "utf8"));
  for (const font of await fs.readdir(katexFontsDir)) {
    const full = path.join(katexFontsDir, font);
    const data = await fs.readFile(full);
    zip.file(`assets/fonts/${font}`, data);
  }

  return zip.generateAsync({ type: "nodebuffer" });
};
