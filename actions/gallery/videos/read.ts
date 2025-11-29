"use server";

import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { GalleryVideo } from "@prisma/client";

/**
 * Fetches all gallery videos using Prisma with optional Redis-based ordering.
 *
 * Redis stores a custom order of video IDs under "gallery:videos:order". If
 * present, that order is applied on top of the default Prisma query.
 */
export async function getGalleryVideos(): Promise<GalleryVideo[]> {
  try {
    // Fetch all videos using Prisma (default order by createdAt DESC)
    const allVideos = await prisma.galleryVideo.findMany({
      orderBy: { createdAt: "desc" },
    });

    const orderedIds = await redis.lrange("gallery:videos:order", 0, -1);

    if (!orderedIds || orderedIds.length === 0) {
      return allVideos;
    }

    // Map videos by id for quick lookup
    const videoMap = new Map(allVideos.map((v) => [v.id, v]));

    // Apply Redis ordering, then append any missing videos
    const orderedFromRedis = orderedIds
      .map((id) => videoMap.get(id))
      .filter(Boolean) as GalleryVideo[];

    const missingVideos = allVideos.filter((v) => !orderedIds.includes(v.id));

    const finalVideos = [...orderedFromRedis, ...missingVideos];

    return finalVideos;
  } catch (error) {
    console.error("Unexpected error (Prisma getGalleryVideos):", error);
    return [];
  }
}

/**
 * Fetches a single gallery video by its Prisma UUID string ID.
 */
export async function getGalleryVideoById(
  id: string
): Promise<GalleryVideo | null> {
  return await prisma.galleryVideo.findUnique({
    where: { id },
  });
}
