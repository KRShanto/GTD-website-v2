"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Users, Mail, Edit3, Trash2, Calendar } from "lucide-react";
import { Author } from "@/lib/types";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

interface AuthorManagementProps {
  authors: Author[];
}

export default function AuthorManagement({ authors }: AuthorManagementProps) {
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleDeleteAuthor = async (id: number, name: string) => {
    setIsDeleting(id);
    try {
      const { deleteAuthor } = await import("@/actions/authors/delete");
      const result = await deleteAuthor(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${name} has been deleted successfully`);
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to delete author");
    } finally {
      setIsDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (authors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Users className="w-16 h-16 text-orange-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Authors Yet</h3>
        <p className="text-gray-400 mb-6">
          Get started by adding your first blog author.
        </p>
        <Link href="/admin/authors/add">
          <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
            Add First Author
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[700px] bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-lg">
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Avatar</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-32 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {authors.map((author) => (
            <TableRow key={author.id}>
              <TableCell>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-orange-500/30 bg-gray-800">
                  <Image
                    src={author.avatar_url}
                    alt={author.name}
                    width={40}
                    height={40}
                    className="object-cover w-10 h-10"
                  />
                </div>
              </TableCell>
              <TableCell className="font-semibold text-white">
                {author.name}
              </TableCell>
              <TableCell className="text-gray-300">
                {author.email || (
                  <span className="text-gray-500 italic">No email</span>
                )}
              </TableCell>
              <TableCell className="text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 inline-block text-orange-400" />
                  {formatDate(author.created_at)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Link href={`/admin/authors/edit/${author.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-gray-800 border-orange-500/30 text-orange-400 hover:bg-orange-700 hover:border-orange-500/60 hover:text-orange-200 focus:bg-orange-900 focus:text-orange-100"
                    >
                      <Edit3 className="w-4 h-4 mr-1" /> Edit
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gray-800 border-red-500/30 text-red-400 hover:bg-red-700 hover:border-red-500/60 hover:text-red-200 focus:bg-red-900 focus:text-red-100"
                        disabled={isDeleting === author.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                          Delete Author
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Are you sure you want to delete {author.name}? This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDeleteAuthor(author.id, author.name)
                          }
                          className="bg-red-600 hover:bg-red-700 text-white"
                          disabled={isDeleting === author.id}
                        >
                          {isDeleting === author.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
