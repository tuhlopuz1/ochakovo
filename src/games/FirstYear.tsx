import { AnimatePresence, motion } from "motion/react";
import { Lightning, UsersThree, Wrench } from "@phosphor-icons/react";
import { useState } from "react";
import { FIRST_YEAR, YEAR_OUTCOMES } from "../data/content";
import { Mascot } from "../components/Mascot";
import { Bubble, Confetti } from "../components/ui";
import { sfx } from "../lib/sfx";
import { useGame } from "../state/store";
import { GameFrame, type GameProps } from "./common";

type Stat = "skill" | "team" | "drive";
const STAT_META: Record<Stat, { name: string; color: string; Icon: typeof Wrench }> = {
  skill: { name: "Навыки", color: "var(--blue)", Icon: Wrench },
  team: { name: "Команда", color: "var(--green)", Icon: UsersThree },
  drive: { name: "Инициатива", color: "var(--amber)", Icon: Lightning },
};
const MAX = 9;

/* Choose-your-path story: every option is valid, they just grow different stats.
   Shows the real growth levers: mentorship, training, rotation, own projects. */
export function FirstYear({ onFinish, onExit }: GameProps) {
  const setYearOutcome = useGame((s) => s.setYearOutcome);
  const [scene, setScene] = useState(0);
  const [stats, setStats] = useState<Record<Stat, number>>({ skill: 1, team: 1, drive: 1 });
  const [picked, setPicked] = useState<number | null>(null);
  const [gain, setGain] = useState<Record<Stat, number> | null>(null);
  const [done, setDone] = useState(false);

  const s = FIRST_YEAR[scene];

  const pick = (k: number) => {
    if (picked !== null) return;
    sfx("good");
    setPicked(k);
    const g = s.choices[k].stats;
    setGain(g);
    setStats((p) => ({ skill: p.skill + g.skill, team: p.team + g.team, drive: p.drive + g.drive }));
  };

  const next = () => {
    sfx("tap");
    setPicked(null);
    setGain(null);
    if (scene + 1 >= FIRST_YEAR.length) {
      const best = (Object.keys(stats) as Stat[]).sort((a, b) => stats[b] - stats[a])[0];
      setYearOutcome(best);
      sfx("win");
      setDone(true);
      return;
    }
    setScene((n) => n + 1);
  };

  const best = (Object.keys(stats) as Stat[]).sort((a, b) => stats[b] - stats[a])[0];

  return (
    <GameFrame progress={done ? 1 : (scene + (picked !== null ? 1 : 0)) / FIRST_YEAR.length} onExit={onExit} color="var(--pink)">
      <div className="mx-auto grid w-full max-w-[1000px] flex-1 gap-8 px-4 pb-16 pt-2 sm:px-8 md:grid-cols-[1fr_280px]">
        <div>
          {!done ? (
            <AnimatePresence mode="wait">
              <motion.div key={scene} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: "spring", stiffness: 340, damping: 30 }}>
                {/* calendar flip */}
                <motion.div
                  initial={{ rotateX: -90 }}
                  animate={{ rotateX: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                  className="inline-flex flex-col overflow-hidden rounded-2xl border-2 border-line text-center"
                  style={{ transformOrigin: "top" }}
                >
                  <span className="bg-red px-4 py-1 text-xs font-black uppercase tracking-widest text-white">{s.month}</span>
                  <span className="bg-surface px-4 py-1 text-lg font-black text-ink">{s.title}</span>
                </motion.div>
                <div className="mt-5 flex items-end gap-3">
                  <Mascot size={96} mood={picked !== null ? "happy" : "think"} equipped />
                  <Bubble className="mb-6 flex-1">{s.story}</Bubble>
                </div>
                <div className="mt-6 grid gap-3">
                  {s.choices.map((c, k) => {
                    const isPicked = picked === k;
                    const dim = picked !== null && !isPicked;
                    return (
                      <motion.button
                        key={k}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: dim ? 0.45 : 1, x: 0, scale: isPicked ? 1.02 : 1 }}
                        transition={{ delay: picked === null ? 0.15 + k * 0.07 : 0, type: "spring", stiffness: 400, damping: 26 }}
                        onClick={() => pick(k)}
                        disabled={picked !== null}
                        className="tile tile-press px-5 py-4 text-left text-[17px] font-extrabold text-ink"
                        style={isPicked ? { borderColor: "var(--blue)", background: "var(--blue-l)", boxShadow: "0 4px 0 var(--blue)" } : undefined}
                      >
                        {c.text}
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {picked !== null && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-5 flex flex-col gap-4 rounded-3xl bg-blue-l p-5 sm:flex-row sm:items-center">
                      <p className="flex-1 font-bold text-ink">{s.choices[picked].result}</p>
                      <button className="btn3d blue" onClick={next}>
                        {scene + 1 >= FIRST_YEAR.length ? "Итоги года" : "Дальше"}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}>
              <Confetti />
              <div className="flex flex-col items-center text-center">
                <Mascot size={150} mood="happy" equipped />
                <div className="mt-4 text-sm font-black uppercase tracking-widest" style={{ color: STAT_META[best].color }}>
                  Итоги первого года
                </div>
                <h1 className="mt-1 text-3xl font-black text-ink sm:text-4xl">{YEAR_OUTCOMES[best].title}</h1>
                <p className="mt-3 max-w-[48ch] text-lg font-semibold text-ink-soft">{YEAR_OUTCOMES[best].text}</p>
                <button className="btn3d mt-8 px-12" onClick={() => onFinish({ stars: 3, stat: YEAR_OUTCOMES[best].title })}>
                  Продолжить
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* live stats */}
        <aside className="tile h-fit p-5 md:sticky md:top-6">
          <div className="text-lg font-black text-ink">Твой рост</div>
          <div className="mt-4 space-y-4">
            {(Object.keys(STAT_META) as Stat[]).map((k) => {
              const m = STAT_META[k];
              return (
                <div key={k}>
                  <div className="mb-1 flex items-center justify-between font-extrabold text-ink">
                    <span className="flex items-center gap-2">
                      <m.Icon size={20} weight="fill" color={m.color} /> {m.name}
                    </span>
                    <span className="relative tabular-nums">
                      {stats[k]}
                      <AnimatePresence>
                        {gain && gain[k] > 0 && (
                          <motion.span key={scene} initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -18 }} exit={{ opacity: 0 }} className="absolute -right-6 top-0 text-sm font-black" style={{ color: m.color }}>
                            +{gain[k]}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-line">
                    <motion.div className="h-full rounded-full" style={{ background: m.color }} animate={{ width: `${Math.min(1, stats[k] / MAX) * 100}%` }} transition={{ type: "spring", stiffness: 200, damping: 20 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </GameFrame>
  );
}
