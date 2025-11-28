import { getTeamMembers } from "@/actions/team/get";
import TeamSectionClient from "./team-section-client";
import { TeamMember } from "@/lib/types";

export default async function TeamSection() {
  // Fetch data from Supabase
  const { members, error } = await getTeamMembers();

  // Transform data to match the expected format
  const teamMembers = members.map((member: TeamMember) => ({
    name: member.name,
    title: member.title,
    bio: member.bio,
    image: member.image_url,
    slug: member.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, ""),
  }));

  return <TeamSectionClient teamMembers={teamMembers} error={error} />;
}
