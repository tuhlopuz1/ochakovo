import { AnimatePresence, motion } from "motion/react";
import { Bank, Factory, Storefront, Trophy, UserCircle } from "@phosphor-icons/react";
import { useEffect, useState, type ComponentType } from "react";
import { ALL_LESSONS, ARTIFACTS } from "./data/content";
import { ArtifactIcon } from "./components/Collect";
import { Mascot } from "./components/Mascot";
import { sfx } from "./lib/sfx";
import { useGame, useToasts, type Tab } from "./state/store";
import { ACHIEVEMENTS } from "./data/content";
import { Onboarding } from "./screens/Onboarding";
import { PathScreen } from "./screens/PathScreen";
import { LessonRunner, type Origin } from "./screens/LessonRunner";
import { Chest } from "./screens/Chest";
import { FinalScreen } from "./screens/FinalScreen";
import { LeagueMini, LevelCard, QuestsCard, StatChips } from "./screens/Side";
import { Badge, LeagueTab, MuseumTab, ProfileTab, ShopTab } from "./screens/Tabs";

const NAV: { id: Tab; label: string; Icon: ComponentType<{ size?: number; weight?: "fill" | "duotone"; color?: string }>; color: string }[] = [
  { id: "path", label: "Завод", Icon: Factory, color: "var(--amber)" },
  { id: "museum", label: "Музей", Icon: Bank, color: "var(--green)" },
  { id: "league", label: "Кубок", Icon: Trophy, color: "var(--yellow-d)" },
  { id: "shop", label: "Магазин", Icon: Storefront, color: "var(--red)" },
  { id: "profile", label: "Профиль", Icon: UserCircle, color: "var(--purple)" },
];
const ORDER: Tab[] = NAV.map((n) => n.id);

export default function App() {
  const onboarded = useGame((s) => s.onboarded);
  const touchStreak = useGame((s) => s.touchStreak);
  useEffect(() => touchStreak(), [touchStreak]);

  return (
    <>
      <AnimatePresence mode="wait">
        {onboarded ? (
          <motion.div key="shell" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
            <Shell />
          </motion.div>
        ) : (
          <motion.div key="onb" exit={{ opacity: 0, y: -40 }} transition={{ duration: 0.3 }}>
            <Onboarding />
          </motion.div>
        )}
      </AnimatePresence>
      <AchievementToasts />
    </>
  );
}

function Shell() {
  const [tab, setTab] = useState<Tab>("path");
  const [dir, setDir] = useState(1);
  const [lesson, setLesson] = useState<{ id: string; origin: Origin } | null>(null);
  const [chest, setChest] = useState<string | null>(null);
  const [pass, setPass] = useState(false);

  const go = (t: Tab) => {
    if (t === tab) return;
    sfx("tap");
    setDir(ORDER.indexOf(t) > ORDER.indexOf(tab) ? 1 : -1);
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  const start = (id: string, origin: Origin) => {
    const l = ALL_LESSONS.find((x) => x.id === id)!;
    if (l.kind === "chest") return setChest(id);
    if (l.kind === "final") {
      useGame.getState().markDone("final");
      return setPass(true);
    }
    setLesson({ id, origin });
  };

  const active = lesson ? ALL_LESSONS.find((x) => x.id === lesson.id)! : null;

  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[256px_minmax(0,1fr)_380px]">
      {/* left nav, desktop */}
      <aside className="sticky top-0 hidden h-[100dvh] flex-col border-r-2 border-line px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-3 text-2xl font-black text-green">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-green text-white" style={{ boxShadow: "0 3px 0 var(--green-d)" }}>
            О
          </span>
          квест
        </div>
        <nav className="flex flex-col gap-2">
          {NAV.map((n) => {
            const on = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className="relative flex items-center gap-4 rounded-xl border-2 px-3 py-2.5 text-[15px] font-black uppercase tracking-wider transition-colors"
                style={{ borderColor: on ? "var(--blue)" : "transparent", background: on ? "var(--blue-l)" : undefined, color: on ? "var(--blue)" : "var(--ink-soft)" }}
              >
                <n.Icon size={32} weight="duotone" color={n.color} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto px-3 text-xs font-bold leading-relaxed text-ink-faint">
          Выпусти свою первую партию кваса и узнай, кем ты можешь стать в «Очаково».
        </div>
      </aside>

      {/* center */}
      <main className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b-2 border-line bg-bg/95 px-3 py-2 backdrop-blur xl:hidden">
          <StatChips />
          <div className="lg:hidden">
            <Mascot size={34} bounce={false} equipped />
          </div>
        </header>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={tab}
            custom={dir}
            variants={{
              in: (d: number) => ({ opacity: 0, x: d * 40 }),
              on: { opacity: 1, x: 0 },
              out: (d: number) => ({ opacity: 0, x: d * -40 }),
            }}
            initial="in"
            animate="on"
            exit="out"
            transition={{ type: "spring", stiffness: 400, damping: 36 }}
          >
            {tab === "path" && <PathScreen onStart={start} />}
            {tab === "profile" && <ProfileTab />}
            {tab === "museum" && <MuseumTab />}
            {tab === "league" && <LeagueTab />}
            {tab === "shop" && <ShopTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* right column, desktop */}
      <aside className="sticky top-0 hidden h-[100dvh] flex-col gap-5 overflow-y-auto border-l-2 border-line px-6 py-6 scrollbar-none xl:flex">
        <StatChips />
        <LevelCard />
        <QuestsCard />
        <LeagueMini onOpen={go} />
      </aside>

      {/* bottom tabs, mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t-2 border-line bg-bg pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.map((n) => {
          const on = tab === n.id;
          return (
            <button key={n.id} onClick={() => go(n.id)} aria-label={n.label} className="relative flex flex-1 flex-col items-center gap-0.5 py-2">
              {on && <motion.span layoutId="tabhl" className="absolute inset-x-3 inset-y-1 rounded-xl border-2 border-blue bg-blue-l" transition={{ type: "spring", stiffness: 500, damping: 34 }} />}
              <motion.span className="relative" animate={on ? { scale: [1, 1.25, 1], rotate: [0, -8, 0] } : { scale: 1 }} transition={{ duration: 0.35 }}>
                <n.Icon size={30} weight="duotone" color={n.color} />
              </motion.span>
              <span className="relative text-[11px] font-black uppercase tracking-wider" style={{ color: on ? "var(--blue)" : "var(--ink-faint)" }}>
                {n.label}
              </span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence>{active && lesson && <LessonRunner key={lesson.id} lesson={active} origin={lesson.origin} onClose={() => setLesson(null)} />}</AnimatePresence>
      <AnimatePresence>{chest && <Chest id={chest} onClose={() => setChest(null)} />}</AnimatePresence>
      <AnimatePresence>{pass && <FinalScreen onClose={() => setPass(false)} />}</AnimatePresence>
    </div>
  );
}

function AchievementToasts() {
  const { queue, shift } = useToasts();
  const cur = queue[0];
  useEffect(() => {
    if (!cur) return;
    const t1 = window.setTimeout(() => sfx("coin"), 200);
    const t2 = window.setTimeout(shift, 2600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [cur, shift]);
  const ach = cur?.kind === "ach" ? ACHIEVEMENTS.find((a) => a.id === cur.id) : null;
  const art = cur?.kind === "artifact" ? ARTIFACTS.find((a) => a.id === cur.id) : null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[80] flex justify-center px-4">
      <AnimatePresence>
        {cur && (
          <motion.div
            key={cur.id + queue.length}
            initial={{ y: -120, scale: 0.8 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
            className="tile flex items-center gap-4 py-3 pl-3 pr-6"
            style={{ boxShadow: "0 6px 0 var(--line)" }}
          >
            <motion.div initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 12 }}>
              {ach && <Badge id={ach.id} unlocked size={52} />}
              {art && <ArtifactIcon art={art.art} color={art.color} size={56} />}
            </motion.div>
            <div>
              <div className="text-xs font-black uppercase tracking-widest" style={{ color: art ? "var(--green)" : "var(--amber)" }}>
                {art ? "Новый экспонат в музее" : "Новый значок"}
              </div>
              <div className="text-lg font-black text-ink">{ach?.name ?? art?.title}</div>
              <div className="text-sm font-semibold text-ink-soft">{ach?.desc ?? art?.year}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
