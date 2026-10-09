import { AnimatePresence, motion } from "motion/react";
import { ArrowCounterClockwise, Bank, Eye, Flask, Footprints, Handshake, IdentificationBadge, Lightbulb, Lock, Moon, SpeakerHigh, SpeakerSlash, Sun, TShirt, Fire, X } from "@phosphor-icons/react";
import { useEffect, useState, type ComponentType } from "react";
import { ACHIEVEMENTS, ARTIFACTS, SHOP, TRACKS, type AchievementId, type Artifact } from "../data/content";
import { Mascot } from "../components/Mascot";
import { ArtifactIcon, DrinkBottle } from "../components/Collect";
import { CapIcon, FlameIcon, XpIcon } from "../components/ui";
import { sfx } from "../lib/sfx";
import { levelOf, topSkill, useGame } from "../state/store";
import { LevelCard, useCup } from "./Side";
import { Radar } from "./FinalScreen";

const ACH_ICON: Record<AchievementId, ComponentType<{ size?: number; weight?: "fill"; color?: string }>> = {
  first: Footprints,
  curator: Bank,
  insight: Lightbulb,
  chemist: Flask,
  engineer: Fire,
  eagle: Eye,
  negotiator: Handshake,
  stylist: TShirt,
  pass: IdentificationBadge,
};

export function Badge({ id, size = 84, unlocked }: { id: AchievementId; size?: number; unlocked: boolean }) {
  const a = ACHIEVEMENTS.find((x) => x.id === id)!;
  const Icon = ACH_ICON[id];
  return (
    <div className="relative" style={{ width: size, height: size * 1.08 }}>
      <svg viewBox="0 0 100 108" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M50 4 L92 28 V80 L50 104 L8 80 V28 Z" fill={unlocked ? a.color : "var(--line)"} />
        <path d="M50 4 L92 28 V80 L50 104 L8 80 V28 Z" fill="#000" opacity="0.12" transform="translate(0 4)" style={{ mixBlendMode: "multiply" }} />
        <path d="M50 14 L83 33 V75 L50 94 L17 75 V33 Z" fill="#fff" opacity={unlocked ? 0.22 : 0.4} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{unlocked ? <Icon size={size * 0.42} weight="fill" color="#fff" /> : <Lock size={size * 0.34} weight="fill" color="var(--ink-faint)" />}</div>
    </div>
  );
}

/* ---------------- Museum ---------------- */
export function MuseumTab() {
  const owned = useGame((s) => s.artifacts);
  const [open, setOpen] = useState<Artifact | null>(null);
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-32 pt-6">
      <h1 className="text-3xl font-black text-ink">Музей завода</h1>
      <p className="mt-1 font-semibold text-ink-soft">
        История «Очаково», которую ты собрал сам. {owned.length} из {ARTIFACTS.length} экспонатов.
      </p>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-line">
        <motion.div className="h-full rounded-full bg-green" initial={{ width: 0 }} animate={{ width: `${(owned.length / ARTIFACTS.length) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {ARTIFACTS.map((a, i) => {
          const has = owned.includes(a.id);
          return (
            <motion.button
              key={a.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
              whileHover={has ? { y: -4 } : {}}
              onClick={() => has && (sfx("pop"), setOpen(a))}
              className="tile tile-press flex flex-col items-center p-4 text-center"
              style={{ cursor: has ? "pointer" : "default" }}
              aria-label={has ? a.title : "Закрытый экспонат"}
            >
              <ArtifactIcon art={a.art} color={a.color} locked={!has} size={80} />
              <div className={`mt-2 text-xs font-black uppercase tracking-wider ${has ? "text-green" : "text-ink-faint"}`}>{a.year}</div>
              <div className={`font-black leading-tight ${has ? "text-ink" : "text-ink-faint"}`}>{has ? a.title : "???"}</div>
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.div
              initial={{ scale: 0.7, rotateY: -60 }}
              animate={{ scale: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              onClick={(e) => e.stopPropagation()}
              className="tile relative w-full max-w-[420px] p-6 text-center"
            >
              <button onClick={() => setOpen(null)} aria-label="Закрыть" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl text-ink-faint hover:bg-surface-2">
                <X size={22} weight="bold" />
              </button>
              <motion.div className="mx-auto w-fit" animate={{ rotate: [0, -4, 4, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <ArtifactIcon art={open.art} color={open.color} size={140} />
              </motion.div>
              <div className="mt-3 text-sm font-black uppercase tracking-widest" style={{ color: open.color }}>
                {open.year}
              </div>
              <h2 className="text-2xl font-black text-ink">{open.title}</h2>
              <p className="mt-3 text-[17px] font-semibold leading-relaxed text-ink-soft">{open.story}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Profile ---------------- */
export function ProfileTab() {
  const g = useGame();
  const lv = levelOf(g.xp);
  const hasSkills = Object.keys(g.skills).length > 0;
  const track = TRACKS[topSkill(g.skills)];
  const [theme, setTheme] = useState<string | null>(() => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  });
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme;
    else delete document.documentElement.dataset.theme;
    try {
      if (theme) localStorage.setItem("theme", theme);
      else localStorage.removeItem("theme");
    } catch {
      /* ignore */
    }
  }, [theme]);

  return (
    <div className="mx-auto w-full max-w-[680px] px-4 pb-32 pt-6">
      <div className="flex items-center gap-5">
        <div className="grid h-32 w-32 shrink-0 place-items-center rounded-full border-4 border-dashed border-line bg-amber-l">
          <Mascot size={96} equipped mood="idle" track />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-wider text-ink-faint">Пропуск стажёра</div>
          <h1 className="truncate text-3xl font-black text-ink">{g.name || "Гость"}</h1>
          <div className="font-bold text-ink-soft">
            {lv.cur.name}
            {g.uni && ` · ${g.uni}`}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: <FlameIcon size={26} />, v: g.streak, l: "Дней подряд" },
          { icon: <XpIcon size={26} />, v: g.xp, l: "Опыта" },
          { icon: <CapIcon size={26} />, v: g.caps, l: "Крышечек" },
        ].map((s, i) => (
          <div key={i} className="tile flex flex-col items-center gap-1 px-2 py-3 text-center sm:flex-row sm:text-left">
            {s.icon}
            <div>
              <div className="text-xl font-black text-ink">{s.v}</div>
              <div className="text-xs font-bold text-ink-soft">{s.l}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <LevelCard />
      </div>

      <h2 className="mt-10 text-2xl font-black text-ink">Профиль навыков</h2>
      <p className="font-semibold text-ink-soft">Строится из того, как ты проходишь смены.</p>
      <div className="mt-3 grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div className="tile p-4">
          <Radar skills={g.skills} size={280} />
        </div>
        <div className="tile flex flex-col items-center p-4">
          <DrinkBottle drink={g.drink} owner={g.name} size={200} showLabel={!!g.drink.concept} />
          <div className="mt-2 max-w-[160px] text-center font-black text-ink">{g.drink.name ? `«${g.drink.name}»` : "Партия впереди"}</div>
        </div>
      </div>
      {hasSkills && (
        <div className="mt-4 rounded-3xl p-5 text-white" style={{ background: track.color, boxShadow: `0 5px 0 ${track.colorD}` }}>
          <div className="text-sm font-black uppercase tracking-widest opacity-90">Пока тебе ближе всего</div>
          <div className="text-2xl font-black">{track.title}</div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-extrabold">
            {track.ladder.map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span className="rounded-lg bg-white/20 px-2 py-1">{s}</span>
                {i < track.ladder.length - 1 && <span aria-hidden>→</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      <h2 className="mt-10 text-2xl font-black text-ink">Значки</h2>
      <div className="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-5">
        {ACHIEVEMENTS.map((a, i) => {
          const u = g.achievements.includes(a.id);
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="flex flex-col items-center text-center">
              <motion.div whileHover={u ? { rotate: [0, -8, 8, 0], scale: 1.08 } : {}}>
                <Badge id={a.id} unlocked={u} size={64} />
              </motion.div>
              <div className={`mt-2 text-sm font-black ${u ? "text-ink" : "text-ink-faint"}`}>{a.name}</div>
              <div className="text-xs font-semibold text-ink-faint">{a.desc}</div>
            </motion.div>
          );
        })}
      </div>

      <h2 className="mt-10 text-2xl font-black text-ink">Настройки</h2>
      <div className="mt-3 flex flex-wrap gap-3">
        <button className="btn3d ghost" onClick={() => g.toggleSound()}>
          {g.sound ? <SpeakerHigh size={20} weight="fill" /> : <SpeakerSlash size={20} weight="fill" />}
          {g.sound ? "Звук вкл" : "Звук выкл"}
        </button>
        <button className="btn3d ghost" onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? null : "dark")}>
          {theme === "dark" ? <Moon size={20} weight="fill" /> : <Sun size={20} weight="fill" />}
          {theme === "dark" ? "Тёмная" : theme === "light" ? "Светлая" : "Как в системе"}
        </button>
        <button className="btn3d ghost" style={{ ["--fg" as string]: "var(--red)" }} onClick={() => window.confirm("Сбросить весь прогресс?") && g.reset()}>
          <ArrowCounterClockwise size={20} weight="bold" /> Сбросить
        </button>
      </div>
    </div>
  );
}

/* ---------------- University cup ---------------- */
export function LeagueTab() {
  const rows = useCup();
  const { xp, uni } = useGame();
  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-32 pt-6">
      <div className="flex flex-col items-center text-center">
        <motion.div initial={{ y: 30, opacity: 0, rotate: -10 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>
          <svg viewBox="0 0 80 80" width="88" aria-hidden>
            <path d="M22 10 H58 V30 Q58 50 40 52 Q22 50 22 30 Z" fill="var(--yellow)" stroke="var(--yellow-d)" strokeWidth="4" />
            <path d="M22 16 Q8 16 10 28 Q12 38 24 38 M58 16 Q72 16 70 28 Q68 38 56 38" fill="none" stroke="var(--yellow-d)" strokeWidth="4" />
            <rect x="34" y="52" width="12" height="10" fill="var(--yellow-d)" />
            <rect x="24" y="62" width="32" height="10" rx="3" fill="var(--amber)" />
            <path d="M30 22 Q32 16 38 16" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.7" />
          </svg>
        </motion.div>
        <h1 className="mt-2 text-3xl font-black text-ink">Кубок вузов</h1>
        <p className="max-w-[44ch] font-semibold text-ink-soft">Опыт студентов суммируется в зачёт их вуза. Вуз-победитель сезона едет на экскурсию на завод.</p>
        <span className="mt-2 rounded-lg bg-surface-2 px-2 py-0.5 text-xs font-bold text-ink-faint">Демо-таблица с тестовыми данными</span>
      </div>
      {uni && (
        <div className="mt-5 rounded-2xl bg-green-l p-4 text-center font-bold text-ink">
          Ты принёс своему вузу <span className="font-black text-green-d">{xp} XP</span>
        </div>
      )}
      <div className="mt-5 overflow-hidden rounded-2xl border-2 border-line">
        {rows.map((r, i) => (
          <motion.div
            layout
            key={r.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
            className="flex items-center gap-4 border-b-2 border-line px-4 py-3 last:border-b-0"
            style={r.me ? { background: "var(--green-l)" } : undefined}
          >
            <span className="w-6 text-center text-lg font-black" style={{ color: i < 3 ? "var(--yellow-d)" : "var(--ink-faint)" }}>
              {i + 1}
            </span>
            <span className="flex-1 font-extrabold text-ink">
              {r.name}
              {r.me && <span className="ml-2 text-sm text-green-d">(твой вуз)</span>}
            </span>
            <span className="font-black tabular-nums text-ink-soft">{r.xp.toLocaleString("ru")} XP</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Shop ---------------- */
export function ShopTab() {
  const g = useGame();
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    g.markShop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-32 pt-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative grid h-48 w-48 shrink-0 place-items-center rounded-[32px] bg-amber-l">
          <Mascot size={140} equipped mood={preview ? "wow" : "happy"} track />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-black text-ink">Гардероб Бочика</h1>
          <p className="mt-1 font-semibold text-ink-soft">Крышечки даются за смены, сундуки и задания дня.</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border-2 border-line px-4 py-2 text-2xl font-black text-amber">
            <CapIcon size={28} /> {g.caps}
          </div>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SHOP.map((it, i) => {
          const owned = g.owned.includes(it.id);
          const worn = g.equipped.includes(it.id);
          const afford = g.caps >= it.price;
          return (
            <motion.div
              key={it.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
              onHoverStart={() => setPreview(it.id)}
              onHoverEnd={() => setPreview(null)}
              className="tile flex flex-col items-center p-4 text-center"
              style={worn ? { borderColor: "var(--green)", boxShadow: "0 2px 0 var(--green)" } : undefined}
            >
              <div className="grid h-24 w-24 place-items-center rounded-2xl bg-surface-2">
                <Mascot size={70} accessories={[it.id]} bounce={false} />
              </div>
              <div className="mt-3 font-black text-ink">{it.name}</div>
              <div className="text-sm font-semibold text-ink-soft">{it.desc}</div>
              {owned ? (
                <button className={`btn3d mt-3 w-full px-2 py-2.5 text-xs ${worn ? "ghost" : "blue"}`} onClick={() => (sfx("tap"), g.toggleEquip(it.id))}>
                  {worn ? "Снять" : "Надеть"}
                </button>
              ) : (
                <button disabled={!afford} className="btn3d amber mt-3 w-full px-2 py-2.5 text-xs" onClick={() => g.buy(it.id, it.price) && sfx("coin")}>
                  <CapIcon size={18} /> {it.price}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
