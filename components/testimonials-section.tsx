import { getTestimonials } from "@/actions/testimonials/get";
import TestimonialsSectionClient from "./testimonials-section-client";
import { Testimonial as BaseTestimonial } from "@/lib/types";

interface Testimonial extends BaseTestimonial {
  delay: number;
}

export default async function TestimonialsSection() {
  // Fetch data from Supabase
  const { testimonials, error } = await getTestimonials();

  // Transform data to match the expected format
  const transformedTestimonials: Testimonial[] = testimonials.map(
    (testimonial, index) => ({
      ...testimonial,
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
