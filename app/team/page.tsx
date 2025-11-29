import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import AnimatedSection from "@/components/animated-section";
import StickyNavigation from "@/components/sticky-navigation";
import { getTeamMembers } from "@/actions/team/read";

export default async function TeamPage() {
  // Fetch data from Supabase
  const members = await getTeamMembers();

  return (
    <div className="min-h-screen bg-black text-white">
      <StickyNavigation alwaysVisible={true} />
      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <AnimatedSection>
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Our Team
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Meet the talented professionals behind GTD Media Production's
                success.
              </p>
            </div>
          </AnimatedSection>

          {/* Team Members */}
          <div className="space-y-8">
            {members.map((member, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div id={member.slug}>
                  <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                        {/* Profile Image */}
                        <div className="flex-shrink-0 mx-auto md:mx-0">
                          <div className="relative w-32 h-32 md:w-40 md:h-40 overflow-hidden rounded-full border-4 border-orange-500">
                            <Image
                              src={member.imageUrl || ""}
                              alt={member.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>

                        {/* Member Information */}
                        <div className="flex-1 text-center md:text-left">
                          <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-2">
                            {member.name}
                          </h2>
                          <h3 className="text-lg md:text-xl text-orange-300 mb-4 font-semibold">
                            {member.title}
                          </h3>
                          <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                            {member.bio}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
