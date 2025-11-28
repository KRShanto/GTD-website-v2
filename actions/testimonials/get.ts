import { getTestimonials as getTestimonialsRaw } from "@/actions/testimonials/read";

/**
 * Wrapper function for getTestimonials
 * Maintains backward compatibility with existing code
 */
export async function getTestimonials() {
  return getTestimonialsRaw();
}
