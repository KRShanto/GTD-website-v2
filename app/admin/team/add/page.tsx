"use client";

import { useRouter } from "next/navigation";
import TeamMemberForm from "@/components/admin/team-member-form";

export default function AddTeamMemberPage() {
  const router = useRouter();

  return (
    <TeamMemberForm
      onSuccess={() => {
        router.push("/admin/team");
        router.refresh();
      }}
    />
  );
}
