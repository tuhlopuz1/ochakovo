import { AnimatePresence, motion } from "motion/react";
import { Check, Clock, Compass, Eye, Flask, IdentificationBadge, Lock, Stairs, Star, TreasureChest } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { ALL_LESSONS, UNITS, type LessonKind } from "../data/content";
import { LessonArt } from "../components/Art";
import { Mascot } from "../components/Mascot";
import { sfx } from "../lib/sfx";
import { lessonStatus, useGame } from "../state/store";
import type { Origin } from "./LessonRunner";

const ICON: Record<LessonKind, ComponentType<{ size?: number; weight?: "fill" | "bold"; color?: string }>> = {
  time: Clock,
  brew: Flask,
  bottle: Eye,
  compass: Compass,
  year: Stairs,
  chest: TreasureChest,
  pass: IdentificationBadge,
};
const OFFSETS = [0, 52, 78, 52, 0, -52, -78, -52];

export function PathScreen({ onStart }: { onStart: (lessonId: string, origin: Origin) => void }) {
  const done = useGame((s) => s.done);
  const status = lessonStatus(done);
  const [open, setOpen] = useState<string | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!(e.target as HTMLElement).closest("[data-node]")) setOpen(null);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  let globalIdx = -1;
  return (
    <div className="mx-auto w-full max-w-[600px] px-4 pb-32 pt-4">
      {UNITS.map((unit, ui) => {
        const unitDone = unit.lessons.filter((l) => done[l.id]).length;
        return (
          <section key={unit.id} className="relative mb-6" style={{ zIndex: unit.lessons.some((l) => l.id === open) ? 10 : undefined }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="relative flex items-center justify-between overflow-hidden rounded-2xl px-5 py-4 text-white"
              style={{ background: unit.color, boxShadow: `0 4px 0 ${unit.colorD}` }}
            >
              <div className="relative">
                <div className="text-lg font-black leading-tight">{unit.title}</div>
                <div className="font-bold opacity-90">{unit.sub}</div>
              </div>
              <div className="relative rounded-xl bg-black/15 px-3 py-1.5 text-sm font-black tabular-nums">
                {unitDone}/{unit.lessons.length}
              </div>
            </motion.div>

            <div className="relative flex min-h-[230px] flex-col items-center justify-center gap-7 py-10">
              {/* decorative scene on alternating sides */}
              <div className={`pointer-events-none absolute top-14 hidden opacity-90 sm:block ${ui % 2 ? "left-0" : "right-0"}`}>
                <div className="anim-float">
                  <LessonArt kind={unit.lessons[0].kind} size={130} />
                </div>
              </div>

              {unit.lessons.map((lesson, li) => {
                globalIdx++;
                const idx = globalIdx;
                const st = status(idx);
                const Icon = ICON[lesson.kind];
                const off = OFFSETS[idx % OFFSETS.length];
                const isCurrent = st === "current";
                const isOpen = open === lesson.id;
                const stars = done[lesson.id]?.stars ?? 0;
                const isSpecial = lesson.kind === "chest" || lesson.kind === "pass";
                const fill = st === "locked" ? "var(--line)" : lesson.kind === "chest" && st === "current" ? "var(--amber)" : unit.color;
                const lip = st === "locked" ? "var(--line-strong)" : lesson.kind === "chest" && st === "current" ? "var(--amber-d)" : unit.colorD;
                return (
                  <div key={lesson.id} className="relative" style={{ transform: `translateX(${off}px)`, zIndex: isOpen ? 20 : undefined }} ref={isCurrent ? currentRef : undefined} data-node>
                    {isCurrent && !isOpen && (
                      <motion.div
                        className="absolute -top-12 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl border-2 border-line bg-surface px-3 py-2 text-sm font-black uppercase tracking-wider"
                        style={{ color: unit.color }}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {lesson.kind === "chest" ? "Открой!" : "Начать"}
                        <span className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-line bg-surface" />
                      </motion.div>
                    )}

                    {/* progress ring around the current node */}
                    {isCurrent && (
                      <svg className="pointer-events-none absolute -inset-[10px]" viewBox="0 0 100 100" aria-hidden>
                        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--line)" strokeWidth="7" />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="46"
                          fill="none"
                          stroke={fill}
                          strokeWidth="7"
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 0.25 }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </svg>
                    )}

                    <motion.button
                      aria-label={`${lesson.title}${st === "locked" ? " (закрыто)" : ""}`}
                      onClick={() => {
                        sfx("tap");
                        setOpen(isOpen ? null : lesson.id);
                      }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 500, damping: 18, delay: li * 0.06 }}
                      whileTap={{ y: 6, boxShadow: `0 0 0 ${lip}` }}
                      className={`relative grid h-[72px] w-[78px] place-items-center ${isSpecial ? "rounded-[24px]" : "rounded-full"}`}
                      style={{ background: fill, boxShadow: `0 7px 0 ${lip}` }}
                    >
                      {st === "locked" ? (
                        <Lock size={32} weight="fill" color="var(--ink-faint)" />
                      ) : st === "done" && !isSpecial ? (
                        <Check size={38} weight="bold" color="#fff" />
                      ) : (
                        <Icon size={36} weight="fill" color="#fff" />
                      )}
                      <span className="pointer-events-none absolute left-3 top-2 h-3 w-6 rotate-[-25deg] rounded-full bg-white/30" />
                    </motion.button>

                    {st === "done" && !isSpecial && (
                      <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-0.5">
                        {[1, 2, 3].map((n) => (
                          <Star key={n} size={16} weight="fill" color={n <= stars ? "var(--yellow)" : "var(--line)"} />
                        ))}
                      </div>
                    )}

                    {isCurrent && (
                      <div className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 sm:block ${off >= 0 ? "-left-40" : "-right-40"}`}>
                        <Mascot size={96} mood="idle" equipped />
                      </div>
                    )}

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.85, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -6, transition: { duration: 0.12 } }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="absolute left-1/2 top-[92px] z-20 w-[290px] -translate-x-1/2 rounded-2xl p-4 text-white"
                          style={{ background: st === "locked" ? "var(--surface-2)" : unit.color, transformOrigin: "top center", color: st === "locked" ? "var(--ink-soft)" : "#fff", border: st === "locked" ? "2px solid var(--line)" : "none" }}
                        >
                          <span className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45" style={{ background: st === "locked" ? "var(--surface-2)" : unit.color }} />
                          <div className="relative text-lg font-black">{lesson.title}</div>
                          {st === "locked" ? (
                            <div className="relative mt-1 font-bold">Сначала пройди предыдущие уровни.</div>
                          ) : (
                            <>
                              {lesson.sub && <div className="relative mt-0.5 font-bold opacity-95">{lesson.sub}</div>}
                              <StartButton
                                label={lesson.kind === "chest" ? (st === "done" ? "Уже открыт" : "Открыть") : lesson.kind === "pass" ? "Получить пропуск" : st === "done" ? "Повторить +XP" : `Начать +${lesson.xp} XP`}
                                color={unit.colorD}
                                disabled={lesson.kind === "chest" && st === "done"}
                                onGo={(o) => {
                                  setOpen(null);
                                  onStart(lesson.id, o);
                                }}
                              />
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
      <div className="flex flex-col items-center gap-2 pt-4 text-center font-bold text-ink-faint">
        <span>Все уровни: {ALL_LESSONS.filter((l) => done[l.id]).length} из {ALL_LESSONS.length}</span>
      </div>
    </div>
  );
}

function StartButton({ label, color, onGo, disabled }: { label: string; color: string; onGo: (o: Origin) => void; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className="btn3d relative mt-3 w-full"
      style={{ ["--c" as string]: "#fff", ["--cd" as string]: "rgba(0,0,0,.2)", ["--fg" as string]: color }}
      onClick={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        sfx("whoosh");
        onGo({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
    >
      {label}
    </button>
  );
}
