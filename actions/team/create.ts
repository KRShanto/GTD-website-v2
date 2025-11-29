"use server";

import { prisma } from "@/lib/db";
import { uploadTeamImageServer } from "@/lib/sevalla/storage-server";
import { deleteImageFromSevallaServer } from "@/lib/sevalla/storage-server";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/consts/cache-tags";

/**
 * Generates a URL-friendly slug from a name
 * Converts to lowercase, replaces spaces with hyphens, and removes special characters
 *
 * @param name - The name to convert to a slug
 * @returns A URL-friendly slug string
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Creates a new team member in the database
 *
 * This function handles the complete team member creation process:
 * 1. Validates required fields (name, title, bio, image)
 * 2. Uploads the profile image to Sevalla storage
 * 3. Generates a unique slug from the member's name
 * 4. Creates the team member record in the database using Prisma
 * 5. Revalidates the relevant Next.js cache paths
 *
 * @param formData - FormData containing team member information
 * @param formData.name - Team member's full name (required)
 * @param formData.title - Team member's job title (required)
 * @param formData.bio - Team member's biography (required)
 * @param formData.image - Profile image file (required)
 *
 * @returns Object with either the created member data or an error message
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append("name", "John Doe");
 * formData.append("title", "Producer");
 * formData.append("bio", "Experienced producer...");
 * formData.append("image", imageFile);
 *
 * const result = await createTeamMember(formData);
 * if (result.member) {
 *   console.log("Member created:", result.member);
 * }
 * ```
 */
export async function createTeamMember(formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as File;

    // Validate required fields
    if (!name || !title || !bio || !image) {
      const missing = [];
      if (!name) missing.push("name");
      if (!title) missing.push("job title");
      if (!bio) missing.push("biography");
      if (!image) missing.push("profile image");
      return { error: `Missing required fields: ${missing.join(", ")}` };
    }

    // Upload image to Sevalla storage
    const imageUploadResult = await uploadTeamImageServer(image, image.name);

    if (!imageUploadResult.success || !imageUploadResult.url) {
      return { error: imageUploadResult.error || "Failed to upload image" };
    }

    // Generate slug from name
    const slug = generateSlug(name);

    // Create team member in database using Prisma
    const teamMember = await prisma.team.create({
      data: {
        name: name.trim(),
        title: title.trim(),
        bio: bio.trim(),
        slug,
        imageUrl: imageUploadResult.url,
      },
    });

    // Revalidate Next.js cache paths
    revalidatePath("/admin/team");
    revalidatePath("/team");
    revalidateTag(CACHE_TAGS.TEAM);

    return { member: teamMember };
  } catch (error) {
    console.error("Create team member error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      // Check for unique constraint violations (e.g., duplicate slug)
      if (error.message.includes("Unique constraint")) {
        return { error: "A team member with this name already exists" };
      }
    }

    return { error: "Failed to create team member" };
  }
}
