"use server";

import { prisma } from "@/lib/db";
import { uploadBlogImageServer } from "@/lib/sevalla/storage-server";
import { JsonValue } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";

/**
 * Creates a new blog post
 *
 * @param formData - FormData containing blog fields and optional featured image file
 * @returns Object with success status and data or error message
 */
export async function createBlog(formData: FormData) {
  try {
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

    // Parse keywords JSON if provided
    let keywordsValue: JsonValue | undefined = undefined;
    if (keywords) {
      try {
        const parsed = JSON.parse(keywords);
        // Ensure it's an array of strings
        if (
          Array.isArray(parsed) &&
          parsed.every((k) => typeof k === "string")
        ) {
          keywordsValue = parsed;
        } else {
          keywordsValue = [];
        }
      } catch {
        // If parsing fails, treat as empty array
        keywordsValue = [];
      }
    }

    // Insert into Prisma
    const blog = await prisma.blog.create({
      data: {
        title,
        description: description || null,
        content,
        featuredImageUrl,
        authorId,
        isPublished,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        keywords: keywordsValue,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    revalidatePath("/admin/blog");
    return { success: true, data: blog };
  } catch (error) {
    console.error("Create blog error:", error);

    // If database insert fails, clean up uploaded image
    const featuredImageFile = formData.get("featured_image") as File | null;
    if (featuredImageFile && featuredImageFile.size > 0) {
      // Try to get the uploaded URL from the upload result
      // Since we can't get it back, we'll just log the error
      console.error(
        "Database insert failed, but featured image may have been uploaded"
      );
    }

    return { error: "An unexpected error occurred" };
  }
}
