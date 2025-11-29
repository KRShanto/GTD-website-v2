"use client";

import { Play, ArrowRight } from "lucide-react";
import AnimatedBackground from "@/components/animated-background";
import HeroNavbar from "@/components/hero-navbar";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      {/* Hero Navigation - completely transparent and inside hero */}
      <HeroNavbar />

      {/* Hero Content */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          {/* TODO: upload to sevalla */}
          <source
            // src="https://firebasestorage.googleapis.com/v0/b/gtd-website-25.firebasestorage.app/o/hero.mp4?alt=media&token=27bc3a0e-6b4e-468e-b994-baa8e2f7329e"
            src="https://gtd-website-39lds.sevalla.storage/1764430768690-a5blxgf-hero.mp4"
            type="video/mp4"
          />
        </video>
        <AnimatedBackground />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/90 to-black/90"></div>{" "}
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-[10%] w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-[30%] right-[15%] w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full opacity-10 animate-pulse delay-1000"></div>
          <div className="absolute bottom-[20%] left-[20%] w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-r from-orange-600 to-orange-700 rounded-full opacity-15 animate-pulse delay-700"></div>

          {/* Animated lines */}
          <div className="absolute inset-0">
            <div className="absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent animate-[pulse_4s_ease-in-out_infinite]"></div>
            <div className="absolute top-[40%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/15 to-transparent animate-[pulse_6s_ease-in-out_infinite_1s]"></div>
            <div className="absolute top-[60%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500/10 to-transparent animate-[pulse_5s_ease-in-out_infinite_0.5s]"></div>
          </div>

          {/* Animated particles */}
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-orange-500 rounded-full"
                style={{
                  width: `${Math.random() * 6 + 2}px`,
                  height: `${Math.random() * 6 + 2}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3,
                  animation: `float ${
                    Math.random() * 10 + 10
                  }s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              ></div>
            ))}
          </div>
        </div>{" "}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.15),transparent_70%)]"></div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center flex flex-col justify-center xl:justify-end min-h-screen pb-8 sm:pb-10 md:pb-12 lg:pb-16 xl:pb-20">
          <div className="max-w-5xl mx-auto mt-0 sm:mt-4 md:mt-6 lg:mt-8 xl:mt-auto">
            <div className="overflow-hidden">
              {" "}
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black mb-4 sm:mb-6 md:mb-8 leading-tight animate-[slideUp_1s_ease-out]">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent inline-block drop-shadow-lg">
                  PREMIUM
                </span>
                <br />
                <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent inline-block">
                  VIDEO
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent inline-block animate-[gradientShift_3s_ease-in-out_infinite]">
                  PRODUCTION
                </span>
              </h1>
            </div>
            <p className="text-sm sm:text-base md:text-base lg:text-lg xl:text-xl text-gray-300 mb-8 sm:mb-12 md:mb-14 lg:mb-16 max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-auto leading-relaxed animate-[fadeIn_1.5s_ease-in] px-2 sm:px-0">
              From corporate videos to commercials, documentaries to live events
              - we bring your vision to life with cutting-edge technology and
              creative expertise that delivers results.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 justify-center items-center mb-8 sm:mb-12 md:mb-14 lg:mb-16 animate-[fadeIn_1.8s_ease-in] px-2 sm:px-0">
              <Link
                href="/#contact"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4 text-sm sm:text-base md:text-base lg:text-lg font-semibold border-0 rounded-full group relative overflow-hidden w-auto sm:w-auto max-w-fit sm:max-w-none"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-orange-400 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10 flex items-center justify-center">
                  Start Your Project
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/#portfolio"
                className="border-orange-400 border items-center justify-center text-orange-400 bg-transparent flex hover:bg-orange-600 hover:text-white hover:border-orange-600 px-6 sm:px-6 md:px-7 lg:px-8 py-2.5 sm:py-3 md:py-3.5 lg:py-4 text-sm sm:text-base md:text-base lg:text-lg font-semibold group rounded-full w-auto sm:w-auto max-w-fit sm:max-w-none transition-all duration-300"
              >
                <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
                Watch Our Videos
              </Link>
            </div>{" "}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 lg:gap-10 xl:gap-12 max-w-2xl lg:max-w-3xl mx-auto animate-[fadeIn_2s_ease-in] px-2 sm:px-0">
              <div className="text-center transform hover:scale-105 transition-transform">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-orange-400 mb-1 sm:mb-2">
                  500+
                </div>
                <div className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-400">
                  Projects Completed
                </div>
              </div>
              <div className="text-center transform hover:scale-105 transition-transform">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-orange-400 mb-1 sm:mb-2">
                  98%
                </div>
                <div className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-400">
                  Client Satisfaction
                </div>
              </div>
              <div className="text-center transform hover:scale-105 transition-transform">
                <div className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-orange-400 mb-1 sm:mb-2">
                  24h
                </div>
                <div className="text-xs sm:text-sm md:text-sm lg:text-base text-gray-400">
                  Quick Turnaround
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
