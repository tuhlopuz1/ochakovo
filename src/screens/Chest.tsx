import { AnimatePresence, motion, useAnimationControls } from "motion/react";
import { useState } from "react";
import { CapIcon, Confetti, CountUp } from "../components/ui";
import { sfx } from "../lib/sfx";
import { useGame } from "../state/store";

const REWARDS = [15, 15, 20, 20, 25, 30, 40];

/* Variable reward: three taps to crack it open, random cap amount inside. */
export function Chest({ id, onClose }: { id: string; onClose: () => void }) {
  const [taps, setTaps] = useState(0);
  const [reward] = useState(() => REWARDS[(Math.random() * REWARDS.length) | 0]);
  const ctl = useAnimationControls();
  const open = taps >= 3;

  const tap = async () => {
    if (open) return;
    const n = taps + 1;
    setTaps(n);
    if (n >= 3) {
      sfx("win");
      window.setTimeout(() => sfx("coin"), 300);
      return;
    }
    sfx("pop");
    await ctl.start({ rotate: [0, -8, 8, -6, 6, 0], scale: [1, 1.08, 1], transition: { duration: 0.4 } });
  };

  const claim = () => {
    const s = useGame.getState();
    s.addCaps(reward);
    s.markDone(id);
    sfx("tap");
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {open && <Confetti count={80} origin={{ x: 0.5, y: 0.45 }} />}
      <motion.div initial={{ scale: 0.7, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: "spring", stiffness: 340, damping: 22 }} className="tile flex w-full max-w-[400px] flex-col items-center px-6 pb-6 pt-8 text-center">
        <h2 className="text-2xl font-black text-ink">{open ? "Сундук открыт!" : "Сундук с наградой"}</h2>
        <p className="mt-1 font-semibold text-ink-soft">{open ? "Трать крышечки в магазине Бочика." : `Стукни по нему ещё ${3 - taps} ${3 - taps === 1 ? "раз" : "раза"}`}</p>
        <button onClick={tap} className="relative mt-6 h-[200px] w-[220px]" aria-label="Открыть сундук" disabled={open}>
          <motion.svg animate={ctl} viewBox="0 0 220 200" className="h-full w-full" style={{ overflow: "visible" }}>
            {/* glow */}
            <AnimatePresence>
              {open && (
                <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, rotate: 360 }} transition={{ scale: { type: "spring", stiffness: 200, damping: 12 }, rotate: { duration: 12, repeat: Infinity, ease: "linear" } }} style={{ transformOrigin: "110px 90px" }}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <path key={i} d="M110 90 L100 -10 L120 -10 Z" fill="#ffc800" opacity="0.35" transform={`rotate(${i * 30} 110 90)`} />
                  ))}
                </motion.g>
              )}
            </AnimatePresence>
            <rect x="40" y="100" width="140" height="80" rx="14" fill="#c86f00" />
            <rect x="40" y="124" width="140" height="12" fill="#8a4508" />
            <rect x="98" y="110" width="24" height="32" rx="6" fill="#ffc800" stroke="#e5a800" strokeWidth="4" />
            <motion.g animate={open ? { rotate: -28, y: -26, x: -6 } : { rotate: taps * -4 }} transition={{ type: "spring", stiffness: 260, damping: 12 }} style={{ transformOrigin: "40px 100px" }}>
              <path d="M40 100 Q40 50 110 50 Q180 50 180 100 Z" fill="#ff9600" />
              <path d="M102 50 H118 V100 H102 Z" fill="#ffc800" />
            </motion.g>
          </motion.svg>
          {/* caps burst */}
          {open &&
            Array.from({ length: 9 }, (_, i) => (
              <motion.span
                key={i}
                className="absolute left-1/2 top-1/2"
                initial={{ x: -13, y: 10, scale: 0, opacity: 1 }}
                animate={{ x: -13 + (i - 4) * 22, y: [10, -70 - (i % 3) * 18, -20], scale: [0, 1.1, 0.8], opacity: [1, 1, 0], rotate: 360 }}
                transition={{ duration: 1.1, ease: [0.2, 0.8, 0.4, 1], delay: i * 0.04 }}
              >
                <CapIcon size={26} />
              </motion.span>
            ))}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35, type: "spring", stiffness: 400, damping: 14 }} className="mt-2 flex items-center gap-2 text-4xl font-black text-amber">
              +<CountUp to={reward} /> <CapIcon size={36} />
            </motion.div>
          )}
        </AnimatePresence>
        <button className={`btn3d mt-6 w-full ${open ? "amber" : "ghost"}`} onClick={open ? claim : onClose}>
          {open ? "Забрать" : "Позже"}
        </button>
      </motion.div>
    </motion.div>
  );
}
