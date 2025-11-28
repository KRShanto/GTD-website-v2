"use server";

import { createClient } from "@/lib/supabase/server";
import { TeamMember } from "@/lib/types";
import { redis } from "@/lib/redis";

export async function getTeamMembers() {
  try {
    const supabase = await createClient();
    // Fetch all team members
    const { data, error } = await supabase.from("team").select("*");

    if (error) {
      return { error: error.message };
    }

    const members = data as TeamMember[];
    // Try to get order from Redis
    let orderedMembers = members;
    const order = await redis.lrange("team:order", 0, -1);
    if (order && order.length > 0) {
      // Redis stores as strings, convert to numbers
      const idOrder = order.map((id: string) => Number(id));
      // Map members by id for fast lookup
      const memberMap = new Map(members.map((m) => [m.id, m]));
      // Order by Redis, then append any missing
      orderedMembers = idOrder
        .map((id) => memberMap.get(id))
        .filter(Boolean) as TeamMember[];
      // Add any members not in Redis order (e.g., new ones)
      const missing = members.filter((m) => !idOrder.includes(m.id));
      orderedMembers = [...orderedMembers, ...missing];
    }
    return { success: true, data: orderedMembers };
  } catch (error) {
    console.error("Error fetching team members:", error);
    return { error: "Failed to fetch team members" };
  }
}

// Get single team member
export async function getTeamMember(id: number) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("team")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      return { error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Get team member error:", error);
    return { error: "An unexpected error occurred" };
  }
}
