"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  Save,
  User,
  Mail,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Author } from "@prisma/client";
import { toast } from "sonner";
import AnimatedSection from "@/components/animated-section";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface AuthorFormProps {
  author?: Author;
  isEditing?: boolean;
}

export default function AuthorForm({
  author,
  isEditing = false,
}: AuthorFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: author?.name || "",
    email: author?.email || "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    author?.avatarUrl || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setSelectedFile(null);
    setImagePreview(author?.avatarUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter the author's name");
      return;
    }

    // Validate email format only if email is provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    if (!isEditing && !selectedFile) {
      toast.error("Please select an avatar image");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("name", formData.name.trim());

      // Only append email if it's provided
      if (formData.email.trim()) {
        submitFormData.append("email", formData.email.trim());
      }

      if (selectedFile) {
        submitFormData.append("avatar", selectedFile);
      }

      const { createAuthor } = await import("@/actions/authors/create");
      const { updateAuthor } = await import("@/actions/authors/update");

      const result =
        isEditing && author
          ? await updateAuthor(author.id, submitFormData)
          : await createAuthor(submitFormData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          isEditing
            ? `${formData.name} has been updated successfully`
            : `${formData.name} has been added as an author`
        );
        router.push("/admin/authors");
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
              href="/admin/authors"
              className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                Back to Author Management
              </span>
            </Link>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {isEditing ? "Edit Author" : "Add Author"}
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
                {isEditing ? "Edit Author" : "Add Author"}
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              {isEditing
                ? "Update author information and avatar image."
                : "Add a new blog author with their basic information and avatar."}
            </p>
          </div>
        </AnimatedSection>

        {/* Form */}
        <AnimatedSection delay={100}>
          <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-orange-400" />
                {isEditing ? "Author Information" : "New Author Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Form Fields */}
                  <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                      <Label
                        htmlFor="name"
                        className="text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-orange-400" />
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter full name"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                        required
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <Label
                        htmlFor="email"
                        className="text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <Mail className="w-4 h-4 text-orange-400" />
                        Email Address{" "}
                        <span className="text-gray-500 text-sm">
                          (Optional)
                        </span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        placeholder="author@example.com (optional)"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Right Column - Avatar Upload */}
                  <div className="space-y-6">
                    <div>
                      <Label className="text-gray-300 mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-orange-400" />
                        Avatar Image
                      </Label>

                      {/* Avatar Preview */}
                      {imagePreview ? (
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <div className="relative w-full h-full overflow-hidden rounded-full border-2 border-orange-500/30">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill
                              className="object-cover"
                              sizes="128px"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handleImageRemove}
                            className="absolute -top-2 -right-2 w-8 h-8 p-0 bg-red-600 hover:bg-red-700 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-xs">No avatar</p>
                          </div>
                        </div>
                      )}

                      {/* File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageSelect(file);
                          }
                        }}
                        className="hidden"
                      />

                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {imagePreview ? "Change Avatar" : "Select Avatar"}
                      </Button>

                      <p className="text-sm text-gray-500 mt-2">
                        Recommended: Square image (1:1 ratio), max 5MB
                      </p>
                    </div>

                    {/* Preview Card */}
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <h4 className="text-gray-300 text-sm font-medium mb-3">
                        Author Preview:
                      </h4>
                      <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          {imagePreview ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-orange-500/30">
                              <Image
                                src={imagePreview}
                                alt="Preview"
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {formData.name
                                ? formData.name.charAt(0).toUpperCase()
                                : "A"}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white">
                              {formData.name || "Author Name"}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formData.email || "No email provided"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t border-gray-700">
                  <Link href="/admin/authors" className="flex-1">
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
                      ? "Update Author"
                      : "Add Author"}
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
