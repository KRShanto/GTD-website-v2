import { getGalleryVideos } from "@/actions/gallery/videos/get";
import { getGalleryImages } from "@/actions/gallery/images/get";
import GallerySectionClient from "./gallery-section-client";
import {
  GalleryImage,
  GalleryVideo,
} from "@/lib/generated/prisma/client";

export default async function GallerySection() {
  const [videosResult, imagesResult] = await Promise.all([
    getGalleryVideos(),
    getGalleryImages(),
  ]);

  const videos = videosResult.videos || [];
  const images = imagesResult.images || [];

  const galleryItems = [
    ...videos.map((video: GalleryVideo) => ({
      src: video.video_url,
      alt: video.alt,
      thumbnail: video.thumbnail_url || undefined,
      type: "video" as const,
    })),
    ...images.map((image: GalleryImage) => ({
      src: image.image_url,
      alt: image.alt,
      type: "image" as const,
    })),
  ];

  return <GallerySectionClient galleryItems={galleryItems} />;
}
