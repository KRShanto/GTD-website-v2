import GalleryImageForm from "@/components/admin/gallery-image-form";
import { getCurrentAdmin } from "@/actions/auth/user";
import { redirect } from "next/navigation";

export default async function AddGalleryImagePage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return <GalleryImageForm />;
}
