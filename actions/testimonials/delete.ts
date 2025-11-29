"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/consts/cache-tags";

/**
 * Deletes a testimonial from the database
 *
 * @param id - The UUID string of the testimonial to delete
 * @returns Object with success status or an error message
 */
export async function deleteTestimonial(id: string) {
  try {
    // Check if testimonial exists and delete
    await prisma.testimonial.delete({
      where: { id },
    });

    // Revalidate paths
    revalidatePath("/admin/testimonials");
    revalidateTag(CACHE_TAGS.TESTIMONIALS);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Delete testimonial error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Record to delete does not exist")) {
        return { error: "Testimonial not found" };
      }
    }

    return { error: "An unexpected error occurred" };
  }
}
