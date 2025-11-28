"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Upload,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  GripVertical,
} from "lucide-react";
import { GalleryImage } from "@/lib/types";
import {
  deleteGalleryImage,
  deleteMultipleGalleryImages,
} from "@/actions/gallery/images/delete";
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
import Masonry from "react-masonry-css";
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
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateMultipleGalleryImages } from "@/actions/gallery/images/update";
import { redis } from "@/lib/redis";
import { reorderGalleryImages } from "@/actions/gallery/images/update";

interface GalleryImageManagementProps {
  initialImages: GalleryImage[];
  error: string | null;
}

// Add type for DraggableImageCard props
interface DraggableImageCardProps {
  image: GalleryImage;
  index: number;
  selected: boolean;
  onSelect: (imageId: number, checked: boolean) => void;
  deletingId: number | null;
  onDelete: (id: number, alt: string) => Promise<void>;
  showAltText: boolean;
  onEdit?: () => void;
}

function DraggableImageCard({
  image,
  index,
  selected,
  onSelect,
  deletingId,
  onDelete,
  showAltText,
}: DraggableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });
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
                  onSelect(image.id, checked as boolean)
                }
                className="border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
            </div>
            {/* Image */}
            <div className="relative overflow-hidden rounded-lg border border-gray-700">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative w-full cursor-pointer group">
                    <Image
                      src={image.image_url}
                      alt={image.alt}
                      width={300}
                      height={200}
                      className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Gallery Image Preview
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="relative aspect-video overflow-hidden rounded-lg">
                      <Image
                        src={image.image_url}
                        alt={image.alt}
                        fill
                        className="object-contain"
                        sizes="90vw"
                      />
                    </div>
                    <div className="text-sm text-gray-300">
                      <strong>Alt Text:</strong> {image.alt}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* Alt Text (if shown) */}
            {showAltText && (
              <div className="text-xs text-gray-400 line-clamp-2 min-h-[2.5rem]">
                {image.alt}
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex gap-1">
              <Link
                href={`/admin/gallery/images/edit/${image.id}`}
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
                    disabled={deletingId === image.id}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">
                      Delete Image
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to delete this image? This action
                      cannot be undone and will also delete the image from
                      storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(image.id, image.alt)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deletingId === image.id ? "Deleting..." : "Delete"}
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

export default function GalleryImageManagement({
  initialImages,
  error,
}: GalleryImageManagementProps) {
  const [images, setImages] = useState(initialImages);
  const [selectedImages, setSelectedImages] = useState<Set<number>>(new Set());
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingMultiple, setDeletingMultiple] = useState(false);
  const [showAltText, setShowAltText] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  const handleSelect = (imageId: number, checked: boolean) => {
    const newSelected = new Set(selectedImages);
    if (checked) {
      newSelected.add(imageId);
    } else {
      newSelected.delete(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedImages(new Set(images.map((img) => img.id)));
    } else {
      setSelectedImages(new Set());
    }
  };

  const handleDelete = async (id: number, alt: string) => {
    setDeletingId(id);
    try {
      const result = await deleteGalleryImage(id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Image "${alt}" has been deleted`);
        setImages((prev) => prev.filter((image) => image.id !== id));
        // Remove from Redis order list
        await redis.lrem("gallery:images:order", 0, id);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteMultiple = async () => {
    const idsToDelete = Array.from(selectedImages);
    setDeletingMultiple(true);

    try {
      const result = await deleteMultipleGalleryImages(idsToDelete);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${idsToDelete.length} images have been deleted`);
        setImages((prev) =>
          prev.filter((image) => !selectedImages.has(image.id))
        );
        setSelectedImages(new Set());
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setDeletingMultiple(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const newImages = arrayMove(images, oldIndex, newIndex);
    setImages(newImages);
    // Persist new order to server action
    await reorderGalleryImages(newImages.map((img) => img.id));
    toast.success("Image order updated");
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="border-b border-gray-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Gallery Image Management
              </Badge>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-16">
          <Card className="bg-gradient-to-br from-gray-900 to-black border-red-500/20 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <div className="text-red-400 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Error Loading Gallery Images
              </h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <Link href="/admin">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                Gallery Images ({images.length})
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
              <Link href="/admin/gallery/images/add">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Images
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
                Gallery Image Management
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your gallery images, upload new ones, and edit alt text.
            </p>
          </div>
        </AnimatedSection>

        {/* Bulk Actions */}
        {selectedImages.size > 0 && (
          <AnimatedSection>
            <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-5 h-5 text-orange-400" />
                    <span className="text-white font-medium">
                      {selectedImages.size} image
                      {selectedImages.size > 1 ? "s" : ""} selected
                    </span>
                    <Button
                      onClick={() => setSelectedImages(new Set())}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-red-900/20 border-red-600 text-red-400 hover:bg-red-800/40 hover:border-red-500 hover:text-red-300"
                        disabled={deletingMultiple}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Selected
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 border-gray-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">
                          Delete Selected Images
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                          Are you sure you want to delete {selectedImages.size}{" "}
                          selected image{selectedImages.size > 1 ? "s" : ""}?
                          This action cannot be undone and will also delete the
                          images from storage.
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
              </CardContent>
            </Card>
          </AnimatedSection>
        )}

        {/* Images Grid */}
        {images.length === 0 ? (
          <AnimatedSection delay={100}>
            <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
              <CardContent className="p-12 text-center">
                <ImageIcon className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  No Gallery Images Yet
                </h3>
                <p className="text-gray-400 mb-6">
                  Get started by uploading your first gallery images.
                </p>
                <Link href="/admin/gallery/images/add">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload First Images
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
                  checked={selectedImages.size === images.length}
                  onCheckedChange={handleSelectAll}
                  className="border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <span className="text-gray-300 text-sm">
                  Select all ({images.length} images)
                </span>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map((img) => img.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {images.map((image, index) => (
                    <DraggableImageCard
                      key={image.id}
                      image={image}
                      index={index}
                      selected={selectedImages.has(image.id)}
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
