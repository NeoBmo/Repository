import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

function Contact() {
  return (
    <section id="contact" role="contentinfo" aria-labelledby="contact-title">
      <div className="min-h-screen relative isolate overflow-hidden flex items-center justify-center">
        <InteractiveGridPattern className="-skew-6" />
        <div className="relative z-10 container py-5 mx-auto px-4 backdrop-blur-xs bg-transparent pointer-events-none">
          <h2 className="text-4xl text-neutral-100 mb-6" id="contact-title">
            Contáctame
          </h2>
          <p className="text-lg text-neutral-200 mb-7">
            ¿Necesitas un desarrollador que sume valor a tu proyecto?
          </p>
          <a href="mailto:luis.rodriguez.reales@gmail.com?subject=Quiero%20trabajar%20contigo&body=Hola,%20me%20interesa%20tu%20perfil%20como%20desarrollador.">
            <ShimmerButton>Escríbeme a mi correo</ShimmerButton>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Contact;
