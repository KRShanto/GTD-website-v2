import { prisma } from "@/lib/db";
import { GalleryImage } from "@/lib/generated/prisma/client";
import { redis } from "@/lib/redis";

export async function getGalleryImages(): Promise<{
  images: GalleryImage[];
  error: string | null;
}> {
  try {
    // Get ordered IDs from Redis
    const orderedIds = await redis.lrange("gallery:images:order", 0, -1);

    // Fetch all images using Prisma (default order by createdAt DESC)
    const allImages = await prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" },
    });

    let images: GalleryImage[] = [];
    let error: string | null = null;

    if (orderedIds && orderedIds.length > 0) {
      // Map images by id for fast lookup
      const imageMap = new Map(allImages.map((img) => [img.id, img]));

      // Order images as per Redis
      images = orderedIds
        .map((id) => imageMap.get(id))
        .filter(Boolean) as GalleryImage[];

      // Append any images not present in Redis order (e.g., newly created)
      const missingImages = allImages.filter((img) => !orderedIds.includes(img.id));
      images = [...images, ...missingImages];
    } else {
      // Fallback: just use Prisma result
      images = allImages;
      error = null;
    }

    return { images, error };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { images: [], error: "An unexpected error occurred" };
  }
}
