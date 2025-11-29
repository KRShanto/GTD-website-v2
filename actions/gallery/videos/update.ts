"use server";

import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/db";
import {
  uploadGalleryVideoServer,
  uploadGalleryThumbnailServer,
  deleteVideoFromSevallaServer,
  deleteImageFromSevallaServer,
} from "@/lib/sevalla/storage-server";

export async function updateGalleryVideo(id: string, formData: FormData) {
  try {
    const alt = formData.get("alt") as string;
    const video = formData.get("video") as File | null;
    const thumbnail = formData.get("thumbnail") as File | null;

    // Get current video data from Prisma
    const currentVideo = await prisma.galleryVideo.findUnique({
      where: { id },
      select: {
        videoUrl: true,
        thumbnailUrl: true,
      },
    });

    if (!currentVideo) {
      return { error: "Gallery video not found" };
    }

    // Prepare update data
    const updateData: {
      alt: string;
      videoUrl?: string;
      thumbnailUrl?: string | null;
    } = {
      alt: alt || "",
    };

    // Handle video update if new file is provided (upload to Sevalla)
    if (video) {
      const videoUploadResult = await uploadGalleryVideoServer(
        video,
        video.name
      );

      if (!videoUploadResult.success || !videoUploadResult.url) {
        return { error: "Failed to upload new video" };
      }

      // Delete old video if exists
      if (currentVideo?.videoUrl) {
        await deleteVideoFromSevallaServer(currentVideo.videoUrl);
      }

      updateData.videoUrl = videoUploadResult.url;
    }

    // Handle thumbnail update if new file is provided (upload to Sevalla)
    if (thumbnail) {
      const thumbnailUploadResult = await uploadGalleryThumbnailServer(
        thumbnail,
        thumbnail.name
      );

      if (!thumbnailUploadResult.success || !thumbnailUploadResult.url) {
        return { error: "Failed to upload new thumbnail" };
      }

      // Delete old thumbnail if exists
      if (currentVideo?.thumbnailUrl) {
        await deleteImageFromSevallaServer(currentVideo.thumbnailUrl);
      }

      updateData.thumbnailUrl = thumbnailUploadResult.url;
    }

    // Update in database via Prisma
    const galleryVideo = await prisma.galleryVideo.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/gallery/videos");
    return { video: galleryVideo };
  } catch (error) {
    console.error("Update gallery video error:", error);
    return { error: "Failed to update gallery video" };
  }
}

export async function updateMultipleGalleryVideos(
  updates: { id: string; alt: string; pos: number }[]
) {
  try {
    // Bulk update alt text using Prisma (we ignore "pos" field; order is handled via Redis)
    const galleryVideos = await Promise.all(
      updates.map((update) =>
        prisma.galleryVideo.update({
          where: { id: update.id },
          data: { alt: update.alt },
        })
      )
    );

    revalidatePath("/admin/gallery/videos");
    return { videos: galleryVideos };
  } catch (error) {
    console.error("Update multiple gallery videos error:", error);
    return { error: "Failed to update gallery videos" };
  }
}

export async function reorderGalleryVideos(ids: string[]) {
  await redis.del("gallery:videos:order");
  if (ids.length > 0) {
    await redis.rpush("gallery:videos:order", ...ids);
  }
  return { success: true };
}
