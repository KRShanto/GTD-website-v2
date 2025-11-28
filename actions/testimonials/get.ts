import { createClient } from "@/lib/supabase/server";
import { Testimonial } from "@/lib/types";

export async function getTestimonials(): Promise<{
  testimonials: Testimonial[];
  error: string | null;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return {
        testimonials: [],
        error: "Failed to fetch testimonials",
      };
    }

    return {
      testimonials: data || [],
      error: null,
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      testimonials: [],
      error: "An unexpected error occurred",
    };
  }
}
