import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Admin Panel - GTD Media",
  description: "GTD Media admin panel for content management",
};

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937", // Dark background
            border: "1px solid #374151",
            color: "#f9fafb",
          },
          className: "admin-toast",
          duration: 4000,
        }}
        theme="dark"
      />
    </>
  );
}
