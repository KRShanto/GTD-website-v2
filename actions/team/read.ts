"use server";

import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";
import { Team } from "@prisma/client";

/**
 * Fetches all team members from the database
 *
 * This function retrieves all team members and applies custom ordering
 * from Redis if available. The order is stored in Redis as a list of IDs,
 * allowing administrators to customize the display order.
 *
 * @returns Object with either the team members array or an error message
 *
 * @example
 * ```typescript
 * const result = await getTeamMembers();
 * if (result.success && result.data) {
 *   result.data.forEach(member => {
 *     console.log(member.name);
 *   });
 * }
 * ```
 */
export async function getTeamMembers() {
  try {
    // Fetch all team members from database using Prisma
    const members = await prisma.team.findMany({
      orderBy: { createdAt: "desc" }, // Default order by creation date
    });

    // Try to get custom order from Redis
    let orderedMembers = members;
    const order = await redis.lrange("team:order", 0, -1);

    if (order && order.length > 0) {
      // Redis stores as strings, convert to UUID strings
      const idOrder = order;

      // Map members by id for fast lookup
      const memberMap = new Map(members.map((m) => [m.id, m]));

      // Order by Redis order, then append any missing
      orderedMembers = idOrder
        .map((id) => memberMap.get(id))
        .filter(Boolean) as Team[];

      // Add any members not in Redis order (e.g., new ones)
      const missing = members.filter((m) => !idOrder.includes(m.id));
      orderedMembers = [...orderedMembers, ...missing];
    }

    return orderedMembers;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

/**
 * Fetches a single team member by ID
 *
 * This function retrieves a specific team member from the database
 * using their unique UUID identifier.
 *
 * @param id - The UUID string of the team member to retrieve
 * @returns Object with either the team member data or an error message
 *
 * @example
 * ```typescript
 * const result = await getTeamMember("uuid-here");
 * if (result.success && result.data) {
 *   console.log(result.data.name);
 * }
 * ```
 */
export async function getTeamMember(id: string) {
  try {
    // Fetch team member from database using Prisma
    const teamMember = await prisma.team.findUnique({
      where: { id },
    });

    if (!teamMember) {
      return { error: "Team member not found" };
    }

    return { success: true, data: teamMember };
  } catch (error) {
    console.error("Get team member error:", error);
    return { error: "An unexpected error occurred" };
  }
}
