import { Suspense } from "react";
import GalleryVideoManagement from "@/components/admin/gallery-video-management";
import { getGalleryVideos } from "@/actions/gallery/videos/read";

export default async function GalleryVideosPage() {
  const videos = await getGalleryVideos();

  return <GalleryVideoManagement initialVideos={videos} />;
}
