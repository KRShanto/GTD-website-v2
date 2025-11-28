"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateTestimonial(id: number, formData: FormData) {
  try {
    const supabase = await createClient();

    // Extract form data
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const company = formData.get("company") as string;
    const content = formData.get("content") as string;
    const rating = parseInt(formData.get("rating") as string);

    // Validation
    if (
      !name?.trim() ||
      !address?.trim() ||
      !company?.trim() ||
      !content?.trim()
    ) {
      return { error: "All fields are required" };
    }

    if (!rating || rating < 1 || rating > 5) {
      return { error: "Rating must be between 1 and 5" };
    }

    if (content.length < 10) {
      return { error: "Content must be at least 10 characters long" };
    }

    if (content.length > 1000) {
      return { error: "Content must be less than 1000 characters" };
    }

    // Check if testimonial exists
    const { data: existingTestimonial, error: fetchError } = await supabase
      .from("testimonials")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !existingTestimonial) {
      return { error: "Testimonial not found" };
    }

    // Update testimonial
    const { data, error } = await supabase
      .from("testimonials")
      .update({
        name: name.trim(),
        address: address.trim(),
        company: company.trim(),
        content: content.trim(),
        rating,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return { error: "Failed to update testimonial. Please try again." };
    }

    // Revalidate paths
    revalidatePath("/admin/testimonials");
    revalidatePath("/");

    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "An unexpected error occurred" };
  }
}
