import GalleryVideoForm from "@/components/admin/gallery-video-form";
import { getCurrentAdmin } from "@/actions/auth/user";
import { redirect } from "next/navigation";

export default async function AddGalleryVideoPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return <GalleryVideoForm />;
}
