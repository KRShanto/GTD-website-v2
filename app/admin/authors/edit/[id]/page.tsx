import AuthorForm from "@/components/admin/author-form";
import { getAuthor } from "@/actions/authors/read";
import { notFound } from "next/navigation";

interface EditAuthorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAuthorPage({ params }: EditAuthorPageProps) {
  // Get params - ID is now a UUID string, not a number
  const { id } = await params;
  const authorId = id;

  // Validate UUID format (basic check)
  if (!authorId || authorId.length < 10) {
    notFound();
  }

  const result = await getAuthor(authorId);

  if (!result.success || !result.data) {
    notFound();
  }

  return <AuthorForm author={result.data} isEditing={true} />;
}
