import TestimonialsSectionClient from "./testimonials-section-client";
import { CACHE_TAGS } from "@/lib/consts/cache-tags";

/**
 * Fetches testimonials using fetch() with cache tags for revalidation
 */
async function getTestimonialsData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/home/testimonials`, {
      next: {
        tags: [CACHE_TAGS.TESTIMONIALS],
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch testimonials");
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

export default async function TestimonialsSection() {
  const testimonials = await getTestimonialsData();
  return <TestimonialsSectionClient testimonials={testimonials} />;
}
