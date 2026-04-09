export const DEFAULT_USERNAME = "anonymous";

export const buildCollectionKey = (username: string, collectionSlug: string) => `${username}/${collectionSlug}`;

export const buildEditorCollectionPath = (username: string, collectionSlug: string) =>
  `/collections/${username}/${collectionSlug}`;

export const buildEditorDocumentPath = (username: string, collectionSlug: string, docSlug: string) =>
  `/collections/${username}/${collectionSlug}/${docSlug}`;

export const buildPreviewCollectionPath = (username: string, collectionSlug: string) =>
  `/preview/${username}/${collectionSlug}`;

export const buildPreviewDocumentPath = (username: string, collectionSlug: string, docSlug: string) =>
  `/preview/${username}/${collectionSlug}/${docSlug}`;

export const buildCollectionApiPath = (username: string, collectionSlug: string) =>
  `/api/collections/${username}/${collectionSlug}`;

export const buildDocumentApiPath = (username: string, collectionSlug: string, docSlug: string) =>
  `/api/collections/${username}/${collectionSlug}/docs/${docSlug}`;

export const buildCreateDocumentApiPath = (username: string, collectionSlug: string) =>
  `/api/collections/${username}/${collectionSlug}/docs`;
