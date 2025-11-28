import BlogForm from "@/components/admin/blog-form";
import { getCurrentAdmin } from "@/actions/auth/user";
import { redirect } from "next/navigation";

export default async function AddBlogPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return <BlogForm />;
}
