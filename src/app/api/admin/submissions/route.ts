import { NextResponse } from "next/server";
import { getPublicArtworkUrl, getSupabaseServerClient } from "@/lib/supabase";
import type { SubmissionStatus } from "@/lib/types";

export const runtime = "nodejs";

const VALID_STATUSES: SubmissionStatus[] = ["pending", "approved", "rejected"];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const statusParam = url.searchParams.get("status") ?? "pending";
  const status = VALID_STATUSES.includes(statusParam as SubmissionStatus)
    ? (statusParam as SubmissionStatus)
    : "pending";

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Could not load submissions" }, { status: 500 });
  }

  const items = (data ?? []).map((s) => ({
    ...s,
    thumb_url: getPublicArtworkUrl(s.thumb_path),
    image_url: getPublicArtworkUrl(s.image_path),
  }));

  return NextResponse.json({ items });
}
