"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { publishExperience } from "@/lib/actions/experience";

export default function PublishButton({
  experienceId,
  isPublished,
}: {
  experienceId: string;
  isPublished: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    startTransition(async () => {
      const result = await publishExperience(experienceId);
      if (result.error) toast.error(result.error);
      else toast.success("Experience published!");
    });
  }

  if (isPublished) return null;

  return (
    <Button onClick={handlePublish} disabled={isPending}>
      {isPending ? "Publishing..." : "Publish"}
    </Button>
  );
}