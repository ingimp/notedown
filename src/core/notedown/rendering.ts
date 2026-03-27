import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { NotesCollection, RenderedDoc } from "./types";

export type MarkdownRendererPlugin = (pipeline: ReturnType<typeof unified>) => ReturnType<typeof unified>;

export const createMarkdownRenderer = (plugins: MarkdownRendererPlugin[] = []) => {
  let pipeline = unified()
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

export const renderCollection = async (collection: NotesCollection) => {
  const renderer = createMarkdownRenderer();
  const docs: RenderedDoc[] = [];

  for (const doc of collection.docs.sort((a, b) => a.meta.order - b.meta.order)) {
    docs.push({
      slug: doc.meta.slug,
      title: doc.meta.title,
      order: doc.meta.order,
      html: await renderer.render(doc.markdown)
    });
  }

  return {
    collection: {
      id: collection.manifest.id,
      title: collection.manifest.title,
      description: collection.manifest.description
    },
    docs
  };
};
