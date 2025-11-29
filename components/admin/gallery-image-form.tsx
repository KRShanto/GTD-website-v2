"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, Upload, Image as ImageIcon, X } from "lucide-react";
import { createGalleryImage } from "@/actions/gallery/images/create";
import { updateGalleryImage } from "@/actions/gallery/images/update";
import { GalleryImage } from "@/lib/generated/prisma/client";
import { toast } from "sonner";
import AnimatedSection from "@/components/animated-section";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MultipleImageUpload from "@/components/admin/multiple-image-upload";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

interface GalleryImageFormProps {
  image?: GalleryImage;
  isEditing?: boolean;
  onSuccess?: () => void;
}

export default function GalleryImageForm({
  image,
  isEditing = false,
  onSuccess,
}: GalleryImageFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast: useToastToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    alt: image?.alt || "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    image?.imageUrl || null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("single");
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
    setImagePreview(image?.imageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);

    try {
      if (!isEditing && !selectedFile) {
        useToastToast({
          title: "Error",
          description: "Please select an image to upload",
          variant: "destructive",
        });
        return;
      }

      // For update, only include changed fields
      if (isEditing && image) {
        if (!selectedFile) {
          // No new image selected, just update alt text
          const updateFormData = new FormData();
          updateFormData.append("alt", formData.alt);
          const result = await updateGalleryImage(image.id, updateFormData);
          if (result.error) {
            useToastToast({
              title: "Error",
              description: result.error,
              variant: "destructive",
            });
            return;
          }
        } else {
          // New image selected - send file + alt to server action (Sevalla upload + Prisma update)
          const updateFormData = new FormData();
          updateFormData.append("image", selectedFile);
          updateFormData.append("alt", formData.alt);
          const result = await updateGalleryImage(image.id, updateFormData);
          if (result.error) {
            useToastToast({
              title: "Error",
              description: result.error,
              variant: "destructive",
            });
            return;
          }
        }
      } else {
        // For create - send file + alt directly to server action (Sevalla upload + Prisma create)
        const fd = new FormData();
        fd.append("image", selectedFile!);
        fd.append("alt", formData.alt);
        const result = await createGalleryImage(fd);
        if (result.error) {
          useToastToast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
          return;
        }
      }

      useToastToast({
        title: "Success",
        description: isEditing
          ? "Image has been updated successfully"
          : "Image has been uploaded successfully",
      });

      if (onSuccess) {
        onSuccess();
      }

      router.push("/admin/gallery/images");
    } catch (error) {
      console.error("Form submission error:", error);
      useToastToast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
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
              href="/admin/gallery/images"
              className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                Back to Gallery Management
              </span>
            </Link>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {isEditing ? "Edit Image" : "Add Images"}
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
                {isEditing ? "Edit Gallery Image" : "Add Gallery Images"}
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              {isEditing
                ? "Update the alt text for this gallery image."
                : "Upload new images to your gallery with proper alt text for accessibility."}
            </p>
          </div>
        </AnimatedSection>

        {/* Upload Mode Selection */}
        {!isEditing && (
          <AnimatedSection delay={100}>
            <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 mb-8">
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-600">
                    <TabsTrigger
                      value="single"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                    >
                      Single Image
                    </TabsTrigger>
                    <TabsTrigger
                      value="multiple"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                    >
                      Multiple Images
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="single" className="mt-6">
                    <div className="text-center text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-orange-400" />
                      <p>Upload a single image with custom alt text</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="multiple" className="mt-6">
                    <div className="text-center text-gray-400">
                      <Upload className="w-12 h-12 mx-auto mb-2 text-orange-400" />
                      <p>
                        Upload multiple images at once with drag & drop support
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Form Content */}
        <AnimatedSection delay={isEditing ? 100 : 200}>
          {!isEditing && activeTab === "multiple" ? (
            <MultipleImageUpload />
          ) : (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ImageIcon className="w-5 h-5 text-orange-400" />
                  {isEditing ? "Image Information" : "Single Image Upload"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="max-w-2xl mx-auto space-y-6">
                    {/* Image Input */}
                    {!isEditing && (
                      <div>
                        <Label className="text-gray-300 mb-2 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-orange-400" />
                          Image <span className="text-red-400">*</span>
                        </Label>

                        <input
                          ref={fileInputRef}
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
                          required={!isEditing}
                        />

                        <Button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="w-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {selectedFile ? "Change Image" : "Select Image"}
                        </Button>

                        <p className="text-sm text-gray-500 mt-2">
                          Supported: JPEG, PNG, WebP (max 10MB)
                        </p>
                      </div>
                    )}

                    {/* Image Preview */}
                    {imagePreview && (
                      <div>
                        <Label className="text-gray-300 mb-2 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-orange-400" />
                          Image Preview
                        </Label>
                        <div className="relative bg-gray-800 border border-gray-600 rounded-lg p-4">
                          <div className="relative w-full max-w-md mx-auto">
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              width={300}
                              height={200}
                              className="w-full h-auto rounded-lg object-cover"
                              unoptimized={selectedFile ? true : false}
                            />
                            {!isEditing && selectedFile && (
                              <Button
                                type="button"
                                onClick={handleImageRemove}
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 w-8 h-8 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Alt Text Field */}
                    <div>
                      <Label
                        htmlFor="alt"
                        className="text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4 text-orange-400" />
                        Alt Text
                      </Label>
                      <Input
                        id="alt"
                        name="alt"
                        type="text"
                        value={formData.alt}
                        onChange={(e) =>
                          handleInputChange("alt", e.target.value)
                        }
                        placeholder="Describe the image for accessibility (optional)"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Current length: {formData.alt.length}/200 characters
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Providing a clear, descriptive text helps with
                        accessibility and SEO, but is optional.
                      </p>
                    </div>
                  </div>

                  {/* Upload Progress */}
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-2">
                      <Label>Upload Progress</Label>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6 border-t border-gray-700">
                    <Link href="/admin/gallery/images" className="flex-1">
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
                      {loading
                        ? "Processing..."
                        : isSubmitting
                        ? isEditing
                          ? "Updating..."
                          : "Uploading..."
                        : isEditing
                        ? "Update Image"
                        : "Upload Image"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </AnimatedSection>
      </div>
    </div>
  );
}
