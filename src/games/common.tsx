import { AnimatePresence, motion } from "motion/react";
import { CheckCircle, X, XCircle } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { ProgressBar } from "../components/ui";

export interface GameResult {
  stars: 1 | 2 | 3;
  /** short line for the results screen, e.g. "Точность 92%" */
  stat?: string;
}

export interface GameProps {
  onFinish: (r: GameResult) => void;
  onExit: () => void;
}

export function GameFrame({ progress, onExit, color = "var(--green)", right, children }: { progress: number; onExit: () => void; color?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="mx-auto flex w-full max-w-[1000px] items-center gap-4 px-4 pb-2 pt-5 sm:px-8">
        <button onClick={onExit} aria-label="Выйти из игры" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink-soft">
          <X size={28} weight="bold" />
        </button>
        <ProgressBar value={progress} color={color} />
        {right}
      </div>
      <div className="relative flex flex-1 flex-col">{children}</div>
    </div>
  );
}

/* Bottom feedback sheet: green when right, red when wrong. Slides up with a spring. */
export function FeedbackSheet({
  state,
  title,
  text,
  extra,
  onNext,
  nextLabel = "Дальше",
}: {
  state: "good" | "bad" | null;
  title: string;
  text?: ReactNode;
  extra?: ReactNode;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <AnimatePresence>
      {state && (
        <motion.div
          key="sheet"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t-2"
          style={{
            background: state === "good" ? "var(--green-l)" : "var(--red-l)",
            borderColor: state === "good" ? "var(--green)" : "var(--red)",
          }}
        >
          <div className="mx-auto flex max-w-[1000px] flex-col gap-4 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:flex-row sm:items-center sm:px-8 sm:py-7">
            <div className="flex flex-1 items-start gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.1 }}
                className="hidden h-16 w-16 shrink-0 place-items-center rounded-full bg-surface sm:grid"
              >
                {state === "good" ? <CheckCircle size={48} weight="fill" color="var(--green)" /> : <XCircle size={48} weight="fill" color="var(--red)" />}
              </motion.div>
              <div className="min-w-0">
                <div className="text-2xl font-black" style={{ color: state === "good" ? "var(--green-d)" : "var(--red-d)" }}>
                  {title}
                </div>
                {text && <div className="mt-1 max-w-[60ch] font-semibold leading-snug" style={{ color: state === "good" ? "var(--green-d)" : "var(--red-d)" }}>{text}</div>}
                {extra}
              </div>
            </div>
            <button autoFocus className={`btn3d w-full sm:w-auto sm:min-w-[160px] ${state === "bad" ? "red" : ""}`} onClick={onNext}>
              {nextLabel}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const shake = { x: [0, -10, 10, -8, 8, -4, 0], transition: { duration: 0.45 } };
