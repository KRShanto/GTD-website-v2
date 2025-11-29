"use server";

import { prisma } from "@/lib/db";
import { deleteImageFromSevallaServer } from "@/lib/sevalla/storage-server";
import { revalidatePath } from "next/cache";

/**
 * Deletes a blog post and its featured image
 * 
 * @param id - Blog ID (UUID string)
 * @param featuredImageUrl - Optional featured image URL to delete from storage
 * @returns Object with success status or error message
 */
export async function deleteBlog(id: string, featuredImageUrl?: string) {
  try {
    // Delete from Prisma
    await prisma.blog.delete({
      where: { id },
    });

    // Delete featured image from Sevalla if provided
    if (featuredImageUrl) {
      await deleteImageFromSevallaServer(featuredImageUrl);
    }

    revalidatePath("/admin/blog");
    return { success: true };
  } catch (error) {
    console.error("Delete blog error:", error);
    return { error: "Failed to delete blog" };
  }
}
