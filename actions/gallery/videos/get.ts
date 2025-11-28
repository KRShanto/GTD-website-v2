import { createClient } from "@/lib/supabase/server";
import { GalleryVideo } from "@/lib/types";
import { redis } from "@/lib/redis";

export async function getGalleryVideos(): Promise<{
  videos: GalleryVideo[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    // Get ordered IDs from Redis
    const orderedIds = await redis.lrange("gallery:videos:order", 0, -1);
    let videos = [];
    let error = null;

    if (orderedIds && orderedIds.length > 0) {
      // Fetch videos by IDs
      const { data, error: fetchError } = await supabase
        .from("gallery-videos")
        .select("*")
        .in("id", orderedIds.map(Number));

      if (fetchError) {
        error = fetchError.message;
      } else {
        // Order videos as per Redis
        videos = orderedIds
          .map((id) => data.find((v) => v.id === Number(id)))
          .filter(Boolean);
      }
    } else {
      // Fallback: order by created_at desc
      const { data, error: fetchError } = await supabase
        .from("gallery-videos")
        .select("*")
        .order("created_at", { ascending: false });
      videos = data || [];
      error = fetchError ? fetchError.message : null;
    }

    return { videos, error };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { videos: [], error: "An unexpected error occurred" };
  }
}
