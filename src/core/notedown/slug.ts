import slugify from "slugify";

const toSlug = (value: string, fallback: string) =>
  slugify(value.trim(), { lower: true, strict: true }) || fallback;

export const slugifyCollectionTitle = (title: string) => toSlug(title, "notes");

export const slugifyDocumentTitle = (title: string) => toSlug(title, "document");

export const extractH1 = (markdown: string): string | null => {
  const match = markdown.match(/^#[ \t]+(.+)$/m);
  return match ? match[1].trim() : null;
};
