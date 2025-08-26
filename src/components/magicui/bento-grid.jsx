import { ArrowRightIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MagicCard } from "./magic-card";

export const BentoGrid = ({ children, className = "", ...props }) => (
  <div
    className={cn(
      "group grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-5 sm:grid-rows-3 gap-5 px-5 lg:px-0"
    )}
    {...props}
    role="list"
  >
    {children}
  </div>
);

export const BentoCard = ({
  name,
  description,
  href,
  cta,
  className,
  ...props
}) => (
  <MagicCard
    className={cn(
      className,
      "group/card hover:scale-110 group-hover:scale-80 group-hover:opacity-60 hover:opacity-100 transition-transform duration-500"
    )}
    {...props}
  >
    <div className="relative flex flex-col h-fit z-10 px-6 md:px-8 py-5 md:py-7 gap-2">
      <p className="text-neutral-400 text-xl mb-1">{name}</p>
      <p className="text-neutral-200 text-base">{description}</p>
    </div>
    {/* 
    <div className="lg:hidden flex w-full items-center py-5 pl-5">
      <Button
        variant="link"
        size="sm"
        asChild
        className="cursor-none text-base hover:scale-105 transition-transform duration-300"
      >
        <a href={href} aria-label={`Saber más sobre ${name}`}>
          {cta}
          <ArrowRightIcon className="ms-1 mt-0.5 h-4 w-4 rtl:rotate-180" />
        </a>
      </Button>
    </div>
    <div className="pointer-events-none relative z-20 hidden translate-y-10 items-center pt-7 pl-6 opacity-0 transition-all duration-300 group-hover/card:-translate-y-5 group-hover/card:opacity-100 lg:flex">
      <Button
        variant="link"
        size="sm"
        asChild
        className="pointer-events-auto text-base cursor-none hover:scale-110 hover:translate-x-5 ease-linear transition-transform duration-200"
      >
        <a href={href} aria-label={`Saber más sobre ${name}`}>
          {cta}
          <ArrowRightIcon className="ms-1 mt-0.5 h-4 w-4 rtl:rotate-180 cursor-none" />
        </a>
      </Button>
    </div> */}
  </MagicCard>
);
