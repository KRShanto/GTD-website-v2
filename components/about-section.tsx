"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import AnimatedSection from "@/components/animated-section";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-b from-black to-gray-900"
    >
      <div className="container mx-auto px-6 xs:px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32">
        <AnimatedSection>
          <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
            <Badge className="mb-3 xs:mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30 text-sm xs:text-base">
              About GTD Media Production
            </Badge>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-4 xs:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Your Complete Video Production Partner
              </span>
            </h2>{" "}
            <div className="max-w-4xl mx-auto">
              <p className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-xl xl:text-2xl text-gray-400 leading-relaxed px-2 xs:px-0">
                Creating high-impact visual content that captivates audiences
                and drives business results. From concept to delivery, we handle
                every aspect of video production with professional expertise.
              </p>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-6 xs:gap-8 sm:gap-12 md:gap-16 items-center">
          <AnimatedSection delay={200}>
            <div>
              <h3 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold mb-4 xs:mb-6 text-white">
                Why Choose GTD Media Production?
              </h3>{" "}
              <div className="space-y-3 xs:space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 xs:space-x-4">
                  <CheckCircle className="h-5 w-5 xs:h-6 xs:w-6 text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1 xs:mb-2 text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg">
                      Full-Service Production
                    </h4>
                    <p className="text-gray-400 text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg leading-relaxed">
                      Complete video production services from pre-production
                      planning to post-production editing
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 xs:space-x-4">
                  <CheckCircle className="h-5 w-5 xs:h-6 xs:w-6 text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1 xs:mb-2 text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg">
                      Professional Team
                    </h4>
                    <p className="text-gray-400 text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg leading-relaxed">
                      Experienced directors, cinematographers, and editors
                      dedicated to bringing your vision to life
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 xs:space-x-4">
                  <CheckCircle className="h-5 w-5 xs:h-6 xs:w-6 text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1 xs:mb-2 text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg">
                      Latest Technology
                    </h4>
                    <p className="text-gray-400 text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg leading-relaxed">
                      State-of-the-art cameras, drones, and editing equipment
                      for superior quality results
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 xs:space-x-4">
                  <CheckCircle className="h-5 w-5 xs:h-6 xs:w-6 text-orange-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-white mb-1 xs:mb-2 text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg">
                      Client-Focused Approach
                    </h4>
                    <p className="text-gray-400 text-sm xs:text-base sm:text-lg lg:text-base xl:text-lg leading-relaxed">
                      Collaborative process ensuring your goals and vision are
                      at the center of every project
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={400}>
            <div className="relative space-y-4 xs:space-y-6">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30">
                <Image
                  src="/images/video-production-1.jpeg"
                  alt="GTD Media Production Studio"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30">
                <Image
                  src="/images/video-production-2.jpeg"
                  alt="GTD Media Production Team"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 xs:-bottom-6 xs:-right-6 w-20 h-20 xs:w-24 xs:h-24 md:w-32 md:h-32 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl opacity-80"></div>
              <div className="absolute -top-4 -left-4 xs:-top-6 xs:-left-6 w-12 h-12 xs:w-16 xs:h-16 md:w-24 md:h-24 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full opacity-60"></div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
