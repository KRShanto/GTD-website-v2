"use client";

import { TeamMember } from "@/lib/types";
import TeamMemberForm from "./team-member-form";
import { useRouter } from "next/navigation";

interface TeamMemberEditProps {
  member: TeamMember;
}

export default function TeamMemberEdit({ member }: TeamMemberEditProps) {
  const router = useRouter();

  return (
    <TeamMemberForm
      id={member.id}
      initialData={member}
      onSuccess={() => {
        router.push("/admin/team");
        router.refresh();
      }}
    />
  );
}
