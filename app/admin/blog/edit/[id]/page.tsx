import BlogForm from "@/components/admin/blog-form";
import { getCurrentAdmin } from "@/actions/auth/user";
import { getBlogById } from "@/actions/blogs/read";
import { redirect, notFound } from "next/navigation";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;

  const blogId = parseInt(id);
  if (isNaN(blogId)) notFound();
  const { blog, error } = await getBlogById(blogId);
  if (error || !blog) notFound();
  return <BlogForm blog={blog} isEditing={true} />;
}
