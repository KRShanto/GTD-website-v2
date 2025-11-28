import { Suspense } from "react";
import TeamManagement from "@/components/admin/team-management";
import { getTeamMembers } from "@/actions/team/read";
import { getCurrentAdmin } from "@/actions/auth/user";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import AnimatedSection from "@/components/animated-section";

async function TeamContent() {
  const { success, data: members, error } = await getTeamMembers();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Team Members ({success && members ? members.length : 0})
              </Badge>
              <Link href="/admin/team/add">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Member
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <AnimatedSection>
          <div className="mb-8">
            <h1 className="text-3xl xs:text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Team Management
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Manage team members, their roles, and information.
            </p>
          </div>
        </AnimatedSection>

        {/* Team Management Component */}
        <AnimatedSection delay={100}>
          <TeamManagement
            initialMembers={success ? members : []}
            error={error}
          />
        </AnimatedSection>
      </div>
    </div>
  );
}

export default async function TeamPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
          <div className="text-white text-xl">Loading team members...</div>
        </div>
      }
    >
      <TeamContent />
    </Suspense>
  );
}
