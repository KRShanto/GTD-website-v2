"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  User,
  Briefcase,
  Building,
  MessageSquare,
  Star,
} from "lucide-react";
import { createTestimonial } from "@/actions/testimonials/create";
import { updateTestimonial } from "@/actions/testimonials/update";
import { Testimonial } from "@/lib/generated/prisma/client";
import { toast } from "sonner";
import AnimatedSection from "@/components/animated-section";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TestimonialFormProps {
  testimonial?: Testimonial;
  isEditing?: boolean;
}

export default function TestimonialForm({
  testimonial,
  isEditing = false,
}: TestimonialFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: testimonial?.name || "",
    address: testimonial?.address || "",
    company: testimonial?.company || "",
    content: testimonial?.content || "",
    rating: testimonial?.rating ? testimonial.rating.toString() : "5",
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.address.trim() ||
      !formData.company.trim() ||
      !formData.content.trim()
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    const ratingNumber = parseInt(formData.rating, 10);
    if (isNaN(ratingNumber) || ratingNumber < 1 || ratingNumber > 5) {
      toast.error("Rating must be between 1 and 5");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name.trim());
      submitFormData.append("address", formData.address.trim());
      submitFormData.append("company", formData.company.trim());
      submitFormData.append("content", formData.content.trim());
      submitFormData.append("rating", ratingNumber.toString());

      const result =
        isEditing && testimonial
          ? await updateTestimonial(testimonial.id, submitFormData)
          : await createTestimonial(submitFormData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isEditing
            ? `Testimonial from ${formData.name} has been updated successfully`
            : `Testimonial from ${formData.name} has been added successfully`
        );
        router.push("/admin/testimonials");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/testimonials"
              className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                Back to Testimonial Management
              </span>
            </Link>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {isEditing ? "Edit Testimonial" : "Add Testimonial"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Page Title */}
        <AnimatedSection>
          <div className="mb-8">
            <h1 className="text-3xl xs:text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {isEditing ? "Edit Testimonial" : "Add Testimonial"}
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              {isEditing
                ? "Update client testimonial information."
                : "Add a new client testimonial and review."}
            </p>
          </div>
        </AnimatedSection>

        {/* Form */}
        <AnimatedSection delay={100}>
          <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-orange-400" />
                {isEditing
                  ? "Testimonial Information"
                  : "New Testimonial Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Client Info */}
                  <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-orange-400" />
                        Client Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter client name"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                        required
                      />
                    </div>

                    {/* Address Field */}
                    <div className="mb-4">
                      <Label
                        htmlFor="address"
                        className="block mb-1 font-medium text-white"
                      >
                        Address
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="Client's Address"
                        value={formData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                        required
                      />
                    </div>

                    {/* Company Field */}
                    <div>
                      <Label
                        htmlFor="company"
                        className="text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <Building className="w-4 h-4 text-orange-400" />
                        Company/Organization
                      </Label>
                      <Input
                        id="company"
                        type="text"
                        value={formData.company}
                        onChange={(e) =>
                          handleInputChange("company", e.target.value)
                        }
                        placeholder="Company name and location"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                        required
                      />
                    </div>

                    {/* Rating Field */}
                    <div>
                      <Label
                        htmlFor="rating"
                        className="text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <Star className="w-4 h-4 text-orange-400" />
                        Rating
                      </Label>
                      <div className="flex items-center gap-4">
                        <Input
                          id="rating"
                          type="number"
                          min="1"
                          max="5"
                          value={formData.rating}
                          onChange={(e) =>
                            handleInputChange(
                              "rating",
                              parseInt(e.target.value) || 5
                            )
                          }
                          className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 w-24"
                          required
                        />
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < parseInt(formData.rating, 10)
                                  ? "text-orange-400 fill-current"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Rate from 1 to 5 stars
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Content */}
                  <div className="space-y-6">
                    {/* Content Field */}
                    <div>
                      <Label
                        htmlFor="content"
                        className="text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4 text-orange-400" />
                        Testimonial Content
                      </Label>
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) =>
                          handleInputChange("content", e.target.value)
                        }
                        placeholder="Enter the testimonial content..."
                        rows={12}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 resize-none"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Current length: {formData.content.length}/1000
                        characters
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-2">
                        Preview:
                      </h4>
                      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          {[...Array(formData.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 text-orange-400 fill-current"
                            />
                          ))}
                        </div>
                        <p className="text-gray-300 text-sm mb-3 italic">
                          "
                          {formData.content ||
                            "Your testimonial content will appear here..."}
                          "
                        </p>
                        <div className="text-sm">
                          <div className="text-white font-medium">
                            {formData.name || "Client Name"}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {formData.address || "Client's Address"}
                          </div>
                          <div className="text-gray-400">
                            {formData.company || "Company/Organization"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t border-gray-700">
                  <Link href="/admin/testimonials" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting
                      ? isEditing
                        ? "Updating..."
                        : "Adding..."
                      : isEditing
                      ? "Update Testimonial"
                      : "Add Testimonial"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
}
