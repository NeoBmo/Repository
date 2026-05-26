import { useEffect, useRef } from "react";
import { siteContent } from "@/lib/site-data";
import { gsap, registerGsapPlugins, ScrollTrigger,} from "@/lib/gsap";
import Container from "@/components/Container";
import SectionHeading from "@/components/SectionHeading";
import SectionWrapper from "@/components/SectionWrapper";

function Contact({ reducedMotion = false }) {
  const { contact } = siteContent;
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || reducedMotion) {
      return undefined;
    }

    registerGsapPlugins();

    const context = gsap.context(() => {
      gsap.from("[data-contact-reveal]", {
        y: 28,
        opacity: 0,
        duration: 0.8,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 74%",
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
      id="contacto"
      ref={sectionRef}
      labelledBy="contact-title"
      className="py-20 sm:py-24 lg:py-32 xl:py-36"
    >
      <Container>
        <div className="relative grid min-h-[70svh] items-center overflow-hidden border border-white/10 bg-white/[0.018] p-6 sm:p-8 lg:p-10">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/60 to-transparent"
            aria-hidden="true"
          />
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16">
            <div data-contact-reveal>
              <SectionHeading
                title={contact.title}
                titleId="contact-title"
                description={contact.description}
                descriptionClassName="text-neutral-300"
              />
            </div>
            <div
              data-contact-reveal
              className="flex flex-col gap-4 lg:items-end lg:text-right"
            >
              <a
                href="https://wa.me/573241506385?text=Hola,%20soy%20"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 w-fit items-center justify-center border border-white/15 bg-white text-sm font-semibold text-black transition-[background-color,border-color,color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-accent/70 hover:bg-accent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background px-6"
              >
                Hablemos
              </a>
              <p className="max-w-xs text-xs leading-6 text-neutral-500">
                Respondo sin vueltas y con foco en el
                proyecto.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}

export default Contact;
