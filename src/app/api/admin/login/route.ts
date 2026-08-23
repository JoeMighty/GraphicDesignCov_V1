import { NextResponse } from "next/server";
import { COOKIE_NAME, MAX_AGE_SECONDS, createSessionToken } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({ password: "" }));
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}
