import GallerySectionClient from "./gallery-section-client";
import { CACHE_TAGS } from "@/lib/consts/cache-tags";

/**
 * Fetches gallery data using fetch() with cache tags for revalidation
 */
async function getGalleryData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const [videosRes, imagesRes] = await Promise.all([
      fetch(`${baseUrl}/api/home/gallery-videos`, {
        next: {
          tags: [CACHE_TAGS.GALLERY_VIDEOS],
        },
      }),
      fetch(`${baseUrl}/api/home/gallery-images`, {
        next: {
          tags: [CACHE_TAGS.GALLERY_IMAGES],
        },
      }),
    ]);

    if (!videosRes.ok || !imagesRes.ok) {
      console.error("Failed to fetch gallery data");
      return { videos: [], images: [] };
    }

    const videos = await videosRes.json();
    const images = await imagesRes.json();

    return { videos, images };
  } catch (error) {
    console.error("Error fetching gallery data:", error);
    return { videos: [], images: [] };
  }
}

export default async function GallerySection() {
  const { videos, images } = await getGalleryData();

  return <GallerySectionClient videos={videos} images={images} />;
}
