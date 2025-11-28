import TestimonialForm from "@/components/admin/testimonial-form";
import { getCurrentAdmin } from "@/actions/auth/user";
import { getTestimonialById } from "@/actions/testimonials/read";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

interface EditTestimonialPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestimonialPage({
  params,
}: EditTestimonialPageProps) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const testimonialId = parseInt(id);

  if (isNaN(testimonialId)) {
    notFound();
  }

  const { testimonial, error } = await getTestimonialById(testimonialId);

  if (error || !testimonial) {
    notFound();
  }

  return <TestimonialForm testimonial={testimonial} isEditing={true} />;
}
