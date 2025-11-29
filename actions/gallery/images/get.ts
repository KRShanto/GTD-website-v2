import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { GalleryImage } from "@prisma/client";

export async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    // Get ordered IDs from Redis
    const orderedIds = await redis.lrange("gallery:images:order", 0, -1);

    // Fetch all images using Prisma (default order by createdAt DESC)
    const allImages = await prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" },
    });

    let images: GalleryImage[] = [];

    if (orderedIds && orderedIds.length > 0) {
      // Map images by id for fast lookup
      const imageMap = new Map(allImages.map((img) => [img.id, img]));

      // Order images as per Redis
      images = orderedIds
        .map((id) => imageMap.get(id))
        .filter(Boolean) as GalleryImage[];

      // Append any images not present in Redis order (e.g., newly created)
      const missingImages = allImages.filter(
        (img) => !orderedIds.includes(img.id)
      );
      images = [...images, ...missingImages];
    } else {
      // Fallback: just use Prisma result
      images = allImages;
    }

    return images;
  } catch (error) {
    console.error("Unexpected error:", error);
    return [];
  }
}
