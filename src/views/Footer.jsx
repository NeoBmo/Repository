import TextReveal from "@/components/magicui/text-reveal";

function footer() {
  return (
    <>
      <section
        id="slogan"
        role="region"
        aria-labelledby="Personal-slogan"
      >
        <div className="w-3/4 lg:w-screen mx-auto">
          <TextReveal>
            Si lo puedo imaginar, lo puedo programar.
          </TextReveal>
        </div>
      </section>
      <footer
        id="footer"
        role="contentinfo"
        aria-labelledby="footer"
        className="w-screen py-4"
      >
        <p className="text-sm text-neutral-400 text-center">
          Diseñado y desarrollado por{" "}
          <a
            href="https://www.youtube.com/watch?v=oHg5SJYRHA0"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold cursor-none text-neutral-100 hover:text-pink-400 transition-colors duration-300"
          >
            NeoBmo
          </a>
        </p>
      </footer>
    </>
  );
}

export default footer;
