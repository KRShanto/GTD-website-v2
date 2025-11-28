"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteTestimonial(id: number) {
  try {
    const supabase = await createClient();

    // Check if testimonial exists
    const { data: existingTestimonial, error: fetchError } = await supabase
      .from("testimonials")
      .select("id, name")
      .eq("id", id)
      .single();

    if (fetchError || !existingTestimonial) {
      return { error: "Testimonial not found" };
    }

    // Delete testimonial
    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      console.error("Database error:", error);
      return { error: "Failed to delete testimonial. Please try again." };
    }

    // Revalidate paths
    revalidatePath("/admin/testimonials");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: "An unexpected error occurred" };
  }
}
