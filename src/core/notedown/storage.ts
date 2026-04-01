import { promises as fs } from "fs";
import path from "path";
import slugify from "slugify";
import { NotesCollection, NotesDoc, NotesManifest } from "./types";

const DATA_ROOT = path.join(process.cwd(), "data", "notes");

const ensureNotesRoot = async () => {
  await fs.mkdir(DATA_ROOT, { recursive: true });
};

const collectionDir = (id: string) => path.join(DATA_ROOT, id);
const manifestPath = (id: string) => path.join(collectionDir(id), "manifest.json");
const docsDir = (id: string) => path.join(collectionDir(id), "docs");
const docPath = (id: string, fileName: string) => path.join(docsDir(id), fileName);

export const createCollection = async (input: { title: string; description: string }) => {
  await ensureNotesRoot();
  const baseId = slugify(input.title, { lower: true, strict: true }) || "notes";
  const id = `${baseId}-${Date.now().toString(36)}`;
  await fs.mkdir(docsDir(id), { recursive: true });

  const now = new Date().toISOString();
  const manifest: NotesManifest = {
    id,
    title: input.title,
    description: input.description,
    docs: [],
    createdAt: now,
    updatedAt: now
  };

  await fs.writeFile(manifestPath(id), JSON.stringify(manifest, null, 2), "utf8");
  return manifest;
};

export const listCollections = async (): Promise<NotesManifest[]> => {
  await ensureNotesRoot();
  const entries = await fs.readdir(DATA_ROOT, { withFileTypes: true });
  const manifests: NotesManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const file = manifestPath(entry.name);
    try {
      const raw = await fs.readFile(file, "utf8");
      manifests.push(JSON.parse(raw) as NotesManifest);
    } catch {
      // Ignore malformed collections.
    }
  }

  return manifests.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

export const getCollection = async (id: string): Promise<NotesCollection | null> => {
  try {
    const rawManifest = await fs.readFile(manifestPath(id), "utf8");
    const manifest = JSON.parse(rawManifest) as NotesManifest;

    const docs: NotesDoc[] = [];
    for (const doc of manifest.docs.sort((a, b) => a.order - b.order)) {
      const markdown = await fs.readFile(docPath(id, doc.fileName), "utf8");
      docs.push({ meta: doc, markdown });
    }

    return { manifest, docs };
  } catch {
    return null;
  }
};

export const addDocument = async (
  id: string,
  input: { title: string; initialMarkdown?: string }
) => {
  const collection = await getCollection(id);
  if (!collection) throw new Error(`Collection not found: ${id}`);

  const slugBase = slugify(input.title, { lower: true, strict: true }) || "document";
  const slug = `${slugBase}-${(collection.manifest.docs.length + 1).toString().padStart(2, "0")}`;
  const fileName = `${slug}.md`;
  const nextOrder = collection.manifest.docs.length;

  const meta = { slug, title: input.title, order: nextOrder, fileName };
  collection.manifest.docs.push(meta);
  collection.manifest.updatedAt = new Date().toISOString();

  await fs.writeFile(docPath(id, fileName), input.initialMarkdown ?? `# ${input.title}\n`, "utf8");
  await fs.writeFile(manifestPath(id), JSON.stringify(collection.manifest, null, 2), "utf8");

  return meta;
};

export const updateDocument = async (id: string, slug: string, markdown: string) => {
  const collection = await getCollection(id);
  if (!collection) throw new Error(`Collection not found: ${id}`);

  const doc = collection.manifest.docs.find((item) => item.slug === slug);
  if (!doc) throw new Error(`Document not found: ${slug}`);

  collection.manifest.updatedAt = new Date().toISOString();
  await fs.writeFile(docPath(id, doc.fileName), markdown, "utf8");
  await fs.writeFile(manifestPath(id), JSON.stringify(collection.manifest, null, 2), "utf8");
};

export const deleteDocument = async (id: string, slug: string) => {
  const collection = await getCollection(id);
  if (!collection) throw new Error(`Collection not found: ${id}`);
  const doc = collection.manifest.docs.find((item) => item.slug === slug);
  if (!doc) throw new Error(`Document not found: ${slug}`);
  // Remove file
  await fs.unlink(docPath(id, doc.fileName));
  // Remove from manifest
  collection.manifest.docs = collection.manifest.docs.filter((d) => d.slug !== slug);
  collection.manifest.updatedAt = new Date().toISOString();
  await fs.writeFile(manifestPath(id), JSON.stringify(collection.manifest, null, 2), "utf8");
};

export const deleteCollection = async (id: string) => {
  const dir = collectionDir(id);
  await fs.rm(dir, { recursive: true, force: true });
};

export const updateDocumentTitle = async (id: string, slug: string, title: string) => {
  const collection = await getCollection(id);
  if (!collection) throw new Error(`Collection not found: ${id}`);
  const doc = collection.manifest.docs.find((item) => item.slug === slug);
  if (!doc) throw new Error(`Document not found: ${slug}`);
  doc.title = title;
  collection.manifest.updatedAt = new Date().toISOString();
  await fs.writeFile(manifestPath(id), JSON.stringify(collection.manifest, null, 2), "utf8");
};
