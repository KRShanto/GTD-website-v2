import { Suspense } from "react";
import GalleryImageManagement from "@/components/admin/gallery-image-management";
import { getGalleryImages } from "@/actions/gallery/images/read";
import { getCurrentAdmin } from "@/actions/auth/user";
import { redirect } from "next/navigation";

async function GalleryImagesContent() {
  const { images, error } = await getGalleryImages();

  return <GalleryImageManagement initialImages={images} error={error} />;
}

export default async function GalleryImagesPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="text-white text-xl">Loading gallery images...</div>
        </div>
      }
    >
      <GalleryImagesContent />
    </Suspense>
  );
}
