"use server";

import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { GalleryImage } from "@/lib/generated/prisma/client";

/**
 * Fetches all gallery images using Prisma with optional Redis-based ordering.
 *
 * Redis stores a custom order of gallery image IDs under the key
 * "gallery:images:order". If present, we apply this order on top of the
 * default Prisma query (which orders by createdAt DESC).
 */
export async function getGalleryImages() {
  try {
    // Fetch all images using Prisma (default order by createdAt DESC)
    const allImages = await prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Try to get custom order from Redis
    const orderedIds = await redis.lrange("gallery:images:order", 0, -1);

    if (!orderedIds || orderedIds.length === 0) {
      return allImages;
    }

    // Map images by id for quick lookup
    const imageMap = new Map(allImages.map((img) => [img.id, img]));

    // Build ordered list based on Redis, then append any missing images
    const orderedFromRedis = orderedIds
      .map((id) => imageMap.get(id))
      .filter(Boolean) as GalleryImage[];

    const missingImages = allImages.filter(
      (img) => !orderedIds.includes(img.id)
    );

    const finalImages = [...orderedFromRedis, ...missingImages];

    return finalImages;
  } catch (error) {
    console.error("Unexpected error (Prisma getGalleryImages):", error);
    return [];
  }
}

/**
 * Fetches a single gallery image by its Prisma UUID string ID.
 */
export async function getGalleryImageById(id: string): Promise<{
  image: GalleryImage | null;
  error: string | null;
}> {
  try {
    const image = await prisma.galleryImage.findUnique({
      where: { id },
    });

    if (!image) {
      return {
        image: null,
        error: "Gallery image not found",
      };
    }

    return {
      image,
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error (Prisma getGalleryImageById):", error);
    return {
      image: null,
      error: "An unexpected error occurred",
    };
  }
}
