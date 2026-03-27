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

export type RenderedSiteLink = {
  slug: string;
  title: string;
};

export type RenderedSiteDoc = {
  slug: string;
  title: string;
  order: number;
  html: string;
  previous: RenderedSiteLink | null;
  next: RenderedSiteLink | null;
  overviewHref: string;
};

export type RenderedSite = {
  collection: {
    id: string;
    title: string;
    description: string;
    overviewHref: string;
  };
  docs: RenderedSiteDoc[];
};
