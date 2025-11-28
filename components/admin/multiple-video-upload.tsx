"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createMultipleGalleryVideos } from "@/actions/gallery/videos/create";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Video, Image as ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  uploadVideoToFirebase,
  uploadImageToFirebase,
  FIREBASE_FOLDERS,
} from "@/lib/firebase/storage";
import { useRouter } from "next/navigation";

interface VideoWithPreview extends File {
  preview: string;
  alt: string;
  thumbnailFile?: File;
  thumbnailPreview?: string;
}

export default function MultipleVideoUpload() {
  const { toast } = useToast();
  const router = useRouter();
  const [videos, setVideos] = useState<VideoWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: { video: number; thumbnail: number };
  }>({});

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setVideos((prevVideos) => [
      ...prevVideos,
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
      "video/*": [],
    },
  });

  const handleThumbnailChange = (index: number, file: File) => {
    setVideos((prevVideos) => {
      const newVideos = [...prevVideos];
      if (newVideos[index].thumbnailPreview) {
        URL.revokeObjectURL(newVideos[index].thumbnailPreview!);
      }
      newVideos[index] = {
        ...newVideos[index],
        thumbnailFile: file,
        thumbnailPreview: URL.createObjectURL(file),
      };
      return newVideos;
    });
  };

  const handleAltChange = (index: number, value: string) => {
    setVideos((prevVideos) => {
      const newVideos = [...prevVideos];
      newVideos[index] = {
        ...newVideos[index],
        alt: value,
      };
      return newVideos;
    });
  };

  const removeVideo = (index: number) => {
    setVideos((prevVideos) => {
      const newVideos = [...prevVideos];
      URL.revokeObjectURL(newVideos[index].preview);
      if (newVideos[index].thumbnailPreview) {
        URL.revokeObjectURL(newVideos[index].thumbnailPreview!);
      }
      newVideos.splice(index, 1);
      return newVideos;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (videos.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one video",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setUploadProgress(
      videos.reduce(
        (acc, _, index) => ({
          ...acc,
          [index]: { video: 0, thumbnail: 0 },
        }),
        {}
      )
    );

    try {
      // Upload all videos and thumbnails to Firebase
      const uploadedVideos = await Promise.all(
        videos.map(async (video, index) => {
          // Upload video
          const videoUploadResult = await uploadVideoToFirebase(
            video,
            video.name,
            `${FIREBASE_FOLDERS.GALLERY_VIDEOS}`,
            {
              onProgress: (progress) => {
                setUploadProgress((prev) => ({
                  ...prev,
                  [index]: {
                    ...prev[index],
                    video: progress,
                  },
                }));
              },
              onError: (error) => {
                toast({
                  title: `Error uploading video ${video.name}`,
                  description: error,
                  variant: "destructive",
                });
              },
            }
          );

          if (!videoUploadResult.success || !videoUploadResult.url) {
            throw new Error(`Failed to upload video: ${video.name}`);
          }

          // Upload thumbnail if present
          let thumbnailUrl = "";
          if (video.thumbnailFile) {
            const thumbnailUploadResult = await uploadImageToFirebase(
              video.thumbnailFile,
              video.thumbnailFile.name,
              `${FIREBASE_FOLDERS.GALLERY_THUMBNAILS}`,
              {
                onProgress: (progress) => {
                  setUploadProgress((prev) => ({
                    ...prev,
                    [index]: {
                      ...prev[index],
                      thumbnail: progress,
                    },
                  }));
                },
                onError: (error) => {
                  toast({
                    title: `Error uploading thumbnail for ${video.name}`,
                    description: error,
                    variant: "destructive",
                  });
                },
              }
            );
            if (thumbnailUploadResult.success && thumbnailUploadResult.url) {
              thumbnailUrl = thumbnailUploadResult.url;
            }
          }

          return {
            videoUrl: videoUploadResult.url,
            alt: video.alt,
            thumbnailUrl: thumbnailUrl || undefined,
          };
        })
      );

      const result = await createMultipleGalleryVideos(uploadedVideos);

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
        description: `Successfully uploaded ${videos.length} videos`,
      });

      // Clean up previews and reset state
      videos.forEach((video) => {
        URL.revokeObjectURL(video.preview);
        if (video.thumbnailPreview) {
          URL.revokeObjectURL(video.thumbnailPreview);
        }
      });
      setVideos([]);
      router.push("/admin/gallery/videos");
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to upload videos. Please try again.",
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
          {isDragActive ? "Drop the videos here" : "Drag & drop videos here"}
        </h3>
        <p className="text-sm text-gray-400">
          or click to select files from your computer
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Supported formats: All video formats
        </p>
      </div>

      {videos.length > 0 && (
        <div className="space-y-6">
          {videos.map((video, index) => (
            <Card
              key={video.name}
              className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20"
            >
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-orange-400" />
                    <h3 className="font-medium text-white">
                      Video {index + 1}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeVideo(index)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Video Preview */}
                  <div className="space-y-4">
                    <Label className="text-gray-300 flex items-center gap-2">
                      <Video className="w-4 h-4 text-orange-400" />
                      Video Preview
                    </Label>
                    <div className="relative bg-gray-800 border border-gray-600 rounded-lg p-4">
                      <video
                        src={video.preview}
                        controls
                        className="w-full h-auto rounded-lg"
                        preload="metadata"
                      />
                      <div className="mt-3 text-sm text-gray-400">
                        <p className="font-medium">{video.name}</p>
                        <p>
                          Size: {(video.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      {uploadProgress[index]?.video > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">
                              Uploading video...
                            </span>
                            <span className="text-orange-400">
                              {uploadProgress[index].video}%
                            </span>
                          </div>
                          <Progress
                            value={uploadProgress[index].video}
                            className="h-2 bg-gray-700"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Alt Text */}
                    <div>
                      <Label
                        htmlFor={`alt-${index}`}
                        className="text-gray-300 flex items-center gap-2"
                      >
                        <Video className="w-4 h-4 text-orange-400" />
                        Alt Text
                      </Label>
                      <Input
                        id={`alt-${index}`}
                        value={video.alt}
                        onChange={(e) => handleAltChange(index, e.target.value)}
                        placeholder="Describe the video for accessibility"
                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500"
                        disabled={loading}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Current length: {video.alt.length}/200 characters
                      </p>
                    </div>

                    {/* Thumbnail */}
                    <div>
                      <Label className="text-gray-300 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-orange-400" />
                        Thumbnail (Optional)
                      </Label>
                      <div className="mt-2">
                        <input
                          id={`thumbnail-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleThumbnailChange(index, file);
                            }
                          }}
                          className="hidden"
                          disabled={loading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                          onClick={() =>
                            document
                              .getElementById(`thumbnail-${index}`)
                              ?.click()
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {video.thumbnailFile
                            ? "Change Thumbnail"
                            : "Select Thumbnail"}
                        </Button>
                      </div>
                      {video.thumbnailPreview && (
                        <div className="mt-4 relative bg-gray-800 border border-gray-600 rounded-lg p-4">
                          <div className="relative">
                            <img
                              src={video.thumbnailPreview}
                              alt="Thumbnail preview"
                              className="w-full h-auto rounded-lg"
                            />
                            {video.thumbnailFile && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => {
                                  setVideos((prevVideos) => {
                                    const newVideos = [...prevVideos];
                                    if (newVideos[index].thumbnailPreview) {
                                      URL.revokeObjectURL(
                                        newVideos[index].thumbnailPreview!
                                      );
                                    }
                                    newVideos[index] = {
                                      ...newVideos[index],
                                      thumbnailFile: undefined,
                                      thumbnailPreview: undefined,
                                    };
                                    return newVideos;
                                  });
                                }}
                                className="absolute top-2 right-2 h-8 w-8"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          {uploadProgress[index]?.thumbnail > 0 && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-300">
                                  Uploading thumbnail...
                                </span>
                                <span className="text-orange-400">
                                  {uploadProgress[index].thumbnail}%
                                </span>
                              </div>
                              <Progress
                                value={uploadProgress[index].thumbnail}
                                className="h-2 bg-gray-700"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex gap-4 pt-6 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              className="flex-1 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
              onClick={() => setVideos([])}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              {loading ? "Uploading..." : "Upload Videos"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
