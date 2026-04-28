"use client";

// Optimistic wishlist toggle button. Implementation added in wishlist step.
export function WishlistHeart({ experienceId }: { experienceId: string }) {
  return <button aria-label="Zur Merkliste" data-experience-id={experienceId} />;
}
