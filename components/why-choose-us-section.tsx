"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Settings, Target } from "lucide-react";
import AnimatedSection from "@/components/animated-section";

export default function WhyChooseUsSection() {
  const features = [
    {
      icon: (
        <Users className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-white" />
      ),
      title: "Experienced Professionals",
      description:
        "Our team of seasoned directors, cinematographers, and editors brings years of industry experience to every project.",
      delay: 100,
    },
    {
      icon: (
        <Settings className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-white" />
      ),
      title: "Cutting-Edge Technology",
      description:
        "We invest in the latest cameras, drones, and editing software to deliver superior quality results.",
      delay: 200,
    },
    {
      icon: (
        <Target className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-white" />
      ),
      title: "Results-Driven Approach",
      description:
        "We focus on creating video content that not only looks great but delivers measurable business results.",
      delay: 300,
    },
  ];

  return (
    <section className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-6 xs:px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32">
        <AnimatedSection>
          <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
            <Badge className="mb-3 xs:mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30 text-sm xs:text-base">
              Why Choose Us
            </Badge>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-4 xs:mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                What Sets GTD Media Production Apart
              </span>
            </h2>
          </div>
        </AnimatedSection>{" "}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <AnimatedSection key={index} delay={feature.delay}>
              <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 text-center h-full">
                <CardContent className="p-4 xs:p-6 md:p-8 flex flex-col items-center h-full">
                  <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 xs:mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg xs:text-xl lg:text-lg xl:text-xl font-bold mb-3 xs:mb-4 text-white leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm xs:text-base lg:text-sm xl:text-base leading-relaxed">
                    {feature.description}
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
