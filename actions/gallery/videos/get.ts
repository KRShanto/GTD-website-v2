import { prisma } from "@/lib/db";
import { GalleryVideo } from "@/lib/generated/prisma/client";
import { redis } from "@/lib/redis";

export async function getGalleryVideos(): Promise<GalleryVideo[]> {
  try {
    // Get ordered IDs from Redis
    const orderedIds = await redis.lrange("gallery:videos:order", 0, -1);

    // Fetch all videos using Prisma (default order by createdAt DESC)
    const allVideos = await prisma.galleryVideo.findMany({
      orderBy: { createdAt: "desc" },
    });

    let videos: GalleryVideo[] = [];

    if (orderedIds && orderedIds.length > 0) {
      // Map videos by id for fast lookup
      const videoMap = new Map(allVideos.map((v) => [v.id, v]));

      // Order videos as per Redis
      videos = orderedIds
        .map((id) => videoMap.get(id))
        .filter(Boolean) as GalleryVideo[];

      // Append any videos not in Redis order (e.g., newly created)
      const missingVideos = allVideos.filter((v) => !orderedIds.includes(v.id));
      videos = [...videos, ...missingVideos];
    } else {
      // Fallback: just use Prisma result
      videos = allVideos;
    }

    return videos;
  } catch (error) {
    console.error("Unexpected error:", error);
    return [];
  }
}
