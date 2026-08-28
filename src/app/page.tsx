import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import TheNoorShowcase from "@/components/TheNoorShowcase";
import AlafasyShowcase from "@/components/AlafasyShowcase";
import GajiMeterShowcase from "@/components/GajiMeterShowcase";
import TekataShowcase from "@/components/TekataShowcase";
import Projects from "@/components/Projects";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Experience />
        <Skills />

        {/* Featured projects section */}
        <section id="featured" className="pt-16 pb-4 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">
              Featured Projects
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Apps I&apos;ve shipped
            </h2>
            <p className="text-white/40 max-w-lg mx-auto text-sm">
              Production apps on Google Play — from 1M+ download Islamic tools to local party games.
            </p>
          </div>
        </section>

        <TheNoorShowcase />
        <AlafasyShowcase />
        <GajiMeterShowcase />
        <TekataShowcase />

        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
