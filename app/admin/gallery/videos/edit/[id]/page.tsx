import GalleryVideoForm from "@/components/admin/gallery-video-form";
import { getGalleryVideoById } from "@/actions/gallery/videos/read";
import { notFound } from "next/navigation";

interface EditGalleryVideoPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditGalleryVideoPage({
  params,
}: EditGalleryVideoPageProps) {
  const { id } = await params;
  const video = await getGalleryVideoById(id);

  if (!video) {
    notFound();
  }

  return <GalleryVideoForm video={video} isEditing={true} id={video.id} />;
}
