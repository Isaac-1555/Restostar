import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  baseVy: number;
  opacity: number;
}

const COLORS = ["#B8860B", "#556B2F", "#6B8E23", "#8B8000", "#808000", "#9ACD32"];
const STAR_COUNT = 32;
const PUSH_RADIUS = 120;
const PUSH_RADIUS_SQUARED = PUSH_RADIUS * PUSH_RADIUS;
const PUSH_STRENGTH = 2.5;
const RETURN_SPEED = 0.04;
const FRAME_DURATION_MS = 1000 / 30;

const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
  const spikes = 4;
  const outerRadius = size;
  const innerRadius = size * 0.4;
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
};

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const cursorRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);
  const lastFrameTimeRef = useRef(0);
  const isInViewRef = useRef(true);
  const isDocumentVisibleRef = useRef(
    typeof document === "undefined" ? true : document.visibilityState !== "hidden"
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const section = canvas.parentElement;
    if (!section) return;

    const resize = () => {
      const rect = section.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width));
      canvas.height = Math.max(1, Math.round(rect.height));
      initStars();
    };

    const createStar = (w: number, h: number, randomY = false): Star => ({
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 20,
      size: 2.5 + Math.random() * 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(0.45 + Math.random() * 0.45),
      baseVy: -(0.45 + Math.random() * 0.45),
      opacity: 0.85 + Math.random() * 0.15,
    });

    const initStars = () => {
      starsRef.current = Array.from({ length: STAR_COUNT }, () =>
        createStar(canvas.width, canvas.height, true)
      );
    };
    resize();
    window.addEventListener("resize", resize);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursorRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const resetCursor = () => {
      cursorRef.current = { x: -1000, y: -1000 };
    };

    section.addEventListener("pointermove", handlePointerMove);
    section.addEventListener("pointerleave", resetCursor);

    const stopAnimation = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      lastFrameTimeRef.current = 0;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cursor = cursorRef.current;

      starsRef.current.forEach((star, i) => {
        const dx = star.x - cursor.x;
        const dy = star.y - cursor.y;
        const distanceSquared = dx * dx + dy * dy;

        if (distanceSquared > 0 && distanceSquared < PUSH_RADIUS_SQUARED) {
          const dist = Math.sqrt(distanceSquared);
          const force = (1 - dist / PUSH_RADIUS) * PUSH_STRENGTH;
          star.vx += (dx / dist) * force;
          star.vy += (dy / dist) * force;
        }

        star.vy += (star.baseVy - star.vy) * RETURN_SPEED;
        star.vx *= 0.99;

        star.x += star.vx;
        star.y += star.vy;

        if (star.y < -20 || star.x < -20 || star.x > canvas.width + 20) {
          starsRef.current[i] = createStar(canvas.width, canvas.height, false);
          return;
        }

        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.opacity;
        drawStar(ctx, star.x, star.y, star.size);
        ctx.globalAlpha = 1;
      });
    };

    const tick = (timestamp: number) => {
      if (!isInViewRef.current || !isDocumentVisibleRef.current) {
        stopAnimation();
        return;
      }

      if (
        lastFrameTimeRef.current === 0 ||
        timestamp - lastFrameTimeRef.current >= FRAME_DURATION_MS
      ) {
        lastFrameTimeRef.current = timestamp;
        animate();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const startAnimation = () => {
      if (!rafRef.current && isInViewRef.current && isDocumentVisibleRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = document.visibilityState !== "hidden";
      if (isDocumentVisibleRef.current) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };

    const observer =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              isInViewRef.current = entry.isIntersecting;
              if (entry.isIntersecting) {
                startAnimation();
              } else {
                stopAnimation();
              }
            },
            { threshold: 0.05 }
          );

    observer?.observe(section);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    startAnimation();

    return () => {
      window.removeEventListener("resize", resize);
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", resetCursor);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      observer?.disconnect();
      stopAnimation();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}