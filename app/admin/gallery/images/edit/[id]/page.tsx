import GalleryImageForm from "@/components/admin/gallery-image-form";
import { getGalleryImageById } from "@/actions/gallery/images/read";
import { getUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

interface EditGalleryImagePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryImagePage({
  params,
}: EditGalleryImagePageProps) {
  const admin = await getUser();

  if (!admin) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const { image, error } = await getGalleryImageById(id);

  if (error || !image) {
    notFound();
  }

  return <GalleryImageForm image={image} isEditing={true} />;
}
