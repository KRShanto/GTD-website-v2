"use server";

import { prisma } from "@/lib/db";
import { deleteImageFromSevallaServer } from "@/lib/sevalla/storage-server";
import { revalidatePath } from "next/cache";

/**
 * Deletes a single team member from the database
 *
 * This function handles the complete team member deletion process:
 * 1. Fetches the team member to get the image URL
 * 2. Deletes the team member record from the database
 * 3. Deletes the associated image from Sevalla storage
 * 4. Revalidates the relevant Next.js cache paths
 *
 * @param id - The UUID string of the team member to delete
 * @returns Object with success status or an error message
 *
 * @example
 * ```typescript
 * const result = await deleteTeamMember("uuid-here");
 * if (result.success) {
 *   console.log("Member deleted successfully");
 * }
 * ```
 */
export async function deleteTeamMember(id: string) {
  try {
    // Get member data first to retrieve image URL
    const member = await prisma.team.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!member) {
      return { error: "Team member not found" };
    }

    // Delete from database using Prisma
    await prisma.team.delete({
      where: { id },
    });

    // Delete image from Sevalla storage if it exists
    if (member.imageUrl) {
      await deleteImageFromSevallaServer(member.imageUrl);
    }

    // Revalidate Next.js cache paths
    revalidatePath("/admin/team");
    revalidatePath("/team");

    return { success: true };
  } catch (error) {
    console.error("Delete team member error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Record to delete does not exist")) {
        return { error: "Team member not found" };
      }
    }

    return { error: "Failed to delete team member" };
  }
}

/**
 * Deletes multiple team members from the database
 *
 * This function handles bulk deletion of team members:
 * 1. Fetches all team members to get their image URLs
 * 2. Deletes all team member records from the database
 * 3. Deletes all associated images from Sevalla storage
 * 4. Revalidates the relevant Next.js cache paths
 *
 * @param ids - Array of UUID strings of team members to delete
 * @returns Object with success status or an error message
 *
 * @example
 * ```typescript
 * const result = await deleteMultipleTeamMembers(["uuid1", "uuid2"]);
 * if (result.success) {
 *   console.log("Members deleted successfully");
 * }
 * ```
 */
export async function deleteMultipleTeamMembers(ids: string[]) {
  try {
    // Get member URLs first
    const members = await prisma.team.findMany({
      where: { id: { in: ids } },
      select: { imageUrl: true },
    });

    // Delete from database using Prisma
    await prisma.team.deleteMany({
      where: { id: { in: ids } },
    });

    // Delete all images from Sevalla storage
    const deletePromises = members
      .filter((member) => member.imageUrl)
      .map((member) => deleteImageFromSevallaServer(member.imageUrl));

    await Promise.all(deletePromises);

    // Revalidate Next.js cache paths
    revalidatePath("/admin/team");
    revalidatePath("/team");

    return { success: true };
  } catch (error) {
    console.error("Delete multiple team members error:", error);
    return { error: "Failed to delete team members" };
  }
}
