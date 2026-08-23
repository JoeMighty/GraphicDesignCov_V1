import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || /^https?:\/\//i.test(v), {
    message: "Link must start with http:// or https://",
  });

export const submissionFieldsSchema = z.object({
  student_name: z.string().trim().min(1, "Name is required").max(120),
  title: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined)),
  instagram_url: optionalUrl,
  behance_url: optionalUrl,
  website_url: optionalUrl,
});

export type SubmissionFields = z.infer<typeof submissionFieldsSchema>;

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB, before server-side compression
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
