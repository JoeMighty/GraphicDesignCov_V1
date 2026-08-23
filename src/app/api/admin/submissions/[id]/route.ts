import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await request.json().catch(() => ({ status: null }));

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("submissions")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Could not update submission" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
