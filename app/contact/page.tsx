"use client";

import { useState, useEffect } from "react";
import StickyNavigation from "@/components/sticky-navigation";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import GlobalStyles from "@/components/global-styles";
import Chatbot from "@/components/chatbot";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <StickyNavigation alwaysVisible={true} />
      <div className="pt-20">
        <ContactSection />
      </div>
      <Footer />
      <GlobalStyles />
      <Chatbot />
    </div>
  );
}
