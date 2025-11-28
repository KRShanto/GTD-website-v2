import { getTeamMembers as getTeamMembersRaw } from "@/actions/team/read";

export async function getTeamMembers() {
  const result = await getTeamMembersRaw();
  if (result && Array.isArray(result.data)) {
    return { members: result.data, error: null };
  } else {
    return { members: [], error: result?.error || "Unknown error" };
  }
}
