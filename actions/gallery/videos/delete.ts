"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/consts/cache-tags";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/db";
import {
  deleteVideoFromSevallaServer,
  deleteImageFromSevallaServer,
} from "@/lib/sevalla/storage-server";

export async function deleteGalleryVideo(id: string) {
  try {
    // Get video data first to get URLs
    const video = await prisma.galleryVideo.findUnique({
      where: { id },
      select: {
        videoUrl: true,
        thumbnailUrl: true,
      },
    });

    if (!video) {
      return { error: "Gallery video not found" };
    }

    // Delete from database
    await prisma.galleryVideo.delete({
      where: { id },
    });

    // Remove from Redis order list
    await redis.lrem("gallery:videos:order", 0, id);

    // Delete video and thumbnail from Sevalla Storage
    if (video.videoUrl) {
      await deleteVideoFromSevallaServer(video.videoUrl);
    }
    if (video.thumbnailUrl) {
      await deleteImageFromSevallaServer(video.thumbnailUrl);
    }

    revalidatePath("/admin/gallery/videos");
    revalidateTag(CACHE_TAGS.GALLERY_VIDEOS);
    return { success: true };
  } catch (error) {
    console.error("Delete gallery video error:", error);
    return { error: "Failed to delete gallery video" };
  }
}

export async function deleteMultipleGalleryVideos(ids: string[]) {
  try {
    if (!ids.length) {
      return { error: "No videos selected for deletion" };
    }

    // Get video URLs first
    const videos = await prisma.galleryVideo.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        videoUrl: true,
        thumbnailUrl: true,
      },
    });

    // Delete from database
    await prisma.galleryVideo.deleteMany({
      where: { id: { in: ids } },
    });

    // Remove IDs from Redis
    for (const id of ids) {
      await redis.lrem("gallery:videos:order", 0, id);
    }

    // Delete all videos and thumbnails from Sevalla Storage
    const deletePromises = videos.flatMap((video) => {
      const promises: Promise<boolean>[] = [];
      if (video.videoUrl) {
        promises.push(deleteVideoFromSevallaServer(video.videoUrl));
      }
      if (video.thumbnailUrl) {
        promises.push(deleteImageFromSevallaServer(video.thumbnailUrl));
      }
      return promises;
    });

    await Promise.all(deletePromises);

    revalidatePath("/admin/gallery/videos");
    revalidateTag(CACHE_TAGS.GALLERY_VIDEOS);
    return { success: true };
  } catch (error) {
    console.error("Delete multiple gallery videos error:", error);
    return { error: "Failed to delete gallery videos" };
  }
}
