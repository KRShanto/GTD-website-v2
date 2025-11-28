import StickyNavigation from "@/components/sticky-navigation";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import ServicesSection from "@/components/services-section";
import WhyChooseUsSection from "@/components/why-choose-us-section";
import TestimonialsSection from "@/components/testimonials-section";
import GallerySection from "@/components/gallery-section";
import TeamSection from "@/components/team-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import GlobalStyles from "@/components/global-styles";
import Chatbot from "@/components/chatbot";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <StickyNavigation />
      <HeroSection />
      <GallerySection />
      <AboutSection />
      <TeamSection />
      <ServicesSection />
      <WhyChooseUsSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
      <GlobalStyles />
      <Chatbot />
    </div>
  );
}
