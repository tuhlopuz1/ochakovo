import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Gift } from "@phosphor-icons/react";
import { LEAGUE_BOTS } from "../data/content";
import { CapIcon, FlameIcon, ProgressBar, XpIcon } from "../components/ui";
import { sfx } from "../lib/sfx";
import { levelOf, QUESTS, useGame, type Tab } from "../state/store";

/* Streak / caps / XP chips used in the top bar (mobile) and side column (desktop) */
export function StatChips() {
  const { streak, caps, xp } = useGame();
  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <Chip label={`Серия: ${streak} дн.`}>
        <FlameIcon size={26} active={streak > 0} />
        <span className="text-amber">{streak}</span>
      </Chip>
      <Chip label={`Крышечки: ${caps}`}>
        <CapIcon size={24} />
        <motion.span key={caps} initial={{ scale: 1.5, color: "var(--green)" }} animate={{ scale: 1, color: "var(--amber)" }} className="text-amber">
          {caps}
        </motion.span>
      </Chip>
      <Chip label={`Опыт: ${xp}`}>
        <XpIcon size={24} />
        <span className="text-yellow-d">{xp}</span>
      </Chip>
    </div>
  );
}

function Chip({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div title={label} aria-label={label} className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[17px] font-black tabular-nums hover:bg-surface-2">
      {children}
    </div>
  );
}

export function LevelCard() {
  const xp = useGame((s) => s.xp);
  const lv = levelOf(xp);
  return (
    <div className="tile p-5">
      <div className="flex items-center justify-between">
        <div className="text-lg font-black text-ink">{lv.cur.name}</div>
        <div className="text-sm font-extrabold text-ink-faint">Ур. {lv.index + 1}</div>
      </div>
      <ProgressBar value={lv.pct} color="var(--yellow)" className="mt-3" />
      <div className="mt-2 text-sm font-bold text-ink-soft">{lv.next ? `${lv.next.xp - xp} XP до уровня «${lv.next.name}»` : "Максимальный уровень!"}</div>
    </div>
  );
}

export function QuestsCard() {
  const daily = useGame((s) => s.daily);
  const claim = useGame((s) => s.claimQuest);
  return (
    <div className="tile p-5">
      <div className="text-lg font-black text-ink">Задания дня</div>
      <div className="mt-4 space-y-5">
        {QUESTS.map((q) => {
          const v = Math.min(q.goal, q.get(daily));
          const complete = v >= q.goal;
          const claimed = daily.claimed.includes(q.id);
          return (
            <div key={q.id} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="font-extrabold text-ink">{q.title}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <ProgressBar value={v / q.goal} color="var(--yellow)" height={14} />
                  <span className="w-10 shrink-0 text-right text-xs font-black text-ink-faint">
                    {v}/{q.goal}
                  </span>
                </div>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {complete && !claimed ? (
                  <motion.button
                    key="claim"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: [0, -10, 10, -6, 0] }}
                    transition={{ rotate: { repeat: Infinity, repeatDelay: 1.2, duration: 0.5 } }}
                    onClick={() => {
                      sfx("coin");
                      claim(q.id, q.caps);
                    }}
                    className="btn3d amber shrink-0 px-3 py-2 text-xs"
                    aria-label={`Забрать ${q.caps} крышечек`}
                  >
                    <Gift size={18} weight="fill" /> +{q.caps}
                  </motion.button>
                ) : (
                  <motion.div key="gift" className="grid h-10 w-10 shrink-0 place-items-center" style={{ opacity: claimed ? 0.35 : 1 }}>
                    <Gift size={30} weight="duotone" color={claimed ? "var(--ink-faint)" : "var(--amber)"} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function useLeague() {
  const { xp, name } = useGame();
  const rows = [...LEAGUE_BOTS, { name: name || "Ты", xp, color: "var(--green)", me: true as const }].sort((a, b) => b.xp - a.xp);
  return rows;
}

export function LeagueMini({ onOpen }: { onOpen: (t: Tab) => void }) {
  const rows = useLeague();
  const myPos = rows.findIndex((r) => "me" in r) + 1;
  return (
    <button onClick={() => onOpen("league")} className="tile tile-press w-full p-5 text-left">
      <div className="flex items-center justify-between">
        <div className="text-lg font-black text-ink">Лига квасоваров</div>
        <span className="text-sm font-black uppercase tracking-wider text-blue">Открыть</span>
      </div>
      <div className="mt-2 font-bold text-ink-soft">
        Ты на <span className="font-black text-ink">{myPos} месте</span>. {myPos > 3 ? "Топ-3 выходят в следующую лигу." : "Ты в зоне повышения!"}
      </div>
    </button>
  );
}
