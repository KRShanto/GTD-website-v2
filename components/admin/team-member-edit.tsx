"use client";

import { Team } from "@prisma/client";
import TeamMemberForm from "./team-member-form";
import { useRouter } from "next/navigation";

interface TeamMemberEditProps {
  member: Team;
}

export default function TeamMemberEdit({ member }: TeamMemberEditProps) {
  const router = useRouter();

  // Transform Team data to match form expectations
  const initialData = {
    name: member.name,
    title: member.title,
    bio: member.bio,
    image_url: member.imageUrl,
  };

  return (
    <TeamMemberForm
      id={member.id}
      initialData={initialData}
      onSuccess={() => {
        router.push("/admin/team");
        router.refresh();
      }}
    />
  );
}
