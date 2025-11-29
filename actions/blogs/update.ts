"use server";

import { prisma } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import { uploadBlogImageServer, deleteImageFromSevallaServer } from "@/lib/sevalla/storage-server";
import { revalidatePath } from "next/cache";

/**
 * Updates an existing blog post
 * 
 * @param id - Blog ID (UUID string)
 * @param formData - FormData containing blog fields and optional new featured image file
 * @returns Object with success status and data or error message
 */
export async function updateBlog(id: string, formData: FormData) {
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
    const oldFeaturedImageUrl = formData.get("old_featured_image_url") as string;

    if (!title || !content || !authorId) {
      return { error: "Title, content, and author are required" };
    }

    let featuredImageUrl: string | null = oldFeaturedImageUrl || null;
    if (featuredImageFile && featuredImageFile.size > 0) {
      // Upload new image
      const uploadResult = await uploadBlogImageServer(
        featuredImageFile,
        featuredImageFile.name,
        "featured"
      );
      if (!uploadResult.success) {
        return { error: uploadResult.error || "Featured image upload failed" };
      }
      featuredImageUrl = uploadResult.url!;
      // Delete old image if replaced
      if (oldFeaturedImageUrl && oldFeaturedImageUrl !== featuredImageUrl) {
        await deleteImageFromSevallaServer(oldFeaturedImageUrl);
      }
    }

    // Parse keywords JSON if provided
    let keywordsValue: Prisma.InputJsonValue | undefined = undefined;
    if (keywords) {
      try {
        const parsed = JSON.parse(keywords);
        // Ensure it's an array of strings
        if (Array.isArray(parsed) && parsed.every((k) => typeof k === "string")) {
          keywordsValue = parsed;
        } else {
          keywordsValue = [];
        }
      } catch {
        // If parsing fails, treat as empty array
        keywordsValue = [];
      }
    }

    // Update in Prisma
    const blog = await prisma.blog.update({
      where: { id },
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
    console.error("Update blog error:", error);
    return { error: "An unexpected error occurred" };
  }
}
