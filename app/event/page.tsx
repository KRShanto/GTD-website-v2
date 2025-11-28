import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "@/components/animated-section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import StickyNavigation from "@/components/sticky-navigation";

const blogs = [
  {
    title: "How Climate Films Inspire Change",
    description:
      "Exploring the impact of visual storytelling on climate action and awareness.",
    author: { name: "Jane Doe", image: "/images/bot.png" },
  },
  {
    title: "Behind the Scenes: GTCF 2025",
    description:
      "A look at the making of the first international climate film festival in Dhaka.",
    author: { name: "John Smith", image: "/images/bot.png" },
  },
  {
    title: "Filmmaking for a Greener Future",
    description:
      "Tips and stories from filmmakers using their craft to address climate change.",
    author: { name: "Alex Green", image: "/images/bot.png" },
  },
];

export default function EventPage() {
  return (
    <div className="min-h-screen  bg-black text-white overflow-x-hidden">
      <StickyNavigation alwaysVisible={true} />
      <div className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-32 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        <div className="flex flex-col items-center gap-8 relative z-10">
          {/* Logo in Card */}
          <div className="p-3 rounded-2xl border-4 border-orange-500 bg-black/80 shadow-xl mb-2 ">
            <Image
              src="/images/gtcf.png"
              alt="GTCF Logo"
              width={140}
              height={140}
              className="rounded-xl"
              priority
            />
          </div>
          {/* Title - reduced size */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-center bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-lg animate-[gradientShift_3s_ease-in-out_infinite,slideUp_1s_ease-out]">
            Global Trend Climate Change Film Festival (GTCF)
          </h1>
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 max-w-2xl text-center tracking-wide mb-2 animate-[fadeIn_1.5s_ease-in]">
            First International Climate Film Festival in Dhaka – December 2025
          </p>
          {/* CTA Button */}
          <Link
            href="https://filmfreeway.com/GTCF"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="group border-2 border-orange-500 text-orange-400 bg-transparent px-8 py-4 text-lg font-semibold rounded-full flex items-center gap-2 shadow-lg transition-all duration-300 hover:bg-orange-500 hover:text-white hover:border-orange-600 animate-[fadeIn_1.8s_ease-in]"
              style={{ boxShadow: "0 2px 24px 0 rgba(251,146,60,0.10)" }}
            >
              <Play className="w-5 h-5 mr-2 group-hover:text-white transition-colors" />
              View Event
            </Button>
          </Link>
        </div>
        {/* Event Description Section */}
        <AnimatedSection delay={200}>
          <div className="mt-14 max-w-2xl mx-auto text-center text-gray-300 text-lg sm:text-xl leading-relaxed animate-[fadeIn_2s_ease-in]">
            <p>
              The Global Trend Climate Change Film Festival (GTCF) is Dhaka's
              first international festival dedicated to climate storytelling.
              Taking place in December 2025 at the Bangladesh National Museum,
              GTCF brings together filmmakers, climate advocates, and audiences
              from around the world to experience powerful films and discussions
              about our planet's future.
            </p>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={400}>
          <div className="mt-24 w-full max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent animate-[slideUp_1s_ease-out]">
              Latest Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {blogs.map((blog, index) => (
                <AnimatedSection key={index} delay={index * 100}>
                  <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group hover:scale-105 h-full shadow-lg">
                    <CardContent className="p-8 flex flex-col h-full">
                      <h3 className="text-xl font-bold mb-2 text-white group-hover:text-orange-400 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-gray-300 mb-4 flex-grow">
                        {blog.description}
                      </p>
                      <div className="flex items-center gap-3 mt-4">
                        <Image
                          src={blog.author.image}
                          alt={blog.author.name}
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-orange-500 bg-gray-800"
                        />
                        <span className="text-orange-300 font-semibold text-base">
                          {blog.author.name}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

// Add floating animation keyframes to your global CSS:
// .animate-float-slow { animation: float 8s ease-in-out infinite; }
// .animate-float-medium { animation: float 6s ease-in-out infinite; }
// .animate-float-fast { animation: float 4s ease-in-out infinite; }
// @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
