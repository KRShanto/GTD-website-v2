import AuthorForm from "@/components/admin/author-form";
import { getAuthor } from "@/actions/authors/read";
import { notFound } from "next/navigation";

interface EditAuthorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAuthorPage({ params }: EditAuthorPageProps) {
  const { id } = await params;
  const authorId = parseInt(id);

  if (isNaN(authorId)) {
    notFound();
  }

  const result = await getAuthor(authorId);

  if (!result.success || !result.data) {
    notFound();
  }

  return <AuthorForm author={result.data} isEditing={true} />;
}
