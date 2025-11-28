import { getTestimonials } from "@/actions/testimonials/get";
import TestimonialsSectionClient from "./testimonials-section-client";
import { Testimonial as PrismaTestimonial } from "@/lib/generated/prisma/client";

interface Testimonial extends PrismaTestimonial {
  delay: number;
  rating: number; // Convert Decimal to number for display
}

export default async function TestimonialsSection() {
  // Fetch data from Prisma
  const { testimonials, error } = await getTestimonials();

  // Transform data to match the expected format
  const transformedTestimonials: Testimonial[] = testimonials.map(
    (testimonial, index) => ({
      ...testimonial,
      rating: Number(testimonial.rating), // Convert Decimal to number
      delay: (index + 1) * 100,
    })
  );

  return (
    <TestimonialsSectionClient
      testimonials={transformedTestimonials}
      error={error}
    />
  );
}
