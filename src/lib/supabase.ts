import { createClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key.
 * Never import this from a "use client" component — the service role key
 * bypasses RLS and must stay on the server.
 */
export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export const ARTWORK_BUCKET = "artwork";

export function getPublicArtworkUrl(path: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${url}/storage/v1/object/public/${ARTWORK_BUCKET}/${path}`;
}
