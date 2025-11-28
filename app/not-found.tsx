"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StickyNavigation from "@/components/sticky-navigation";
import Footer from "@/components/footer";
import GlobalStyles from "@/components/global-styles";
import Chatbot from "@/components/chatbot";
import AnimatedSection from "@/components/animated-section";
import { Home, ArrowLeft, Film, Mail } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <StickyNavigation alwaysVisible={false} />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="max-w-4xl mx-auto text-center">
              {/* 404 Number */}
              <div className="mb-8">
                <h1 className="text-8xl md:text-9xl lg:text-[12rem] font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent leading-none">
                  404
                </h1>
              </div>

              {/* Error Message */}
              <div className="mb-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-white">
                  Page Not Found
                </h2>
                <p className="text-xl md:text-2xl text-gray-400 mb-8 leading-relaxed">
                  Sorry, the page you're looking for doesn't exist or has been
                  moved.
                </p>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                  <CardContent className="p-6">
                    <Film className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Explore Our Work
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Check out our portfolio and video production services
                    </p>
                    <Link href="/#portfolio">
                      <Button
                        variant="outline"
                        className="w-full bg-gray-800/50 border-orange-500/50 text-orange-400 hover:bg-orange-500/20 hover:border-orange-400 hover:text-orange-300 transition-all duration-300"
                      >
                        View Gallery
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
                  <CardContent className="p-6">
                    <Mail className="h-12 w-12 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Get In Touch
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Have a project in mind? Let's discuss your vision
                    </p>
                    <Link href="/contact">
                      <Button
                        variant="outline"
                        className="w-full bg-gray-800/50 border-orange-500/50 text-orange-400 hover:bg-orange-500/20 hover:border-orange-400 hover:text-orange-300 transition-all duration-300"
                      >
                        Contact Us
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/">
                  <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 text-lg font-semibold border-0 rounded-full">
                    <Home className="mr-2 h-5 w-5" />
                    Go Home
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="bg-gray-800/50 border-orange-500/50 text-orange-400 hover:bg-orange-500/20 hover:border-orange-400 hover:text-orange-300 px-8 py-3 text-lg font-semibold rounded-full transition-all duration-300"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Go Back
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <Footer />
      <GlobalStyles />
      <Chatbot />
    </div>
  );
}
