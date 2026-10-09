import { AnimatePresence, LayoutGroup, motion, useAnimationControls } from "motion/react";
import { Plus } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { HISTORY, type HistoryEvent } from "../data/content";
import { Mascot } from "../components/Mascot";
import { sfx } from "../lib/sfx";
import { useGame } from "../state/store";
import { FeedbackSheet, GameFrame, type GameProps } from "./common";

/* "Timeline" party-game mechanic: place each event card into the right gap
   of a growing timeline. No multiple choice, you reason about order. */
export function TimeMachine({ onFinish, onExit }: GameProps) {
  const unlock = useGame((s) => s.unlock);
  const queue0 = useMemo(() => {
    const rest = HISTORY.slice(1);
    // keep "Сейчас" last, shuffle the middle so it's a real puzzle
    const mid = rest.slice(0, -1).sort(() => Math.random() - 0.5);
    return [...mid, rest[rest.length - 1]];
  }, []);
  const [placed, setPlaced] = useState<(HistoryEvent & { wrong?: boolean })[]>([HISTORY[0]]);
  const [queue, setQueue] = useState(queue0);
  const [feedback, setFeedback] = useState<null | { ok: boolean; ev: HistoryEvent }>(null);
  const [mistakes, setMistakes] = useState(0);
  const [wrongSlot, setWrongSlot] = useState<number | null>(null);
  const cardCtl = useAnimationControls();

  const current = queue[0];
  const total = HISTORY.length - 1;
  const progress = (total - queue.length + (feedback ? 1 : 0)) / total;

  const place = async (slot: number) => {
    if (!current || feedback) return;
    const before = placed[slot - 1];
    const after = placed[slot];
    const ok = (!before || before.year <= current.year) && (!after || current.year <= after.year);
    if (!ok) {
      sfx("bad");
      setWrongSlot(slot);
      setMistakes((m) => m + 1);
      await cardCtl.start({ x: [0, -12, 12, -8, 8, 0], transition: { duration: 0.4 } });
      setWrongSlot(null);
    } else sfx("good");
    const next = [...placed, { ...current, wrong: !ok }].sort((a, b) => a.year - b.year);
    setPlaced(next);
    setQueue((q) => q.slice(1));
    setFeedback({ ok, ev: current });
  };

  const next = () => {
    sfx("tap");
    setFeedback(null);
    if (queue.length === 0) {
      if (mistakes === 0) unlock("historian");
      onFinish({ stars: mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1, stat: mistakes === 0 ? "Без единой ошибки" : `Ошибок: ${mistakes}` });
    }
  };

  return (
    <GameFrame progress={progress} onExit={onExit}>
      <div className="mx-auto grid w-full max-w-[1000px] flex-1 gap-6 px-4 pb-48 pt-4 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-10">
        {/* left: the card to place */}
        <div className="md:sticky md:top-6 md:self-start">
          <h1 className="text-2xl font-black text-ink sm:text-3xl">Расставь события по порядку</h1>
          <p className="mt-1 font-semibold text-ink-soft">Нажми на щель в ленте времени, куда встаёт карточка.</p>
          <div className="mt-6 flex items-end gap-3">
            <Mascot size={92} mood={feedback ? (feedback.ok ? "happy" : "sad") : "think"} />
            <div className="relative min-h-[132px] flex-1">
              <AnimatePresence mode="popLayout">
                {current && !feedback && (
                  <motion.div
                    key={current.year}
                    initial={{ opacity: 0, y: 30, rotate: -6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, rotate: -2, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6, y: 40, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  >
                    <motion.div animate={cardCtl} className="tile bg-surface p-5" style={{ boxShadow: "0 6px 0 var(--green-d)", borderColor: "var(--green)" }}>
                      <div className="text-xs font-black uppercase tracking-widest text-green">Какой это год?</div>
                      <div className="mt-1 text-2xl font-black leading-tight text-ink">{current.title}</div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* right: the timeline */}
        <LayoutGroup>
          <div className="relative pl-8">
            <div className="absolute bottom-4 left-[14px] top-4 w-1.5 rounded-full bg-line" />
            <Slot index={0} active={!!current && !feedback} wrong={wrongSlot === 0} onPick={place} />
            {placed.map((ev, i) => (
              <div key={ev.year}>
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8, x: -20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  className="relative my-1"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 600, damping: 14, delay: 0.15 }}
                    className="absolute -left-[30px] top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-4 border-surface"
                    style={{ background: ev.wrong ? "var(--red)" : "var(--green)" }}
                  />
                  <div className="tile flex items-center gap-3 px-4 py-3">
                    <motion.span
                      initial={{ rotateX: 90 }}
                      animate={{ rotateX: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 18 }}
                      className="rounded-xl px-2.5 py-1 text-sm font-black text-white"
                      style={{ background: ev.wrong ? "var(--red)" : "var(--green)" }}
                    >
                      {ev.label}
                    </motion.span>
                    <span className="font-extrabold text-ink">{ev.title}</span>
                  </div>
                </motion.div>
                <Slot index={i + 1} active={!!current && !feedback} wrong={wrongSlot === i + 1} onPick={place} />
              </div>
            ))}
          </div>
        </LayoutGroup>
      </div>

      <FeedbackSheet
        state={feedback ? (feedback.ok ? "good" : "bad") : null}
        title={feedback?.ok ? `Точно! ${feedback.ev.label}` : `Это был ${feedback?.ev.label}`}
        text={feedback?.ev.fact}
        onNext={next}
        nextLabel={queue.length === 0 ? "Финиш" : "Дальше"}
      />
    </GameFrame>
  );
}

function Slot({ index, active, wrong, onPick }: { index: number; active: boolean; wrong: boolean; onPick: (i: number) => void }) {
  return (
    <motion.div layout className="relative">
      <AnimatePresence initial={false}>
        {active && (
          <motion.button
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 44, opacity: 1, x: wrong ? [0, -8, 8, -6, 6, 0] : 0 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={() => onPick(index)}
            className="group my-1 flex w-full items-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed px-4 text-sm font-extrabold transition-colors hover:bg-green-l"
            style={{ borderColor: wrong ? "var(--red)" : "var(--line-strong)", color: wrong ? "var(--red)" : "var(--ink-faint)" }}
          >
            <Plus size={16} weight="bold" className="transition-transform group-hover:rotate-90" />
            Сюда
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
