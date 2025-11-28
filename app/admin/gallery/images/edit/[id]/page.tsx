import GalleryImageForm from "@/components/admin/gallery-image-form";
import { getCurrentAdmin } from "@/actions/auth/user";
import { getGalleryImageById } from "@/actions/gallery/images/read";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

interface EditGalleryImagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryImagePage({
  params,
}: EditGalleryImagePageProps) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const imageId = parseInt(id);

  if (isNaN(imageId)) {
    notFound();
  }

  const { image, error } = await getGalleryImageById(imageId);

  if (error || !image) {
    notFound();
  }

  return <GalleryImageForm image={image} isEditing={true} />;
}
