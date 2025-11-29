import BlogDashboard from "@/components/admin/blog-dashboard";
import { getBlogMetadatas } from "@/actions/blogs/read";

export default async function BlogDashboardPage() {
  const blogs = await getBlogMetadatas();
  return <BlogDashboard blogs={blogs!} />;
}
