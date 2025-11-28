"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  Save,
  User,
  Briefcase,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { createTeamMember } from "@/actions/team/create";
import { updateTeamMember } from "@/actions/team/update";
import { TeamMember } from "@/lib/types";
import { toast } from "sonner";
import AnimatedSection from "@/components/animated-section";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

interface TeamMemberFormProps {
  id?: string; // Changed from number to string (UUID)
  initialData?: {
    name: string;
    title: string;
    bio: string;
    image_url: string; // Keep snake_case for form compatibility
  };
  onSuccess?: () => void;
}

export default function TeamMemberForm({
  id,
  initialData,
  onSuccess,
}: TeamMemberFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast: useToastToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    title: initialData?.title || "",
    bio: initialData?.bio || "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image_url || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    setImagePreview(initialData?.image_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      useToastToast({
        title: "Error",
        description: "Please enter the full name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      useToastToast({
        title: "Error",
        description: "Please enter the job title",
        variant: "destructive",
      });
      return;
    }

    if (!formData.bio.trim()) {
      useToastToast({
        title: "Error",
        description: "Please enter the biography",
        variant: "destructive",
      });
      return;
    }

    if (!id && !selectedFile) {
      useToastToast({
        title: "Error",
        description: "Please select a profile image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Create a new FormData instance instead of using the form's FormData
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("title", formData.title);
      formDataToSubmit.append("bio", formData.bio);

      // Only append image if a new file is selected
      if (selectedFile) {
        formDataToSubmit.append("image", selectedFile);
      }

      const result = id
        ? await updateTeamMember(id, formDataToSubmit)
        : await createTeamMember(formDataToSubmit);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        id ? "Member updated successfully" : "Member created successfully"
      );
      router.push("/admin/team");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/team"
              className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                Back to Team Management
              </span>
            </Link>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {id ? "Edit Team Member" : "Add Team Member"}
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
                {id ? "Edit Team Member" : "Add Team Member"}
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              {id
                ? "Update team member information and profile image."
                : "Add a new team member with their profile information and image."}
            </p>
          </div>
        </AnimatedSection>

        {/* Form */}
        <AnimatedSection delay={100}>
          <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-orange-400" />
                {id ? "Member Information" : "New Member Information"}
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
                        Full Name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        placeholder="Enter full name"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Role Field */}
                    <div>
                      <Label
                        htmlFor="title"
                        className="text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4 text-orange-400" />
                        Job Title <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        placeholder="e.g., Founder & Producer"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                        required
                        disabled={loading}
                      />
                    </div>

                    {/* Bio Field */}
                    <div>
                      <Label
                        htmlFor="bio"
                        className="text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4 text-orange-400" />
                        Biography <span className="text-red-400">*</span>
                      </Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        placeholder="Enter a detailed biography"
                        rows={8}
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 resize-none"
                        required
                        disabled={loading}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Current length: {formData.bio.length} characters
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Image Upload */}
                  <div className="space-y-6">
                    <div>
                      <Label className="text-gray-300 mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-orange-400" />
                        Profile Image{" "}
                        {!id && <span className="text-red-400">*</span>}
                      </Label>

                      {/* Image Preview */}
                      {imagePreview ? (
                        <div className="relative w-full aspect-square max-w-sm mx-auto mb-4">
                          <div className="relative w-full h-full overflow-hidden rounded-lg border-2 border-orange-500/30">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill
                              className="object-cover"
                              sizes="400px"
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
                        <div className="w-full aspect-square max-w-sm mx-auto mb-4 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">No image selected</p>
                          </div>
                        </div>
                      )}

                      {/* File Input */}
                      <input
                        ref={fileInputRef}
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageSelect(file);
                          }
                        }}
                        className="hidden"
                        disabled={loading}
                        required={!id}
                      />

                      <Button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {imagePreview ? "Change Image" : "Select Image"}
                      </Button>

                      <p className="text-sm text-gray-500 mt-2">
                        Recommended: Square image (1:1 ratio), max 5MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t border-gray-700">
                  <Link href="/admin/team" className="flex-1">
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
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading
                      ? "Processing..."
                      : id
                      ? "Update Member"
                      : "Add Member"}
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
