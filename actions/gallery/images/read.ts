"use server";

import { createClient } from "@/lib/supabase/server";
import { GalleryImage } from "@/lib/types";
import { redis } from "@/lib/redis";

export async function getGalleryImages(): Promise<{
  images: GalleryImage[];
  error: string | null;
}> {
  try {
    // Get ordered IDs from Redis
    const orderedIds = await redis.lrange("gallery:images:order", 0, -1);
    const supabase = await createClient();
    let images = [];
    let error = null;
    if (orderedIds && orderedIds.length > 0) {
      // Fetch images by IDs
      const { data, error: fetchError } = await supabase
        .from("gallery-images")
        .select("*")
        .in("id", orderedIds.map(Number));
      if (fetchError) {
        error = fetchError.message;
      } else {
        // Order images as per Redis
        images = orderedIds
          .map((id) => data.find((img) => img.id === Number(id)))
          .filter(Boolean);
      }
    } else {
      // Fallback: order by created_at desc
      const { data, error: fetchError } = await supabase
        .from("gallery-images")
        .select("*")
        .order("created_at", { ascending: false });
      images = data || [];
      error = fetchError ? fetchError.message : null;
    }
    return { images, error };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { images: [], error: "An unexpected error occurred" };
  }
}

export async function getGalleryImageById(id: number): Promise<{
  image: GalleryImage | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("gallery-images")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database error:", error);
      return {
        image: null,
        error: "Failed to fetch gallery image",
      };
    }

    return {
      image: data,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      image: null,
      error: "An unexpected error occurred",
    };
  }
}
