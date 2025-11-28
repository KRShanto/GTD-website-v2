import { Suspense } from "react";
import GalleryVideoManagement from "@/components/admin/gallery-video-management";
import { getGalleryVideos } from "@/actions/gallery/videos/read";
import { getCurrentAdmin } from "@/actions/auth/user";
import { redirect } from "next/navigation";

async function GalleryVideosContent() {
  const { videos, error } = await getGalleryVideos();

  return <GalleryVideoManagement initialVideos={videos} error={error} />;
}

export default async function GalleryVideosPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="text-white text-xl">Loading gallery videos...</div>
        </div>
      }
    >
      <GalleryVideosContent />
    </Suspense>
  );
}
