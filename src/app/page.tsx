import Gallery from "@/components/gallery/Gallery";
import { getPublicArtworkUrl, getSupabaseServerClient } from "@/lib/supabase";
import { DEMO_ITEMS } from "@/lib/demo-items";
import type { GalleryItem } from "@/components/gallery/types";

export const dynamic = "force-dynamic";

async function getApprovedWork(): Promise<GalleryItem[]> {
  let supabase;
  try {
    supabase = getSupabaseServerClient();
  } catch (err) {
    console.warn("Supabase not configured yet:", (err as Error).message);
    return [];
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((s) => ({
    id: s.id,
    student_name: s.student_name,
    title: s.title,
    width: s.width,
    height: s.height,
    thumb_url: getPublicArtworkUrl(s.thumb_path),
    image_url: getPublicArtworkUrl(s.image_path),
    instagram_url: s.instagram_url,
    behance_url: s.behance_url,
    website_url: s.website_url,
  }));
}

export default async function Home() {
  const items = await getApprovedWork();
  return <Gallery items={items.length > 0 ? items : DEMO_ITEMS} />;
}
