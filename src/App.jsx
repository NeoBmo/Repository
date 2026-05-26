import { useEffect, useRef, useState } from "react";
import { registerGsapPlugins, ScrollSmoother,} from "@/lib/gsap";
import "@/index.css";
import Hero from "@/views/Hero";
import About from "@/views/About";
import Skills from "@/views/Skills";
import Contact from "@/views/Contact";

const SmoothScroll = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";
const ReducedMotion = "(prefers-reduced-motion: reduce)";

function getInitialReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia(ReducedMotion).matches;
}

function AppContent() {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const smootherRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(getInitialReducedMotion);

  useEffect(() => {
    const mediaQuery = window.matchMedia(ReducedMotion);
    const syncMotionPreference = () => {
      setReducedMotion(mediaQuery.matches);
    };

    syncMotionPreference();
    mediaQuery.addEventListener?.("change", syncMotionPreference);

    return () => {
      mediaQuery.removeEventListener?.("change", syncMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) {
      return undefined;
    }

    registerGsapPlugins();
    const shouldUseSmoothScroll = window.matchMedia(SmoothScroll).matches;

    if (!reducedMotion && shouldUseSmoothScroll) {
      smootherRef.current = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 1.18,
        smoothTouch: 0.1,
        effects: false,
        normalizeScroll: true,
      });
    }

    return () => {
      smootherRef.current?.kill();
      smootherRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <div ref={wrapperRef}>
        <div ref={contentRef}>
          <div className="relative z-10 flex min-h-screen w-full flex-col">
            <Hero reducedMotion={reducedMotion} />
            <About reducedMotion={reducedMotion} />
            <Skills reducedMotion={reducedMotion} />
            <Contact reducedMotion={reducedMotion} />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;
