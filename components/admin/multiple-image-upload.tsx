"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMultipleGalleryImages } from "@/actions/gallery/images/create";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { uploadGalleryImage } from "@/lib/supabase/storage";
import { useRouter } from "next/navigation";

interface ImageWithPreview extends File {
  preview: string;
  alt: string;
}

export default function MultipleImageUpload() {
  const { toast } = useToast();
  const router = useRouter();
  const [images, setImages] = useState<ImageWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImages((prevImages) => [
      ...prevImages,
      ...acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          alt: "",
        })
      ),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleAltChange = (index: number, value: string) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      newImages[index] = {
        ...newImages[index],
        alt: value,
      };
      return newImages;
    });
  };

  const removeImage = (index: number) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one image",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploadProgress(
      images.reduce(
        (acc, _, index) => ({
          ...acc,
          [index]: 0,
        }),
        {}
      )
    );

    try {
      // Upload all images to Supabase
      const uploadedImages = await Promise.all(
        images.map(async (image, index) => {
          // Upload image
          const imageUploadResult = await uploadGalleryImage(
            image,
            image.name,
            {
              onProgress: (progress) => {
                setUploadProgress((prev) => ({
                  ...prev,
                  [index]: progress,
                }));
              },
              onError: (error) => {
                toast({
                  title: `Error uploading image ${image.name}`,
                  description: error,
                  variant: "destructive",
                });
              },
            }
          );

          if (!imageUploadResult.success || !imageUploadResult.url) {
            throw new Error(`Failed to upload image: ${image.name}`);
          }

          return {
            imageUrl: imageUploadResult.url,
            alt: image.alt,
          };
        })
      );

      const result = await createMultipleGalleryImages(uploadedImages);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `Successfully uploaded ${images.length} images`,
      });

      // Clean up previews and reset state
      images.forEach((image) => {
        URL.revokeObjectURL(image.preview);
      });
      setImages([]);
      router.push("/admin/gallery/images");
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setUploadProgress({});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div
        {...getRootProps()}
        className={`bg-gray-800 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-orange-500 bg-orange-500/10"
            : "border-gray-600 hover:border-orange-500/50 hover:bg-orange-500/5"
        }`}
      >
        <input {...getInputProps()} />
        <Upload
          className={`w-12 h-12 mx-auto mb-4 ${
            isDragActive ? "text-orange-400" : "text-gray-400"
          }`}
        />
        <h3 className="text-lg font-medium text-white mb-2">
          {isDragActive ? "Drop the images here" : "Drag & drop images here"}
        </h3>
        <p className="text-sm text-gray-400">
          or click to select files from your computer
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Supported formats: PNG, JPG, JPEG, WebP (max 10MB)
        </p>
      </div>

      {images.length > 0 && (
        <div className="space-y-6">
          {images.map((image, index) => (
            <Card
              key={image.name}
              className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20"
            >
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-orange-400" />
                    <h3 className="font-medium text-white">
                      Image {index + 1}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImage(index)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image Preview */}
                  <div className="space-y-4">
                    <Label className="text-gray-300 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-orange-400" />
                      Image Preview
                    </Label>
                    <div className="relative bg-gray-800 border border-gray-600 rounded-lg p-4">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full h-auto rounded-lg"
                      />
                      <div className="mt-3 text-sm text-gray-400">
                        <p className="font-medium">{image.name}</p>
                        <p>
                          Size: {(image.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alt Text Input */}
                  <div className="space-y-4">
                    <Label className="text-gray-300">Alt Text</Label>
                    <Input
                      type="text"
                      placeholder="Enter alt text for accessibility"
                      value={image.alt}
                      onChange={(e) => handleAltChange(index, e.target.value)}
                      className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                    />
                    <p className="text-xs text-gray-500">
                      Describe the image for screen readers and SEO
                    </p>
                  </div>
                </div>

                {/* Upload Progress */}
                {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">Upload Progress</Label>
                    <Progress
                      value={uploadProgress[index]}
                      className="w-full"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || images.length === 0}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading
          ? "Uploading..."
          : `Upload ${images.length} ${
              images.length === 1 ? "Image" : "Images"
            }`}
      </Button>
    </form>
  );
}
