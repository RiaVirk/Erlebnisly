import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCentsEUR } from "@/lib/pricing/utils";

export default async function HostExperiencesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) redirect("/sign-in");

  const experiences = await prisma.experience.findMany({
    where: { hostId: user.id, deletedAt: null },
    include: { category: true, _count: { select: { timeSlots: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Experiences</h1>
        <Button asChild>
          <Link href="/host/experiences/new">+ New Experience</Link>
        </Button>
      </div>

      {experiences.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          No experiences yet. Create your first one!
        </Card>
      )}

      <div className="grid gap-4">
        {experiences.map((exp) => (
          <Card key={exp.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{exp.title}</h2>
                <Badge variant={exp.isPublished ? "default" : "secondary"}>
                  {exp.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {exp.category.name} · {formatCentsEUR(exp.basePriceCents)} ·{" "}
                {exp._count.timeSlots} slots
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/host/experiences/${exp.id}`}>Manage</Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}