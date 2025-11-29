import BlogForm from "@/components/admin/blog-form";
import { getUser } from "@/lib/auth";
import { getBlogById } from "@/actions/blogs/read";
import { redirect, notFound } from "next/navigation";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const user = await getUser();
  if (!user) redirect("/admin/login");

  const { id } = await params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const { blog, error } = await getBlogById(id);
  if (error || !blog) notFound();
  
  return <BlogForm blog={blog} isEditing={true} />;
}
