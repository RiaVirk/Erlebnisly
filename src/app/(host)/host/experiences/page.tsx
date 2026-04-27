import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
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
    <>
      <header className="sticky top-0 h-16 border-b border-ds-outline-variant bg-white/80 backdrop-blur-md flex justify-between items-center px-8 z-40">
        <div>
          <p className="type-label-caps text-ds-on-surface-variant">HOST PORTAL</p>
          <h1 className="type-title-sm text-ds-on-surface">My Experiences</h1>
        </div>
        <Link href="/host/experiences/new" className="flex items-center gap-2 bg-ds-secondary text-ds-on-secondary px-4 py-2 rounded-ds type-body-sm font-semibold hover:opacity-90 transition-opacity">
          <span className="material-symbols-outlined text-title-sm">add</span>New Experience
        </Link>
      </header>

      <div className="p-8 max-w-360 mx-auto">
        {experiences.length === 0 ? (
          <div className="bg-white rounded-ds-lg border border-dashed border-ds-outline-variant p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-ds-outline mb-4 block">travel_explore</span>
            <p className="type-title-sm text-ds-on-surface mb-2">No experiences yet</p>
            <p className="type-body-sm text-ds-on-surface-variant mb-6">Create your first experience to start accepting bookings.</p>
            <Link href="/host/experiences/new" className="inline-flex items-center gap-2 bg-ds-secondary text-ds-on-secondary px-5 py-2.5 rounded-ds type-body-sm font-semibold hover:opacity-90 transition-opacity">
              <span className="material-symbols-outlined text-title-sm">add</span>Create your first experience
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-ds-lg border border-ds-outline-variant overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.08)]">
            <table className="w-full text-left">
              <thead className="bg-ds-surface-container-low border-b border-ds-outline-variant">
                <tr>
                  {["Experience", "Category", "Price", "Slots", "Status", ""].map((h) => (
                    <th key={h} className="px-6 py-3 type-label-caps text-ds-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ds-outline-variant">
                {experiences.map((exp) => (
                  <tr key={exp.id} className="hover:bg-ds-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <p className="type-body-sm font-semibold text-ds-on-surface">{exp.title}</p>
                      <p className="type-body-sm text-ds-on-surface-variant line-clamp-1">{exp.shortDescription}</p>
                    </td>
                    <td className="px-6 py-4 type-body-sm text-ds-on-surface-variant">{exp.category.name}</td>
                    <td className="px-6 py-4 type-data-tabular text-ds-on-surface">{formatCentsEUR(exp.basePriceCents)}<span className="text-ds-on-surface-variant">/pp</span></td>
                    <td className="px-6 py-4 type-data-tabular text-ds-on-surface">{exp._count.timeSlots}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full type-label-caps ${exp.isPublished ? "bg-ds-secondary/10 text-ds-secondary" : "bg-ds-surface-container-highest text-ds-on-surface-variant"}`}>
                        {exp.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/host/experiences/${exp.id}`} className="px-4 py-1.5 border border-ds-primary text-ds-primary type-body-sm font-semibold rounded-ds hover:bg-ds-primary hover:text-ds-on-primary transition-all">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
