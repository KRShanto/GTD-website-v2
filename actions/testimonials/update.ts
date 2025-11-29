"use server";

import { prisma } from "@/lib/db";
import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/consts/cache-tags";

/**
 * Updates an existing testimonial in the database
 *
 * @param id - The UUID string of the testimonial to update
 * @param formData - FormData containing updated testimonial information
 * @returns Object with either the updated testimonial data or an error message
 */
export async function updateTestimonial(id: string, formData: FormData) {
  try {
    // Extract form data
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const company = formData.get("company") as string;
    const content = formData.get("content") as string;
    const ratingValue = parseFloat(formData.get("rating") as string);

    // Validation
    if (
      !name?.trim() ||
      !address?.trim() ||
      !company?.trim() ||
      !content?.trim()
    ) {
      return { error: "All fields are required" };
    }

    if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
      return { error: "Rating must be between 1 and 5" };
    }

    if (content.length < 10) {
      return { error: "Content must be at least 10 characters long" };
    }

    if (content.length > 1000) {
      return { error: "Content must be less than 1000 characters" };
    }

    // Check if testimonial exists and update
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name: name.trim(),
        address: address.trim(),
        company: company.trim(),
        content: content.trim(),
        rating: ratingValue, // Prisma will convert to Decimal
      },
    });

    // Revalidate paths
    revalidatePath("/admin/testimonials");
    revalidateTag(CACHE_TAGS.TESTIMONIALS);
    revalidatePath("/");

    return { success: true, data: testimonial };
  } catch (error) {
    console.error("Update testimonial error:", error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return { error: "Testimonial not found" };
      }
    }

    return { error: "An unexpected error occurred" };
  }
}
