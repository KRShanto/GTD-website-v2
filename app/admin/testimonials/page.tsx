import { Suspense } from "react";
import TestimonialManagement from "@/components/admin/testimonial-management";
import { getTestimonials } from "@/actions/testimonials/read";

async function TestimonialsContent() {
  const testimonials = await getTestimonials();

  return <TestimonialManagement initialTestimonials={testimonials} />;
}

export default async function TestimonialsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="text-white text-xl">Loading testimonials...</div>
        </div>
      }
    >
      <TestimonialsContent />
    </Suspense>
  );
}
