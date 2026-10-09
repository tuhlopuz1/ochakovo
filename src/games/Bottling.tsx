import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BOTTLE_INFO, type BottleKind } from "../data/content";
import { Mascot } from "../components/Mascot";
import { sfx } from "../lib/sfx";
import { useGame } from "../state/store";
import { GameFrame, type GameProps } from "./common";

const ROUND = 30; // seconds
const KINDS: BottleKind[] = ["nocap", "low", "label", "crack"];

interface B {
  id: number;
  kind: BottleKind;
  x: number; // 0..1 along the belt
  state: "move" | "picked" | "gone";
}
interface Pop {
  id: number;
  x: number;
  text: string;
  good: boolean;
}

/* Arcade QC: bottles roll along a belt, tap the defective ones, let good ones pass.
   Speed ramps up. Teaches what quality control actually looks for. */
export function Bottling({ onFinish, onExit }: GameProps) {
  const unlock = useGame((s) => s.unlock);
  const [phase, setPhase] = useState<"brief" | "count" | "play" | "end">("brief");
  const [count, setCount] = useState(3);
  const [bottles, setBottles] = useState<B[]>([]);
  const [time, setTime] = useState(ROUND);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [pops, setPops] = useState<Pop[]>([]);
  const [flash, setFlash] = useState(0);
  const stats = useRef({ right: 0, wrong: 0, maxCombo: 0 });
  const ids = useRef(0);
  const comboRef = useRef(0);
  const bRef = useRef<B[]>([]);
  const warned = useRef(new Set<number>());

  /* countdown */
  useEffect(() => {
    if (phase !== "count") return;
    if (count === 0) {
      setPhase("play");
      sfx("win");
      return;
    }
    sfx("tap");
    const t = window.setTimeout(() => setCount((c) => c - 1), 700);
    return () => window.clearTimeout(t);
  }, [phase, count]);

  /* game loop */
  useEffect(() => {
    if (phase !== "play") return;
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;
    let spawnIn = 0.2;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      elapsed += dt;
      const speed = 0.2 + elapsed * 0.006; // belt lengths per second
      spawnIn -= dt;
      const arr = bRef.current;
      for (const b of arr) {
        if (b.state !== "move") continue;
        b.x += speed * dt;
        if (b.x > 1.02) {
          b.state = "gone";
          if (BOTTLE_INFO[b.kind].bad) {
            stats.current.wrong++;
            comboRef.current = 0;
            setCombo(0);
            setFlash((f) => f + 1);
            sfx("bad");
            addPop(0.94, "Брак ушёл!", false);
          } else stats.current.right++;
        }
      }
      bRef.current = arr.filter((b) => b.state !== "gone");
      if (spawnIn <= 0) {
        spawnIn = Math.max(0.5, 1.05 - elapsed * 0.018) * (0.75 + Math.random() * 0.5);
        const bad = Math.random() < 0.42;
        bRef.current.push({ id: ids.current++, kind: bad ? KINDS[(Math.random() * KINDS.length) | 0] : "ok", x: -0.08, state: "move" });
      }
      setBottles(bRef.current.map((b) => ({ ...b })));
      const left = Math.max(0, ROUND - elapsed);
      setTime(left);
      if (left <= 0) {
        setPhase("end");
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const addPop = (x: number, text: string, good: boolean) => {
    const id = ids.current++;
    setPops((p) => [...p, { id, x, text, good }]);
    window.setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 900);
  };

  const tap = (b: B) => {
    if (phase !== "play" || b.state !== "move") return;
    if (BOTTLE_INFO[b.kind].bad) {
      comboRef.current++;
      stats.current.right++;
      stats.current.maxCombo = Math.max(stats.current.maxCombo, comboRef.current);
      const mult = 1 + Math.floor(comboRef.current / 4);
      setScore((s) => s + 10 * mult);
      setCombo(comboRef.current);
      sfx(comboRef.current % 4 === 0 ? "coin" : "good");
      addPop(b.x, `+${10 * mult} ${BOTTLE_INFO[b.kind].name}`, true);
      const live = bRef.current.find((q) => q.id === b.id);
      if (live) live.state = "picked";
      window.setTimeout(() => (bRef.current = bRef.current.filter((q) => q.id !== b.id)), 350);
    } else {
      if (warned.current.has(b.id)) return;
      warned.current.add(b.id);
      stats.current.wrong++;
      comboRef.current = 0;
      setCombo(0);
      setFlash((f) => f + 1);
      sfx("bad");
      addPop(b.x, "Это норма!", false);
    }
  };

  /* finish */
  useEffect(() => {
    if (phase !== "end") return;
    const { right, wrong, maxCombo } = stats.current;
    const acc = right + wrong ? right / (right + wrong) : 0;
    if (acc >= 0.9) unlock("eagle");
    if (maxCombo >= 8) unlock("combo");
    const t = window.setTimeout(() => onFinish({ stars: acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1, stat: `Точность ${Math.round(acc * 100)}% · ${score} очков` }), 900);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  return (
    <GameFrame
      progress={phase === "play" || phase === "end" ? 1 - time / ROUND : 0}
      onExit={onExit}
      color="var(--blue)"
      right={
        <div className="min-w-[64px] text-right text-xl font-black tabular-nums text-blue">
          {phase === "play" ? Math.ceil(time) : ROUND}с
        </div>
      }
    >
      {phase === "brief" && (
        <div className="mx-auto flex w-full max-w-[860px] flex-col px-4 pb-10 pt-4 sm:px-8">
          <h1 className="text-2xl font-black text-ink sm:text-3xl">Ты на смене контроля качества</h1>
          <p className="mt-1 max-w-[60ch] font-semibold text-ink-soft">Жми на бракованные бутылки, чтобы снять их с линии. Нормальные пропускай. Серия без ошибок умножает очки.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {(["ok", ...KINDS] as BottleKind[]).map((k, i) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: 24, rotate: -6 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.08 * i, type: "spring", stiffness: 400, damping: 20 }}
                className="tile flex flex-col items-center gap-2 px-2 pb-3 pt-4"
                style={k === "ok" ? { borderColor: "var(--green)" } : undefined}
              >
                <Bottle kind={k} size={72} />
                <span className="text-sm font-extrabold" style={{ color: k === "ok" ? "var(--green-d)" : "var(--red)" }}>
                  {BOTTLE_INFO[k].name}
                </span>
              </motion.div>
            ))}
          </div>
          <button
            className="btn3d blue mt-8 self-start px-10"
            onClick={() => {
              sfx("tap");
              setPhase("count");
            }}
          >
            Запустить линию
          </button>
        </div>
      )}

      {phase !== "brief" && (
        <div className="mx-auto flex w-full max-w-[1000px] flex-1 flex-col px-4 pt-2 sm:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold uppercase tracking-widest text-ink-faint">Очки</div>
              <motion.div key={score} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="text-4xl font-black tabular-nums text-ink">
                {score}
              </motion.div>
            </div>
            <AnimatePresence>
              {combo >= 2 && (
                <motion.div
                  key={Math.floor(combo / 4)}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: -4 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 12 }}
                  className="rounded-2xl bg-amber px-4 py-2 text-xl font-black text-white"
                  style={{ boxShadow: "0 4px 0 var(--amber-d)" }}
                >
                  Серия {combo} · x{1 + Math.floor(combo / 4)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* belt arena */}
          <motion.div
            key={flash}
            animate={flash ? { x: [0, -8, 8, -5, 5, 0] } : {}}
            transition={{ duration: 0.35 }}
            className="relative mt-8 h-[300px] select-none overflow-hidden rounded-3xl border-2 border-line bg-surface-2 sm:h-[340px]"
          >
            {/* factory backdrop */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-blue-l to-transparent" />
            <div className="absolute left-6 top-6 flex gap-2">
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-3 w-3 rounded-full" style={{ background: ["var(--red)", "var(--yellow)", "var(--green)"][i], animation: `fs-blink 1.2s ${i * 0.2}s steps(1) infinite` }} />
              ))}
            </div>
            {/* belt */}
            <div className="absolute inset-x-0 bottom-14 h-7 overflow-hidden rounded-md bg-[#4b4b4b]">
              <div className="belt-stripes absolute inset-0" style={{ animationPlayState: phase === "play" ? "running" : "paused" }} />
            </div>
            <div className="absolute inset-x-0 bottom-6 flex justify-between px-4">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className="h-8 w-8 rounded-full border-4 border-[#3c3c3c] bg-[#afafaf]" style={{ animation: phase === "play" ? "spin 1s linear infinite" : "none" }} />
              ))}
            </div>
            {/* exit gate */}
            <div className="absolute bottom-14 right-0 top-16 w-3 rounded-l-lg bg-green/70" />

            {bottles.map((b) => (
              <motion.button
                key={b.id}
                onPointerDown={() => tap(b)}
                className="absolute bottom-[78px] -translate-x-1/2 p-2"
                style={{ left: `${b.x * 100}%` }}
                animate={b.state === "picked" ? { y: -160, rotate: 40, scale: 0.4, opacity: 0 } : { y: [0, -3, 0] }}
                transition={b.state === "picked" ? { duration: 0.35, ease: [0.3, 0, 0.6, 1] } : { duration: 0.4, repeat: Infinity }}
                aria-label={`Бутылка: ${BOTTLE_INFO[b.kind].name}`}
              >
                <Bottle kind={b.kind} size={92} />
              </motion.button>
            ))}

            <AnimatePresence>
              {pops.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 0, scale: 0.6 }}
                  animate={{ opacity: 1, y: -50, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none absolute top-1/3 -translate-x-1/2 whitespace-nowrap rounded-xl px-2 py-1 text-sm font-black text-white"
                  style={{ left: `${Math.min(0.88, Math.max(0.12, p.x)) * 100}%`, background: p.good ? "var(--green)" : "var(--red)" }}
                >
                  {p.text}
                </motion.div>
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {phase === "count" && (
                <motion.div key={count} initial={{ scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 18 }} className="absolute inset-0 grid place-items-center text-8xl font-black text-blue">
                  {count || "Старт!"}
                </motion.div>
              )}
              {phase === "end" && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 grid place-items-center bg-surface/70 text-5xl font-black text-ink backdrop-blur-sm">
                  Смена окончена!
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <div className="mt-6 flex items-center gap-3 pb-10">
            <Mascot size={70} mood={combo >= 4 ? "happy" : "think"} />
            <p className="max-w-[48ch] font-bold text-ink-soft">На реальном заводе так работают специалисты ОТК и лаборатории, только с камерами и датчиками.</p>
          </div>
          <style>{`
            .belt-stripes{background:repeating-linear-gradient(90deg,#4b4b4b 0 22px,#5f5f5f 22px 44px);animation:belt 0.6s linear infinite}
            @keyframes belt{from{transform:translateX(-44px)}to{transform:translateX(0)}}
            @keyframes fs-blink{50%{opacity:.25}}
          `}</style>
        </div>
      )}
    </GameFrame>
  );
}

export function Bottle({ kind, size = 60 }: { kind: BottleKind; size?: number }) {
  const low = kind === "low";
  return (
    <svg viewBox="0 0 40 90" width={(size * 40) / 90} height={size} aria-hidden style={{ overflow: "visible" }}>
      <defs>
        <clipPath id={`bt-${kind}`}>
          <path d="M14 4 H26 V22 Q36 28 36 40 V82 Q36 88 30 88 H10 Q4 88 4 82 V40 Q4 28 14 22 Z" />
        </clipPath>
      </defs>
      <path d="M14 4 H26 V22 Q36 28 36 40 V82 Q36 88 30 88 H10 Q4 88 4 82 V40 Q4 28 14 22 Z" fill="#e9dccb" opacity="0.5" />
      <g clipPath={`url(#bt-${kind})`}>
        <rect x="0" y={low ? 56 : 18} width="40" height="80" fill="#a8550c" />
        {low && <rect x="0" y="56" width="40" height="3" fill="#ffd28a" />}
      </g>
      <path d="M14 4 H26 V22 Q36 28 36 40 V82 Q36 88 30 88 H10 Q4 88 4 82 V40 Q4 28 14 22 Z" fill="none" stroke="#5c2c04" strokeWidth="2.5" />
      {kind !== "nocap" && <rect x="11.5" y="0" width="17" height="8" rx="2.5" fill="var(--red)" stroke="var(--red-d)" strokeWidth="1.5" />}
      <g transform={kind === "label" ? "rotate(-16 20 58)" : undefined}>
        <rect x="4" y="48" width="32" height="20" fill="var(--yellow)" stroke="var(--yellow-d)" strokeWidth="1.5" />
        <rect x="9" y="54" width="22" height="3" rx="1.5" fill="var(--red)" />
        <rect x="12" y="60" width="16" height="2.5" rx="1.25" fill="#c86f00" />
      </g>
      {kind === "crack" && <path d="M28 30 L22 40 L28 44 L20 56" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      <path d="M9 36 Q8 52 9 76" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.5" fill="none" />
    </svg>
  );
}
