import { Suspense } from "react";
import TestimonialManagement from "@/components/admin/testimonial-management";
import { getTestimonials } from "@/actions/testimonials/read";
import { getCurrentAdmin } from "@/actions/auth/user";
import { redirect } from "next/navigation";

async function TestimonialsContent() {
  const { testimonials, error } = await getTestimonials();

  return (
    <TestimonialManagement initialTestimonials={testimonials} error={error} />
  );
}

export default async function TestimonialsPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

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
