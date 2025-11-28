"use server";

import { createClient } from "@/lib/supabase/server";
import {
  uploadVideoToFirebase,
  uploadImageToFirebase,
  deleteVideoFromFirebase,
  deleteImageFromFirebase,
  FIREBASE_FOLDERS,
} from "@/lib/firebase/storage";
import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";

export async function updateGalleryVideo(id: number, formData: FormData) {
  try {
    const alt = formData.get("alt") as string;
    const video = formData.get("video") as File | null;
    const thumbnail = formData.get("thumbnail") as File | null;

    // Create Supabase client
    const supabase = await createClient();

    // Get current video data
    const { data: currentVideo, error: fetchError } = await supabase
      .from("gallery-videos")
      .select("video_url, thumbnail_url")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    // Prepare update data
    const updateData: {
      alt: string;
      video_url?: string;
      thumbnail_url?: string;
    } = {
      alt: alt || "",
    };

    // Handle video update if new file is provided
    if (video) {
      const videoUploadResult = await uploadVideoToFirebase(
        video,
        video.name,
        `${FIREBASE_FOLDERS.GALLERY_VIDEOS}`,
        {
          onError: (error) => {
            console.error("Video upload error:", error);
          },
        }
      );

      if (!videoUploadResult.success || !videoUploadResult.url) {
        return { error: "Failed to upload new video" };
      }

      // Delete old video if exists
      if (currentVideo?.video_url) {
        await deleteVideoFromFirebase(currentVideo.video_url);
      }

      updateData.video_url = videoUploadResult.url;
    }

    // Handle thumbnail update if new file is provided
    if (thumbnail) {
      const thumbnailUploadResult = await uploadImageToFirebase(
        thumbnail,
        thumbnail.name,
        `${FIREBASE_FOLDERS.GALLERY_THUMBNAILS}`,
        {
          onError: (error) => {
            console.error("Thumbnail upload error:", error);
          },
        }
      );

      if (!thumbnailUploadResult.success || !thumbnailUploadResult.url) {
        return { error: "Failed to upload new thumbnail" };
      }

      // Delete old thumbnail if exists
      if (currentVideo?.thumbnail_url) {
        await deleteImageFromFirebase(currentVideo.thumbnail_url);
      }

      updateData.thumbnail_url = thumbnailUploadResult.url;
    }

    // Update in database
    const { data: galleryVideo, error: updateError } = await supabase
      .from("gallery-videos")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath("/admin/gallery/videos");
    return { video: galleryVideo };
  } catch (error) {
    console.error("Update gallery video error:", error);
    return { error: "Failed to update gallery video" };
  }
}

export async function updateMultipleGalleryVideos(
  updates: { id: number; alt: string; pos: number }[]
) {
  try {
    const supabase = await createClient();

    // Update all videos in database
    const { data: galleryVideos, error } = await supabase
      .from("gallery-videos")
      .upsert(
        updates.map((update) => ({
          id: update.id,
          alt: update.alt,
          pos: update.pos,
        }))
      )
      .select();

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/gallery/videos");
    return { videos: galleryVideos };
  } catch (error) {
    console.error("Update multiple gallery videos error:", error);
    return { error: "Failed to update gallery videos" };
  }
}

export async function reorderGalleryVideos(ids: number[]) {
  await redis.del("gallery:videos:order");
  if (ids.length > 0) {
    await redis.rpush("gallery:videos:order", ...ids);
  }
  return { success: true };
}
