import { siteContent } from "@/lib/site-data";
import { lazy, Suspense, useEffect, useRef } from "react";
import { gsap, registerGsapPlugins,} from "@/lib/gsap";
import Container from "@/components/Container";
import SectionWrapper from "@/components/SectionWrapper";

const Particles = lazy(() => import("@/UI/Particles"));

function Hero({ reducedMotion = false }) {
  const { hero } = siteContent;
  const sectionRef = useRef(null);
  const titleWords = hero.title.split(" ");

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || reducedMotion) {
      return undefined;
    }

    registerGsapPlugins();

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      timeline
        .from("[data-hero-word]", {
          yPercent: 110,
          opacity: 0,
          duration: 0.9,
          stagger: 0.075,
        })
        .from(
          "[data-hero-copy]",
          {
            y: 18,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.42",
        )
        .from(
          "[data-hero-background]",
          {
            opacity: 0,
            scale: 1.04,
            duration: 1.2,
          },
          0,
        );
    }, section);

    return () => {
      context.revert();
    };
  }, [reducedMotion]);

  return (
    <SectionWrapper
      id="hero"
      ref={sectionRef}
      labelledBy="hero-title"
      className="flex min-h-svh items-center bg-background"
    >
      <div
        data-hero-background
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <Particles
            particleCount={64}
            particleSpread={8.4}
            speed={0.055}
            particleBaseSize={105}
            particleHoverFactor={0.22}
            className="absolute inset-0 h-full w-full opacity-90"
          />
        </Suspense>
      </div>
      <Container className="flex min-h-svh items-end pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pb-24 xl:pb-28">
        <div className="grid w-full gap-7 md:max-w-5xl md:gap-9">
          <h1
            id="hero-title"
            className="max-w-5xl text-balance text-[clamp(3.15rem,11vw,8.4rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-white sm:tracking-[-0.08em]"
          >
            {titleWords.map((word, index) => (
              <span key={`${word}-${index}`}>
                <span className="inline-block overflow-hidden align-top">
                  <span data-hero-word className="inline-block pr-[0.18em]">
                    {word}
                  </span>
                </span>
                {index < titleWords.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          <p
            data-hero-copy
            className="max-w-2xl text-sm leading-7 text-neutral-300 sm:text-base sm:leading-8 lg:text-lg lg:leading-8"
          >
            {hero.description}
          </p>
        </div>
      </Container>
    </SectionWrapper>
  );
}

export default Hero;
