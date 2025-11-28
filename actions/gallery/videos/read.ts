"use server";

import { createClient } from "@/lib/supabase/server";
import { redis } from "@/lib/redis";

export async function getGalleryVideos() {
  try {
    // Get ordered IDs from Redis
    const orderedIds = await redis.lrange("gallery:videos:order", 0, -1);
    const supabase = await createClient();
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

export async function getGalleryVideoById(id: number) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("gallery-videos")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching gallery video:", error);
      return { video: null, error: "Video not found" };
    }

    return { video: data, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { video: null, error: "An unexpected error occurred" };
  }
}
