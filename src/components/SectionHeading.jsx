import { cn } from "@/lib/utils";

function SectionHeading({
  title,
  titleId,
  description,
  className,
  descriptionClassName,
}) {
  return (
    <header className={cn("max-w-3xl space-y-4 sm:space-y-5", className)}>
      <h2
        id={titleId}
        className="text-[2.2rem] font-semibold tracking-[-0.055em] text-white sm:text-[2.7rem] lg:text-[3.35rem] lg:leading-[1.02]"
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-sm leading-7 text-white sm:text-base sm:leading-8 lg:text-lg lg:leading-8",
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}

export default SectionHeading;
