import GalleryVideoForm from "@/components/admin/gallery-video-form";
import { getGalleryVideoById } from "@/actions/gallery/videos/read";
import { getCurrentAdmin } from "@/actions/auth/user";
import { redirect, notFound } from "next/navigation";

interface EditGalleryVideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGalleryVideoPage({
  params,
}: EditGalleryVideoPageProps) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const videoId = parseInt(id);
  if (isNaN(videoId)) {
    notFound();
  }

  const { video, error } = await getGalleryVideoById(videoId);

  if (error || !video) {
    notFound();
  }

  return <GalleryVideoForm video={video} isEditing={true} id={videoId} />;
}
