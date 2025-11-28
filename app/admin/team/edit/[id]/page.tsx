import { notFound, redirect } from "next/navigation";
import TeamMemberEdit from "@/components/admin/team-member-edit";
import { getCurrentAdmin } from "@/actions/auth/user";
import { getTeamMember } from "@/actions/team/read";

interface EditTeamMemberPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTeamMemberPage({
  params,
}: EditTeamMemberPageProps) {
  // Check auth
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  // Get params
  const { id } = await params;
  const memberId = parseInt(id);

  if (isNaN(memberId)) {
    notFound();
  }

  // Fetch team member
  const { data: member, error } = await getTeamMember(memberId);

  if (error || !member) {
    notFound();
  }

  return <TeamMemberEdit member={member} />;
}
