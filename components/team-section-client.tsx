"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/animated-section";

interface TeamMember {
  name: string;
  title: string;
  bio: string;
  image: string;
  slug: string;
}

interface TeamSectionClientProps {
  teamMembers: TeamMember[];
  error?: string | null;
}

export default function TeamSectionClient({
  teamMembers,
  error,
}: TeamSectionClientProps) {
  if (error) {
    return (
      <section
        id="team"
        className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-b from-black to-gray-900"
      >
        <div className="container mx-auto px-6 xs:px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32">
          <div className="text-center">
            <p className="text-red-400">Error loading team members: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="team"
      className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-b from-black to-gray-900"
    >
      <div className="container mx-auto px-6 xs:px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32">
        <AnimatedSection>
          <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
            <Badge className="mb-3 xs:mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30 text-sm xs:text-base">
              Our Expert Team
            </Badge>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-4 xs:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Meet the Creative Minds Behind GTD Media
              </span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-xl xl:text-2xl text-gray-400 leading-relaxed px-2 xs:px-0">
                Our diverse team of experienced professionals brings together
                decades of expertise in media production, storytelling, and
                creative innovation.
              </p>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6 md:gap-8">
          {teamMembers.map((member, index) => (
            <AnimatedSection key={index} delay={index * 100}>
              <Link href={`/team#${member.slug}`}>
                <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group hover:scale-105 h-full cursor-pointer">
                  <CardContent className="p-4 xs:p-6 flex flex-col items-center text-center h-full">
                    <div className="relative w-24 h-24 xs:w-28 xs:h-28 sm:w-32 sm:h-32 mb-4 xs:mb-6">
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      <div className="relative w-full h-full overflow-hidden rounded-full border-2 border-orange-500/30 group-hover:border-orange-500/60 transition-colors">
                        <Image
                          src={member.image}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 128px, (max-width: 1024px) 128px, 128px"
                        />
                      </div>
                    </div>

                    <div className="flex-grow flex flex-col">
                      <h3 className="text-lg xs:text-xl lg:text-lg xl:text-xl font-bold mb-2 text-white leading-tight">
                        {member.name}
                      </h3>
                      <div className="text-orange-400 font-medium text-sm xs:text-base lg:text-sm xl:text-base mb-3 xs:mb-4">
                        {member.title}
                      </div>
                      <p className="text-gray-400 text-xs xs:text-sm lg:text-xs xl:text-sm leading-relaxed flex-grow overflow-hidden">
                        <span className="line-clamp-4">{member.bio}</span>
                      </p>
                      <div className="mt-3 xs:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-orange-400 text-xs font-medium">
                          Click to read more →
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
