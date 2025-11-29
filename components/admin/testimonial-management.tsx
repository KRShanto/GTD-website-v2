"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Quote,
  Star,
} from "lucide-react";
import { Testimonial } from "@/lib/generated/prisma/client";
import { deleteTestimonial } from "@/actions/testimonials/delete";
import { toast } from "sonner";
import AnimatedSection from "@/components/animated-section";
import Link from "next/link";
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

interface TestimonialManagementProps {
  initialTestimonials: Testimonial[];
}

export default function TestimonialManagement({
  initialTestimonials,
}: TestimonialManagementProps) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      const result = await deleteTestimonial(id);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Testimonial from ${name} has been deleted`);
        setTestimonials((prev) =>
          prev.filter((testimonial) => testimonial.id !== id)
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

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
                Testimonial Management
              </Badge>
              <Link href="/admin/testimonials/add">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Testimonial
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
                Testimonial Management
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Manage client testimonials and reviews.
            </p>
          </div>
        </AnimatedSection>

        {/* Testimonials Grid */}
        {testimonials.length === 0 ? (
          <AnimatedSection delay={100}>
            <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Testimonials Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Get started by adding your first testimonial.
                </p>
                <Link href="/admin/testimonials/add">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Testimonial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </AnimatedSection>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection key={testimonial.id} delay={100 + index * 50}>
                <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col h-full">
                      {/* Quote Icon */}
                      <Quote className="h-6 w-6 text-orange-400 mb-3" />

                      {/* Content */}
                      <p className="text-gray-300 mb-4 text-sm leading-relaxed flex-grow line-clamp-4">
                        "{testimonial.content}"
                      </p>

                      {/* Rating */}
                      <div className="flex items-center mb-4">
                        {[...Array(Number(testimonial.rating))].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-orange-400 fill-current"
                          />
                        ))}
                      </div>

                      {/* Client Info */}
                      <div className="mb-4">
                        <div className="font-bold text-white text-sm">
                          {testimonial.name}
                        </div>
                        <div className="text-orange-400 text-xs mb-1">
                          {testimonial.address}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {testimonial.company}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-4 border-t border-gray-700">
                        <Link
                          href={`/admin/testimonials/edit/${testimonial.id}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            className="w-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="bg-red-900/20 border-red-600 text-red-400 hover:bg-red-800/40 hover:border-red-500 hover:text-red-300 focus:bg-red-800/40 focus:border-red-500 focus:text-red-300"
                              disabled={deletingId === testimonial.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-900 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">
                                Delete Testimonial
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-400">
                                Are you sure you want to delete the testimonial
                                from <strong>{testimonial.name}</strong>? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDelete(testimonial.id, testimonial.name)
                                }
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                {deletingId === testimonial.id
                                  ? "Deleting..."
                                  : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
