import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

export const spring = { type: "spring" as const, stiffness: 420, damping: 26 };
export const softSpring = { type: "spring" as const, stiffness: 220, damping: 22 };

/* Duolingo-style progress bar: thick, rounded, with a glossy highlight strip */
export function ProgressBar({ value, color = "var(--green)", height = 16, className = "" }: { value: number; color?: string; height?: number; className?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-line ${className}`} style={{ height }}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: color }}
        initial={false}
        animate={{ width: `${Math.max(v * 100, v > 0 ? 6 : 0)}%` }}
        transition={softSpring}
      >
        <div className="absolute left-2 right-2 top-[22%] h-[26%] rounded-full bg-white/35" />
      </motion.div>
    </div>
  );
}

/* Bottle cap: the in-game currency */
export function CapIcon({ size = 22, className = "" }: { size?: number; className?: string }) {
  const teeth = Array.from({ length: 14 }, (_, i) => {
    const a = (i / 14) * Math.PI * 2;
    return `${12 + Math.cos(a) * 11},${12 + Math.sin(a) * 11}`;
  });
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden>
      <polygon points={teeth.join(" ")} fill="#e5a800" />
      <circle cx="12" cy="12" r="9.2" fill="#ffc800" />
      <circle cx="12" cy="12" r="6.2" fill="#ffd84d" stroke="#e5a800" strokeWidth="1.2" />
      <path d="M9.4 9.2 Q12 7.4 14.6 9.2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.8" />
    </svg>
  );
}

export function FlameIcon({ size = 22, active = true }: { size?: number; active?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path
        d="M12 2c1 4 5 5.5 5 11a5 5 0 0 1-10 0c0-2.4 1-3.6 2-4.6.2 1.6 1 2.6 2 2.6-.6-3 .2-6.2 1-9z"
        fill={active ? "#ff9600" : "var(--line-strong)"}
      />
      <path d="M12 12c.6 1.8 2.6 2.4 2.6 4.6a2.6 2.6 0 0 1-5.2 0c0-1.4.8-2.4 1.6-3 0 .8.4 1.2 1 1.2-.2-1 0-2 0-2.8z" fill={active ? "#ffc800" : "var(--line)"} />
    </svg>
  );
}

export function XpIcon({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d="M13.5 2 5 13.5h6L9.8 22 19 9.8h-6.2z" fill="#ffc800" stroke="#e5a800" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* Animated number, eases toward the target */
export function CountUp({ to, duration = 1.1, className = "" }: { to: number; duration?: number; className?: string }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    const c = animate(mv, to, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => c.stop();
  }, [to, duration, mv]);
  return <motion.span className={className}>{rounded}</motion.span>;
}

/* Canvas confetti burst; fires once on mount */
export function Confetti({ count = 120, origin = { x: 0.5, y: 0.35 } }: { count?: number; origin?: { x: number; y: number } }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
    };
    resize();
    const colors = ["#58cc02", "#1cb0f6", "#ff9600", "#ff4b4b", "#ce82ff", "#ffc800", "#ff86d0"];
    const parts = Array.from({ length: count }, () => {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const sp = 8 + Math.random() * 12;
      return {
        x: origin.x * c.width,
        y: origin.y * c.height,
        vx: Math.cos(a) * sp * dpr,
        vy: Math.sin(a) * sp * dpr,
        r: (4 + Math.random() * 6) * dpr,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.4,
        color: colors[(Math.random() * colors.length) | 0],
        shape: Math.random() > 0.5 ? 0 : 1,
        life: 1,
      };
    });
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      let alive = 0;
      for (const p of parts) {
        p.vy += 0.35 * dpr;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > c.height * 0.7) p.life -= 0.02;
        if (p.life <= 0 || p.y > c.height + 40) continue;
        alive++;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape) ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
        else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r / 2.4, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [count, origin.x, origin.y]);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[70] h-full w-full" aria-hidden />;
}

/* Speech bubble that points to the mascot */
export function Bubble({ children, side = "left", className = "" }: { children: ReactNode; side?: "left" | "bottom"; className?: string }) {
  return (
    <div className={`tile relative px-4 py-3 text-[15px] font-bold leading-snug text-ink ${className}`}>
      {children}
      {side === "left" ? (
        <span className="absolute -left-[10px] top-1/2 h-4 w-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-line bg-surface" />
      ) : (
        <span className="absolute -bottom-[10px] left-10 h-4 w-4 rotate-45 border-b-2 border-r-2 border-line bg-surface" />
      )}
    </div>
  );
}

/* Kinetic headline: words slam in one by one (borrowed from the video-promo vocabulary) */
export function KineticText({ text, className = "", delay = 0, stagger = 0.08 }: { text: string; className?: string; delay?: number; stagger?: number }) {
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {text.split(" ").map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="mr-[0.25em] inline-block"
          initial={{ y: "0.9em", opacity: 0, scale: 0.6, rotate: -6 }}
          animate={{ y: 0, opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 22, delay: delay + i * stagger }}
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}
