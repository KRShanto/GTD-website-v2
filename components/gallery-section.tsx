import { getGalleryVideos } from "@/actions/gallery/videos/get";
import { getGalleryImages } from "@/actions/gallery/images/get";
import GallerySectionClient from "./gallery-section-client";

export default async function GallerySection() {
  const videos = await getGalleryVideos();
  const images = await getGalleryImages();

  return <GallerySectionClient videos={videos} images={images} />;
}
