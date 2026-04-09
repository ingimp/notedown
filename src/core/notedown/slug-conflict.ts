export interface SlugCandidate {
  slug: string;
}

export function hasConflictingSiblingSlug(
  docs: SlugCandidate[],
  nextSlug: string,
  currentSlug: string
) {
  return docs.some((doc) => doc.slug === nextSlug && doc.slug !== currentSlug);
}
