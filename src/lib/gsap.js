import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ScrollSmoother from "gsap/ScrollSmoother";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import SplitText from "gsap/SplitText";

let pluginsRegistered = false;

export function registerGsapPlugins() {
  if (pluginsRegistered || typeof window === "undefined") {
    return;
  }

  gsap.registerPlugin(
    ScrollTrigger,
    ScrollSmoother,
    DrawSVGPlugin,
    SplitText,
  );
  pluginsRegistered = true;
}

export {
  DrawSVGPlugin,
  gsap,
  ScrollSmoother,
  ScrollTrigger,
  SplitText,
};
