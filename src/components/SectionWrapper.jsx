import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const SectionWrapper = forwardRef(function SectionWrapper(
  {
    id,
    labelledBy,
    className,
    children,
    ...props
  },
  ref,
) {
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      className={cn("relative isolate w-full overflow-clip", className)}
      {...props}
    >
      {children}
    </section>
  );
});

export default SectionWrapper;
