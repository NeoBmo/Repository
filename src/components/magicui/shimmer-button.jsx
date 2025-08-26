import React from "react";

import { cn } from "@/lib/utils";

export const ShimmerButton = React.forwardRef((
  {
    shimmerColor = "#fb64b6",
    shimmerSize = "0.09em",
    shimmerDuration = "1s",
    borderRadius = "0px",
    background = "rgba(0, 0, 0, 1)",
    className,
    children,
    ...props
  },
  ref,
) => {
  return (
    <button
      style={
        {
          "--spread": "90deg",
          "--shimmer-color": shimmerColor,
          "--radius": borderRadius,
          "--speed": shimmerDuration,
          "--cut": shimmerSize,
          "--bg": background
        }
      }
      className={cn(
        "group relative pointer-events-auto cursor-none z-0 flex items-center justify-center overflow-hidden whitespace-nowrap border border-transparent px-6 py-3 text-white ",
        "transform-gpu transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:scale-110",
        className
      )}
      ref={ref}
      {...props}>
      {/* spark container */}
      <div
        className={cn(
          "-z-30",
          "absolute inset-0 overflow-visible [container-type:size]"
        )}>
        {/* spark */}
        <div
          className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
          {/* spark before */}
          <div
            className="absolute -inset-full w-auto rotate-0 animate-spin-around [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>
      {children}
      {/* backdrop */}
      <div
        className={cn(
          "absolute -z-20 [background:var(--bg)] [inset:var(--cut)]"
        )} />
    </button>
  );
});

ShimmerButton.displayName = "ShimmerButton";
