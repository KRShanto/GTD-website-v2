"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

interface GalleryVideoData {
  videoUrl: string;
  alt: string;
  thumbnailUrl?: string;
}

export async function createGalleryVideo(videoData: GalleryVideoData) {
  try {
    const supabase = await createClient();

    // Insert new video into Supabase (no SQL function, just a direct insert)
    const { data: insertData, error } = await supabase
      .from("gallery-videos")
      .insert({
        video_url: videoData.videoUrl,
        alt: videoData.alt?.trim() || "",
        thumbnail_url: videoData.thumbnailUrl || null,
      })
      .select()
      .single();
    if (error) {
      return { error: error.message };
    }
    // Add new video ID to Redis order list (at the start)
    if (insertData?.id) {
      await redis.lpush("gallery:videos:order", insertData.id);
    }
    revalidatePath("/admin/gallery/videos");
    return { success: true, data: insertData };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}

export async function createMultipleGalleryVideos(
  videosData: GalleryVideoData[]
) {
  try {
    const supabase = await createClient();

    if (videosData.length === 0) {
      return { error: "Please select at least one video" };
    }

    // Validate all videos
    for (let i = 0; i < videosData.length; i++) {
      const video = videosData[i];

      if (!video.videoUrl) {
        return {
          error: `Video ${i + 1}: Video URL is required`,
        };
      }

      if (video.alt && video.alt.length > 200) {
        return {
          error: `Video ${i + 1}: Alt text must be less than 200 characters`,
        };
      }
    }

    // Prepare database entries
    const galleryEntries = videosData.map((video) => ({
      video_url: video.videoUrl,
      alt: video.alt?.trim() || "",
      thumbnail_url: video.thumbnailUrl || null,
    }));

    // Insert all videos into database
    const { data, error } = await supabase
      .from("gallery-videos")
      .insert(galleryEntries)
      .select();

    if (error) {
      return { error: "Failed to save video information. Please try again." };
    }

    // Add new video IDs to Redis order list (at the beginning)
    if (data && data.length > 0) {
      const videoIds = data.map((video) => video.id);
      await redis.lpush("gallery:videos:order", ...videoIds);
    }

    // Revalidate paths
    revalidatePath("/admin/gallery/videos");
    revalidatePath("/");

    return { success: true, data, count: videosData.length };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}
