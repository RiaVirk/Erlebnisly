import ExperienceForm from "../_components/ExperienceForm";
import { prisma } from "@/lib/prisma";

export default async function NewExperiencePage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create New Experience</h1>
      <ExperienceForm categories={categories} />
    </div>
  );
}