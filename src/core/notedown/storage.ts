import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_USERNAME, buildCollectionKey } from "./paths";
import { extractH1, slugifyCollectionTitle, slugifyDocumentTitle } from "./slug";
import { NotesCollection, NotesDoc, NotesManifest } from "./types";

const DATA_ROOT = process.env.NOTEDOWN_DATA_ROOT || path.join(process.cwd(), "data", "notes");

const ensureNotesRoot = async () => {
  await fs.mkdir(DATA_ROOT, { recursive: true });
};

const userDir = (username: string) => path.join(DATA_ROOT, username);
const collectionDir = (username: string, collectionSlug: string) => path.join(userDir(username), collectionSlug);
const manifestPath = (username: string, collectionSlug: string) => path.join(collectionDir(username, collectionSlug), "manifest.json");
const docsDir = (username: string, collectionSlug: string) => path.join(collectionDir(username, collectionSlug), "docs");
const docPath = (username: string, collectionSlug: string, fileName: string) => path.join(docsDir(username, collectionSlug), fileName);

const throwConflict = (message: string) => {
  const error = new Error(message) as Error & { code?: string };
  error.code = "CONFLICT";
  throw error;
};

const readManifest = async (username: string, collectionSlug: string): Promise<NotesManifest | null> => {
  try {
    const raw = await fs.readFile(manifestPath(username, collectionSlug), "utf8");
    const manifest = JSON.parse(raw) as NotesManifest;
    return {
      ...manifest,
      username: manifest.username || username,
      slug: manifest.slug || collectionSlug,
      id: manifest.id || buildCollectionKey(username, collectionSlug),
    };
  } catch {
    return null;
  }
};

export const createCollection = async (input: { title: string; description: string; username?: string }) => {
  await ensureNotesRoot();
  const username = input.username || DEFAULT_USERNAME;
  const collectionSlug = slugifyCollectionTitle(input.title);
  const id = buildCollectionKey(username, collectionSlug);

  const existing = await readManifest(username, collectionSlug);
  if (existing) {
    throwConflict(`Collection already exists for ${id}`);
  }

  await fs.mkdir(docsDir(username, collectionSlug), { recursive: true });

  const now = new Date().toISOString();
  const manifest: NotesManifest = {
    id,
    username,
    slug: collectionSlug,
    title: input.title,
    description: input.description,
    docs: [],
    createdAt: now,
    updatedAt: now,
  };

  await fs.writeFile(manifestPath(username, collectionSlug), JSON.stringify(manifest, null, 2), "utf8");
  return manifest;
};

export const listCollections = async (): Promise<NotesManifest[]> => {
  await ensureNotesRoot();
  const userEntries = await fs.readdir(DATA_ROOT, { withFileTypes: true });
  const manifests: NotesManifest[] = [];

  for (const userEntry of userEntries) {
    if (!userEntry.isDirectory()) continue;
    const username = userEntry.name;
    const collectionEntries = await fs.readdir(userDir(username), { withFileTypes: true });
    for (const collectionEntry of collectionEntries) {
      if (!collectionEntry.isDirectory()) continue;
      const manifest = await readManifest(username, collectionEntry.name);
      if (manifest) manifests.push(manifest);
    }
  }

  return manifests.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
};

export const getCollection = async (username: string, collectionSlug: string): Promise<NotesCollection | null> => {
  const manifest = await readManifest(username, collectionSlug);
  if (!manifest) return null;

  try {
    const docs: NotesDoc[] = [];
    for (const doc of manifest.docs.sort((a, b) => a.order - b.order)) {
      const markdown = await fs.readFile(docPath(username, collectionSlug, doc.fileName), "utf8");
      docs.push({ meta: doc, markdown });
    }

    return { manifest, docs };
  } catch {
    return null;
  }
};

export const addDocument = async (
  username: string,
  collectionSlug: string,
  input: { title: string; initialMarkdown?: string }
) => {
  const collection = await getCollection(username, collectionSlug);
  if (!collection) throw new Error(`Collection not found: ${buildCollectionKey(username, collectionSlug)}`);

  const slug = slugifyDocumentTitle(input.title);
  if (collection.manifest.docs.some((doc) => doc.slug === slug)) {
    throwConflict(`Document slug already exists: ${slug}`);
  }

  const fileName = `${slug}.md`;
  const nextOrder = collection.manifest.docs.length;

  const meta = { slug, title: input.title, order: nextOrder, fileName };
  collection.manifest.docs.push(meta);
  collection.manifest.updatedAt = new Date().toISOString();

  await fs.writeFile(docPath(username, collectionSlug, fileName), input.initialMarkdown ?? `# ${input.title}\n`, "utf8");
  await fs.writeFile(manifestPath(username, collectionSlug), JSON.stringify(collection.manifest, null, 2), "utf8");

  return meta;
};

export const updateDocument = async (username: string, collectionSlug: string, slug: string, markdown: string) => {
  const collection = await getCollection(username, collectionSlug);
  if (!collection) throw new Error(`Collection not found: ${buildCollectionKey(username, collectionSlug)}`);

  const doc = collection.manifest.docs.find((item) => item.slug === slug);
  if (!doc) throw new Error(`Document not found: ${slug}`);

  const derivedTitle = extractH1(markdown) || doc.title;
  const nextSlug = slugifyDocumentTitle(derivedTitle);

  if (nextSlug !== slug && collection.manifest.docs.some((item) => item.slug === nextSlug)) {
    throwConflict(`Cannot rename document to existing slug: ${nextSlug}`);
  }

  const targetFileName = `${nextSlug}.md`;
  if (targetFileName !== doc.fileName) {
    await fs.rename(
      docPath(username, collectionSlug, doc.fileName),
      docPath(username, collectionSlug, targetFileName)
    );
    doc.slug = nextSlug;
    doc.fileName = targetFileName;
  }

  doc.title = derivedTitle;
  collection.manifest.updatedAt = new Date().toISOString();

  await fs.writeFile(docPath(username, collectionSlug, doc.fileName), markdown, "utf8");
  await fs.writeFile(manifestPath(username, collectionSlug), JSON.stringify(collection.manifest, null, 2), "utf8");

  return { slug: doc.slug, fileName: doc.fileName, title: doc.title };
};

export const deleteDocument = async (username: string, collectionSlug: string, slug: string) => {
  const collection = await getCollection(username, collectionSlug);
  if (!collection) throw new Error(`Collection not found: ${buildCollectionKey(username, collectionSlug)}`);
  const doc = collection.manifest.docs.find((item) => item.slug === slug);
  if (!doc) throw new Error(`Document not found: ${slug}`);

  await fs.unlink(docPath(username, collectionSlug, doc.fileName));
  collection.manifest.docs = collection.manifest.docs.filter((d) => d.slug !== slug);
  collection.manifest.updatedAt = new Date().toISOString();
  await fs.writeFile(manifestPath(username, collectionSlug), JSON.stringify(collection.manifest, null, 2), "utf8");
};

export const deleteCollection = async (username: string, collectionSlug: string) => {
  const dir = collectionDir(username, collectionSlug);
  await fs.rm(dir, { recursive: true, force: true });
};
