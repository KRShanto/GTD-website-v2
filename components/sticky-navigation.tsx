"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface StickyNavigationProps {
  alwaysVisible?: boolean;
}

export default function StickyNavigation({
  alwaysVisible = false,
}: StickyNavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (alwaysVisible) {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > heroHeight * 0.8); // Trigger when 80% through hero
    };
    document.documentElement.style.scrollBehavior = "smooth";
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [alwaysVisible]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/90 backdrop-blur-md border-b border-orange-500/20 translate-y-0 opacity-100"
            : "bg-transparent -translate-y-full opacity-0"
        }`}
      >
        <div className="container mx-auto px-4 xs:px-6 py-3 xs:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <Image
                  src="/images/gtd-logo.png"
                  alt="GTD Media Production"
                  width={150}
                  height={75}
                  className="object-contain w-[100px] h-[50px] xs:w-[120px] xs:h-[60px] sm:w-[140px] sm:h-[70px] md:w-[160px] md:h-[80px]"
                />
              </Link>
            </div>{" "}
            <div className="hidden lg:flex items-center space-x-8 lg:space-x-10 uppercase">
              <Link
                href="/#home"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm lg:text-base"
              >
                HOME
              </Link>
              <Link
                href="/#portfolio"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm lg:text-base"
              >
                OUR PORTFOLIO
              </Link>
              <Link
                href="/#about"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm lg:text-base"
              >
                ABOUT
              </Link>
              <Link
                href="/#team"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm lg:text-base"
              >
                TEAM
              </Link>
              <Link
                href="/#services"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm lg:text-base"
              >
                SERVICES
              </Link>
              <Link
                href="/event"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm lg:text-base"
              >
                EVENT
              </Link>
              {/*
              <Link
                href="/blog"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm lg:text-base"
              >
                BLOG
              </Link>
              */}
              <Link
                href="/#contact"
                className="text-gray-300 hover:text-orange-400 transition-colors text-sm lg:text-base"
              >
                CONTACT
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden lg:block">
                <Link
                  href="/#contact"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 rounded-full px-4 py-2 text-sm lg:px-6 lg:py-3 lg:text-base"
                >
                  GET QUOTE
                </Link>
              </div>
              <button
                className="text-white lg:hidden p-3"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm lg:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-end p-4 xs:p-6">
                <button
                  className="text-white p-3"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>
              </div>{" "}
              <div className="flex flex-col items-center justify-center flex-1 space-y-6 xs:space-y-8 text-center px-4">
                {/* GTD Logo in Mobile Menu */}
                <div className="mb-4 xs:mb-6">
                  <Image
                    src="/images/gtd-logo.png"
                    alt="GTD Media Production"
                    width={150}
                    height={75}
                    className="object-contain w-[120px] h-[60px] xs:w-[140px] xs:h-[70px] sm:w-[160px] sm:h-[80px]"
                  />
                </div>
                <Link
                  href="/#home"
                  className="text-xl xs:text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMobileMenu}
                >
                  HOME
                </Link>{" "}
                <Link
                  href="/#portfolio"
                  className="text-xl xs:text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMobileMenu}
                >
                  OUR PORTFOLIO
                </Link>
                <Link
                  href="/#about"
                  className="text-xl xs:text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMobileMenu}
                >
                  ABOUT
                </Link>
                <Link
                  href="/#team"
                  className="text-xl xs:text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMobileMenu}
                >
                  TEAM
                </Link>
                <Link
                  href="/#services"
                  className="text-xl xs:text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMobileMenu}
                >
                  SERVICES
                </Link>
                <Link
                  href="/event"
                  className="text-xl xs:text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMobileMenu}
                >
                  EVENT
                </Link>
                {/*
                <Link
                  href="/blog"
                  className="text-xl xs:text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMobileMenu}
                >
                  BLOG
                </Link>
                */}
                <Link
                  href="/#contact"
                  className="text-xl xs:text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMobileMenu}
                >
                  CONTACT
                </Link>
                <Link
                  href="/#contact"
                  className="mt-6 xs:mt-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 rounded-full px-6 py-4 xs:px-8 xs:py-6 text-base xs:text-lg"
                  onClick={closeMobileMenu}
                >
                  GET QUOTE
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
