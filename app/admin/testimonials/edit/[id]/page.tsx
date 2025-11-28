import TestimonialForm from "@/components/admin/testimonial-form";
import { getTestimonialById } from "@/actions/testimonials/read";
import { notFound } from "next/navigation";

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({
  params,
}: EditTestimonialPageProps) {
  // Get params - ID is now a UUID string, not a number
  const { id } = await params;
  const testimonialId = id;

  // Validate UUID format (basic check)
  if (!testimonialId || testimonialId.length < 10) {
    notFound();
  }

  const { testimonial, error } = await getTestimonialById(testimonialId);

  if (error || !testimonial) {
    notFound();
  }

  return <TestimonialForm testimonial={testimonial} isEditing={true} />;
}
