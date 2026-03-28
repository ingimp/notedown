import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { NotesCollection, RenderedSite, RenderedSiteDoc } from "./types";

export type MarkdownRendererPlugin = (pipeline: any) => any;

export const createMarkdownRenderer = (plugins: MarkdownRendererPlugin[] = []) => {
  let pipeline: any = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify);

  for (const plugin of plugins) {
    pipeline = plugin(pipeline);
  }

  return {
    render: async (markdown: string) => {
      const file = await pipeline.process(markdown);
      return String(file.value);
    }
  };
};

export const renderCollection = async (collection: NotesCollection): Promise<RenderedSite> => {
  const renderer = createMarkdownRenderer();
  const ordered = [...collection.docs].sort((a, b) => a.meta.order - b.meta.order);

  const docs: RenderedSiteDoc[] = await Promise.all(
    ordered.map(async (doc, index) => ({
      slug: doc.meta.slug,
      title: doc.meta.title,
      order: doc.meta.order,
      html: await renderer.render(doc.markdown),
      previous:
        index > 0
          ? {
              slug: ordered[index - 1].meta.slug,
              title: ordered[index - 1].meta.title
            }
          : null,
      next:
        index < ordered.length - 1
          ? {
              slug: ordered[index + 1].meta.slug,
              title: ordered[index + 1].meta.title
            }
          : null,
      overviewHref: "index.html"
    }))
  );

  return {
    collection: {
      id: collection.manifest.id,
      title: collection.manifest.title,
      description: collection.manifest.description,
      overviewHref: "index.html"
    },
    docs
  };
};
