"use server";

import { createClient } from "@/lib/supabase/server";
import {
  deleteImageFromFirebase,
  deleteVideoFromFirebase,
} from "@/lib/firebase/storage";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

export async function deleteGalleryVideo(id: number) {
  try {
    const supabase = await createClient();

    // Get video data first to get URLs
    const { data: video, error: fetchError } = await supabase
      .from("gallery-videos")
      .select("video_url, thumbnail_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("gallery-videos")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Remove from Redis order list
    await redis.lrem("gallery:videos:order", 0, id);

    // Delete video and thumbnail from Firebase Storage
    if (video?.video_url) {
      await deleteVideoFromFirebase(video.video_url);
    }
    if (video?.thumbnail_url) {
      await deleteImageFromFirebase(video.thumbnail_url);
    }

    revalidatePath("/admin/gallery/videos");
    return { success: true };
  } catch (error) {
    console.error("Delete gallery video error:", error);
    return { error: "Failed to delete gallery video" };
  }
}

export async function deleteMultipleGalleryVideos(ids: number[]) {
  try {
    const supabase = await createClient();

    // Get video URLs first
    const { data: videos, error: fetchError } = await supabase
      .from("gallery-videos")
      .select("video_url, thumbnail_url")
      .in("id", ids);

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("gallery-videos")
      .delete()
      .in("id", ids);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Delete all videos and thumbnails from Firebase Storage
    const deletePromises = videos.flatMap((video) => {
      const promises = [];
      if (video.video_url) {
        promises.push(deleteVideoFromFirebase(video.video_url));
      }
      if (video.thumbnail_url) {
        promises.push(deleteImageFromFirebase(video.thumbnail_url));
      }
      return promises;
    });

    await Promise.all(deletePromises);

    revalidatePath("/admin/gallery/videos");
    return { success: true };
  } catch (error) {
    console.error("Delete multiple gallery videos error:", error);
    return { error: "Failed to delete gallery videos" };
  }
}
