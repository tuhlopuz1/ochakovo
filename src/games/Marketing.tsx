import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { Check, X } from "@phosphor-icons/react";
import { useState } from "react";
import { CONCEPTS, INSIGHTS, LABEL_COLORS, NAME_IDEAS, type Concept, type Tag } from "../data/content";
import { FactCard, MentorCard } from "../components/Mentor";
import { DrinkBottle } from "../components/Collect";
import { sfx } from "../lib/sfx";
import { freshDrink, useGame } from "../state/store";
import { GameFrame, type GameProps } from "./common";

const TAG_NAME: Record<Tag, string> = { classic: "традиции", novel: "новизна", health: "польза", natural: "натуральность" };

function fitOf(c: Concept, kept: Tag[]) {
  if (!kept.length) return 0.5;
  return kept.filter((t) => c.tags.includes(t)).length / kept.length;
}

/* Shift 1: swipe research insights -> pick a concept that matches them -> name & label. */
export function Marketing({ onFinish, onExit }: GameProps) {
  const { setDrink, setSkill, unlock, name: owner } = useGame();
  const [step, setStep] = useState<"research" | "concept" | "name">("research");
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [kept, setKept] = useState<Tag[]>([]);
  const [concept, setConcept] = useState<Concept | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(LABEL_COLORS[0]);

  const swipe = (yes: boolean) => {
    if (i >= INSIGHTS.length) return;
    sfx(yes ? "pop" : "tap");
    setDir(yes ? 1 : -1);
    if (yes) setKept((k) => [...k, INSIGHTS[i].tag]);
    if (i + 1 >= INSIGHTS.length) window.setTimeout(() => setStep("concept"), 450);
    setI(i + 1);
  };

  const finish = () => {
    if (!concept) return;
    const fit = fitOf(concept, kept);
    setDrink({ ...freshDrink(), concept: concept.id, fit, name: name.trim() || NAME_IDEAS[concept.id][0], labelColor: color });
    setSkill("creative", 0.35 + fit * 0.65);
    if (fit >= 0.99) unlock("insight");
    onFinish({ stars: fit >= 0.75 ? 3 : fit >= 0.45 ? 2 : 1, stat: `Попадание в аудиторию ${Math.round(fit * 100)}%` });
  };

  const progress = step === "research" ? (i / INSIGHTS.length) * 0.4 : step === "concept" ? 0.4 + (concept ? 0.3 : 0) : 0.85;

  return (
    <GameFrame progress={progress} onExit={onExit} color="var(--red)">
      <div className="mx-auto w-full max-w-[980px] px-4 pb-16 pt-2 sm:px-8">
        {step === "research" && (
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <h1 className="text-2xl font-black text-ink sm:text-3xl">Что важно покупателям?</h1>
              <p className="mt-1 font-semibold text-ink-soft">Это выдержки из интервью. Вправо: это важно для нашего продукта. Влево: не про нас.</p>
              <div className="mt-6">
                <MentorCard id="brand" text="Не пытайся угодить всем. Выбери то, во что сам веришь: от этого зависит концепт." compact />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {kept.map((t, k) => (
                  <motion.span key={k} initial={{ scale: 0 }} animate={{ scale: 1 }} className="rounded-xl bg-red px-3 py-1 text-sm font-black text-white">
                    {TAG_NAME[t]}
                  </motion.span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="relative h-[300px] w-full max-w-[360px]">
                <AnimatePresence custom={dir}>
                  {INSIGHTS.slice(i, i + 3)
                    .map((ins, k) => <Card key={i + k} text={ins.text} n={i + k + 1} depth={k} onSwipe={swipe} />)
                    .reverse()}
                </AnimatePresence>
              </div>
              <div className="mt-6 flex gap-6">
                <button aria-label="Не про нас" onClick={() => swipe(false)} className="btn3d red h-16 w-16 rounded-full p-0">
                  <X size={30} weight="bold" />
                </button>
                <button aria-label="Важно" onClick={() => swipe(true)} className="btn3d h-16 w-16 rounded-full p-0">
                  <Check size={30} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === "concept" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-black text-ink sm:text-3xl">Выбери концепт</h1>
            <p className="mt-1 font-semibold text-ink-soft">Шкала показывает, насколько концепт отвечает тому, что ты счёл важным.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {CONCEPTS.map((c, k) => {
                const fit = fitOf(c, kept);
                const on = concept?.id === c.id;
                return (
                  <motion.button
                    key={c.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: k * 0.06 }}
                    onClick={() => {
                      sfx("good");
                      setConcept(c);
                    }}
                    className="tile tile-press flex gap-4 p-4 text-left"
                    style={on ? { borderColor: "var(--blue)", background: "var(--blue-l)", boxShadow: "0 4px 0 var(--blue)" } : undefined}
                  >
                    <span className="h-16 w-10 shrink-0 rounded-xl" style={{ background: c.liquid, boxShadow: "inset 0 -8px 0 rgba(0,0,0,.15)" }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-lg font-black leading-tight text-ink">{c.name}</span>
                      <span className="block text-sm font-semibold text-ink-soft">{c.desc}</span>
                      <span className="mt-2 flex flex-wrap gap-1">
                        {c.tags.map((t) => (
                          <span key={t} className="rounded-lg px-2 py-0.5 text-xs font-black" style={{ background: kept.includes(t) ? "var(--red)" : "var(--surface-2)", color: kept.includes(t) ? "#fff" : "var(--ink-soft)" }}>
                            {TAG_NAME[t]}
                          </span>
                        ))}
                      </span>
                      <span className="mt-2 flex items-center gap-2">
                        <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
                          <motion.span className="block h-full rounded-full bg-red" initial={{ width: 0 }} animate={{ width: `${fit * 100}%` }} transition={{ delay: 0.3 + k * 0.08, type: "spring", stiffness: 120, damping: 18 }} />
                        </span>
                        <span className="w-10 text-right text-xs font-black text-ink-soft">{Math.round(fit * 100)}%</span>
                      </span>
                    </span>
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-5">
              <FactCard show={!!concept} color="var(--red)">
                {concept?.analog}
              </FactCard>
            </div>
            <button disabled={!concept} className="btn3d red mt-6 w-full sm:w-auto sm:px-12" onClick={() => (sfx("tap"), setStep("name"))}>
              Беру этот концепт
            </button>
          </motion.div>
        )}

        {step === "name" && concept && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <h1 className="text-2xl font-black text-ink sm:text-3xl">Как назовём?</h1>
              <p className="mt-1 font-semibold text-ink-soft">Название и цвет этикетки. Бутылку с ней ты получишь в финале.</p>
              <label htmlFor="drink-name" className="mt-6 block font-extrabold text-ink">
                Название напитка
              </label>
              <input
                id="drink-name"
                maxLength={22}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={NAME_IDEAS[concept.id][0]}
                className="mt-2 w-full rounded-2xl border-2 border-line bg-surface-2 px-5 py-4 text-xl font-extrabold text-ink outline-none focus:border-blue focus:bg-surface"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {NAME_IDEAS[concept.id].map((n) => (
                  <button key={n} onClick={() => (sfx("tap"), setName(n))} className="rounded-xl border-2 border-line px-3 py-1.5 text-sm font-extrabold text-ink-soft hover:border-blue hover:text-blue">
                    {n}
                  </button>
                ))}
              </div>
              <div className="mt-6 font-extrabold text-ink">Цвет этикетки</div>
              <div className="mt-2 flex gap-3">
                {LABEL_COLORS.map((c) => (
                  <motion.button
                    key={c}
                    aria-label={`Цвет ${c}`}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => (sfx("pop"), setColor(c))}
                    className="h-11 w-11 rounded-full"
                    style={{ background: c, boxShadow: color === c ? `0 0 0 4px var(--bg), 0 0 0 7px ${c}` : "none" }}
                  />
                ))}
              </div>
              <button className="btn3d red mt-8 w-full sm:w-auto sm:px-12" onClick={finish}>
                Утвердить концепт
              </button>
            </div>
            <motion.div key={color + name} initial={{ rotate: -6, scale: 0.95 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 12 }} className="justify-self-center">
              <DrinkBottle drink={{ ...freshDrink(), concept: concept.id, name: name || NAME_IDEAS[concept.id][0], labelColor: color }} owner={owner} size={300} />
            </motion.div>
          </motion.div>
        )}
      </div>
    </GameFrame>
  );
}

function Card({ text, n, depth, onSwipe }: { text: string; n: number; depth: number; onSwipe: (yes: boolean) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-16, 16]);
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
        <span className="rounded-xl bg-red px-3 py-1 text-xs font-black uppercase tracking-widest text-white">Интервью</span>
        <span className="text-sm font-black text-ink-faint">
          {n}/{INSIGHTS.length}
        </span>
      </div>
      <div className="text-[24px] font-black leading-tight text-ink">«{text}»</div>
      <div className="h-4" />
      {top && (
        <>
          <motion.div style={{ opacity: yes }} className="absolute left-6 top-16 -rotate-12 rounded-xl border-4 border-green px-3 py-1 text-xl font-black text-green">
            ВАЖНО
          </motion.div>
          <motion.div style={{ opacity: no }} className="absolute right-6 top-16 rotate-12 rounded-xl border-4 border-red px-3 py-1 text-xl font-black text-red">
            НЕ ПРО НАС
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
