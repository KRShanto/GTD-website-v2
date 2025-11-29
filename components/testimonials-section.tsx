import { getTestimonials } from "@/actions/testimonials/read";
import TestimonialsSectionClient from "./testimonials-section-client";

export default async function TestimonialsSection() {
  const testimonials = await getTestimonials();
  return <TestimonialsSectionClient testimonials={testimonials} />;
}
