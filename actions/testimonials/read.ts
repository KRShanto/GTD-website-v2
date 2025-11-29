"use server";

import { prisma } from "@/lib/db";
import { Testimonial } from "@prisma/client";

/**
 * Fetches all testimonials from the database
 *
 * @returns Object with either the testimonials array or an error message
 */
export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });

    return testimonials;
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return [];
  }
}

/**
 * Fetches a single testimonial by ID
 *
 * @param id - The UUID string of the testimonial to retrieve
 * @returns Object with either the testimonial data or an error message
 */
export async function getTestimonialById(id: string): Promise<{
  testimonial: Testimonial | null;
  error: string | null;
}> {
  try {
    const testimonial = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonial) {
      return {
        testimonial: null,
        error: "Testimonial not found",
      };
    }

    return {
      testimonial,
      error: null,
    };
  } catch (error) {
    console.error("Get testimonial error:", error);
    return {
      testimonial: null,
      error: "An unexpected error occurred",
    };
  }
}
