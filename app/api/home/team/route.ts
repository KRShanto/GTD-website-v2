import { NextResponse } from "next/server";
import { getTeamMembers } from "@/actions/team/read";

/**
 * GET /api/home/team
 *
 * Returns team members for the home page with caching.
 * Cache tag: 'team' for revalidation.
 */
export async function GET() {
  try {
    const members = await getTeamMembers();
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}
