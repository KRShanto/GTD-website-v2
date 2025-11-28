import { getCurrentAdmin } from "@/actions/auth/user";
import { getAuthors } from "@/actions/authors/read";
import { getTeamMembers } from "@/actions/team/read";
import { getGalleryImages } from "@/actions/gallery/images/read";
import { getGalleryVideos } from "@/actions/gallery/videos/read";
import { getTestimonials } from "@/actions/testimonials/read";
import { getBlogCount } from "@/actions/blogs/read";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  // Check auth
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  // Fetch counts
  const [
    authorsResult,
    teamResult,
    imagesResult,
    videosResult,
    testimonialsResult,
    blogCount,
  ] = await Promise.all([
    getAuthors(),
    getTeamMembers(),
    getGalleryImages(),
    getGalleryVideos(),
    getTestimonials(),
    getBlogCount(),
  ]);

  const authorsCount = authorsResult.success ? authorsResult.data.length : 0;
  const teamCount = teamResult.success ? teamResult.data.length : 0;
  const imagesCount = imagesResult.images ? imagesResult.images.length : 0;
  const videosCount = videosResult.videos ? videosResult.videos.length : 0;
  const testimonialsCount = testimonialsResult.testimonials
    ? testimonialsResult.testimonials.length
    : 0;

  return (
    <AdminDashboard
      admin={admin}
      counts={{
        authors: authorsCount,
        team: teamCount,
        images: imagesCount,
        videos: videosCount,
        testimonials: testimonialsCount,
        blogs: blogCount,
      }}
    />
  );
}
