"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="lg:hidden">
      {" "}
      <button
        className="text-white p-3"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6 sm:h-8 sm:w-8" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-end p-6">
                {" "}
                <button
                  className="text-white p-3"
                  onClick={closeMenu}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>
              </div>{" "}
              <div className="flex flex-col items-center justify-center flex-1 space-y-8 text-center">
                {/* GTD Logo in Mobile Menu */}
                <div className="mb-4">
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
                  className="text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMenu}
                >
                  HOME
                </Link>
                <Link
                  href="/#portfolio"
                  className="text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMenu}
                >
                  OUR PORTFOLIO
                </Link>
                <Link
                  href="/#about"
                  className="text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMenu}
                >
                  ABOUT
                </Link>
                <Link
                  href="/#team"
                  className="text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMenu}
                >
                  TEAM
                </Link>
                <Link
                  href="/#services"
                  className="text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMenu}
                >
                  SERVICES
                </Link>
                <Link
                  href="/event"
                  className="text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMenu}
                >
                  EVENT
                </Link>
                {/*
                <Link
                  href="/blog"
                  className="text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMenu}
                >
                  BLOG
                </Link>
                */}
                <Link
                  href="/#contact"
                  className="text-2xl font-bold text-white hover:text-orange-400 transition-colors uppercase"
                  onClick={closeMenu}
                >
                  CONTACT
                </Link>

                <Link
                  href="/#contact"
                  className="mt-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 rounded-full px-8 py-6 text-lg"
                  onClick={closeMenu}
                >
                  GET QUOTE
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
