import TeamSectionClient from "./team-section-client";
import { getTeamMembers } from "@/actions/team/read";

export default async function TeamSection() {
  const members = await getTeamMembers();

  return <TeamSectionClient teamMembers={members} />;
}
