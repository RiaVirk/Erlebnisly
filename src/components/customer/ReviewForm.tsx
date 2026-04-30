"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { submitReview } from "@/lib/actions/review";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ReviewForm({ bookingId }: { bookingId: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-4 rounded-md border p-5">
      <h3 className="font-semibold">Bewertung abgeben</h3>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            aria-label={`${n} Stern${n === 1 ? "" : "e"}`}
            className="p-1"
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                n <= (hover || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Wie war das Erlebnis? (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        maxLength={2000}
      />

      <Button
        disabled={rating === 0 || pending}
        onClick={() =>
          start(async () => {
            const res = await submitReview({
              bookingId,
              rating,
              comment: comment.trim() || undefined,
            });
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            toast.success("Danke für deine Bewertung!");
            router.refresh();
          })
        }
      >
        {pending ? "Wird gesendet…" : "Bewertung abschicken"}
      </Button>
    </div>
  );
}
