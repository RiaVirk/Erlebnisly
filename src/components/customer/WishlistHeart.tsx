"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

interface Props {
  experienceId: string;
  initialIsInWishlist: boolean;
}

export function WishlistHeart({ experienceId, initialIsInWishlist }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(initialIsInWishlist);
  const [pending, start] = useTransition();

  function handle() {
    start(async () => {
      setOptimistic(!optimistic);
      const res = await toggleWishlist(experienceId);
      if (!res.ok) {
        toast.error("Merkliste konnte nicht aktualisiert werden");
        setOptimistic(initialIsInWishlist);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={optimistic ? "Von Merkliste entfernen" : "Zur Merkliste hinzufügen"}
      onClick={handle}
      disabled={pending}
      className="rounded-full"
    >
      <Heart
        className={`h-5 w-5 transition-colors ${
          optimistic ? "fill-red-500 text-red-500" : "text-gray-400"
        }`}
      />
    </Button>
  );
}
