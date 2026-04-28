// Experience card shown in search results and listings.
// Will include WishlistHeart and star rating. Implementation added in search step.
export function ExperienceCard({ id, title }: { id: string; title: string }) {
  return <div data-id={id}>{title}</div>;
}
