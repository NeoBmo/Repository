import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";

const reviews = [
  {
    name: "Gabriela",
    username: "@growt.activewear",
    body: "“Hasta las cosas más complicadas las hace ver sencillas.”",
    img: "https://avatar.vercel.sh/jack",
  },
  {
    name: "Samith",
    username: "@Samith",
    body: "“Una pepita de oro que debe seguir creciendo.”",
    img: "https://avatar.vercel.sh/jill",
  },
  {
    name: "Angélica",
    username: "@nutriastuangelica",
    body: "“Siempre dispuesto a sacar lo mejor de cada proceso.”",
    img: "https://avatar.vercel.sh/john",
  },
  {
    name: "Rolong",
    username: "@nutriastuangelica",
    body: "“Un entusiasta con excelentes ideas.”",
    img: "https://avatar.vercel.sh/john",
  },
];

const ReviewCard = ({ img, name, username, body }) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 overflow-hidden px-4 transition-all duration-300 ease-in-out",
        "group-hover:blur-[4px] group-hover:scale-90",
        "hover:blur-none hover:scale-110 "
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <img src={img} alt={`Avatar de ${name}`} width="45" height="45" />
        <figcaption className="flex flex-col">
          <span className="text-lg font-medium text-neutral-100 antialiased">
            {name}
          </span>
          <span className="text-sm text-neutral-400 antialiased">
            {username}
          </span>
        </figcaption>
      </div>
      <blockquote className="text-base text-neutral-200 antialiased">
        {body}
      </blockquote>
    </figure>
  );
};

function Experience() {
  return (
    <>
      <section id="experience" role="region" aria-labelledby="experience-title">
        <div className="py-12 lg:py-20 w-full lg:w-3/4 mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center">
            <div className="w-full lg:w-1/2 mb-10 px-5 text-left">
              <h2 id="experience-title" className="text-2xl text-pink-400 mb-4">
                Experiencia que me respalda
              </h2>
              <p className="text-neutral-200 text-lg mb-10">
                Cada proyecto ha sido un espacio para mejorar prácticas y
                dominar nuevas herramientas.
              </p>
              <ol className="relative border-s border-pink-400 text-left">
                <li className="mb-10 ms-4">
                  <div className="absolute w-2 h-2 bg-pink-400 mt-[8px] -start-1 -ml-[0.8px]"></div>
                  <time className="text-neutral-400 mb-1 text-sm">
                    Febrero 2025
                  </time>
                  <h3 className="text-pink-400 text-lg">
                    Nutricionista Angélica Astudillo
                  </h3>
                  <p className="text-neutral-200 text-base mb-4">
                    E-commerce en Hostinger, con paleta de colores y diseño
                    pensado para el usuario.
                  </p>
                </li>
                <li className="mb-10 ms-4">
                  <div className="absolute w-2 h-2 bg-pink-400 mt-[8px] -start-1 -ml-[0.8px]"></div>
                  <time className="text-neutral-400 mb-1 text-sm">
                    Septiembre 2024
                  </time>
                  <h3 className="text-pink-400 text-lg">Growt Activewear</h3>
                  <p className="text-neutral-200 text-base mb-4">
                    Tienda Shopify con funcionalidades personalizadas y
                    re-branding de identidad visual.
                  </p>
                </li>
                <li className="mb-10 ms-4">
                  <div className="absolute w-2 h-2 bg-pink-400 mt-[8px] -start-1 -ml-[0.8px]"></div>
                  <time className="text-neutral-400 mb-1 text-sm">
                    Abril 2023
                  </time>
                  <h3 className="text-pink-400 text-lg">JUNIOR S.I.G.I</h3>
                  <p className="text-neutral-200 text-base mb-4">
                    Sistema de gestión inteligente con Google Sheets, macros y
                    reportes web automatizados.
                  </p>
                </li>
                <li className="mb-10 ms-4">
                  <div className="absolute w-2 h-2 bg-pink-400 mt-[8px] -start-1 -ml-[0.8px]"></div>
                  <time className="text-neutral-400 mb-1 text-sm">
                    Enero 2021
                  </time>
                  <h3 className="text-pink-400 text-lg">Glopstra</h3>
                  <p className="text-neutral-200 text-base mb-4">
                    Colaboré en proyectos fortaleciendo mis bases en frontend y
                    backend.
                  </p>
                </li>
              </ol>
            </div>
            <div className="w-max lg:w-1/2 h-96 lg:h-screen m-auto pr-4 lg:p-0 skew-y-7 group flex flex-row items-center justify-center overflow-hidden">
              <Marquee
                pauseOnHover
                vertical
                className="group-hover:blur-[4px] group-hover:scale-90 hover:blur-none hover:scale-105 duration-300 transition"
              >
                {[...reviews, ...reviews].map((review, idx) => (
                  <div key={review.username + idx} className="group/card">
                    <ReviewCard {...review} />
                  </div>
                ))}
              </Marquee>
              <Marquee
                pauseOnHover
                vertical
                reverse
                className="group-hover:blur-[4px] group-hover:scale-90 hover:blur-none hover:scale-105 duration-300 transition hidden md:block"
              >
                {[...reviews, ...reviews].map((review, idx) => (
                  <div key={review.username + idx} className="group/card">
                    <ReviewCard {...review} />
                  </div>
                ))}
              </Marquee>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b from-black via-transparent to-transparent"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-black via-transparent to-transparent"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Experience;
