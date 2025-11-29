import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { requireAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Panel - GTD Media",
  description: "GTD Media admin panel for content management",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return <>{children}</>;
}
