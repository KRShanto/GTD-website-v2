"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Upload,
  Video,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { createGalleryVideo } from "@/actions/gallery/videos/create";
import { updateGalleryVideo } from "@/actions/gallery/videos/update";
import { GalleryVideo } from "@/lib/types";
import { toast } from "sonner";
import AnimatedSection from "@/components/animated-section";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MultipleVideoUpload from "@/components/admin/multiple-video-upload";
import { useToast } from "@/components/ui/use-toast";
import {
  uploadVideoToFirebase,
  uploadImageToFirebase,
} from "@/lib/firebase/storage";
import { FIREBASE_FOLDERS } from "@/lib/firebase/storage";

interface GalleryVideoFormProps {
  video?: GalleryVideo;
  isEditing?: boolean;
  id?: number;
  initialData?: {
    video_url: string;
    thumbnail_url: string;
    alt: string;
  };
  onSuccess?: () => void;
}

export default function GalleryVideoForm({
  video,
  isEditing = false,
  id,
  initialData,
  onSuccess,
}: GalleryVideoFormProps) {
  const router = useRouter();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    alt: initialData?.alt || video?.alt || "",
  });
  const [videoPreview, setVideoPreview] = useState<string | null>(
    initialData?.video_url || video?.video_url || null
  );
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    initialData?.thumbnail_url || video?.thumbnail_url || null
  );
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("single");
  const [uploadProgress, setUploadProgress] = useState({
    video: 0,
    thumbnail: 0,
    stage: "" as "idle" | "uploading-video" | "uploading-thumbnail" | "saving",
  });
  const { toast: useToastToast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleVideoSelect = (file: File) => {
    setSelectedVideo(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setVideoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailSelect = (file: File) => {
    setSelectedThumbnail(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoRemove = () => {
    setSelectedVideo(null);
    setVideoPreview(video?.video_url || null);
    setUploadProgress({ video: 0, thumbnail: 0, stage: "idle" });
    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleThumbnailRemove = () => {
    setSelectedThumbnail(null);
    setThumbnailPreview(video?.thumbnail_url || null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress({ video: 0, thumbnail: 0, stage: "idle" });

    try {
      if (!id && !selectedVideo) {
        useToastToast({
          title: "Error",
          description: "Please select a video to upload",
          variant: "destructive",
        });
        return;
      }

      // Create FormData
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("alt", formData.alt);

      // Add video file if selected
      if (selectedVideo) {
        formDataToSubmit.append("video", selectedVideo);
      }

      // Add thumbnail file if selected
      if (selectedThumbnail) {
        formDataToSubmit.append("thumbnail", selectedThumbnail);
      }

      // For update, send FormData directly
      if (id) {
        console.log("Updating video with ID:", id);
        console.log(
          "Form data:",
          Object.fromEntries(formDataToSubmit.entries())
        );

        const result = await updateGalleryVideo(id, formDataToSubmit);
        console.log("Update result:", result);

        if (result.error) {
          useToastToast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
          return;
        }
      } else {
        // For create, upload files first then send URLs
        let videoUrl = "";
        if (selectedVideo) {
          setUploadProgress((prev) => ({ ...prev, stage: "uploading-video" }));
          const videoUploadResult = await uploadVideoToFirebase(
            selectedVideo,
            selectedVideo.name,
            `${FIREBASE_FOLDERS.GALLERY_VIDEOS}`,
            {
              onProgress: (progress) => {
                setUploadProgress((prev) => ({ ...prev, video: progress }));
              },
              onError: (error) => {
                console.error("Video upload error:", error);
                useToastToast({
                  title: "Error",
                  description: "Failed to upload video. Please try again.",
                  variant: "destructive",
                });
              },
            }
          );

          if (!videoUploadResult.success || !videoUploadResult.url) {
            useToastToast({
              title: "Error",
              description: "Failed to upload video. Please try again.",
              variant: "destructive",
            });
            return;
          }

          videoUrl = videoUploadResult.url;
        }

        // Upload thumbnail if selected
        let thumbnailUrl = "";
        if (selectedThumbnail) {
          setUploadProgress((prev) => ({
            ...prev,
            stage: "uploading-thumbnail",
          }));
          const thumbnailUploadResult = await uploadImageToFirebase(
            selectedThumbnail,
            selectedThumbnail.name,
            `${FIREBASE_FOLDERS.GALLERY_THUMBNAILS}`,
            {
              onProgress: (progress) => {
                setUploadProgress((prev) => ({ ...prev, thumbnail: progress }));
              },
              onError: (error) => {
                console.error("Thumbnail upload error:", error);
              },
            }
          );

          if (!thumbnailUploadResult.success || !thumbnailUploadResult.url) {
            useToastToast({
              title: "Error",
              description:
                "Failed to upload thumbnail. Video will be saved without a thumbnail.",
              variant: "destructive",
            });
          } else {
            thumbnailUrl = thumbnailUploadResult.url;
          }
        }

        setUploadProgress((prev) => ({ ...prev, stage: "saving" }));

        // Create new video
        const result = await createGalleryVideo({
          videoUrl: videoUrl,
          thumbnailUrl: thumbnailUrl,
          alt: formData.alt,
        });

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
        description: id
          ? "Video updated successfully"
          : "Video uploaded successfully",
      });

      router.push("/admin/gallery/videos");
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      useToastToast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress({ video: 0, thumbnail: 0, stage: "idle" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/gallery/videos"
              className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                Back to Video Gallery Management
              </span>
            </Link>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {isEditing ? "Edit Video" : "Add Videos"}
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
                {isEditing ? "Edit Gallery Video" : "Add Gallery Videos"}
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              {isEditing
                ? "Update the alt text or thumbnail for this gallery video."
                : "Upload new videos to your gallery with optional thumbnails and alt text for accessibility."}
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
                      Single Video
                    </TabsTrigger>
                    <TabsTrigger
                      value="multiple"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                    >
                      Multiple Videos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="single" className="mt-6">
                    <div className="text-center text-gray-400">
                      <Video className="w-12 h-12 mx-auto mb-2 text-orange-400" />
                      <p>
                        Upload a single video with optional thumbnail and alt
                        text
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="multiple" className="mt-6">
                    <div className="text-center text-gray-400">
                      <Upload className="w-12 h-12 mx-auto mb-2 text-orange-400" />
                      <p>
                        Upload multiple videos at once with drag & drop support
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
            <MultipleVideoUpload />
          ) : (
            <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Video className="w-5 h-5 text-orange-400" />
                  {isEditing ? "Video Information" : "Single Video Upload"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="max-w-2xl mx-auto space-y-6">
                    {/* Video Input */}
                    {!isEditing && (
                      <div>
                        <Label className="text-gray-300 mb-2 flex items-center gap-2">
                          <Video className="w-4 h-4 text-orange-400" />
                          Video <span className="text-red-400">*</span>
                        </Label>

                        <input
                          ref={videoInputRef}
                          name="video"
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleVideoSelect(file);
                            }
                          }}
                          className="hidden"
                          required={!isEditing && !id}
                        />

                        <Button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          variant="outline"
                          className="w-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {selectedVideo ? "Change Video" : "Select Video"}
                        </Button>

                        <p className="text-sm text-gray-500 mt-2">
                          Supported: All video formats
                        </p>
                      </div>
                    )}

                    {/* Video Preview */}
                    {videoPreview && (
                      <div>
                        <Label className="text-gray-300 mb-2 flex items-center gap-2">
                          <Video className="w-4 h-4 text-orange-400" />
                          Video Preview
                        </Label>
                        <div className="relative bg-gray-800 border border-gray-600 rounded-lg p-4">
                          <div className="relative w-full max-w-md mx-auto">
                            <video
                              src={videoPreview}
                              controls
                              className="w-full h-auto rounded-lg"
                              preload="metadata"
                            />
                            {!isEditing && selectedVideo && (
                              <Button
                                type="button"
                                onClick={handleVideoRemove}
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2 w-8 h-8 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          {/* Video File Info */}
                          {selectedVideo && (
                            <div className="mt-3 text-sm text-gray-400">
                              <p className="font-medium">
                                {selectedVideo.name}
                              </p>
                              <p>
                                Size:{" "}
                                {(selectedVideo.size / (1024 * 1024)).toFixed(
                                  2
                                )}{" "}
                                MB
                              </p>
                            </div>
                          )}

                          {/* Upload Progress */}
                          {uploadProgress.stage !== "idle" && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">
                                  {uploadProgress.stage === "uploading-video"
                                    ? "Uploading video..."
                                    : uploadProgress.stage ===
                                      "uploading-thumbnail"
                                    ? "Uploading thumbnail..."
                                    : ""}
                                </span>
                                {uploadProgress.stage === "uploading-video" && (
                                  <span className="text-orange-400">
                                    {uploadProgress.video}%
                                  </span>
                                )}
                                {uploadProgress.stage ===
                                  "uploading-thumbnail" && (
                                  <span className="text-orange-400">
                                    {uploadProgress.thumbnail}%
                                  </span>
                                )}
                              </div>
                              {uploadProgress.stage === "uploading-video" && (
                                <Progress
                                  value={uploadProgress.video}
                                  className="h-2 bg-gray-700"
                                />
                              )}
                              {uploadProgress.stage ===
                                "uploading-thumbnail" && (
                                <Progress
                                  value={uploadProgress.thumbnail}
                                  className="h-2 bg-gray-700"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Thumbnail Input */}
                    <div>
                      <Label className="text-gray-300 mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-orange-400" />
                        Thumbnail (Optional)
                      </Label>

                      <input
                        ref={thumbnailInputRef}
                        name="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleThumbnailSelect(file);
                          }
                        }}
                        className="hidden"
                      />

                      <Button
                        type="button"
                        onClick={() => thumbnailInputRef.current?.click()}
                        variant="outline"
                        className="w-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {selectedThumbnail
                          ? "Change Thumbnail"
                          : "Select Thumbnail"}
                      </Button>

                      <p className="text-sm text-gray-500 mt-2">
                        Supported: All image formats
                      </p>
                    </div>

                    {/* Thumbnail Preview */}
                    {(thumbnailPreview || videoPreview) && (
                      <div>
                        <Label className="text-gray-300 mb-2 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-orange-400" />
                          Thumbnail Preview
                        </Label>
                        <div className="relative bg-gray-800 border border-gray-600 rounded-lg p-4">
                          <div className="relative w-full max-w-md mx-auto">
                            {thumbnailPreview ? (
                              <>
                                <Image
                                  src={thumbnailPreview}
                                  alt="Thumbnail Preview"
                                  width={300}
                                  height={200}
                                  className="w-full h-auto rounded-lg object-cover"
                                  unoptimized={selectedThumbnail ? true : false}
                                />
                                {(selectedThumbnail ||
                                  (isEditing && video?.thumbnail_url)) && (
                                  <Button
                                    type="button"
                                    onClick={handleThumbnailRemove}
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2 w-8 h-8 p-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </>
                            ) : videoPreview ? (
                              <video
                                src={videoPreview}
                                className="w-full h-auto rounded-lg object-cover"
                                muted
                                preload="metadata"
                                onLoadedMetadata={(e) => {
                                  const video = e.target as HTMLVideoElement;
                                  video.currentTime = 2;
                                }}
                              />
                            ) : null}
                          </div>
                          {!thumbnailPreview && videoPreview && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Using video frame as thumbnail (no custom
                              thumbnail uploaded)
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Alt Text Field */}
                    <div>
                      <Label
                        htmlFor="alt"
                        className="text-gray-300 mb-2 flex items-center gap-2"
                      >
                        <Video className="w-4 h-4 text-orange-400" />
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
                        placeholder="Describe the video for accessibility"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Current length: {formData.alt.length}/200 characters
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Providing a clear, descriptive text helps with
                        accessibility and SEO.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-4 pt-6 border-t border-gray-700">
                    <Link href="/admin/gallery/videos" className="flex-1">
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
                          : "Uploading..."
                        : isEditing
                        ? "Update Video"
                        : "Upload Video"}
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
