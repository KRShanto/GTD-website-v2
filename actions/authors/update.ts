"use server";

import { prisma } from "@/lib/db";
import {
  uploadAuthorImageServer,
  deleteImageFromSevallaServer,
} from "@/lib/sevalla/storage-server";
import { revalidatePath } from "next/cache";

/**
 * Updates an existing author in the database
 * 
 * @param id - The UUID string of the author to update
 * @param formData - FormData containing updated author information
 * @returns Object with either the updated author data or an error message
 */
export async function updateAuthor(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | null;
    const avatar = formData.get("avatar") as File | null;

    if (!name) {
      return { error: "Name is required" };
    }

    // Get current author data
    const currentAuthor = await prisma.author.findUnique({
      where: { id },
      select: { avatarUrl: true },
    });

    if (!currentAuthor) {
      return { error: "Author not found" };
    }

    // Prepare update data
    const updateData: {
      name: string;
      email?: string | null;
      avatarUrl?: string;
    } = {
      name: name.trim(),
    };

    // Handle email update
    if (email && email.trim()) {
      updateData.email = email.trim();
    } else {
      // Set email to null if not provided
      updateData.email = null;
    }

    // Handle avatar update if new file is provided
    if (avatar) {
      const uploadResult = await uploadAuthorImageServer(avatar, avatar.name);

      if (!uploadResult.success || !uploadResult.url) {
        return {
          error: uploadResult.error || "Failed to upload new avatar",
        };
      }

      // Delete old avatar from Sevalla storage if it exists
      if (currentAuthor.avatarUrl) {
        await deleteImageFromSevallaServer(currentAuthor.avatarUrl);
      }

      updateData.avatarUrl = uploadResult.url;
    }

    // Update author in database using Prisma
    const author = await prisma.author.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/admin/authors");
    return { author };
  } catch (error) {
    console.error("Update author error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return { error: "Author not found" };
      }
    }
    
    return { error: "Failed to update author" };
  }
}
