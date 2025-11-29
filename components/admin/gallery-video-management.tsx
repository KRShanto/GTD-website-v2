"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Video as VideoIcon,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  Play,
  GripVertical,
} from "lucide-react";
import { GalleryVideo } from "@prisma/client";
import {
  deleteGalleryVideo,
  deleteMultipleGalleryVideos,
} from "@/actions/gallery/videos/delete";
import { reorderGalleryVideos } from "@/actions/gallery/videos/update";
import { toast } from "sonner";
import AnimatedSection from "@/components/animated-section";
import Link from "next/link";
import Image from "next/image";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface GalleryVideoManagementProps {
  initialVideos: GalleryVideo[];
}

interface DraggableVideoCardProps {
  video: GalleryVideo;
  selected: boolean;
  onSelect: (videoId: string, checked: boolean) => void;
  deletingId: string | null;
  onDelete: (id: string, alt: string) => Promise<void>;
  showAltText: boolean;
  onEdit?: () => void;
}

function DraggableVideoCard({
  video,
  selected,
  onSelect,
  deletingId,
  onDelete,
  showAltText,
}: DraggableVideoCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: video.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.7 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      {/* Move drag handle to top right */}
      <div
        {...listeners}
        className="absolute right-2 top-2 z-10 cursor-grab text-gray-400 hover:text-orange-400"
      >
        <GripVertical className="w-5 h-5" />
      </div>
      <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group mb-4">
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Selection Checkbox */}
            <div className="flex items-center justify-between">
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) =>
                  onSelect(video.id, checked as boolean)
                }
                className="border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
            </div>

            {/* Video */}
            <div className="relative overflow-hidden rounded-lg border border-gray-700">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative w-full cursor-pointer group">
                    {video.thumbnailUrl ? (
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.alt}
                        width={300}
                        height={200}
                        className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <video
                        src={video.videoUrl}
                        className="w-full aspect-video object-cover transition-transform group-hover:scale-105"
                        muted
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          const videoEl = e.target as HTMLVideoElement;
                          videoEl.currentTime = 2;
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Play className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Gallery Video Preview
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <video
                        src={video.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="text-sm text-gray-300">
                      <strong>Alt Text:</strong> {video.alt}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Alt Text (if shown) */}
            {showAltText && (
              <div className="text-xs text-gray-400 line-clamp-2 min-h-[2.5rem]">
                {video.alt}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-1">
              <Link
                href={`/admin/gallery/videos/edit/${video.id}`}
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white text-xs"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-red-900/20 border-red-600 text-red-400 hover:bg-red-800/40 hover:border-red-500 hover:text-red-300 focus:bg-red-800/40 focus:border-red-500 focus:text-red-300"
                    disabled={deletingId === video.id}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Delete Video
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to delete this video? This action
                      cannot be undone and will also delete the video from
                      storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(video.id, video.alt)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deletingId === video.id ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GalleryVideoManagement({
  initialVideos,
}: GalleryVideoManagementProps) {
  const [videos, setVideos] = useState<GalleryVideo[]>(initialVideos);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [showAltText, setShowAltText] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingMultiple, setDeletingMultiple] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleSelect = (videoId: string, checked: boolean) => {
    const newSelection = new Set(selectedVideos);
    if (checked) {
      newSelection.add(videoId);
    } else {
      newSelection.delete(videoId);
    }
    setSelectedVideos(newSelection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVideos(new Set(videos.map((video) => video.id)));
    } else {
      setSelectedVideos(new Set());
    }
  };

  const handleDelete = async (id: string, alt: string) => {
    setDeletingId(id);
    try {
      const result = await deleteGalleryVideo(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Video deleted successfully");
        setVideos(videos.filter((video) => video.id !== id));
        setSelectedVideos((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      toast.error("Failed to delete video");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteMultiple = async () => {
    setDeletingMultiple(true);
    try {
      const result = await deleteMultipleGalleryVideos(
        Array.from(selectedVideos)
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `${Array.from(selectedVideos).length} videos deleted successfully`
        );
        setVideos(videos.filter((video) => !selectedVideos.has(video.id)));
        setSelectedVideos(new Set());
      }
    } catch (error) {
      toast.error("Failed to delete videos");
    } finally {
      setDeletingMultiple(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = videos.findIndex((vid) => vid.id === active.id);
    const newIndex = videos.findIndex((vid) => vid.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newVideos = arrayMove(videos, oldIndex, newIndex);
    setVideos(newVideos);
    // Persist new order to server action
    await reorderGalleryVideos(newVideos.map((v) => v.id));
    toast.success("Video order updated");
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
                Gallery Videos ({videos.length})
              </Badge>
              <Button
                onClick={() => setShowAltText(!showAltText)}
                variant="outline"
                className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {showAltText ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {showAltText ? "Hide" : "Show"} Alt Text
              </Button>
              <Link href="/admin/gallery/videos/add">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Videos
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
                Gallery Video Management
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your gallery videos, upload new ones, and edit alt text.
            </p>
          </div>
        </AnimatedSection>

        {/* Bulk Actions */}
        {selectedVideos.size > 0 && (
          <AnimatedSection>
            <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-white font-medium">
                      {selectedVideos.size} video
                      {selectedVideos.size > 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setSelectedVideos(new Set())}
                      variant="outline"
                      className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Selection
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="bg-red-900/20 border-red-600 text-red-400 hover:bg-red-800/40"
                          disabled={deletingMultiple}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {deletingMultiple ? "Deleting..." : "Delete Selected"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Delete Multiple Videos
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete{" "}
                            {selectedVideos.size} selected video
                            {selectedVideos.size > 1 ? "s" : ""}? This action
                            cannot be undone and will also delete the videos
                            from storage.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteMultiple}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {deletingMultiple ? "Deleting..." : "Delete All"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Videos Grid */}
        {videos.length === 0 ? (
          <AnimatedSection delay={100}>
            <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
              <CardContent className="p-12 text-center">
                <VideoIcon className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Gallery Videos Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Get started by uploading your first gallery videos.
                </p>
                <Link href="/admin/gallery/videos/add">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload First Videos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </AnimatedSection>
        ) : (
          <>
            {/* Select All Control */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedVideos.size === videos.length}
                  onCheckedChange={handleSelectAll}
                  className="border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <span className="text-gray-300 text-sm">
                  Select all ({videos.length} videos)
                </span>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={videos.map((vid) => vid.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {videos.map((video) => (
                    <DraggableVideoCard
                      key={video.id}
                      video={video}
                      selected={selectedVideos.has(video.id)}
                      onSelect={handleSelect}
                      deletingId={deletingId}
                      onDelete={handleDelete}
                      showAltText={showAltText}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>
    </div>
  );
}
