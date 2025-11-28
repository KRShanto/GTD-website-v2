"use server";

import { prisma } from "@/lib/db";
import {
  uploadTeamImageServer,
  deleteImageFromSevallaServer,
} from "@/lib/sevalla/storage-server";
import { revalidatePath } from "next/cache";

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
 * Updates an existing team member in the database
 * 
 * This function handles the complete team member update process:
 * 1. Validates required fields (name, title, bio)
 * 2. Fetches the current team member to preserve existing image if no new image is provided
 * 3. Uploads new image to Sevalla storage if provided
 * 4. Deletes old image from Sevalla storage if replaced
 * 5. Generates a new slug if the name has changed
 * 6. Updates the team member record in the database using Prisma
 * 7. Revalidates the relevant Next.js cache paths
 * 
 * @param id - The UUID string of the team member to update
 * @param formData - FormData containing updated team member information
 * @param formData.name - Team member's full name (required)
 * @param formData.title - Team member's job title (required)
 * @param formData.bio - Team member's biography (required)
 * @param formData.image - Optional new profile image file
 * 
 * @returns Object with either the updated member data or an error message
 * 
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append("name", "John Doe");
 * formData.append("title", "Senior Producer");
 * formData.append("bio", "Updated biography...");
 * 
 * const result = await updateTeamMember("uuid-here", formData);
 * if (result.member) {
 *   console.log("Member updated:", result.member);
 * }
 * ```
 */
export async function updateTeamMember(id: string, formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string;
    const title = formData.get("title") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as File | null;

    // Validate required fields
    if (!name || !title || !bio) {
      const missing = [];
      if (!name) missing.push("name");
      if (!title) missing.push("job title");
      if (!bio) missing.push("biography");
      return { error: `Missing required fields: ${missing.join(", ")}` };
    }

    // Get current member data to preserve existing image
    const currentMember = await prisma.team.findUnique({
      where: { id },
      select: { imageUrl: true, name: true },
    });

    if (!currentMember) {
      return { error: "Team member not found" };
    }

    // Prepare update data
    const updateData: {
      name: string;
      title: string;
      bio: string;
      slug: string;
      imageUrl: string;
    } = {
      name: name.trim(),
      title: title.trim(),
      bio: bio.trim(),
      slug: generateSlug(name.trim()),
      imageUrl: currentMember.imageUrl, // Preserve existing image by default
    };

    // Handle image update if new file is provided
    if (image) {
      // Upload new image to Sevalla storage
      const imageUploadResult = await uploadTeamImageServer(image, image.name);

      if (!imageUploadResult.success || !imageUploadResult.url) {
        return {
          error: imageUploadResult.error || "Failed to upload new image",
        };
      }

      // Delete old image from Sevalla storage if it exists
      if (currentMember.imageUrl) {
        await deleteImageFromSevallaServer(currentMember.imageUrl);
      }

      updateData.imageUrl = imageUploadResult.url;
    }

    // Update team member in database using Prisma
    const teamMember = await prisma.team.update({
      where: { id },
      data: updateData,
    });

    // Revalidate Next.js cache paths
    revalidatePath("/admin/team");
    revalidatePath("/team");

    return { member: teamMember };
  } catch (error) {
    console.error("Update team member error:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return { error: "Team member not found" };
      }
    }
    
    return { error: "Failed to update team member" };
  }
}

/**
 * Updates multiple team members in the database
 * 
 * This function allows bulk updates of team member information.
 * Note: This does not handle image updates, only text fields.
 * 
 * @param updates - Array of update objects containing id, name, title, and bio
 * @returns Object with either the updated members array or an error message
 */
export async function updateMultipleTeamMembers(
  updates: { id: string; name: string; title: string; bio: string }[]
) {
  try {
    // Update all members using Prisma transaction
    const updatePromises = updates.map((update) =>
      prisma.team.update({
        where: { id: update.id },
        data: {
          name: update.name.trim(),
          title: update.title.trim(),
          bio: update.bio.trim(),
          slug: generateSlug(update.name.trim()),
        },
      })
    );

    const teamMembers = await Promise.all(updatePromises);

    // Revalidate Next.js cache paths
    revalidatePath("/admin/team");
    revalidatePath("/team");

    return { members: teamMembers };
  } catch (error) {
    console.error("Update multiple team members error:", error);
    return { error: "Failed to update team members" };
  }
}

/**
 * Reorders team members using Redis
 * 
 * This function stores the team member order in Redis for retrieval
 * when displaying team members. The order is stored as a list of IDs.
 * 
 * @param ids - Array of team member UUIDs in the desired order
 * @returns Object with success status
 */
export async function reorderTeamMembers(ids: string[]) {
  try {
    // Store the order in Redis, similar to gallery images/videos
    const { redis } = await import("@/lib/redis");
    await redis.del("team:order");
    if (ids.length > 0) {
      await redis.rpush("team:order", ...ids);
    }
    return { success: true };
  } catch (error) {
    console.error("Reorder team members error:", error);
    return { error: "Failed to reorder team members" };
  }
}

