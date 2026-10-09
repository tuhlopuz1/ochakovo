import { motion } from "motion/react";
import { ArrowCounterClockwise, Clock, Compass, Eye, Flask, Footprints, IdentificationBadge, Lightning, Lock, Moon, SpeakerHigh, SpeakerSlash, Sun, TShirt } from "@phosphor-icons/react";
import { useEffect, useState, type ComponentType } from "react";
import { ACHIEVEMENTS, FACTS, SHOP, TRACKS, type AchievementId } from "../data/content";
import { Mascot } from "../components/Mascot";
import { CapIcon, FlameIcon, XpIcon } from "../components/ui";
import { sfx } from "../lib/sfx";
import { levelOf, useGame } from "../state/store";
import { LevelCard, useLeague } from "./Side";

const ACH_ICON: Record<AchievementId, ComponentType<{ size?: number; weight?: "fill"; color?: string }>> = {
  first: Footprints,
  historian: Clock,
  brewer: Flask,
  eagle: Eye,
  combo: Lightning,
  found: Compass,
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

export function ProfileTab() {
  const g = useGame();
  const lv = levelOf(g.xp);
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
    <div className="mx-auto w-full max-w-[640px] px-4 pb-32 pt-6">
      <div className="flex items-center gap-5">
        <div className="grid h-36 w-36 shrink-0 place-items-center rounded-full border-4 border-dashed border-line bg-amber-l">
          <Mascot size={110} equipped mood="idle" track />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-black text-ink">{g.name || "Гость"}</h1>
          <div className="font-bold text-ink-soft">{lv.cur.name}</div>
          {g.track && (
            <div className="mt-2 inline-block rounded-xl px-3 py-1 text-sm font-black text-white" style={{ background: TRACKS[g.track].color }}>
              {TRACKS[g.track].title}
            </div>
          )}
        </div>
      </div>

      <h2 className="mt-8 text-2xl font-black text-ink">Статистика</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {[
          { icon: <FlameIcon size={28} />, v: g.streak, l: "Дней подряд" },
          { icon: <XpIcon size={28} />, v: g.xp, l: "Всего опыта" },
          { icon: <CapIcon size={28} />, v: g.caps, l: "Крышечек" },
          { icon: <span className="text-2xl font-black text-purple">{g.achievements.length}</span>, v: null, l: `Значков из ${ACHIEVEMENTS.length}` },
        ].map((s, i) => (
          <div key={i} className="tile flex items-center gap-3 px-4 py-3">
            {s.icon}
            <div>
              {s.v !== null && <div className="text-xl font-black text-ink">{s.v}</div>}
              <div className="text-sm font-bold text-ink-soft">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <LevelCard />
      </div>

      <h2 className="mt-8 text-2xl font-black text-ink">Значки</h2>
      <div className="mt-3 grid grid-cols-3 gap-4 sm:grid-cols-4">
        {ACHIEVEMENTS.map((a, i) => {
          const u = g.achievements.includes(a.id);
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="flex flex-col items-center text-center">
              <motion.div whileHover={u ? { rotate: [0, -8, 8, 0], scale: 1.08 } : {}}>
                <Badge id={a.id} unlocked={u} size={72} />
              </motion.div>
              <div className={`mt-2 text-sm font-black ${u ? "text-ink" : "text-ink-faint"}`}>{a.name}</div>
              <div className="text-xs font-semibold text-ink-faint">{a.desc}</div>
            </motion.div>
          );
        })}
      </div>

      <h2 className="mt-10 text-2xl font-black text-ink">Коллекция фактов</h2>
      <p className="font-semibold text-ink-soft">Открываются за прохождение уровней.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {Object.entries(FACTS).map(([id, f]) => {
          const u = !!g.done[id];
          return (
            <div key={id} className="tile overflow-hidden">
              <div className="h-2" style={{ background: u ? f.color : "var(--line)" }} />
              <div className="p-4">
                <div className={`font-black ${u ? "text-ink" : "text-ink-faint"}`}>{u ? f.title : "Закрытая карточка"}</div>
                <p className="mt-1 text-sm font-semibold text-ink-soft">{u ? f.text : "Пройди уровень, чтобы узнать факт."}</p>
              </div>
            </div>
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
        <button
          className="btn3d ghost"
          style={{ ["--fg" as string]: "var(--red)" }}
          onClick={() => {
            if (window.confirm("Сбросить весь прогресс?")) g.reset();
          }}
        >
          <ArrowCounterClockwise size={20} weight="bold" /> Сбросить
        </button>
      </div>
    </div>
  );
}

export function LeagueTab() {
  const rows = useLeague();
  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-32 pt-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex gap-3">
          {["var(--amber)", "var(--blue)", "var(--purple)"].map((c, i) => (
            <motion.div key={c} initial={{ y: 30, opacity: 0 }} animate={{ y: i === 1 ? -10 : 0, opacity: 1 }} transition={{ delay: i * 0.1, type: "spring", stiffness: 300, damping: 16 }}>
              <svg viewBox="0 0 60 70" width={i === 1 ? 72 : 56} aria-hidden>
                <path d="M30 2 L56 16 V50 L30 68 L4 50 V16 Z" fill={i === 1 ? c : "var(--line)"} />
                <path d="M30 12 L46 21 V45 L30 56 L14 45 V21 Z" fill="#fff" opacity="0.3" />
              </svg>
            </motion.div>
          ))}
        </div>
        <h1 className="mt-4 text-3xl font-black text-ink">Лига квасоваров</h1>
        <p className="font-semibold text-ink-soft">Топ-3 переходят в лигу Мастеров. Набирай опыт в играх.</p>
        <span className="mt-2 rounded-lg bg-surface-2 px-2 py-0.5 text-xs font-bold text-ink-faint">Демо-лига с тестовыми игроками</span>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border-2 border-line">
        {rows.map((r, i) => {
          const me = "me" in r;
          return (
            <motion.div
              layout
              key={r.name + (me ? "-me" : "")}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 30 }}
              className="flex items-center gap-4 border-b-2 border-line px-4 py-3 last:border-b-0"
              style={me ? { background: "var(--green-l)" } : undefined}
            >
              <span className="w-6 text-center text-lg font-black" style={{ color: i < 3 ? "var(--green)" : "var(--ink-faint)" }}>
                {i + 1}
              </span>
              <span className="grid h-11 w-11 place-items-center rounded-full text-lg font-black text-white" style={{ background: r.color }}>
                {r.name[0]}
              </span>
              <span className="flex-1 font-extrabold text-ink">{me ? `${r.name} (ты)` : r.name}</span>
              <span className="font-black tabular-nums text-ink-soft">{r.xp} XP</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

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
          <p className="mt-1 font-semibold text-ink-soft">Крышечки даются за уровни, сундуки и задания дня.</p>
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
                <button
                  disabled={!afford}
                  className="btn3d amber mt-3 w-full px-2 py-2.5 text-xs"
                  onClick={() => {
                    if (g.buy(it.id, it.price)) sfx("coin");
                  }}
                >
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
