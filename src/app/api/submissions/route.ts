import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, submissionFieldsSchema } from "@/lib/validation";
import { processArtworkImage } from "@/lib/image";
import { ARTWORK_BUCKET, getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();

  // Honeypot: real users never fill this hidden field. Bots that do get a
  // fake success so they don't learn to avoid the field.
  const honeypot = formData.get("company");
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const parsed = submissionFieldsSchema.safeParse({
    student_name: formData.get("student_name"),
    title: formData.get("title"),
    instagram_url: formData.get("instagram_url"),
    behance_url: formData.get("behance_url"),
    website_url: formData.get("website_url"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
      { status: 400 }
    );
  }

  const file = formData.get("image");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "An image file is required" }, { status: 400 });
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Please upload a JPEG, PNG, or WebP image" },
      { status: 400 }
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 20MB)" }, { status: 400 });
  }

  let processed;
  try {
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    processed = await processArtworkImage(inputBuffer);
  } catch {
    return NextResponse.json({ error: "Could not process that image file" }, { status: 400 });
  }

  const id = randomUUID();
  const fullPath = `full/${id}.webp`;
  const thumbPath = `thumb/${id}.webp`;

  const supabase = getSupabaseServerClient();

  const [fullUpload, thumbUpload] = await Promise.all([
    supabase.storage.from(ARTWORK_BUCKET).upload(fullPath, processed.full, {
      contentType: "image/webp",
      upsert: false,
    }),
    supabase.storage.from(ARTWORK_BUCKET).upload(thumbPath, processed.thumb, {
      contentType: "image/webp",
      upsert: false,
    }),
  ]);

  if (fullUpload.error || thumbUpload.error) {
    return NextResponse.json({ error: "Upload failed, please try again" }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("submissions").insert({
    id,
    student_name: parsed.data.student_name,
    title: parsed.data.title ?? null,
    image_path: fullPath,
    thumb_path: thumbPath,
    width: processed.width,
    height: processed.height,
    instagram_url: parsed.data.instagram_url ?? null,
    behance_url: parsed.data.behance_url ?? null,
    website_url: parsed.data.website_url ?? null,
    status: "pending",
  });

  if (insertError) {
    await Promise.all([
      supabase.storage.from(ARTWORK_BUCKET).remove([fullPath]),
      supabase.storage.from(ARTWORK_BUCKET).remove([thumbPath]),
    ]);
    return NextResponse.json({ error: "Could not save submission, please try again" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id }, { status: 201 });
}
