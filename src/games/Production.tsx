import { AnimatePresence, motion } from "motion/react";
import { Flame, Funnel, Jar, Sparkle } from "@phosphor-icons/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CONCEPTS } from "../data/content";
import { FactCard, MentorCard } from "../components/Mentor";
import { sfx } from "../lib/sfx";
import { useGame } from "../state/store";
import { FeedbackSheet, GameFrame, type GameProps } from "./common";

const STEP_TITLES = ["Собери линию подачи воды", "Проведи затор", "Запусти брожение", "Фильтровать или нет?"];
const STEP_HINTS = [
  "Поворачивай трубы, чтобы вода дошла от водоподготовки до заторного чана.",
  "Держи кнопку нагрева. Вода горячая, но не кипящая: удерживай стрелку в зелёной зоне.",
  "Добавь закваску и подбери тёплую температуру для брожения.",
  "Последнее решение перед розливом. Здесь нет неправильного ответа.",
];
const STEP_FACTS = [
  { title: "Вода готова!", text: "На каждом заводе «Очаково» своя станция водоподготовки: воду очищают, дехлорируют и умягчают.", who: "Инженер-механик" },
  { title: "Затор готов!", text: "Дроблёный солод заливают горячей водой в чанах на 65 000 литров. Нагрев и паузы чередуются час-два, потом сусло фильтруют.", who: "Аппаратчик варки" },
  { title: "Квас забродил!", text: "Брожение идёт в цилиндро-коническом танке на 700 000 литров, высотой с восьмиэтажный дом.", who: "Технолог и микробиолог" },
];

/* ---------------- pipe puzzle ---------------- */
type Tile = { kind: "straight" | "corner"; rot: number; path: boolean };
const COLS = 5;
const ROWS = 3;
// N=0 E=1 S=2 W=3
const SOLUTION: Record<string, { kind: Tile["kind"]; rot: number }> = {
  "0,1": { kind: "straight", rot: 1 },
  "1,1": { kind: "corner", rot: 2 },
  "1,2": { kind: "corner", rot: 0 },
  "2,2": { kind: "straight", rot: 1 },
  "3,2": { kind: "corner", rot: 3 },
  "3,1": { kind: "straight", rot: 0 },
  "3,0": { kind: "corner", rot: 1 },
  "4,0": { kind: "straight", rot: 1 },
};
const openings = (t: Tile) => (t.kind === "straight" ? [0, 2] : [0, 1]).map((d) => (d + t.rot) % 4);
const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

function makeGrid(): Tile[] {
  const g: Tile[] = [];
  for (let y = 0; y < ROWS; y++)
    for (let x = 0; x < COLS; x++) {
      const s = SOLUTION[`${x},${y}`];
      g.push(s ? { kind: s.kind, rot: (s.rot + 1 + Math.floor(Math.random() * 3)) % 4, path: true } : { kind: Math.random() > 0.5 ? "corner" : "straight", rot: Math.floor(Math.random() * 4), path: false });
    }
  return g;
}

/* Returns the visited cells (in order) and whether water reaches the outlet */
function trace(g: Tile[]) {
  let x = 0;
  let y = 1;
  let dir = 1; // travelling east into (0,1)
  const seen: number[] = [];
  for (let n = 0; n < 20; n++) {
    if (x === COLS && y === 0) return { seen, ok: true };
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return { seen, ok: false };
    const t = g[y * COLS + x];
    const op = openings(t);
    const entry = (dir + 2) % 4;
    if (!op.includes(entry)) return { seen, ok: false };
    seen.push(y * COLS + x);
    dir = op.find((d) => d !== entry)!;
    x += DX[dir];
    y += DY[dir];
  }
  return { seen, ok: false };
}

/* Shift 3: brewing hall. Pipe puzzle -> mash heat -> fermentation -> filter decision. */
export function Production({ onFinish, onExit }: GameProps) {
  const { drink, setDrink, setSkill, unlock } = useGame();
  const concept = CONCEPTS.find((c) => c.id === drink.concept) ?? CONCEPTS[0];
  const [step, setStep] = useState(0);
  const [sheet, setSheet] = useState<null | "good">(null);
  const [mistakes, setMistakes] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [grid, setGrid] = useState<Tile[]>(() => {
    let g = makeGrid();
    while (trace(g).ok) g = makeGrid();
    return g;
  });
  const [moves, setMoves] = useState(0);
  const [temp, setTemp] = useState(18);
  const [zoneT, setZoneT] = useState(0);
  const [starter, setStarter] = useState(false);
  const [fermT, setFermT] = useState(12);
  const [fermProg, setFermProg] = useState(0);
  const [filtered, setFiltered] = useState<boolean | null>(null);

  const flow = useMemo(() => trace(grid), [grid]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 1800);
  };
  const oops = (msg: string) => {
    sfx("bad");
    setMistakes((m) => m + 1);
    flash(msg);
  };

  /* step 0: pipes */
  const rotate = (k: number) => {
    if (step !== 0 || flow.ok) return;
    sfx("tap");
    setMoves((m) => m + 1);
    const g = grid.map((t, i) => (i === k ? { ...t, rot: (t.rot + 1) % 4 } : t));
    setGrid(g);
    if (trace(g).ok) {
      sfx("win");
      window.setTimeout(() => setSheet("good"), 900);
    }
  };

  /* step 1: mash heat (hold) */
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
        oops("Закипело! Солоду так нельзя, начинаем заново.");
      }
      if (t >= 62 && t <= 72) z += dt;
      setTemp(t);
      setZoneT(z);
      if (z >= 2.5) {
        holding.current = false;
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

  /* step 2: fermentation */
  const inFermZone = fermT >= 25 && fermT <= 30;
  useEffect(() => {
    if (step !== 2 || !starter || sheet || !inFermZone) return;
    const id = window.setInterval(() => {
      setFermProg((p) => {
        const n = Math.min(1, p + 0.05);
        if (Math.random() > 0.5) sfx("bubble");
        if (n >= 1) {
          window.clearInterval(id);
          window.setTimeout(() => setSheet("good"), 300);
        }
        return n;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [step, starter, inFermZone, sheet]);

  const next = () => {
    sfx("tap");
    setSheet(null);
    setStep((s) => s + 1);
  };

  const finish = () => {
    const pipeScore = Math.max(0, 1 - Math.max(0, moves - 10) * 0.04);
    setSkill("engineering", Math.max(0.3, pipeScore - mistakes * 0.15));
    setDrink({ filtered });
    if (mistakes === 0) unlock("engineer");
    onFinish({ stars: mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1, stat: mistakes === 0 ? "Варка без единой ошибки" : `Перегревов: ${mistakes}` });
  };

  const level = step === 0 ? (flow.ok ? 0.35 : 0.05) : step === 1 ? 0.55 : 0.75;
  const bubbles = step === 2 ? (starter ? 0.25 + (inFermZone ? 0.75 : Math.max(0, 1 - Math.abs(fermT - 27.5) / 15) * 0.5) : 0) : step === 1 ? Math.max(0, (temp - 50) / 40) : 0;
  const liquid = step === 0 ? "#7fd3ff" : concept.liquid;
  const progress = (step + (sheet ? 1 : 0) + (filtered !== null ? 1 : 0)) / 4;

  return (
    <GameFrame progress={progress} onExit={onExit} color="var(--amber)">
      <div className="mx-auto grid w-full max-w-[1040px] flex-1 items-start gap-6 px-4 pb-48 pt-2 sm:px-8 md:grid-cols-[1.15fr_1fr] md:gap-10">
        <div className="order-2 md:order-1">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ type: "spring", stiffness: 380, damping: 32 }}>
              <div className="text-sm font-black uppercase tracking-widest text-amber">Этап {step + 1} из 4</div>
              <h1 className="mt-1 text-2xl font-black text-ink sm:text-3xl">{STEP_TITLES[step]}</h1>
              <p className="mt-1 font-semibold text-ink-soft">{STEP_HINTS[step]}</p>

              <div className="mt-5">
                {step === 0 && <Pipes grid={grid} flow={flow.seen} ok={flow.ok} onRotate={rotate} />}

                {step === 1 && (
                  <div className="flex items-center gap-6">
                    <Gauge value={temp} min={18} max={85} zone={[62, 72]} unit="°C" />
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
                      onClick={() => !starter && (sfx("pop"), setStarter(true))}
                      className={`tile tile-press flex items-center gap-4 px-4 py-3 text-left ${starter ? "opacity-50" : ""}`}
                      disabled={starter}
                    >
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-l">
                        <Jar size={30} weight="fill" color="var(--amber)" />
                      </span>
                      <span>
                        <span className="block font-extrabold text-ink">{starter ? "Закваска в танке" : "Добавить фирменную закваску"}</span>
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
                      <input type="range" min={4} max={40} value={fermT} onChange={(e) => setFermT(+e.target.value)} className="brew-range mt-3 w-full" aria-label="Температура брожения" />
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
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { v: true, t: "Фильтровать", d: "Прозрачный, чистый вкус", Icon: Funnel },
                        { v: false, t: "Не фильтровать", d: "С осадком, ярче вкус", Icon: Sparkle },
                      ].map((o) => (
                        <button
                          key={String(o.v)}
                          disabled={filtered !== null}
                          onClick={() => (sfx("good"), setFiltered(o.v))}
                          className="tile tile-press flex flex-col items-center gap-2 p-4 text-center"
                          style={filtered === o.v ? { borderColor: "var(--amber)", background: "var(--amber-l)", boxShadow: "0 4px 0 var(--amber)" } : undefined}
                        >
                          <o.Icon size={34} weight="fill" color="var(--amber)" />
                          <span className="font-black text-ink">{o.t}</span>
                          <span className="text-sm font-semibold text-ink-soft">{o.d}</span>
                        </button>
                      ))}
                    </div>
                    <FactCard show={filtered !== null} color="var(--amber)">
                      «Очаковский» фильтруют, а «Семейный секрет» нет, поэтому в нём есть осадок. {filtered === concept.filtered ? "Ты поступил так же, как сделали бы на заводе с похожим квасом." : `Для похожего кваса на заводе выбрали бы «${concept.filtered ? "фильтровать" : "не фильтровать"}», но и твой вариант имеет право на жизнь.`}
                    </FactCard>
                    {filtered !== null && (
                      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="btn3d amber w-full" onClick={finish}>
                        На розлив!
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} className="mt-5 rounded-2xl bg-red-l px-4 py-3 font-extrabold text-red-d">
                {toast}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="order-1 flex flex-col items-center gap-3 md:order-2">
          <div className="w-full">
            <MentorCard id="eng" text={["Начнём с воды: без неё ничего не сварить.", "Затор: солод плюс горячая вода. Только не кипяти!", "Танк на 700 000 литров ждёт закваску.", "Последнее слово за тобой, технолог."][step]} compact />
          </div>
          <Tank level={level} color={liquid} bubbles={bubbles} steam={step === 1 && temp > 55} frost={0} foam={step >= 2 && starter} />
        </div>
      </div>

      <FeedbackSheet
        state={step < 3 ? sheet : null}
        title={STEP_FACTS[Math.min(step, 2)].title}
        text={STEP_FACTS[Math.min(step, 2)].text}
        extra={<div className="mt-3 inline-flex rounded-xl bg-surface px-3 py-2 text-sm font-extrabold text-ink">На заводе это делает: {STEP_FACTS[Math.min(step, 2)].who}</div>}
        onNext={next}
      />
      <style>{`
        .brew-range{appearance:none;height:18px;border-radius:999px;background:linear-gradient(90deg,var(--blue) 0%,var(--green) 55%,var(--green) 72%,var(--red) 100%);outline:none}
        .brew-range::-webkit-slider-thumb{appearance:none;width:34px;height:34px;border-radius:50%;background:#fff;border:4px solid var(--ink);box-shadow:0 3px 0 rgba(0,0,0,.2);cursor:grab}
        .brew-range::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:#fff;border:4px solid var(--ink);cursor:grab}
      `}</style>
    </GameFrame>
  );
}

function Pipes({ grid, flow, ok, onRotate }: { grid: Tile[]; flow: number[]; ok: boolean; onRotate: (k: number) => void }) {
  return (
    <div className="relative">
      <div className="flex items-stretch">
        <div className="flex flex-col justify-center pr-1">
          <div className="mt-[33%] rounded-l-xl bg-blue px-2 py-3 text-[10px] font-black uppercase leading-tight text-white" style={{ writingMode: "vertical-rl" }}>
            вода
          </div>
        </div>
        <div className="grid flex-1 gap-1.5 rounded-2xl bg-surface-2 p-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {grid.map((t, k) => {
            const wet = ok ? flow.includes(k) : flow.includes(k);
            const order = flow.indexOf(k);
            return (
              <button key={k} onClick={() => onRotate(k)} aria-label="Повернуть трубу" className="aspect-square rounded-xl bg-surface" style={{ boxShadow: "inset 0 -3px 0 var(--line)" }}>
                <motion.svg viewBox="0 0 60 60" className="h-full w-full" initial={false} animate={{ rotate: t.rot * 90 }} transition={{ type: "spring", stiffness: 400, damping: 22 }}>
                  {t.kind === "straight" ? (
                    <>
                      <rect x="22" y="0" width="16" height="60" fill="#afbcc5" />
                      <motion.rect x="26" y="0" width="8" height="60" initial={false} animate={{ fill: wet ? "#1cb0f6" : "#dfe7ec" }} transition={{ delay: ok ? order * 0.08 : 0 }} />
                    </>
                  ) : (
                    <>
                      <path d="M30 0 V22 Q30 30 38 30 H60" stroke="#afbcc5" strokeWidth="16" fill="none" />
                      <motion.path d="M30 0 V22 Q30 30 38 30 H60" strokeWidth="8" fill="none" initial={false} animate={{ stroke: wet ? "#1cb0f6" : "#dfe7ec" }} transition={{ delay: ok ? order * 0.08 : 0 }} />
                    </>
                  )}
                </motion.svg>
              </button>
            );
          })}
        </div>
        <div className="flex flex-col pl-1">
          <div className="rounded-r-xl px-2 py-3 text-[10px] font-black uppercase leading-tight text-white transition-colors" style={{ writingMode: "vertical-rl", background: ok ? "var(--green)" : "var(--amber)" }}>
            чан
          </div>
        </div>
      </div>
    </div>
  );
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
