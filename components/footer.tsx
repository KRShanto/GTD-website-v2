"use client";

import { Code, Facebook, Linkedin, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-8 xs:py-10 sm:py-12 bg-black border-t border-orange-500/20">
      <div className="container mx-auto px-6 xs:px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xs:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-3 xs:mb-4">
              <Image
                src="/images/gtd-logo.png"
                alt="GTD Media Production"
                width={100}
                height={50}
                className="object-contain xs:w-[112px] xs:h-[56px] sm:w-[125px] sm:h-[62px]"
              />
            </div>
            <p className="text-gray-400 mb-3 xs:mb-4 text-sm xs:text-base leading-relaxed">
              Professional video production company creating high-impact visual
              content that drives business results.
            </p>{" "}
            <div className="flex space-x-2 xs:space-x-3 mt-3 xs:mt-4">
              <a
                href="https://www.facebook.com/GreenTomatoDimension/"
                className="w-7 h-7 xs:w-8 xs:h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-3 w-3 xs:h-4 xs:w-4 text-gray-400" />
              </a>
              <a
                href="https://www.linkedin.com/company/gtdnet"
                className="w-7 h-7 xs:w-8 xs:h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500/20 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-3 w-3 xs:h-4 xs:w-4 text-gray-400" />
              </a>
              <a
                href="https://www.youtube.com/@GTDNet"
                className="w-7 h-7 xs:w-8 xs:h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500/20 transition-colors"
                aria-label="Youtube"
              >
                <Youtube className="h-3 w-3 xs:h-4 xs:w-4 text-gray-400" />
              </a>
            </div>
          </div>{" "}
          <div>
            <h4 className="font-semibold text-white mb-3 xs:mb-4 text-sm xs:text-base">
              Services
            </h4>{" "}
            <ul className="space-y-1 xs:space-y-2 text-gray-400 text-sm xs:text-base">
              <li>
                <Link
                  href="#services"
                  className="hover:text-orange-400 transition-colors"
                >
                  Corporate Videos
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="hover:text-orange-400 transition-colors"
                >
                  Commercial Production
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="hover:text-orange-400 transition-colors"
                >
                  Documentary Filmmaking
                </Link>
              </li>
              <li>
                <Link
                  href="#services"
                  className="hover:text-orange-400 transition-colors"
                >
                  Post-Production
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3 xs:mb-4 text-sm xs:text-base">
              Company
            </h4>{" "}
            <ul className="space-y-1 xs:space-y-2 text-gray-400 text-sm xs:text-base">
              <li>
                <Link
                  href="#about"
                  className="hover:text-orange-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#portfolio"
                  className="hover:text-orange-400 transition-colors"
                >
                  Our Portfolio
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="hover:text-orange-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="hover:text-orange-400 transition-colors"
                >
                  Get Quote
                </Link>
              </li>
            </ul>
          </div>{" "}
          <div>
            <h4 className="font-semibold text-white mb-3 xs:mb-4 text-sm xs:text-base">
              Contact Info
            </h4>
            <ul className="space-y-1 xs:space-y-2 text-gray-400 text-sm xs:text-base">
              <li>info@gtdnet.online</li>
              <li>+8801712196535</li>
              <li>Dhaka, Bangladesh</li>
            </ul>
          </div>
        </div>{" "}
        <div className="border-t border-gray-800 mt-6 xs:mt-8 pt-6 xs:pt-8 text-center text-gray-400">
          <p className="text-sm xs:text-base">
            &copy; {new Date().getFullYear()} GTD Media Production. All rights
            reserved.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-orange-500/30 transition-all duration-300 group">
              <Code className="h-4 w-4 text-orange-400 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs xs:text-sm text-gray-300">
                Crafted with ❤️ by{" "}
                <a
                  href="https://krshanto.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:text-orange-300 transition-colors font-medium ml-1 hover:underline"
                >
                  KR Shanto
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
