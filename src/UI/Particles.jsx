import { useEffect, useRef } from "react";
import { Camera, Geometry, Mesh, Program, Renderer } from "ogl";

const defaultColors = ["#ffffff"];

function hexToRgb(hex) {
  let normalized = hex.replace(/^#/, "");

  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((character) => character + character)
      .join("");
  }

  const int = Number.parseInt(normalized, 16);
  return [
    ((int >> 16) & 255) / 255,
    ((int >> 8) & 255) / 255,
    (int & 255) / 255,
  ];
}

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  
  uniform float uTime;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    float circle = smoothstep(0.5, 0.38, d) * 0.78;
    gl_FragColor = vec4(
      vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28),
      circle
    );
  }
`;

const Particles = ({
  particleCount = 90,
  particleSpread = 10,
  speed = 0.08,
  particleColors,
  particleHoverFactor = 0.35,
  particleBaseSize = 180,
  sizeRandomness = 1,
  cameraDistance = 44,
  pixelRatio = "auto",
  className,
}) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const prefersReducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactViewport = window.matchMedia("(max-width: 767px)").matches;
    const canTrackPointer =
      !prefersReducedMotion &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const resolvedPixelRatio =
      pixelRatio === "auto"
        ? Math.min(window.devicePixelRatio || 1, compactViewport ? 1 : 1.25)
        : pixelRatio;

    const renderer = new Renderer({
      dpr: resolvedPixelRatio,
      depth: false,
      alpha: true,
    });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, cameraDistance);

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };
    window.addEventListener("resize", resize, false);
    resize();

    const handlePointerMove = (event) => {
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      const x = (event.clientX / width) * 2 - 1;
      const y = -((event.clientY / height) * 2 - 1);
      mouseRef.current = { x, y };
    };

    const handlePointerLeave = () => {
      mouseRef.current = { x: 0, y: 0 };
    };

    if (canTrackPointer) {
      window.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      window.addEventListener("pointerleave", handlePointerLeave, {
        passive: true,
      });
    }

    const count = compactViewport
      ? Math.max(36, Math.round(particleCount * 0.62))
      : particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = particleColors && particleColors.length > 0 ? particleColors : defaultColors;

    for (let i = 0; i < count; i++) {
      let x, y, z, len;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);
      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: particleSpread },
        uBaseSize: { value: particleBaseSize * resolvedPixelRatio },
        uSizeRandomness: { value: sizeRandomness },
      },
      transparent: true,
      depthTest: false,
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let animationFrameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let isRunning = false;
    let isInView = true;
    const currentMouse = { x: 0, y: 0 };

    const update = (time) => {
      animationFrameId = requestAnimationFrame(update);
      const delta = time - lastTime;
      lastTime = time;
      elapsed += prefersReducedMotion ? 0 : delta * speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      currentMouse.x += (mouseRef.current.x - currentMouse.x) * 0.08;
      currentMouse.y += (mouseRef.current.y - currentMouse.y) * 0.08;

      particles.position.x = canTrackPointer
        ? -currentMouse.x * particleHoverFactor
        : 0;
      particles.position.y = canTrackPointer
        ? currentMouse.y * particleHoverFactor * 0.72
        : 0;

      if (!prefersReducedMotion) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * speed;
      }

      renderer.render({ scene: particles, camera });
    };

    const start = () => {
      if (isRunning || prefersReducedMotion || document.hidden || !isInView) {
        return;
      }

      isRunning = true;
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(update);
    };

    const stop = () => {
      if (!isRunning) {
        return;
      }

      cancelAnimationFrame(animationFrameId);
      isRunning = false;
    };

    const syncPlayback = () => {
      if (document.hidden || !isInView) {
        stop();
        return;
      }

      start();
    };

    const handleVisibilityChange = () => {
      syncPlayback();
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInView = entry?.isIntersecting ?? true;
        syncPlayback();
      },
      {
        rootMargin: "18% 0px 18% 0px",
        threshold: 0.08,
      },
    );
    intersectionObserver.observe(container);

    if (prefersReducedMotion) {
      renderer.render({ scene: particles, camera });
    } else {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      start();
    }

    return () => {
      intersectionObserver.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (canTrackPointer) {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
      }

      stop();

      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
      }

      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [
    particleCount,
    particleColors,
    particleSpread,
    speed,
    particleHoverFactor,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    pixelRatio,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${className ?? ""}`}
    />
  );
};

export default Particles;
