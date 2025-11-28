import BlogDashboard from "@/components/admin/blog-dashboard";
import { getBlogMetadatas } from "@/actions/blogs/read";
import { getCurrentAdmin } from "@/actions/auth/user";
import { redirect } from "next/navigation";

export default async function BlogDashboardPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  const { blogs, error } = await getBlogMetadatas();
  return <BlogDashboard blogs={blogs} error={error} />;
}
