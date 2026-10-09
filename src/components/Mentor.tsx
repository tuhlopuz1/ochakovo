import { AnimatePresence, motion } from "motion/react";
import { Factory } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { MENTORS, type MentorId } from "../data/content";

/* Cartoon portrait for a composite mentor. Blinks and breathes. */
export function MentorAvatar({ id, size = 96, talking = false }: { id: MentorId; size?: number; talking?: boolean }) {
  const { look } = MENTORS[id];
  const hairBack: Record<string, ReactNode> = {
    bob: <path d="M18 52 Q14 14 50 12 Q86 14 82 52 L82 74 Q72 66 70 50 L30 50 Q28 66 18 74 Z" fill={look.hair} />,
    curly: (
      <g fill={look.hair}>
        {[20, 32, 46, 60, 74, 82, 18].map((x, i) => (
          <circle key={i} cx={x} cy={i === 6 ? 46 : 26 + (i % 2) * 4} r="12" />
        ))}
        <circle cx="16" cy="58" r="9" />
        <circle cx="84" cy="58" r="9" />
      </g>
    ),
    bun: <circle cx="50" cy="8" r="11" fill={look.hair} />,
    short: null,
    buzz: null,
  };
  const hairFront: Record<string, ReactNode> = {
    bob: <path d="M24 40 Q30 18 52 18 Q74 18 78 40 Q60 30 44 34 Q32 36 24 40 Z" fill={look.hair} />,
    curly: <path d="M26 38 Q40 22 74 34 Q60 28 26 38 Z" fill={look.hair} />,
    bun: <path d="M22 44 Q24 16 50 16 Q76 16 78 44 Q64 30 50 30 Q36 30 22 44 Z" fill={look.hair} />,
    short: <path d="M22 42 Q22 14 52 14 Q80 16 78 40 Q70 26 46 28 Q32 30 22 42 Z" fill={look.hair} />,
    buzz: <path d="M24 38 Q26 16 50 16 Q74 16 76 38 Q62 28 50 28 Q38 28 24 38 Z" fill={look.hair} opacity="0.85" />,
  };
  return (
    <svg viewBox="0 0 100 110" width={size} height={size * 1.1} role="img" aria-label={MENTORS[id].name} style={{ overflow: "visible" }}>
      <style>{`
        .mt-breathe{animation:mtb 3.2s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
        @keyframes mtb{0%,100%{transform:scale(1,1)}50%{transform:scale(1.015,.985)}}
        .mt-blink{animation:mtk 4.6s infinite;transform-box:fill-box;transform-origin:center}
        @keyframes mtk{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
        .mt-talk{animation:mtt .28s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
        @keyframes mtt{from{transform:scaleY(.4)}to{transform:scaleY(1.1)}}
      `}</style>
      <g className="mt-breathe">
        {/* body */}
        <path d="M14 110 Q16 80 50 78 Q84 80 86 110 Z" fill={look.extra === "coat" ? "#fff" : look.shirt} stroke={look.extra === "coat" ? "var(--line)" : "none"} strokeWidth="3" />
        {look.extra === "coat" && <path d="M50 80 L42 110 M50 80 L58 110" stroke="var(--line)" strokeWidth="3" />}
        <rect x="42" y="66" width="16" height="16" rx="6" fill={look.skin} />
        {hairBack[look.hairStyle]}
        {/* head */}
        <ellipse cx="50" cy="46" rx="28" ry="30" fill={look.skin} />
        <ellipse cx="22" cy="50" rx="5" ry="7" fill={look.skin} />
        <ellipse cx="78" cy="50" rx="5" ry="7" fill={look.skin} />
        {hairFront[look.hairStyle]}
        {/* eyes */}
        <g className="mt-blink">
          <ellipse cx="39" cy="50" rx="4.2" ry="5" fill="#2b2b2b" />
          <ellipse cx="61" cy="50" rx="4.2" ry="5" fill="#2b2b2b" />
          <circle cx="40.5" cy="48.5" r="1.4" fill="#fff" />
          <circle cx="62.5" cy="48.5" r="1.4" fill="#fff" />
        </g>
        <ellipse cx="32" cy="60" rx="5" ry="3" fill="#ff7a8a" opacity="0.35" />
        <ellipse cx="68" cy="60" rx="5" ry="3" fill="#ff7a8a" opacity="0.35" />
        {talking ? <ellipse className="mt-talk" cx="50" cy="64" rx="6" ry="4" fill="#8a2a2a" /> : <path d="M43 62 Q50 68 57 62" stroke="#8a2a2a" strokeWidth="3" strokeLinecap="round" fill="none" />}
        {look.extra === "glasses" && (
          <g fill="none" stroke="#3c3c3c" strokeWidth="2.5">
            <circle cx="39" cy="50" r="9" />
            <circle cx="61" cy="50" r="9" />
            <path d="M48 50 H52" />
          </g>
        )}
        {look.extra === "helmet" && (
          <g>
            <path d="M20 34 Q20 6 50 6 Q80 6 80 34 Z" fill="var(--yellow)" />
            <rect x="14" y="30" width="72" height="8" rx="4" fill="var(--yellow-d)" />
          </g>
        )}
        {look.extra === "headset" && (
          <g>
            <path d="M20 46 Q18 10 50 10 Q82 10 80 46" stroke="#3c3c3c" strokeWidth="4" fill="none" />
            <rect x="14" y="42" width="10" height="16" rx="4" fill="#3c3c3c" />
            <path d="M20 58 Q24 72 40 68" stroke="#3c3c3c" strokeWidth="3" fill="none" />
          </g>
        )}
      </g>
    </svg>
  );
}

/* Mentor briefing card: portrait, name, career path, speech. */
export function MentorCard({ id, text, compact = false }: { id: MentorId; text: ReactNode; compact?: boolean }) {
  const m = MENTORS[id];
  return (
    <div className="flex items-end gap-3">
      <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="shrink-0">
        <MentorAvatar id={id} size={compact ? 64 : 96} talking />
      </motion.div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0, originX: 0, originY: 1 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 24, delay: 0.1 }}
        className="tile relative mb-4 flex-1 px-4 py-3"
      >
        <span className="absolute -left-[10px] bottom-5 h-4 w-4 rotate-45 border-b-2 border-l-2 border-line bg-surface" />
        <div className="text-xs font-black uppercase tracking-wider text-ink-faint">
          {m.name}, {m.role.toLowerCase()}
        </div>
        <div className="mt-1 text-[15px] font-bold leading-snug text-ink">{text}</div>
      </motion.div>
    </div>
  );
}

/* "How Ochakovo does it" card shown after the player's own decision */
export function FactCard({ show, title = "А как это делает «Очаково»", children, color = "var(--green)" }: { show: boolean; title?: string; children: ReactNode; color?: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, rotateX: -60, y: 20 }}
          animate={{ opacity: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformOrigin: "top" }}
          className="overflow-hidden rounded-2xl border-2"
        >
          <div className="flex items-center gap-2 px-4 py-2 text-sm font-black uppercase tracking-wider text-white" style={{ background: color }}>
            <Factory size={18} weight="fill" /> {title}
          </div>
          <div className="bg-surface px-4 py-3 font-semibold leading-snug text-ink" style={{ borderColor: color }}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
