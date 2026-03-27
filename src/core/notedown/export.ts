import JSZip from "jszip";
import { renderCollection } from "./rendering";
import { getCollection } from "./storage";
import { DOCUMENT_SITE_CSS } from "./site-theme";

const layout = (title: string, body: string, assetPrefix = "") => `<!doctype html>
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
  const zip = new JSZip();

  zip.file(
    "index.html",
    layout(
      rendered.collection.title,
      `<main class="nd-page"><h1>${rendered.collection.title}</h1><p>${rendered.collection.description}</p><ol class="nd-doc-list">${rendered.docs
        .map((doc) => `<li><a href="docs/${doc.slug}.html">${doc.title}</a></li>`)
        .join("")}</ol></main>`
    )
  );

  rendered.docs.forEach((doc) => {
    zip.file(
      `docs/${doc.slug}.html`,
      layout(
        doc.title,
        `<main class="nd-page"><nav class="nd-nav"><a href="../${doc.overviewHref}">← Back to collection</a></nav><article class="markdown-body">${doc.html}</article><div class="nd-nav-grid">${
          doc.previous
            ? `<a href="${doc.previous.slug}.html">← ${doc.previous.title}</a>`
            : "<span></span>"
        }${doc.next ? `<a href="${doc.next.slug}.html">${doc.next.title} →</a>` : "<span></span>"}</div></main>`,
        "../"
      )
    );
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
