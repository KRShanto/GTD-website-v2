import TestimonialForm from "@/components/admin/testimonial-form";
import { getCurrentAdmin } from "@/actions/auth/user";
import { redirect } from "next/navigation";

export default async function AddTestimonialPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return <TestimonialForm />;
}
