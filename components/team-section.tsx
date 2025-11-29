import TeamSectionClient from "./team-section-client";
import { CACHE_TAGS } from "@/lib/consts/cache-tags";

/**
 * Fetches team members using fetch() with cache tags for revalidation
 */
async function getTeamData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/home/team`, {
      next: {
        tags: [CACHE_TAGS.TEAM],
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch team members");
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

export default async function TeamSection() {
  const members = await getTeamData();

  return <TeamSectionClient teamMembers={members} />;
}
