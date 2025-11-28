"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Monitor, Award, Edit, Facebook } from "lucide-react";
import AnimatedSection from "@/components/animated-section";

export default function ServicesSection() {
  const services = [
    {
      icon: <Film className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8" />,
      title: "Legacy Film",
      description:
        "We turn your cherished memories into cinematic stories that last forever. A legacy film captures your family's history, emotions, and values — preserving them beautifully for generations to come.",
      delay: 0,
    },
    {
      icon: <Film className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8" />,
      title: "Short-form Video",
      description:
        "We create powerful short-form videos that grab attention, tell your story fast, and drive real results for your brand.",
      delay: 100,
    },
    {
      icon: <Facebook className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8" />,
      title: "Social Content",
      description:
        "We craft engaging social content that connects with your audience, builds your brand, and drives action across all platforms.",
      delay: 200,
    },
    {
      icon: <Award className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8" />,
      title: "Documentary Filmmaking",
      description:
        "Compelling documentary content that tells authentic stories and captures real moments.",
      delay: 300,
    },
    {
      icon: <Film className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8" />,
      title: "Corporate Videos",
      description:
        "Professional corporate communications, training videos, and company profiles.",
      delay: 400,
    },
    {
      icon: <Monitor className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8" />,
      title: "Commercial Production",
      description:
        "High-impact commercials and promotional videos that drive sales and brand awareness.",
      delay: 500,
    },
    {
      icon: <Edit className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8" />,
      title: "Post-Production",
      description:
        "Expert editing, color grading, and visual effects to polish your content to perfection.",
      delay: 600,
    },
    {
      icon: <Monitor className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8" />,
      title: "Live Streaming",
      description:
        "We offer high-quality live streaming solutions to help you broadcast your events, conferences, or programs in real time, seamlessly and professionally.",
      delay: 700,
    },
  ];

  return (
    <section
      id="services"
      className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-b from-gray-900 to-black"
    >
      <div className="container mx-auto px-6 xs:px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32">
        <AnimatedSection>
          <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
            <Badge className="mb-3 xs:mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30 text-sm xs:text-base">
              Our Services
            </Badge>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-4 xs:mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Professional Video Production Services
              </span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-xl xl:text-2xl text-gray-400 leading-relaxed px-2 xs:px-0">
                From concept to completion, we deliver high-quality video
                content that engages your audience and achieves your business
                objectives.
              </p>
            </div>
          </div>
        </AnimatedSection>{" "}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 md:gap-8">
          {services.map((service, index) => (
            <AnimatedSection key={index} delay={service.delay}>
              <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group hover:scale-105 text-center h-full">
                <CardContent className="p-4 xs:p-6 md:p-8 flex flex-col items-center h-full">
                  <div className="text-orange-400 mb-3 xs:mb-4 group-hover:scale-110 transition-transform flex justify-center">
                    {service.icon}
                  </div>
                  <h3 className="text-lg xs:text-xl lg:text-lg xl:text-xl font-bold mb-3 xs:mb-4 text-white leading-tight">
                    {service.title}
                  </h3>
                  <p className="text-gray-400 text-sm xs:text-base lg:text-sm xl:text-base leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
