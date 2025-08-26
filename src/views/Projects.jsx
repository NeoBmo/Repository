import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid";
import { BlurFade } from "@/components/magicui/blur-fade";
import { cn } from "@/lib/utils";

const features = [
  {
    name: "Aprendizaje continuo",
    description: "siempre un paso adelante con las últimas tendencias.",
    href: "#",
    cta: "Leer más",
    className: "lg:row-span-3",
  },
  {
    name: "IA como aliada",
    description: "integro inteligencia artificial para trabajar más rápido y mejor.",
    href: "#",
    cta: "Leer más",
    className: "lg:col-start-3 lg:row-start-1 lg:row-span-2",
  },
  {
    name: "Multitarea",
    description: "involucrado en todo el ciclo: planeación, desarrollo y entrega.",
    href: "#",
    cta: "Learn more",
    className: "lg:col-start-1 lg:row-start-4 lg:row-span-2",
  },
  {
    name: "Enfoque en resultados",
    description: "soluciones que cumplen objetivos reales.",
    href: "#",
    cta: "Learn more",
    className: "lg:col-start-2 lg:row-start-1 lg:row-span-5",
  },
  {
    name: "Creatividad técnica",
    description: "equilibrio entre diseño atractivo y código sólido.",
    href: "#",
    cta: "Learn more",
    className: "lg:col-start-3 lg:row-start-3 lg:row-span-3",
  },
];

export default function Projects() {
  return (
    <section id="projects" role="region" aria-labelledby="projects-title">
      <div className="py-12 lg:py-20 w-full lg:w-3/4 mx-auto">
        <div className="mb-14 px-5 lg:px-10 text-start">
          <BlurFade delay={0.15}>
            <h2 id="projects-title" className="text-pink-400 text-2xl mb-4">
              5 años creciendo como autodidacta
            </h2>
          </BlurFade>
          <BlurFade delay={0.25}>
            <p className="text-neutral-200 text-lg" itemProp="description">
              Afinando mi talento para transformar ideas en resultados de calidad
            </p>
          </BlurFade>
        </div>
        <BlurFade delay={0.35}>
          <BentoGrid className="group" role="list">
            {features.map((feature) => (
              <BentoCard
                key={feature.name}
                {...feature}
                role="listitem"
                className={cn(feature.className, "group/card")}
              >
                <p itemProp="name">{feature.name}</p>
                <p itemProp="description">{feature.description}</p>
                <a href={feature.href} itemProp="url">
                  {feature.cta}
                </a>
              </BentoCard>
            ))}
          </BentoGrid>
        </BlurFade>
      </div>
    </section>
  );
}
