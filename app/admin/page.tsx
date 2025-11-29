import AdminDashboard from "@/components/admin/admin-dashboard";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AdminPage() {
  const admin = await getUser();

  const authorsCount = await prisma.author.count();
  const teamCount = await prisma.team.count();
  const imagesCount = await prisma.galleryImage.count();
  const videosCount = await prisma.galleryVideo.count();
  const testimonialsCount = await prisma.testimonial.count();
  const blogCount = await prisma.blog.count();

  return (
    <AdminDashboard
      admin={admin!}
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
