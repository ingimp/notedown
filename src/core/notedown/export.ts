import JSZip from "jszip";
import { renderCollection } from "./rendering";
import { getCollection } from "./storage";

export const EXPORTED_SITE_CSS = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #24292f; background: #fff; }
a { color: #0969da; text-decoration: none; }
a:hover { text-decoration: underline; }
.page { max-width: 980px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
nav { margin: 0 0 1.5rem; font-size: 0.95rem; }
.doc-list { padding-left: 1.25rem; }
.markdown-body { line-height: 1.65; }
.markdown-body h1, .markdown-body h2, .markdown-body h3 { border-bottom: 1px solid #d0d7de; padding-bottom: .3em; }
.markdown-body pre { background: #f6f8fa; border-radius: 6px; padding: 1rem; overflow-x: auto; }
.markdown-body code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
.markdown-body table { border-collapse: collapse; width: 100%; }
.markdown-body th, .markdown-body td { border: 1px solid #d0d7de; padding: 0.4rem 0.6rem; }
.nav-grid { display: flex; justify-content: space-between; margin-top: 2.5rem; gap: 1rem; }
`;

const layout = (title: string, body: string) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="assets/site.css" />
    <link rel="stylesheet" href="assets/katex.min.css" />
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
      `<main class="page"><h1>${rendered.collection.title}</h1><p>${rendered.collection.description}</p><ol class="doc-list">${rendered.docs
        .map((doc) => `<li><a href="docs/${doc.slug}.html">${doc.title}</a></li>`)
        .join("")}</ol></main>`
    )
  );

  rendered.docs.forEach((doc, index) => {
    const prev = rendered.docs[index - 1];
    const next = rendered.docs[index + 1];

    zip.file(
      `docs/${doc.slug}.html`,
      layout(
        doc.title,
        `<main class="page"><nav><a href="../index.html">← Back to collection</a></nav><article class="markdown-body">${doc.html}</article><div class="nav-grid">${
          prev ? `<a href="${prev.slug}.html">← ${prev.title}</a>` : "<span></span>"
        }${next ? `<a href="${next.slug}.html">${next.title} →</a>` : "<span></span>"}</div></main>`
      ).replaceAll("assets/", "../assets/")
    );
  });

  zip.file("assets/site.css", EXPORTED_SITE_CSS);

  const katexCssPath = require.resolve("katex/dist/katex.min.css");
  const katexFontsDir = require.resolve("katex/dist/fonts/KaTeX_Main-Regular.woff2").replace(
    /KaTeX_Main-Regular\.woff2$/,
    ""
  );
  const fs = await import("fs/promises");
  const path = await import("path");
  zip.file("assets/katex.min.css", await fs.readFile(katexCssPath, "utf8"));
  for (const font of await fs.readdir(katexFontsDir)) {
    const full = path.join(katexFontsDir, font);
    const data = await fs.readFile(full);
    zip.file(`assets/fonts/${font}`, data);
  }

  return zip.generateAsync({ type: "nodebuffer" });
};
