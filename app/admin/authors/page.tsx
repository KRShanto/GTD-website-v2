import AuthorManagement from "@/components/admin/author-management";
import { getAuthors } from "@/actions/authors/read";
import { Author } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import AnimatedSection from "@/components/animated-section";

export default async function AuthorsPage() {
  const result = await getAuthors();
  const authors: Author[] = result.success ? result.data : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Authors ({authors.length})
              </Badge>
              <Link href="/admin/authors/add">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Author
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Page Title */}
        <AnimatedSection>
          <div className="mb-8">
            <h1 className="text-3xl xs:text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Author Management
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Manage blog authors, their profiles, and information.
            </p>
          </div>
        </AnimatedSection>

        {/* Authors Management */}
        <AnimatedSection delay={100}>
          <AuthorManagement authors={authors} />
        </AnimatedSection>
      </div>
    </div>
  );
}
