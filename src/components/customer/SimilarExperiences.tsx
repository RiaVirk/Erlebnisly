import { getSimilarExperiences } from "@/lib/actions/similar";
import { ExperienceCard } from "@/components/customer/search/ExperienceCard";

export async function SimilarExperiences({ experienceId }: { experienceId: string }) {
  const similar = await getSimilarExperiences(experienceId, 4);
  if (similar.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="type-title-sm text-ds-on-surface mb-6">Ähnliche Erlebnisse</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similar.map((exp) => (
          <ExperienceCard key={exp.id} experience={exp} />
        ))}
      </div>
    </section>
  );
}
