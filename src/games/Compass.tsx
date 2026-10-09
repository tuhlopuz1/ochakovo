import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { Check, X } from "@phosphor-icons/react";
import { useState } from "react";
import { COMPASS, TRACKS, type TrackId } from "../data/content";
import { Mascot } from "../components/Mascot";
import { LessonArt } from "../components/Art";
import { sfx } from "../lib/sfx";
import { useGame } from "../state/store";
import { GameFrame, type GameProps } from "./common";

/* Swipe statements left/right; weights accumulate into a career track. */
export function Compass({ onFinish, onExit }: GameProps) {
  const setTrack = useGame((s) => s.setTrack);
  const unlock = useGame((s) => s.unlock);
  const [i, setI] = useState(0);
  const [scores, setScores] = useState<Partial<Record<TrackId, number>>>({});
  const [phase, setPhase] = useState<"swipe" | "spin" | "result">("swipe");

  const [dir, setDir] = useState(1);
  const answer = (yes: boolean) => {
    if (phase !== "swipe" || i >= COMPASS.length) return;
    sfx(yes ? "pop" : "tap");
    setDir(yes ? 1 : -1);
    const card = COMPASS[i];
    const next = { ...scores };
    if (yes) for (const [k, v] of Object.entries(card.w)) next[k as TrackId] = (next[k as TrackId] ?? 0) + (v as number);
    setScores(next);
    if (i + 1 >= COMPASS.length) {
      setPhase("spin");
      const ranked = rank(next);
      setTrack(ranked[0], next);
      unlock("found");
      window.setTimeout(() => {
        sfx("win");
        setPhase("result");
      }, 1800);
    }
    setI((n) => n + 1);
  };

  const ranked = rank(scores);
  const top = TRACKS[ranked[0]];

  return (
    <GameFrame progress={Math.min(1, i / COMPASS.length)} onExit={onExit} color="var(--purple)">
      {phase === "swipe" && (
        <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center px-4 pb-10 pt-2">
          <h1 className="text-center text-2xl font-black text-ink sm:text-3xl">Это про тебя?</h1>
          <p className="mt-1 text-center font-semibold text-ink-soft">Свайпай вправо, если да, влево, если нет.</p>
          <div className="relative mt-8 h-[340px] w-full max-w-[380px]">
            <AnimatePresence custom={dir}>
              {COMPASS.slice(i, i + 3)
                .map((c, k) => <SwipeCard key={i + k} card={c} depth={k} onSwipe={answer} index={i + k} />)
                .reverse()}
            </AnimatePresence>
          </div>
          <div className="mt-8 flex gap-6">
            <button aria-label="Нет" onClick={() => answer(false)} className="btn3d red h-16 w-16 rounded-full p-0">
              <X size={30} weight="bold" />
            </button>
            <button aria-label="Да" onClick={() => answer(true)} className="btn3d h-16 w-16 rounded-full p-0">
              <Check size={30} weight="bold" />
            </button>
          </div>
        </div>
      )}

      {phase === "spin" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 pb-20">
          <motion.div animate={{ rotate: [0, 720, 1080] }} transition={{ duration: 1.7, ease: [0.2, 0.8, 0.2, 1] }}>
            <LessonArt kind="compass" size={200} />
          </motion.div>
          <div className="text-xl font-black text-ink-soft">Компас ищет твоё направление...</div>
        </div>
      )}

      {phase === "result" && (
        <div className="mx-auto w-full max-w-[880px] px-4 pb-16 pt-2 sm:px-8">
          <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
            <div className="flex justify-center">
              <Mascot size={150} mood="happy" />
            </div>
            <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
              <div className="text-sm font-black uppercase tracking-widest" style={{ color: top.color }}>
                Твоё направление
              </div>
              <h1 className="mt-1 text-3xl font-black leading-tight text-ink sm:text-4xl">{top.title}</h1>
              <p className="mt-3 max-w-[56ch] text-lg font-semibold text-ink-soft">{top.pitch}</p>
            </motion.div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl p-6 text-white" style={{ background: top.color, boxShadow: `0 6px 0 ${top.colorD}` }}>
              <div className="text-lg font-black">Твой обычный день</div>
              <ul className="mt-3 space-y-2">
                {top.day.map((d, k) => (
                  <motion.li key={d} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + k * 0.1 }} className="flex items-start gap-2 font-bold">
                    <Check size={20} weight="bold" className="mt-0.5 shrink-0" /> {d}
                  </motion.li>
                ))}
              </ul>
              <div className="mt-5 rounded-2xl bg-white/20 p-4 font-bold">
                <div className="text-sm uppercase tracking-wider opacity-90">Как зайти</div>
                {top.start}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="tile p-6">
              <div className="text-lg font-black text-ink">Что пригодится</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {top.skills.map((s) => (
                  <span key={s} className="rounded-xl border-2 border-line px-3 py-1.5 text-sm font-extrabold text-ink">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-6 text-lg font-black text-ink">Тебе также подойдёт</div>
              <div className="mt-3 space-y-2">
                {ranked.slice(1, 3).map((id) => (
                  <div key={id} className="flex items-center gap-3 font-extrabold text-ink">
                    <span className="h-4 w-4 rounded-full" style={{ background: TRACKS[id].color }} />
                    {TRACKS[id].title}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          <button className="btn3d purple mt-8 w-full sm:w-auto sm:px-12" onClick={() => onFinish({ stars: 3, stat: `Направление: ${top.short}` })}>
            Забрать результат
          </button>
        </div>
      )}
    </GameFrame>
  );
}

function rank(scores: Partial<Record<TrackId, number>>): TrackId[] {
  return (Object.keys(TRACKS) as TrackId[]).sort((a, b) => (scores[b] ?? 0) - (scores[a] ?? 0));
}

function SwipeCard({ card, depth, onSwipe, index }: { card: (typeof COMPASS)[number]; depth: number; onSwipe: (yes: boolean) => void; index: number }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const yes = useTransform(x, [20, 110], [0, 1]);
  const no = useTransform(x, [-110, -20], [1, 0]);
  const top = depth === 0;
  return (
    <motion.div
      className="absolute inset-0 flex cursor-grab flex-col justify-between rounded-[28px] border-2 border-line bg-surface p-7 active:cursor-grabbing"
      style={{ x: top ? x : 0, rotate: top ? rotate : 0, zIndex: 10 - depth, boxShadow: "0 6px 0 var(--line)" }}
      initial={{ scale: 0.9, y: 30, opacity: 0 }}
      animate={{ scale: 1 - depth * 0.05, y: depth * 14, opacity: 1 }}
      variants={{ out: (d: number) => ({ x: d * 520, opacity: 0, rotate: d * 30, transition: { duration: 0.35 } }) }}
      exit="out"
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      drag={top ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 110 || Math.abs(info.velocity.x) > 600) onSwipe(info.offset.x > 0);
        else animate(x, 0);
      }}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-xl px-3 py-1 text-xs font-black uppercase tracking-widest text-white" style={{ background: card.color }}>
          {card.hint}
        </span>
        <span className="text-sm font-black text-ink-faint">
          {index + 1}/{COMPASS.length}
        </span>
      </div>
      <div className="text-[26px] font-black leading-tight text-ink">{card.text}</div>
      <div className="h-6" />
      {top && (
        <>
          <motion.div style={{ opacity: yes }} className="absolute left-6 top-16 -rotate-12 rounded-xl border-4 border-green px-3 py-1 text-2xl font-black text-green">
            ДА!
          </motion.div>
          <motion.div style={{ opacity: no }} className="absolute right-6 top-16 rotate-12 rounded-xl border-4 border-red px-3 py-1 text-2xl font-black text-red">
            НЕ МОЁ
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
