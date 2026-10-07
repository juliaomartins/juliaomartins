import ScrollToTop from "@/components/ui/ScrollToTop";
import Navbar from "@/components/layout/Navbar";
import SkipLink from "@/components/layout/SkipLink";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Gallery from "@/components/sections/Gallery";
import ContactForm from "@/components/sections/ContactForm";
import Footer from "@/components/layout/Footer";

export default function PortfolioPage() {
  return (
    <>
      {/*
        First focusable element on the page, so a keyboard user can jump past
        the six nav links. Sits outside <main> because <main> is its target.
      */}
      <SkipLink />

      <Navbar />

      {/*
        Previously everything lived inside a single <main> — including the
        <nav> and the footer, which do not belong to the main landmark.
        `scroll-smooth` was also duplicated here; it lives on <html> in
        globals.css, where it is gated behind prefers-reduced-motion.
      */}
      <main id="main-content" className="overflow-x-clip">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Gallery />
        <ContactForm />
      </main>

      <ScrollToTop />
      <Footer />
    </>
  );
}
