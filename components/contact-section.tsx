"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Film,
  Monitor,
  Award,
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Youtube,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import AnimatedSection from "@/components/animated-section";
import { sendContactEmail, ContactFormData } from "@/actions/send-mail";
import { useState, useTransition } from "react";

export default function ContactSection() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    email: "",
    projectDetails: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.projectDetails
    ) {
      setMessage({
        type: "error",
        text: "Please fill in all fields.",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await sendContactEmail(formData);

        if (result.success) {
          setMessage({
            type: "success",
            text: result.message,
          });
          // Reset form
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            projectDetails: "",
          });
        } else {
          setMessage({
            type: "error",
            text: result.message,
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: "Something went wrong. Please try again.",
        });
      }
    });
  };
  return (
    <section
      id="contact"
      className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-28 bg-gradient-to-b from-gray-900 to-black"
    >
      <div className="container mx-auto px-6 xs:px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32">
        <AnimatedSection>
          <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16 lg:mb-20">
            <Badge className="mb-3 xs:mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30 text-sm xs:text-base">
              Get Started
            </Badge>
            <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold mb-4 xs:mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Create Something Amazing?
              </span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-base xs:text-lg sm:text-xl md:text-xl lg:text-xl xl:text-2xl text-gray-400 leading-relaxed px-2 xs:px-0">
                Let's discuss your video production needs and create content
                that drives results for your business.
              </p>
            </div>
          </div>
        </AnimatedSection>{" "}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 md:gap-12">
          <AnimatedSection delay={200}>
            {" "}
            <div>
              <h3 className="text-lg xs:text-xl md:text-2xl lg:text-xl xl:text-2xl font-bold mb-6 xs:mb-8 text-white">
                Get In Touch
              </h3>

              {/* Contact Information */}
              <div className="space-y-4 xs:space-y-5">
                <div className="flex items-center space-x-3 xs:space-x-4">
                  <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm xs:text-base">
                      info@gtdnet.online
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 xs:space-x-4">
                  <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm xs:text-base">
                      +8801712196535
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 xs:space-x-4">
                  <div className="w-10 h-10 xs:w-12 xs:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm xs:text-base leading-relaxed text-center">
                      Dhaka, Bangladesh
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="mt-8 xs:mt-10">
                <div className="flex space-x-3 xs:space-x-4">
                  <a
                    href="https://www.facebook.com/GreenTomatoDimension/"
                    className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/gtdnet"
                    className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
                  </a>
                  <a
                    href="https://www.youtube.com/@GTDNet"
                    className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    aria-label="Youtube"
                  >
                    <Youtube className="h-4 w-4 xs:h-5 xs:w-5 text-white" />
                  </a>
                </div>
              </div>
            </div>
          </AnimatedSection>{" "}
          <AnimatedSection delay={400}>
            {" "}
            <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20">
              <CardContent className="p-4 xs:p-6 md:p-8">
                {message.type && (
                  <div
                    className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                      message.type === "success"
                        ? "bg-green-500/20 border border-green-500/30 text-green-400"
                        : "bg-red-500/20 border border-red-500/30 text-red-400"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <p className="text-sm">{message.text}</p>
                  </div>
                )}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 xs:space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2">
                        First Name
                      </label>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        disabled={isPending}
                        className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 text-sm xs:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2">
                        Last Name
                      </label>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        disabled={isPending}
                        className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 text-sm xs:text-base"
                      />
                    </div>
                  </div>{" "}
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={isPending}
                      className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 text-sm xs:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs xs:text-sm font-medium text-gray-300 mb-1 xs:mb-2">
                      Project Details
                    </label>
                    <Textarea
                      name="projectDetails"
                      value={formData.projectDetails}
                      onChange={handleInputChange}
                      required
                      disabled={isPending}
                      className="bg-gray-800 border-gray-700 text-white focus:border-orange-500 min-h-[100px] xs:min-h-[120px] text-sm xs:text-base"
                      placeholder="Tell us about your project goals, timeline, and any specific requirements..."
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 xs:py-3 text-sm xs:text-base md:text-lg font-semibold border-0 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? "Sending..." : "Send Message"}
                    {!isPending && (
                      <ArrowRight className="ml-1 xs:ml-2 h-4 w-4 xs:h-5 xs:w-5" />
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
