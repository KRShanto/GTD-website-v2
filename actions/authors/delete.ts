"use server";

import { prisma } from "@/lib/db";
import { deleteImageFromSevallaServer } from "@/lib/sevalla/storage-server";
import { revalidatePath } from "next/cache";

/**
 * Deletes an author from the database
 * 
 * @param id - The UUID string of the author to delete
 * @returns Object with success status or an error message
 */
export async function deleteAuthor(id: string) {
  try {
    // Get author data first to retrieve avatar URL
    const author = await prisma.author.findUnique({
      where: { id },
      select: { avatarUrl: true },
    });

    if (!author) {
      return { error: "Author not found" };
    }

    // Delete from database using Prisma
    await prisma.author.delete({
      where: { id },
    });

    // Delete avatar from Sevalla storage if it exists
    if (author.avatarUrl) {
      await deleteImageFromSevallaServer(author.avatarUrl);
    }

    revalidatePath("/admin/authors");
    return { success: true };
  } catch (error) {
    console.error("Delete author error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Record to delete does not exist")) {
        return { error: "Author not found" };
      }
      // Check for foreign key constraint (author has blogs)
      if (error.message.includes("Foreign key constraint")) {
        return { error: "Cannot delete author with existing blog posts" };
      }
    }
    
    return { error: "Failed to delete author" };
  }
}
