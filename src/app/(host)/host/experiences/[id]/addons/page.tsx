import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAddOn, deleteAddOn } from "@/lib/actions/addon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, PlusCircle } from "lucide-react";

function formatCents(cents: number) {
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export default async function AddOnsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId: clerkId, isAuthenticated } = await auth();
  if (!isAuthenticated || !clerkId) redirect("/sign-in");

  const { id: experienceId } = await params;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!dbUser) redirect("/sign-in");

  const experience = await prisma.experience.findFirst({
    where: { id: experienceId, hostId: dbUser.id, deletedAt: null },
    select: { id: true, title: true },
  });
  if (!experience) redirect("/host/experiences");

  const addOns = await prisma.addOn.findMany({
    where: { experienceId },
    orderBy: { priceCents: "asc" },
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add-ons</h1>
        <p className="text-muted-foreground text-sm mt-1">
          For: <span className="font-medium">{experience.title}</span>
        </p>
      </div>

      {addOns.length === 0 ? (
        <p className="text-sm text-muted-foreground">No add-ons yet.</p>
      ) : (
        <div className="space-y-3">
          {addOns.map((addon) => (
            <Card key={addon.id}>
              <CardContent className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{addon.name}</p>
                    <Badge variant={addon.isOptional ? "secondary" : "default"}>
                      {addon.isOptional ? "Optional" : "Required"}
                    </Badge>
                  </div>
                  {addon.description && (
                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                  )}
                  <p className="text-sm font-semibold">{formatCents(addon.priceCents)}</p>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await deleteAddOn(addon.id, experienceId);
                  }}
                >
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add new add-on</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async (formData: FormData) => {
              "use server";
              await createAddOn(experienceId, formData);
            }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" placeholder="e.g. Equipment rental" required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="priceEuros">Price (EUR) *</Label>
              <Input id="priceEuros" name="priceEuros" placeholder="12.50" required />
              <p className="text-xs text-muted-foreground">Dot or comma as decimal separator.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isOptional"
                name="isOptional"
                value="true"
                defaultChecked
                className="h-4 w-4"
              />
              <Label htmlFor="isOptional">Optional (customer can skip)</Label>
            </div>
            <Button type="submit" className="gap-2">
              <PlusCircle className="h-4 w-4" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
