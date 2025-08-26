import "@/index.css";
import Hero from "@/views/Hero";
import Projects from "@/views/Projects";
import Experiments from "@/views/Experience";
import Contact from "@/views/Contact";
import Footer from "@/views/Footer";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { Particles } from "./components/magicui/particles";

function App() {
  return (
    <div className="relative">
      <Particles />
      <Hero/>
      <Projects />
      <Experiments />
      <Contact />
      <Footer />
      <SmoothCursor />
    </div>
  );
}

export default App;
