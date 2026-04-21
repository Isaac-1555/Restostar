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
const STAR_COUNT = 80;
const PUSH_RADIUS = 120;
const PUSH_STRENGTH = 2.5;
const RETURN_SPEED = 0.04;

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const createStar = (w: number, h: number, randomY = false): Star => ({
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 20,
      size: 3 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 0.8,
      vy: -(0.8 + Math.random() * 0.7),
      baseVy: -(0.8 + Math.random() * 0.7),
      opacity: 0.85 + Math.random() * 0.15,
    });

    const initStars = () => {
      starsRef.current = Array.from({ length: STAR_COUNT }, () => createStar(canvas.width, canvas.height, true));
    };
    initStars();

    const handleMouse = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouse);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cursor = cursorRef.current;

      starsRef.current.forEach((star, i) => {
        const dx = star.x - cursor.x;
        const dy = star.y - cursor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < PUSH_RADIUS && dist > 0) {
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
        ctx.shadowBlur = star.size * 6;
        ctx.shadowColor = star.color;
        drawStar(ctx, star.x, star.y, star.size);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(rafRef.current);
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