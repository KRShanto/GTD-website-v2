import BlogForm from "@/components/admin/blog-form";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AddBlogPage() {
  return <BlogForm />;
}
