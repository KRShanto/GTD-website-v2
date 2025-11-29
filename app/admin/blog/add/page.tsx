import BlogForm from "@/components/admin/blog-form";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AddBlogPage() {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  
  return <BlogForm />;
}
