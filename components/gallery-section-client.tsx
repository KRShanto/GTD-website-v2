"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AnimatedSection from "@/components/animated-section";
import Masonry from "react-masonry-css";
import { GalleryImage, GalleryVideo } from "@/lib/generated/prisma/client";

interface GalleryItem {
  type: "image" | "video";
  src: string;
  alt: string;
  thumbnail?: string;
}

interface GallerySectionClientProps {
  videos: GalleryVideo[];
  images: GalleryImage[];
}

export default function GallerySectionClient({
  videos,
  images,
}: GallerySectionClientProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleVideoItems, setVisibleVideoItems] = useState(8); // Initially show 8 videos
  const [visibleImageItems, setVisibleImageItems] = useState(8); // Initially show 8 images
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Get currently visible items
  const visibleVideos = videos.slice(0, visibleVideoItems);
  const visibleImages = images.slice(0, visibleImageItems);

  const hasMoreVideos = visibleVideoItems < videos.length;
  const hasMoreImages = visibleImageItems < images.length;

  // Load more functions
  const loadMoreVideos = () => {
    setIsLoadingVideos(true);
    setTimeout(() => {
      setVisibleVideoItems((prev) => Math.min(prev + 8, videos.length));
      setIsLoadingVideos(false);
    }, 500);
  };

  const loadMoreImages = () => {
    setIsLoadingImages(true);
    setTimeout(() => {
      setVisibleImageItems((prev) => Math.min(prev + 8, images.length));
      setIsLoadingImages(false);
    }, 500);
  };

  const openLightbox = (
    item: GalleryItem,
    index: number,
    isVideo: boolean = false
  ) => {
    setSelectedItem(item);
    // Find the correct index in the combined array
    const combinedIndex = isVideo
      ? videos.findIndex((video) => video.videoUrl === item.src)
      : images.findIndex((image) => image.imageUrl === item.src);
    setCurrentIndex(combinedIndex);
  };

  const closeLightbox = () => {
    setSelectedItem(null);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : videos.length - 1;
    setCurrentIndex(newIndex);
    setSelectedItem({
      type: "video",
      src: videos[newIndex].videoUrl,
      alt: videos[newIndex].alt,
    });
  };

  const goToNext = () => {
    const newIndex = currentIndex < videos.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    setSelectedItem({
      type: "video",
      src: videos[newIndex].videoUrl,
      alt: videos[newIndex].alt,
    });
  };

  // Masonry breakpoints
  const breakpointColumns = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <section
      id="portfolio"
      className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-28 bg-zinc-950"
    >
      <div className="relative container mx-auto px-4 xs:px-6 sm:px-8">
        <AnimatedSection>
          <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
            <Badge className="mb-3 xs:mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30 text-sm xs:text-base">
              Our Portfolio
            </Badge>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 xs:mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Creative Showcase
              </span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-2xl text-gray-400 leading-relaxed px-2 xs:px-0">
                Explore our creative work and behind-the-scenes moments from
                various video production projects
              </p>
            </div>
          </div>
        </AnimatedSection>

        {/* Videos Section */}
        <AnimatedSection delay={100}>
          <div className="mb-12 xs:mb-16 sm:mb-20">
            <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-6 xs:mb-8 text-center">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Our Videos
              </span>
            </h3>
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex -ml-4 w-auto"
              columnClassName="pl-4 bg-clip-padding"
            >
              {visibleVideos.map((item, index) => (
                <AnimatedSection
                  key={`video-${index}`}
                  delay={150 + index * 50}
                >
                  <div className="mb-4">
                    <div
                      className="relative bg-zinc-800 rounded-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-300"
                      onClick={() =>
                        openLightbox(
                          { type: "video", src: item.videoUrl, alt: item.alt },
                          index,
                          true
                        )
                      }
                      style={{ aspectRatio: "16/9" }}
                    >
                      <div className="relative w-full h-full">
                        {item.thumbnailUrl ? (
                          <Image
                            src={item.thumbnailUrl || ""}
                            alt={item.alt}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <video
                            src={item.videoUrl}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            muted
                            preload="metadata"
                            onLoadedMetadata={(e) => {
                              const video = e.target as HTMLVideoElement;
                              video.currentTime = 2;
                            }}
                          />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play className="w-12 h-12 text-white/80 group-hover:text-orange-400 transition-colors" />
                        </div>
                      </div>
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </Masonry>
            {/* Load More Videos Button */}
            {hasMoreVideos && (
              <AnimatedSection delay={200}>
                <div className="text-center mt-8 xs:mt-10 sm:mt-12">
                  <Button
                    onClick={loadMoreVideos}
                    disabled={isLoadingVideos}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 xs:px-12 py-4 xs:py-5 text-base xs:text-lg md:text-xl font-semibold border-0 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingVideos ? "Loading..." : "Load More Videos"}
                  </Button>
                </div>
              </AnimatedSection>
            )}
          </div>
        </AnimatedSection>

        {/* Images Section */}
        <AnimatedSection delay={200}>
          <div className="mb-8 xs:mb-10 sm:mb-12">
            <h3 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold mb-6 xs:mb-8 text-center">
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Behind The Scenes
              </span>
            </h3>

            <Masonry
              breakpointCols={breakpointColumns}
              className="flex -ml-4 w-auto"
              columnClassName="pl-4 bg-clip-padding"
            >
              {visibleImages.map((item, index) => (
                <AnimatedSection
                  key={`image-${index}`}
                  delay={150 + index * 50}
                >
                  <div className="mb-4">
                    <div
                      className="relative bg-zinc-800 rounded-lg overflow-hidden cursor-pointer group hover:scale-105 transition-transform duration-300"
                      onClick={() =>
                        openLightbox(
                          { type: "image", src: item.imageUrl, alt: item.alt },
                          index,
                          false
                        )
                      }
                      style={{
                        aspectRatio:
                          index % 3 === 0
                            ? "4/5"
                            : index % 3 === 1
                            ? "3/4"
                            : "1/1",
                      }}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.alt}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </Masonry>

            {/* Load More Images Button */}
            {hasMoreImages && (
              <AnimatedSection delay={200}>
                <div className="text-center mt-8 xs:mt-10 sm:mt-12">
                  <Button
                    onClick={loadMoreImages}
                    disabled={isLoadingImages}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 xs:px-12 py-4 xs:py-5 text-base xs:text-lg md:text-xl font-semibold border-0 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingImages ? "Loading..." : "Load More Images"}
                  </Button>
                </div>
              </AnimatedSection>
            )}
          </div>
        </AnimatedSection>

        {/* Lightbox Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-5xl max-h-full w-full h-full flex items-center justify-center">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>
              {/* Navigation buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                onClick={goToNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
              {/* Content */}
              <div className="relative w-full h-full flex items-center justify-center">
                {selectedItem.type === "image" ? (
                  <Image
                    src={selectedItem.src}
                    alt={selectedItem.alt}
                    width={1200}
                    height={800}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <video
                    src={selectedItem.src}
                    controls
                    autoPlay
                    className="max-w-full max-h-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              {/* Item counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                {currentIndex + 1} / {videos.length + images.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
