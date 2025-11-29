"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Star } from "lucide-react";
import AnimatedSection from "@/components/animated-section";
import { Testimonial } from "@/lib/generated/prisma/client";

interface TestimonialsSectionClientProps {
  testimonials: Testimonial[];
}

export default function TestimonialsSectionClient({
  testimonials,
}: TestimonialsSectionClientProps) {
  return (
    <section className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-6 xs:px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32">
        <AnimatedSection>
          <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
            <Badge className="mb-3 xs:mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30 text-sm xs:text-base">
              Client Success Stories
            </Badge>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-4 xs:mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                What Our Clients Say
              </span>
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <AnimatedSection key={index} delay={index * 100}>
              <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 h-full">
                <CardContent className="p-4 xs:p-6 md:p-8 flex flex-col h-full">
                  <Quote className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-orange-400 mb-3 xs:mb-4" />
                  <p className="text-gray-300 mb-4 xs:mb-6 text-sm xs:text-base md:text-lg lg:text-base xl:text-lg leading-relaxed flex-grow">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center mb-3 xs:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 xs:h-4 xs:w-4 md:h-5 md:w-5 text-orange-400 fill-current"
                      />
                    ))}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm xs:text-base lg:text-sm xl:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-orange-400 text-sm xs:text-base lg:text-sm xl:text-base">
                      {testimonial.address}
                    </div>
                    <div className="text-gray-400 text-xs xs:text-sm lg:text-xs xl:text-sm">
                      {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
