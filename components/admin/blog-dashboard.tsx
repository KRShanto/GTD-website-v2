"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Edit3,
  Trash2,
  Plus,
  User,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteBlog } from "@/actions/blogs/delete";
import { Blog } from "@/lib/generated/prisma/client";

type BlogWithAuthor = Blog & {
  author: {
    id: string;
    name: string;
    email: string | null;
    avatarUrl: string;
  };
};

export default function BlogDashboard({ blogs }: { blogs: BlogWithAuthor[] }) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [blogList, setBlogList] = useState(blogs);

  const handleDelete = async (id: string, featuredImageUrl?: string | null) => {
    setDeletingId(id);
    try {
      const result = await deleteBlog(id, featuredImageUrl || undefined);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Blog deleted successfully");
        setBlogList((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (error) {
      toast.error("Failed to delete blog");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Blog Management</h1>
          <Link href="/admin/blog/add">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" /> Add New Blog
            </Button>
          </Link>
        </div>
      </div>
      <div className="container mx-auto px-6 py-8">
        <Table className="min-w-[900px] bg-gradient-to-br from-gray-900 to-black border border-orange-500/20 rounded-lg">
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-32 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogList.map((blog) => (
              <TableRow key={blog.id}>
                <TableCell className="font-semibold text-white">
                  {blog.title}
                </TableCell>
                <TableCell className="text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-400" />
                  {blog.author?.name || "-"}
                </TableCell>
                <TableCell>
                  {blog.isPublished ? (
                    <Badge className="bg-green-600/20 text-green-400 border-green-500/30 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Published
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-700/20 text-gray-400 border-gray-500/30 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> Draft
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 inline-block text-orange-400" />
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <Link href={`/admin/blog/edit/${blog.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gray-800 border-orange-500/30 text-orange-400 hover:bg-orange-700 hover:border-orange-500/60 hover:text-orange-200"
                      >
                        <Edit3 className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-gray-800 border-red-500/30 text-red-400 hover:bg-red-700 hover:border-red-500/60 hover:text-red-200"
                      disabled={deletingId === blog.id}
                      onClick={() =>
                        handleDelete(blog.id, blog.featuredImageUrl)
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {blogList.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No blogs found. Click "Add New Blog" to create your first post.
          </div>
        )}
      </div>
    </div>
  );
}
