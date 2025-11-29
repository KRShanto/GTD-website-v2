import { NextResponse } from "next/server";
import { getTestimonials } from "@/actions/testimonials/read";

/**
 * GET /api/home/testimonials
 *
 * Returns testimonials for the home page with caching.
 * Cache tag: 'testimonials' for revalidation.
 */
export async function GET() {
  try {
    const testimonials = await getTestimonials();
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
