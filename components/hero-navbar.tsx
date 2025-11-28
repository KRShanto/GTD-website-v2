"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./mobile-menu";

export default function HeroNavbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 w-full bg-transparent">
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {" "}
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <Image
                src="/images/gtd-logo.png"
                alt="GTD Media Production"
                width={100}
                height={50}
                className="object-contain w-20 h-10 sm:w-[100px] sm:h-[50px] md:w-[120px] md:h-[60px]"
              />
            </Link>
          </div>{" "}
          <div className="hidden lg:flex items-center uppercase space-x-10">
            <Link
              href="/#home"
              className="text-gray-300  hover:text-orange-400 transition-colors"
            >
              HOME
            </Link>
            <Link
              href="/#portfolio"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              OUR PORTFOLIO
            </Link>
            <Link
              href="/#about"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              ABOUT
            </Link>
            <Link
              href="/#team"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              TEAM
            </Link>
            <Link
              href="/#services"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              SERVICES
            </Link>
            <Link
              href="/event"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              EVENT
            </Link>
            {/*
            <Link
              href="/blog"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              BLOG
            </Link>
            */}
            <Link
              href="/#contact"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              CONTACT
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <Link
                href="/#contact"
                className="mt-6 xs:mt-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 rounded-full px-6 py-2 xs:px-8 xs:py-3 text-base xs:text-lg"
              >
                GET QUOTE
              </Link>
            </div>
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
