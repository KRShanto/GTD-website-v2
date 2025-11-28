"use server";

import { prisma } from "@/lib/db";
import { uploadAuthorImageServer } from "@/lib/sevalla/storage-server";
import { revalidatePath } from "next/cache";

/**
 * Creates a new author in the database
 * 
 * @param formData - FormData containing author information
 * @returns Object with either the created author data or an error message
 */
export async function createAuthor(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string | null;
    const avatar = formData.get("avatar") as File;

    if (!name || !avatar) {
      return { error: "Name and avatar are required" };
    }

    // Upload avatar to Sevalla storage
    const uploadResult = await uploadAuthorImageServer(avatar, avatar.name);

    if (!uploadResult.success || !uploadResult.url) {
      return { error: uploadResult.error || "Failed to upload avatar" };
    }

    // Prepare author data
    const authorData: {
      name: string;
      email?: string | null;
      avatarUrl: string;
    } = {
      name: name.trim(),
      avatarUrl: uploadResult.url,
    };

    // Only add email if provided
    if (email && email.trim()) {
      authorData.email = email.trim();
    } else {
      authorData.email = null;
    }

    // Create author in database using Prisma
    const author = await prisma.author.create({
      data: authorData,
    });

    revalidatePath("/admin/authors");
    return { author };
  } catch (error) {
    console.error("Create author error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return { error: "An author with this email already exists" };
      }
    }
    
    return { error: "Failed to create author" };
  }
}
