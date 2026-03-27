export type NoteDocMeta = {
  slug: string;
  title: string;
  order: number;
  fileName: string;
};

export type NotesManifest = {
  id: string;
  title: string;
  description: string;
  docs: NoteDocMeta[];
  createdAt: string;
  updatedAt: string;
};

export type NotesDoc = {
  meta: NoteDocMeta;
  markdown: string;
};

export type NotesCollection = {
  manifest: NotesManifest;
  docs: NotesDoc[];
};

export type RenderedDoc = {
  slug: string;
  title: string;
  html: string;
  order: number;
};
