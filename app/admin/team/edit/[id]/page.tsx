import { notFound, redirect } from "next/navigation";
import TeamMemberEdit from "@/components/admin/team-member-edit";
import { getUser } from "@/lib/auth";
import { getTeamMember } from "@/actions/team/read";

interface EditTeamMemberPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeamMemberPage({
  params,
}: EditTeamMemberPageProps) {
  // Check auth
  const admin = await getUser();
  if (!admin) {
    redirect("/admin/login");
  }

  // Get params - ID is now a UUID string, not a number
  const { id } = await params;
  const memberId = id;

  // Validate UUID format (basic check)
  if (!memberId || memberId.length < 10) {
    notFound();
  }

  // Fetch team member
  const { data: member, error } = await getTeamMember(memberId);

  if (error || !member) {
    notFound();
  }

  // Transform Team to match form expectations (image_url instead of imageUrl)
  const formData = {
    ...member,
    image_url: member.imageUrl,
  };

  return <TeamMemberEdit member={formData as any} />;
}
