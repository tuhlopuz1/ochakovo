import { AnimatePresence, motion } from "motion/react";
import { Cube, Drop, Fish, Flame, Grains, HardHat, Jar, Pepper, Snowflake } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { BREW_INGREDIENTS, BREW_ROLES } from "../data/content";
import { Mascot } from "../components/Mascot";
import { sfx } from "../lib/sfx";
import { useGame } from "../state/store";
import { FeedbackSheet, GameFrame, type GameProps } from "./common";

const ICONS: Record<string, ComponentType<{ size?: number; weight?: "fill" | "bold" | "duotone"; color?: string }>> = {
  water: Drop,
  malt: Grains,
  sugar: Cube,
  pepper: Pepper,
  fish: Fish,
};

const STEP_TITLES = ["Собери сусло", "Нагрей до нужной температуры", "Запусти брожение", "Охлади квас"];
const STEP_HINTS = [
  "Брось в танк только то, из чего делают настоящий квас.",
  "Держи кнопку, чтобы греть. Удерживай стрелку в зелёной зоне.",
  "Добавь закваску и подбери тёплую температуру для брожения.",
  "Жми на вентиль охлаждения, пока квас не станет холодным.",
];

/* Brewing simulator: four physical mini-interactions mapped to real production steps,
   each ending with "who does this at the plant" so the game doubles as a career map. */
export function Brew({ onFinish, onExit }: GameProps) {
  const unlock = useGame((s) => s.unlock);
  const [step, setStep] = useState(0);
  const [sheet, setSheet] = useState<null | "good" | "bad">(null);
  const [mistakes, setMistakes] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  // tank state
  const [added, setAdded] = useState<string[]>([]);
  const [temp, setTemp] = useState(18);
  const [zoneT, setZoneT] = useState(0);
  const [starter, setStarter] = useState(false);
  const [fermT, setFermT] = useState(12);
  const [fermProg, setFermProg] = useState(0);
  const [cool, setCool] = useState(0);
  const [mood, setMood] = useState<"think" | "happy" | "sad" | "wow">("think");

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 1800);
  };
  const oops = (msg: string) => {
    sfx("bad");
    setMistakes((m) => m + 1);
    setMood("sad");
    flash(msg);
    window.setTimeout(() => setMood("think"), 900);
  };

  /* ---- step 0: ingredients ---- */
  const goodIds = BREW_INGREDIENTS.filter((i) => i.good).map((i) => i.id);
  const addIngredient = (id: string) => {
    const ing = BREW_INGREDIENTS.find((i) => i.id === id)!;
    if (!ing.good) return oops(ing.nope);
    if (added.includes(id)) return;
    sfx("pop");
    const next = [...added, id];
    setAdded(next);
    if (goodIds.every((g) => next.includes(g))) {
      setMood("happy");
      window.setTimeout(() => setSheet("good"), 500);
    }
  };

  /* ---- step 1: heating (hold) ---- */
  const holding = useRef(false);
  useEffect(() => {
    if (step !== 1 || sheet) return;
    let raf = 0;
    let last = performance.now();
    let t = temp;
    let z = zoneT;
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += holding.current ? 24 * dt : -7 * dt;
      t = Math.max(18, t);
      if (t > 82) {
        t = 52;
        oops("Перегрев! Сусло подгорело, начинаем заново.");
      }
      if (t >= 62 && t <= 70) z += dt;
      setTemp(t);
      setZoneT(z);
      if (z >= 2.5) {
        holding.current = false;
        setMood("happy");
        sfx("good");
        setSheet("good");
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, sheet]);

  /* ---- step 2: fermentation (slider) ---- */
  const inFermZone = fermT >= 25 && fermT <= 30;
  useEffect(() => {
    if (step !== 2 || !starter || sheet) return;
    if (!inFermZone) return;
    const id = window.setInterval(() => {
      setFermProg((p) => {
        const n = Math.min(1, p + 0.05);
        if (Math.random() > 0.5) sfx("bubble");
        if (n >= 1) {
          window.clearInterval(id);
          setMood("happy");
          window.setTimeout(() => setSheet("good"), 300);
        }
        return n;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [step, starter, inFermZone, sheet]);

  /* ---- step 3: cooling (taps) ---- */
  const coolTap = () => {
    if (cool >= 1) return;
    sfx("bubble");
    const n = Math.min(1, cool + 1 / 6);
    setCool(n);
    if (n >= 0.999) {
      setMood("happy");
      window.setTimeout(() => setSheet("good"), 400);
    }
  };

  const next = () => {
    sfx("tap");
    setSheet(null);
    setMood("think");
    if (step === 3) {
      if (mistakes === 0) unlock("brewer");
      onFinish({ stars: mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1, stat: mistakes === 0 ? "Идеальная партия" : `Промахов: ${mistakes}` });
      return;
    }
    setStep((s) => s + 1);
  };

  // derived tank visuals
  const level = step === 0 ? (added.length ? 0.12 + added.length * 0.2 : 0.03) : 0.72;
  const hasMalt = added.includes("malt");
  const liquid = cool > 0 ? mix("#b8620f", "#d98a2b", cool) : hasMalt ? "#b8620f" : added.includes("water") ? "#7fd3ff" : "#7fd3ff";
  const bubbles = step === 2 ? (starter ? 0.25 + (inFermZone ? 0.75 : Math.max(0, 1 - Math.abs(fermT - 27.5) / 15) * 0.5) : 0) : step === 1 ? Math.max(0, (temp - 50) / 40) : step === 3 ? 0.6 * (1 - cool) : 0;
  const steam = step === 1 && temp > 55;
  const progress = (step + (sheet === "good" ? 1 : 0)) / 4;

  return (
    <GameFrame progress={progress} onExit={onExit} color="var(--amber)">
      <div className="mx-auto grid w-full max-w-[1000px] flex-1 items-start gap-6 px-4 pb-48 pt-4 sm:px-8 md:grid-cols-[1.1fr_1fr] md:gap-10">
        <div className="order-2 md:order-1">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ type: "spring", stiffness: 380, damping: 32 }}>
              <div className="text-sm font-black uppercase tracking-widest text-amber">Этап {step + 1} из 4</div>
              <h1 className="mt-1 text-2xl font-black text-ink sm:text-3xl">{STEP_TITLES[step]}</h1>
              <p className="mt-1 font-semibold text-ink-soft">{STEP_HINTS[step]}</p>

              <div className="mt-6">
                {step === 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {BREW_INGREDIENTS.map((ing, i) => {
                      const Icon = ICONS[ing.id];
                      const used = added.includes(ing.id);
                      return (
                        <motion.button
                          key={ing.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: used ? 0.35 : 1, y: 0, scale: used ? 0.92 : 1 }}
                          transition={{ delay: i * 0.05, type: "spring", stiffness: 400, damping: 24 }}
                          whileTap={{ scale: 0.92 }}
                          disabled={used}
                          onClick={() => addIngredient(ing.id)}
                          className="tile tile-press flex flex-col items-center gap-2 px-1 py-3 font-extrabold text-ink sm:px-3 sm:py-4"
                        >
                          <span className="grid h-14 w-14 place-items-center rounded-2xl" style={{ background: `color-mix(in srgb, ${ing.color} 18%, transparent)` }}>
                            <Icon size={34} weight="fill" color={ing.color} />
                          </span>
                          <span className="text-sm">{ing.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {step === 1 && (
                  <div className="flex items-center gap-6">
                    <Gauge value={temp} min={18} max={85} zone={[62, 70]} unit="°C" />
                    <div className="flex flex-1 flex-col gap-4">
                      <div className="text-4xl font-black tabular-nums text-ink">{Math.round(temp)}°C</div>
                      <ZoneMeter value={zoneT / 2.5} />
                      <button
                        className="btn3d red w-full py-5 text-lg"
                        onPointerDown={(e) => {
                          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                          holding.current = true;
                          sfx("whoosh");
                        }}
                        onPointerUp={() => (holding.current = false)}
                        onPointerCancel={() => (holding.current = false)}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <Flame size={24} weight="fill" /> Держи, чтобы греть
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-5">
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        if (!starter) {
                          sfx("pop");
                          setStarter(true);
                          setMood("wow");
                        }
                      }}
                      className={`tile tile-press flex items-center gap-4 px-4 py-3 text-left ${starter ? "opacity-50" : ""}`}
                      disabled={starter}
                    >
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-l">
                        <Jar size={30} weight="fill" color="var(--amber)" />
                      </span>
                      <span>
                        <span className="block font-extrabold text-ink">{starter ? "Закваска в танке" : "Добавить закваску"}</span>
                        <span className="text-sm font-semibold text-ink-soft">Дрожжи + молочнокислые бактерии</span>
                      </span>
                    </motion.button>
                    <div className={starter ? "" : "pointer-events-none opacity-40"}>
                      <div className="flex items-baseline justify-between">
                        <span className="font-extrabold text-ink">Температура брожения</span>
                        <span className="text-3xl font-black tabular-nums" style={{ color: inFermZone ? "var(--green)" : fermT > 30 ? "var(--red)" : "var(--blue)" }}>
                          {fermT}°C
                        </span>
                      </div>
                      <input
                        type="range"
                        min={4}
                        max={40}
                        value={fermT}
                        onChange={(e) => setFermT(+e.target.value)}
                        className="brew-range mt-3 w-full"
                        aria-label="Температура брожения"
                        style={{ ["--p" as string]: `${((fermT - 4) / 36) * 100}%` }}
                      />
                      <div className="mt-1 flex justify-between text-xs font-bold text-ink-faint">
                        <span>Холодно</span>
                        <span>Тепло</span>
                        <span>Жарко</span>
                      </div>
                      <div className="mt-4">
                        <ZoneMeter value={fermProg} label={inFermZone ? "Бродит!" : fermT > 30 ? "Дрожжам жарко" : "Дрожжи спят"} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex items-center gap-6">
                    <motion.button
                      onClick={coolTap}
                      whileTap={{ scale: 0.9 }}
                      animate={{ rotate: cool * 360 }}
                      transition={{ type: "spring", stiffness: 260, damping: 14 }}
                      className="grid h-32 w-32 shrink-0 place-items-center rounded-full border-[6px] border-blue-d bg-blue text-white"
                      style={{ boxShadow: "0 6px 0 var(--blue-d)" }}
                      aria-label="Повернуть вентиль охлаждения"
                    >
                      <Snowflake size={64} weight="bold" />
                    </motion.button>
                    <div className="flex-1">
                      <div className="text-4xl font-black tabular-nums text-blue">{Math.round(28 - cool * 22)}°C</div>
                      <div className="mt-3">
                        <ZoneMeter value={cool} color="var(--blue)" label="Охлаждение" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-5 rounded-2xl bg-red-l px-4 py-3 font-extrabold text-red-d"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="order-1 flex items-end justify-center gap-2 md:order-2">
          <Mascot size={86} mood={mood} className="mb-2 hidden sm:block" />
          <Tank level={level} color={liquid} bubbles={bubbles} steam={steam} frost={cool} foam={step >= 2 && starter} />
        </div>
      </div>

      <FeedbackSheet
        state={sheet}
        title={["Сусло готово!", "Идеальный нагрев!", "Квас забродил!", "Квас готов!"][step]}
        text={BREW_ROLES[step].note}
        extra={
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm font-extrabold text-ink">
            <HardHat size={18} weight="fill" color="var(--amber)" /> На заводе это делает: {BREW_ROLES[step].who}
          </div>
        }
        onNext={next}
        nextLabel={step === 3 ? "Финиш" : "Дальше"}
      />
      <style>{`
        .brew-range{appearance:none;height:18px;border-radius:999px;background:linear-gradient(90deg,var(--blue) 0%,var(--green) 55%,var(--green) 72%,var(--red) 100%);outline:none}
        .brew-range::-webkit-slider-thumb{appearance:none;width:34px;height:34px;border-radius:50%;background:#fff;border:4px solid var(--ink);box-shadow:0 3px 0 rgba(0,0,0,.2);cursor:grab}
        .brew-range::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:#fff;border:4px solid var(--ink);cursor:grab}
      `}</style>
    </GameFrame>
  );
}

function mix(a: string, b: string, t: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
}

function ZoneMeter({ value, color = "var(--green)", label = "В зоне" }: { value: number; color?: string; label?: string }) {
  return (
    <div>
      <div className="mb-1 text-sm font-extrabold text-ink-soft">{label}</div>
      <div className="h-4 overflow-hidden rounded-full bg-line">
        <motion.div className="h-full rounded-full" style={{ background: color }} animate={{ width: `${Math.min(1, value) * 100}%` }} transition={{ duration: 0.12 }} />
      </div>
    </div>
  );
}

function Gauge({ value, min, max, zone, unit }: { value: number; min: number; max: number; zone: [number, number]; unit: string }) {
  const h = 220;
  const y = (v: number) => h - ((v - min) / (max - min)) * h;
  return (
    <div className="relative" style={{ height: h + 40, width: 64 }} aria-label={`Температура ${Math.round(value)}${unit}`}>
      <div className="absolute left-1/2 top-0 w-7 -translate-x-1/2 overflow-hidden rounded-full border-4 border-line bg-surface-2" style={{ height: h + 8 }}>
        <div className="absolute inset-x-0 bg-green/40" style={{ top: y(zone[1]), height: y(zone[0]) - y(zone[1]) }} />
        <motion.div className="absolute inset-x-0 bottom-0 bg-red" animate={{ height: h - y(value) }} transition={{ duration: 0.05 }} />
      </div>
      <div className="absolute bottom-0 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full border-4 border-line bg-red" />
    </div>
  );
}

/* The star of the show: a steel fermentation tank with live liquid */
function Tank({ level, color, bubbles, steam, frost, foam }: { level: number; color: string; bubbles: number; steam: boolean; frost: number; foam: boolean }) {
  const top = 262 - level * 210;
  const n = Math.round(bubbles * 14);
  return (
    <svg viewBox="0 0 220 300" className="w-[140px] sm:w-[260px]" style={{ overflow: "visible" }} role="img" aria-label="Варочный танк">
      <style>{`
        .tk-bub{animation:tk-rise var(--d) ease-in infinite;transform-box:fill-box}
        @keyframes tk-rise{0%{transform:translateY(0);opacity:0}10%{opacity:1}100%{transform:translateY(var(--h));opacity:.2}}
        .tk-steam{animation:fs-steam 2.4s ease-out infinite;transform-box:fill-box;transform-origin:center}
        @keyframes fs-steam{0%{transform:translate(0,0) scale(.4);opacity:0}20%{opacity:.9}100%{transform:translate(10px,-60px) scale(1.5);opacity:0}}
      `}</style>
      <defs>
        <clipPath id="tk-in">
          <path d="M44 70 Q44 34 110 34 Q176 34 176 70 V250 Q176 270 156 270 H64 Q44 270 44 250 Z" />
        </clipPath>
        <linearGradient id="tk-steel" x1="0" x2="1">
          <stop offset="0" stopColor="#dfe7ec" />
          <stop offset="0.35" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c5d3dc" />
        </linearGradient>
      </defs>
      {/* legs */}
      <path d="M62 270 L52 296 M158 270 L168 296" stroke="#afafaf" strokeWidth="10" strokeLinecap="round" />
      {/* steam */}
      {steam &&
        [0, 0.8, 1.6].map((d) => <circle key={d} className="tk-steam" cx="110" cy="20" r="16" fill="#fff" stroke="#e5e5e5" strokeWidth="2" style={{ animationDelay: `${d}s` }} />)}
      <path d="M36 70 Q36 24 110 24 Q184 24 184 70 V252 Q184 278 158 278 H62 Q36 278 36 252 Z" fill="url(#tk-steel)" stroke="#afbcc5" strokeWidth="5" />
      <g clipPath="url(#tk-in)">
        <rect x="40" y="30" width="140" height="250" fill="#f3f7f9" />
        <motion.g initial={false} animate={{ y: top }} transition={{ type: "spring", stiffness: 120, damping: 16 }}>
          <motion.path initial={false} animate={{ fill: color }} transition={{ duration: 0.6 }}>
            <animate
              attributeName="d"
              dur="2.4s"
              repeatCount="indefinite"
              values="M30 0 Q57 -9 85 0 T140 0 T195 0 V300 H30 Z;M30 0 Q57 9 85 0 T140 0 T195 0 V300 H30 Z;M30 0 Q57 -9 85 0 T140 0 T195 0 V300 H30 Z"
            />
          </motion.path>
          {foam && (
            <motion.g initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} style={{ transformOrigin: "110px 0px" }}>
              {[50, 74, 98, 122, 146, 170].map((x, i) => (
                <circle key={x} cx={x} cy={-2} r={12 + (i % 2) * 4} fill="var(--foam)" />
              ))}
            </motion.g>
          )}
          {Array.from({ length: n }, (_, i) => (
            <circle
              key={i}
              className="tk-bub"
              cx={52 + ((i * 37) % 116)}
              cy={230 - top + ((i * 13) % 20)}
              r={2 + (i % 3)}
              fill="#fff"
              opacity="0.8"
              style={{ ["--d" as string]: `${1.2 + ((i * 7) % 10) / 10}s`, ["--h" as string]: `${-(240 - top)}px`, animationDelay: `${(i * 0.17) % 1.4}s` }}
            />
          ))}
        </motion.g>
        {/* frost */}
        <motion.g animate={{ opacity: frost * 0.9 }} initial={false}>
          <rect x="40" y="30" width="140" height="250" fill="#ddf4ff" opacity="0.35" />
          {[
            [70, 90],
            [140, 130],
            [90, 200],
            [150, 230],
            [60, 160],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`} stroke="#fff" strokeWidth="3" strokeLinecap="round">
              <path d="M-9 0 H9 M0 -9 V9 M-6 -6 L6 6 M-6 6 L6 -6" />
            </g>
          ))}
        </motion.g>
      </g>
      {/* window glare + rivets */}
      <path d="M58 80 Q54 160 58 240" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.7" fill="none" />
      {[70, 110, 150].map((x) => (
        <circle key={x} cx={x} cy="44" r="4" fill="#afbcc5" />
      ))}
      <rect x="150" y="150" width="44" height="20" rx="6" fill="#afbcc5" />
      <circle cx="194" cy="160" r="12" fill="var(--red)" stroke="var(--red-d)" strokeWidth="4" />
    </svg>
  );
}
