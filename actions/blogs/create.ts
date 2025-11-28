"use server";

import { createClient } from "@/lib/supabase/server";
import { uploadBlogImageServer, deleteImageFromSupabaseServer } from "@/lib/supabase/storage-server";
import { revalidatePath } from "next/cache";

export async function createBlog(formData: FormData) {
  try {
    const supabase = await createClient();

    // Extract form data
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const content = formData.get("content") as string;
    const featuredImageFile = formData.get("featured_image") as File | null;
    const authorId = formData.get("author_id") as string;
    const isPublished = formData.get("is_published") === "true";
    const seoTitle = formData.get("seo_title") as string;
    const seoDescription = formData.get("seo_description") as string;
    const keywords = formData.get("keywords") as string;

    if (!title || !content || !authorId) {
      return { error: "Title, content, and author are required" };
    }

    let featuredImageUrl: string | null = null;
    if (featuredImageFile && featuredImageFile.size > 0) {
      const uploadResult = await uploadBlogImageServer(
        featuredImageFile,
        featuredImageFile.name,
        "featured"
      );
      if (!uploadResult.success) {
        return { error: uploadResult.error || "Featured image upload failed" };
      }
      featuredImageUrl = uploadResult.url!;
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from("blogs")
      .insert({
        title,
        description,
        content,
        featured_image_url: featuredImageUrl,
        author_id: Number(authorId),
        is_published: isPublished,
        seo_title: seoTitle,
        seo_description: seoDescription,
        keywords: keywords ? JSON.parse(keywords) : null,
      })
      .select()
      .single();

    if (error) {
      // If database insert fails, clean up uploaded image
      if (featuredImageUrl) await deleteImageFromSupabaseServer(featuredImageUrl);
      return { error: error.message };
    }

    revalidatePath("/admin/blog");
    return { success: true, data };
  } catch (error) {
    console.error("Create blog error:", error);
    return { error: "An unexpected error occurred" };
  }
}
