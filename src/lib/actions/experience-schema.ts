import { z } from "zod";

export const CreateExperienceSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100),
  shortDescription: z.string().min(10).max(160, "Max 160 characters"),
  description: z.string().min(50, "Please describe your experience in detail"),
  categoryId: z.string().cuid("Invalid category"),
  location: z.string().min(3),
  timezone: z.string().default("Europe/Berlin"),
  durationMinutes: z.number().int().min(30).max(1440),
  minParticipants: z.number().int().min(1),
  maxParticipants: z.number().int().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  // User inputs a string like "49.99" — we convert to cents in the action
  basePriceEuros: z
    .string()
    .regex(/^\d+([.,]\d{1,2})?$/, "Enter a valid price like 49.99"),
  vatRateBps: z.number().int().default(1900),
}).refine(
  (d) => d.maxParticipants >= d.minParticipants,
  { message: "Max participants must be ≥ min participants", path: ["maxParticipants"] }
);

export const UpdateExperienceSchema = CreateExperienceSchema.partial().extend({
  id: z.string().cuid(),
});

export type CreateExperienceInput = z.infer<typeof CreateExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof UpdateExperienceSchema>;