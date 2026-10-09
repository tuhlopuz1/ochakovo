import { AnimatePresence, motion } from "motion/react";
import { Star } from "@phosphor-icons/react";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { FACTS, MENTORS, type ALL_LESSONS } from "../data/content";
import { MentorAvatar } from "../components/Mentor";
import { LessonArt } from "../components/Art";
import { Mascot } from "../components/Mascot";
import { CapIcon, Confetti, CountUp, KineticText, XpIcon } from "../components/ui";
import { sfx } from "../lib/sfx";
import { levelOf, useGame } from "../state/store";
import type { GameProps, GameResult } from "../games/common";
import { History } from "../games/History";
import { Marketing } from "../games/Marketing";
import { Lab } from "../games/Lab";
import { Production } from "../games/Production";
import { Bottling } from "../games/Bottling";
import { Sales } from "../games/Sales";

type LessonWithUnit = (typeof ALL_LESSONS)[number];

const GAMES: Partial<Record<string, ComponentType<GameProps>>> = {
  history: History,
  marketing: Marketing,
  lab: Lab,
  production: Production,
  qc: Bottling,
  sales: Sales,
};

export interface Origin {
  x: number;
  y: number;
}

/* Full-screen lesson overlay. Entry is a circular color wipe out of the tapped node,
   then a "title card" hook (video-promo style kinetic type), then the game. */
export function LessonRunner({ lesson, origin, onClose }: { lesson: LessonWithUnit; origin: Origin; onClose: () => void }) {
  const [stage, setStage] = useState<"intro" | "brief" | "play" | "result">("intro");
  const [result, setResult] = useState<(GameResult & { xp: number; caps: number; first: boolean; levelUp: string | null }) | null>(null);
  const Game = GAMES[lesson.kind]!;

  const finish = (r: GameResult) => {
    const s = useGame.getState();
    const first = !s.done[lesson.id];
    const factor = first ? 1 : 0.4;
    const xp = Math.round((lesson.xp + (r.stars - 1) * 5) * factor);
    const caps = Math.round((lesson.caps + (r.stars === 3 ? 5 : 0)) * factor);
    const before = levelOf(s.xp).index;
    s.completeLesson(lesson.id, { xp: lesson.xp + (r.stars - 1) * 5, caps: lesson.caps + (r.stars === 3 ? 5 : 0), stars: r.stars });
    const after = levelOf(useGame.getState().xp);
    sfx("win");
    if (lesson.artifact) window.setTimeout(() => useGame.getState().addArtifact(lesson.artifact!), 1900);
    setResult({ ...r, xp, caps, first, levelUp: after.index > before ? after.cur.name : null });
    setStage("result");
  };

  const circle = (r: string) => `circle(${r} at ${origin.x}px ${origin.y}px)`;

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-bg"
      initial={{ clipPath: circle("0px") }}
      animate={{ clipPath: circle("150vmax"), transition: { duration: 0.6, ease: [0.7, 0, 0.2, 1] } }}
      exit={{ clipPath: circle("0px"), transition: { duration: 0.45, ease: [0.7, 0, 0.84, 0] } }}
      role="dialog"
      aria-label={lesson.title}
    >
      <AnimatePresence mode="wait">
        {stage === "intro" && (
          <motion.div
            key="intro"
            className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center text-white"
            style={{ background: lesson.unit.color }}
            exit={{ y: "-100%", transition: { duration: 0.45, ease: [0.7, 0, 0.2, 1] } }}
          >
            <IntroBackdrop />
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.35 }} className="relative rounded-full bg-white/95 p-5" style={{ boxShadow: `0 8px 0 ${lesson.unit.colorD}` }}>
              <LessonArt kind={lesson.kind} size={150} />
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ delay: 0.45 }} className="relative mt-8 text-sm font-black uppercase tracking-[0.2em]">
              {lesson.unit.title}
            </motion.div>
            <h1 className="relative mt-2 max-w-[16ch] text-4xl font-black leading-[1.05] sm:text-6xl">
              <KineticText text={lesson.hook} delay={0.55} />
            </h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95 }} className="relative mt-4 max-w-[36ch] text-lg font-bold opacity-95">
              {lesson.sub}
            </motion.p>
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.1, type: "spring", stiffness: 400, damping: 20 }}
              className="btn3d relative mt-10 min-w-[220px]"
              style={{ ["--c" as string]: "#fff", ["--cd" as string]: "rgba(0,0,0,.18)", ["--fg" as string]: lesson.unit.colorD }}
              onClick={() => {
                sfx("whoosh");
                setStage(lesson.mentor ? "brief" : "play");
              }}
            >
              Поехали!
            </motion.button>
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} whileHover={{ opacity: 1 }} transition={{ delay: 1.3 }} onClick={onClose} className="relative mt-5 text-sm font-extrabold uppercase tracking-widest">
              Не сейчас
            </motion.button>
            <motion.div initial={{ y: 200 }} animate={{ y: 0 }} transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 16 }} className="absolute -bottom-6 right-[6%] hidden sm:block">
              <Mascot size={150} mood="wow" equipped />
            </motion.div>
          </motion.div>
        )}

        {stage === "brief" && lesson.mentor && <Brief key="brief" lesson={lesson} onGo={() => (sfx("tap"), setStage("play"))} />}

        {stage === "play" && (
          <motion.div key="play" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            <Game onFinish={finish} onExit={onClose} />
          </motion.div>
        )}

        {stage === "result" && result && <ResultScreen key="result" lesson={lesson} result={result} onClose={onClose} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* Mentor briefing: who you work with this shift and their path inside the company */
function Brief({ lesson, onGo }: { lesson: LessonWithUnit; onGo: () => void }) {
  const m = MENTORS[lesson.mentor!];
  return (
    <motion.div
      key="brief"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-5 py-10"
    >
      <div className="absolute inset-x-0 top-0 h-[34%]" style={{ background: lesson.unit.color, borderRadius: "0 0 50% 50% / 0 0 18% 18%" }} />
      <div className="relative flex w-full max-w-[560px] flex-col items-center text-center">
        <motion.div initial={{ y: 80, scale: 0.6 }} animate={{ y: 0, scale: 1 }} transition={{ delay: 0.25, type: "spring", stiffness: 260, damping: 14 }} className="rounded-full bg-surface p-3" style={{ boxShadow: `0 8px 0 ${lesson.unit.colorD}` }}>
          <MentorAvatar id={m.id} size={150} talking />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-6">
          <div className="text-3xl font-black text-ink">{m.name}</div>
          <div className="font-extrabold" style={{ color: lesson.unit.color }}>
            {m.role}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 22 }} className="tile relative mt-5 w-full p-5 text-left">
          <span className="absolute -top-[10px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-line bg-surface" />
          <p className="text-[17px] font-bold leading-relaxed text-ink">{lesson.brief}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }} className="mt-4 flex w-full items-start gap-3 rounded-2xl bg-surface-2 p-4 text-left">
          <span className="mt-0.5 rounded-lg px-2 py-0.5 text-xs font-black uppercase tracking-wider text-white" style={{ background: lesson.unit.color }}>
            Путь
          </span>
          <span className="font-semibold text-ink-soft">
            {m.path} <span className="text-xs font-bold text-ink-faint">Собирательный образ.</span>
          </span>
        </motion.div>
        <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, type: "spring", stiffness: 400, damping: 20 }} className="btn3d mt-8 w-full" style={{ ["--c" as string]: lesson.unit.color, ["--cd" as string]: lesson.unit.colorD }} onClick={onGo}>
          За работу!
        </motion.button>
      </div>
    </motion.div>
  );
}

/* Floating bubbles behind the title card */
function IntroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{ left: `${(i * 53) % 100}%`, width: 10 + ((i * 7) % 30), height: 10 + ((i * 7) % 30), bottom: -40 }}
          animate={{ y: [0, -900], opacity: [0, 0.25, 0] }}
          transition={{ duration: 5 + (i % 5), repeat: Infinity, delay: (i % 7) * 0.6, ease: "easeOut" }}
        />
      ))}
      <motion.div
        className="absolute -left-1/4 top-0 h-full w-[150%] opacity-[0.07]"
        style={{ background: "repeating-linear-gradient(115deg,#fff 0 40px,transparent 40px 120px)" }}
        animate={{ x: [0, 120] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function ResultScreen({ lesson, result, onClose }: { lesson: LessonWithUnit; result: GameResult & { xp: number; caps: number; first: boolean; levelUp: string | null }; onClose: () => void }) {
  const fact = FACTS[lesson.kind];
  useEffect(() => {
    const ts = Array.from({ length: result.stars }, (_, i) => window.setTimeout(() => sfx("pop"), 550 + (i + 1) * 180));
    const c = window.setTimeout(() => sfx("coin"), 1000);
    return () => [...ts, c].forEach((t) => window.clearTimeout(t));
  }, [result.stars]);
  return (
    <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-[100dvh] flex-col items-center px-4 pb-10 pt-10 text-center">
      <Confetti />
      <Mascot size={150} mood="happy" equipped />
      <h1 className="mt-4 text-3xl font-black sm:text-4xl" style={{ color: lesson.unit.color }}>
        <KineticText text={result.first ? "Уровень пройден!" : "Отличный повтор!"} />
      </h1>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3].map((n) => (
          <motion.div key={n} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4 + n * 0.18, type: "spring", stiffness: 500, damping: 12 }}>
            <Star size={48} weight="fill" color={n <= result.stars ? "var(--yellow)" : "var(--line)"} />
          </motion.div>
        ))}
      </div>
      {result.stat && <div className="mt-2 font-bold text-ink-soft">{result.stat}</div>}

      <div className="mt-8 grid w-full max-w-[520px] grid-cols-2 gap-3">
        <StatTile color="var(--yellow)" label="Опыт" delay={0.9}>
          <XpIcon size={26} /> <CountUp to={result.xp} />
        </StatTile>
        <StatTile color="var(--amber)" label="Крышечки" delay={1.05}>
          <CapIcon size={26} /> <CountUp to={result.caps} />
        </StatTile>
      </div>

      {result.levelUp && (
        <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.3, type: "spring", stiffness: 300, damping: 14 }} className="mt-4 w-full max-w-[520px] rounded-2xl bg-purple px-5 py-3 font-black text-white" style={{ boxShadow: "0 4px 0 var(--purple-d)" }}>
          Новый уровень: {result.levelUp}!
        </motion.div>
      )}

      {fact && result.first && (
        <motion.div initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 18 }} className="tile mt-4 w-full max-w-[520px] p-5 text-left">
          <div className="text-xs font-black uppercase tracking-widest" style={{ color: fact.color }}>
            Новая карточка в коллекции
          </div>
          <div className="mt-1 text-xl font-black text-ink">{fact.title}</div>
          <p className="mt-1 font-semibold text-ink-soft">{fact.text}</p>
        </motion.div>
      )}

      <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.7 }} className="btn3d mt-8 w-full max-w-[520px]" onClick={onClose}>
        Продолжить
      </motion.button>
    </motion.div>
  );
}

function StatTile({ color, label, delay, children }: { color: string; label: string; delay: number; children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: "spring", stiffness: 300, damping: 18 }} className="overflow-hidden rounded-2xl border-2" style={{ borderColor: color, background: color }}>
      <div className="py-1 text-xs font-black uppercase tracking-widest text-white">{label}</div>
      <div className="flex items-center justify-center gap-2 rounded-t-xl bg-surface py-3 text-2xl font-black text-ink">{children}</div>
    </motion.div>
  );
}
