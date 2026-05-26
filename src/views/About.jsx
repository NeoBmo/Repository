import { useEffect, useRef } from "react";
import { siteContent } from "@/lib/site-data";
import { gsap, registerGsapPlugins, ScrollTrigger } from "@/lib/gsap";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";

function About({ reducedMotion = false }) {
  const { about } = siteContent;
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || reducedMotion) {
      return undefined;
    }

    registerGsapPlugins();

    const context = gsap.context(() => {
      gsap.from("[data-about-reveal]", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      });
    }, section);

    return () => {
      context.revert();
      ScrollTrigger.refresh();
    };
  }, [reducedMotion]);

  return (
    <SectionWrapper
      id="sobre-mi"
      ref={sectionRef}
      labelledBy="about-title"
      className="py-20 sm:py-24 lg:py-32 xl:py-36"
    >
      <Container>
        <div className="grid min-h-[70svh] items-center gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div
            data-about-reveal
            className="relative flex aspect-square w-full items-center justify-center justify-self-center"
            aria-hidden="true"
          >
            <svg
              className="relative h-auto w-full max-w-50 sm:max-w-62 md:max-w-[320px] text-white/90"
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M156.046 380.36L58.8937 120.92H90.0817L187.234 380.36H156.046ZM235.15 380.36V120.92H264.958V380.36H235.15ZM376.906 225.8C364.578 225.8 354.55 222.12 346.822 214.76C339.278 207.4 335.506 197.74 335.506 185.78C335.506 173.82 339.278 164.16 346.822 156.8C354.55 149.44 364.578 145.76 376.906 145.76C389.418 145.76 399.446 149.44 406.99 156.8C414.534 164.16 418.306 173.82 418.306 185.78C418.306 197.74 414.534 207.4 406.99 214.76C399.446 222.12 389.418 225.8 376.906 225.8ZM376.63 210.62C383.806 210.62 389.602 208.32 394.018 203.72C398.434 199.12 400.642 193.14 400.642 185.78C400.642 178.236 398.434 172.164 394.018 167.564C389.602 162.964 383.806 160.664 376.63 160.664C369.638 160.664 363.934 162.964 359.518 167.564C355.286 172.164 353.17 178.236 353.17 185.78C353.17 193.14 355.286 199.12 359.518 203.72C363.934 208.32 369.638 210.62 376.63 210.62Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div data-about-reveal className="max-w-3xl">
            <SectionHeading
              title={about.title}
              titleId="about-title"
              description={about.description}
              descriptionClassName="text-neutral-300"
            />
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}

export default About;
