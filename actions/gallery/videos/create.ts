"use server";

import { revalidatePath } from "next/cache";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/db";
import {
  uploadGalleryVideoServer,
  uploadGalleryThumbnailServer,
} from "@/lib/sevalla/storage-server";

interface GalleryVideoData {
  videoUrl: string;
  alt: string;
  thumbnailUrl?: string;
}

export async function createGalleryVideo(videoData: GalleryVideoData) {
  try {
    // Create new video record via Prisma
    const created = await prisma.galleryVideo.create({
      data: {
        videoUrl: videoData.videoUrl,
        alt: videoData.alt?.trim() || "",
        thumbnailUrl: videoData.thumbnailUrl || null,
      },
    });

    // Add new video ID to Redis order list (at the start)
    await redis.lpush("gallery:videos:order", created.id);

    revalidatePath("/admin/gallery/videos");
    revalidatePath("/");

    return { success: true, data: created };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}

export async function createMultipleGalleryVideos(
  videosData: GalleryVideoData[]
) {
  try {
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

    // Create all videos in a single Prisma transaction
    const createdVideos = await prisma.$transaction(
      videosData.map((video) =>
        prisma.galleryVideo.create({
          data: {
            videoUrl: video.videoUrl,
            alt: video.alt?.trim() || "",
            thumbnailUrl: video.thumbnailUrl || null,
          },
        })
      )
    );

    // Add new video IDs to Redis order list (at the beginning)
    if (createdVideos.length > 0) {
      const videoIds = createdVideos.map((video) => video.id);
      await redis.lpush("gallery:videos:order", ...videoIds);
    }

    // Revalidate paths
    revalidatePath("/admin/gallery/videos");
    revalidatePath("/");

    return { success: true, data: createdVideos, count: videosData.length };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Creates multiple gallery videos from FormData containing files, thumbnails and alts.
 *
 * Expected FormData fields (repeated per video, same ordering):
 * - "videos": File
 * - "thumbnails": File (optional)
 * - "alts": string
 */
export async function createMultipleGalleryVideosFromFormData(
  formData: FormData
) {
  try {
    const videoFiles = formData.getAll("videos") as File[];
    const thumbnailFiles = formData.getAll("thumbnails") as (File | null)[];
    const altsRaw = formData.getAll("alts");

    if (!videoFiles.length) {
      return { error: "Please select at least one video" };
    }

    if (videoFiles.length !== altsRaw.length) {
      return { error: "Videos and alt text count do not match" };
    }

    // For thumbnails we allow fewer/none, so we won't hard match length;
    // treat missing entries as "no thumbnail".

    const toCreate: { videoUrl: string; thumbnailUrl?: string; alt: string }[] =
      [];

    for (let i = 0; i < videoFiles.length; i++) {
      const videoFile = videoFiles[i];
      const alt = (altsRaw[i] as string | null) || "";
      const thumbFile = (thumbnailFiles[i] as File | null) || null;

      if (!videoFile) {
        return { error: `Video ${i + 1}: File is missing` };
      }

      if (alt.length > 200) {
        return {
          error: `Video ${i + 1}: Alt text must be less than 200 characters`,
        };
      }

      // Upload video to Sevalla
      const videoUpload = await uploadGalleryVideoServer(
        videoFile,
        videoFile.name
      );

      if (!videoUpload.success || !videoUpload.url) {
        return {
          error:
            videoUpload.error ||
            `Failed to upload video ${i + 1}: ${videoFile.name}`,
        };
      }

      // Upload thumbnail if present
      let thumbnailUrl: string | undefined;
      if (thumbFile) {
        const thumbUpload = await uploadGalleryThumbnailServer(
          thumbFile,
          thumbFile.name
        );

        if (!thumbUpload.success) {
          // Non-fatal: we allow videos without thumbnails
          console.error(
            `Thumbnail upload failed for video ${i + 1}:`,
            thumbUpload.error
          );
        } else if (thumbUpload.url) {
          thumbnailUrl = thumbUpload.url;
        }
      }

      toCreate.push({
        videoUrl: videoUpload.url,
        thumbnailUrl,
        alt: alt.trim(),
      });
    }

    const createdVideos = await prisma.$transaction(
      toCreate.map((video) =>
        prisma.galleryVideo.create({
          data: {
            videoUrl: video.videoUrl,
            alt: video.alt,
            thumbnailUrl: video.thumbnailUrl || null,
          },
        })
      )
    );

    const videoIds = createdVideos.map((v) => v.id);
    if (videoIds.length > 0) {
      await redis.lpush("gallery:videos:order", ...videoIds);
    }

    revalidatePath("/admin/gallery/videos");
    revalidatePath("/");

    return {
      success: true,
      data: createdVideos,
      count: createdVideos.length,
    };
  } catch (error) {
    console.error("Create multiple gallery videos (FormData) error:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Creates a single gallery video from FormData containing:
 * - "video": File (required)
 * - "thumbnail": File (optional)
 * - "alt": string
 */
export async function createGalleryVideoFromFormData(formData: FormData) {
  try {
    const videoFile = formData.get("video") as File | null;
    const thumbnailFile = formData.get("thumbnail") as File | null;
    const altRaw = (formData.get("alt") as string | null) || "";

    if (!videoFile) {
      return { error: "Video file is required" };
    }

    if (altRaw.length > 200) {
      return { error: "Alt text must be less than 200 characters" };
    }

    const alt = altRaw.trim();

    // Upload video to Sevalla
    const videoUpload = await uploadGalleryVideoServer(
      videoFile,
      videoFile.name
    );

    if (!videoUpload.success || !videoUpload.url) {
      return {
        error:
          videoUpload.error ||
          `Failed to upload video: ${videoFile.name}`,
      };
    }

    // Upload thumbnail if provided
    let thumbnailUrl: string | undefined;
    if (thumbnailFile) {
      const thumbnailUpload = await uploadGalleryThumbnailServer(
        thumbnailFile,
        thumbnailFile.name
      );

      if (!thumbnailUpload.success) {
        console.error(
          "Thumbnail upload failed for single video:",
          thumbnailUpload.error
        );
      } else if (thumbnailUpload.url) {
        thumbnailUrl = thumbnailUpload.url;
      }
    }

    const created = await prisma.galleryVideo.create({
      data: {
        videoUrl: videoUpload.url!,
        alt,
        thumbnailUrl: thumbnailUrl || null,
      },
    });

    await redis.lpush("gallery:videos:order", created.id);

    revalidatePath("/admin/gallery/videos");
    revalidatePath("/");

    return { success: true, data: created };
  } catch (error) {
    console.error("Create gallery video (FormData) error:", error);
    return { error: "An unexpected error occurred" };
  }
}
