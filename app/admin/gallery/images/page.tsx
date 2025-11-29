import { Suspense } from "react";
import GalleryImageManagement from "@/components/admin/gallery-image-management";
import { getGalleryImages } from "@/actions/gallery/images/read";

export default async function GalleryImagesPage() {
  const images = await getGalleryImages();

  return <GalleryImageManagement initialImages={images} />;
}
