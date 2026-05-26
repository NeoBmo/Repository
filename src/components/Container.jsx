import { cn } from "@/lib/utils";

const containerSizes = {
  default: "max-w-[1280px]",
  text: "max-w-[760px]",
  narrow: "max-w-[960px]",
  full: "max-w-none",
};

function Container({ size = "default", className, children }) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 sm:px-8 lg:px-10 xl:px-14",
        containerSizes[size],
        className,
      )}
    >
      {children}
    </div>
  );
}

export default Container;
