import { useEffect, useRef } from "react";
import { siteContent } from "@/lib/site-data";
import { gsap, registerGsapPlugins, ScrollTrigger,} from "@/lib/gsap";
import Container from "@/components/Container";
import SectionWrapper from "@/components/SectionWrapper";

function Skills({ reducedMotion = false }) {
  const { skills } = siteContent;
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || reducedMotion) {
      return undefined;
    }

    registerGsapPlugins();

    const context = gsap.context(() => {
      gsap.from("[data-skills-reveal]", {
        y: 26,
        opacity: 0,
        duration: 0.75,
        stagger: 0.075,
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
      id="skills"
      ref={sectionRef}
      labelledBy="skills-title"
      className="py-20 sm:py-24 lg:py-32 xl:py-36"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div data-skills-reveal className="max-w-xl">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-accent/80">
              Skills
            </p>
            <h2
              id="skills-title"
              className="text-[2.2rem] font-semibold tracking-[-0.055em] text-white sm:text-[2.7rem] lg:text-[3.35rem] lg:leading-[1.02]"
            >
              {skills.subtitle}
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
            {skills.groups.map((skill, index) => (
              <article
                key={skill.title}
                data-skills-reveal
                className="group min-h-52 border border-transparent bg-white/[0.018] p-6 transition-[border-color,background-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.035] focus-within:border-accent/60 sm:p-7 lg:min-h-60"
              >
                <div className="mb-10 flex items-center justify-between text-xs text-neutral-500">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span className="h-px w-8 bg-white/10 transition-colors duration-300 group-hover:bg-accent/50" />
                </div>
                <h3 className="mb-4 max-w-sm text-xl font-semibold leading-tight tracking-[-0.035em] text-white">
                  {skill.title}
                </h3>
                <p className="max-w-md text-sm leading-7 text-neutral-300">
                  {skill.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}

export default Skills;
