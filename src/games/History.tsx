import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ARTIFACTS, HISTORY_SCENES, MAP_POINTS, SHELF_ITEMS, type SceneKind } from "../data/content";
import { MentorCard } from "../components/Mentor";
import { ArtifactIcon } from "../components/Collect";
import { KineticText } from "../components/ui";
import { sfx } from "../lib/sfx";
import { useGame } from "../state/store";
import { GameFrame, type GameProps } from "./common";

/* Interactive excursion: each era is a small hands-on scene. You do the thing,
   then read what actually happened, then the exhibit goes to the museum. No quiz. */
export function History({ onFinish, onExit }: GameProps) {
  const addArtifact = useGame((s) => s.addArtifact);
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState(false);
  const scene = HISTORY_SCENES[i];
  const art = ARTIFACTS.find((a) => a.id === scene.artifact)!;

  const solve = () => {
    if (solved) return;
    sfx("good");
    setSolved(true);
    window.setTimeout(() => addArtifact(scene.artifact), 500);
  };
  const next = () => {
    sfx("whoosh");
    if (i + 1 >= HISTORY_SCENES.length) return onFinish({ stars: 3, stat: "6 экспонатов в музее" });
    setSolved(false);
    setI(i + 1);
  };

  return (
    <GameFrame progress={(i + (solved ? 1 : 0)) / HISTORY_SCENES.length} onExit={onExit}>
      <div className="mx-auto grid w-full max-w-[1040px] flex-1 items-start gap-6 px-4 pb-16 pt-2 sm:px-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 60, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: -60, rotate: -2 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative overflow-hidden rounded-[28px] border-2 border-line bg-surface-2"
            style={{ boxShadow: "0 6px 0 var(--line)" }}
          >
            <div className="flex items-baseline justify-between px-5 pt-4">
              <div className="text-4xl font-black text-green sm:text-5xl">
                <KineticText text={scene.year} />
              </div>
              <span className="text-sm font-black text-ink-faint">
                {i + 1} из {HISTORY_SCENES.length}
              </span>
            </div>
            <div className="px-5 text-lg font-black text-ink">{scene.title}</div>
            <div className="mt-2 aspect-[4/3] w-full">
              <Scene kind={scene.kind} solved={solved} onSolve={solve} />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col gap-4 lg:pt-4">
          <MentorCard id="guide" text={solved ? "Вот как это было на самом деле:" : scene.task} compact />
          <AnimatePresence mode="wait">
            {solved ? (
              <motion.div key="fact" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                <div className="tile p-5 text-[17px] font-bold leading-relaxed text-ink">{scene.fact}</div>
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.35, type: "spring", stiffness: 380, damping: 14 }}
                  className="flex items-center gap-3 rounded-2xl bg-green-l p-3"
                >
                  <ArtifactIcon art={art.art} color={art.color} size={56} />
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-green-d">Экспонат в музей</div>
                    <div className="font-black text-ink">{art.title}</div>
                  </div>
                </motion.div>
                <button className="btn3d w-full" onClick={next}>
                  {i + 1 >= HISTORY_SCENES.length ? "К своей первой смене" : "Следующая эпоха"}
                </button>
              </motion.div>
            ) : (
              <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hidden text-sm font-bold text-ink-faint lg:block">
                Взаимодействуй со сценой слева
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </GameFrame>
  );
}

function Scene({ kind, solved, onSolve }: { kind: SceneKind; solved: boolean; onSolve: () => void }) {
  if (kind === "launch") return <LaunchScene solved={solved} onSolve={onSolve} />;
  if (kind === "rivals") return <RivalsScene solved={solved} onSolve={onSolve} />;
  if (kind === "ferment") return <FermentScene solved={solved} onSolve={onSolve} />;
  if (kind === "label") return <LabelScene solved={solved} onSolve={onSolve} />;
  if (kind === "map") return <MapScene solved={solved} onSolve={onSolve} />;
  return <ShelfScene solved={solved} onSolve={onSolve} />;
}

type SP = { solved: boolean; onSolve: () => void };

/* 1978: dark plant, pull the switch, lights and fireworks */
function LaunchScene({ solved, onSolve }: SP) {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="Комбинат ночью и рубильник">
      <motion.rect width="400" height="300" initial={false} animate={{ fill: solved ? "#bdeaff" : "#22313a" }} transition={{ duration: 1 }} />
      {!solved && [40, 120, 300, 350, 210].map((x, k) => <circle key={k} cx={x} cy={30 + (k % 3) * 22} r="2" fill="#fff" opacity="0.7" />)}
      {solved &&
        [80, 200, 320].map((x, k) => (
          <motion.g key={x} initial={{ scale: 0, opacity: 1 }} animate={{ scale: [0, 1.2, 1.4], opacity: [1, 1, 0] }} transition={{ duration: 1.4, delay: 0.3 + k * 0.25, repeat: 2, repeatDelay: 0.4 }} style={{ transformOrigin: `${x}px 60px` }}>
            {Array.from({ length: 10 }, (_, j) => (
              <line key={j} x1={x} y1={60} x2={x + Math.cos((j / 10) * Math.PI * 2) * 30} y2={60 + Math.sin((j / 10) * Math.PI * 2) * 30} stroke={["#ffc800", "#ff4b4b", "#58cc02", "#1cb0f6"][j % 4]} strokeWidth="4" strokeLinecap="round" />
            ))}
          </motion.g>
        ))}
      <rect x="0" y="240" width="400" height="60" fill={solved ? "#58cc02" : "#2f4a2a"} />
      {/* plant */}
      <rect x="70" y="120" width="220" height="120" rx="10" fill={solved ? "#fff" : "#3a4a53"} />
      <path d="M70 130 L110 96 L150 130 L190 96 L230 130 L270 96 L290 114 V130 Z" fill={solved ? "#ff4b4b" : "#4a5a63"} />
      {[0, 1, 2, 3].map((k) => (
        <motion.rect key={k} x={92 + k * 50} y="150" width="34" height="30" rx="6" initial={false} animate={{ fill: solved ? "#ffd84d" : "#26343b" }} transition={{ delay: 0.15 * k + 0.2 }} />
      ))}
      <rect x="160" y="196" width="44" height="44" rx="6" fill={solved ? "#ff9600" : "#26343b"} />
      <motion.text x="180" y="86" textAnchor="middle" fontWeight="900" fontSize="15" initial={{ opacity: 0 }} animate={{ opacity: solved ? 1 : 0 }} fill="#ff4b4b">
        МОСКВА-80
      </motion.text>
      {/* switch */}
      <g style={{ cursor: solved ? "default" : "pointer" }} onClick={onSolve} role="button" aria-label="Дёрнуть рубильник">
        <rect x="296" y="110" width="100" height="140" fill="transparent" />
        <rect x="316" y="150" width="56" height="86" rx="10" fill="#afafaf" stroke="#8f8f8f" strokeWidth="4" />
        <motion.g initial={false} animate={{ rotate: solved ? 50 : -40 }} transition={{ type: "spring", stiffness: 300, damping: 12 }} style={{ transformOrigin: "344px 206px" }}>
          <rect x="339" y="150" width="10" height="56" rx="5" fill="#4b4b4b" />
          <circle cx="344" cy="150" r="12" fill="var(--red)" />
        </motion.g>
        <circle cx="344" cy="206" r="8" fill="#4b4b4b" />
        {!solved && (
          <motion.circle cx="344" cy="150" r="20" fill="none" stroke="#ffc800" strokeWidth="4" animate={{ r: [16, 28], opacity: [1, 0] }} transition={{ duration: 1.2, repeat: Infinity }} style={{ transform: "rotate(-40deg)", transformOrigin: "344px 206px" }} />
        )}
      </g>
    </svg>
  );
}

/* 1979: three bottles, our own + two foreign brands, tap to run each line */
function RivalsScene({ solved, onSolve }: SP) {
  const [on, setOn] = useState<number[]>([]);
  const items = [
    { c: "#1b5fae", label: "Pepsi" },
    { c: "#ff8a00", label: "Fanta" },
    { c: "#8a4508", label: "Своё" },
  ];
  const tap = (k: number) => {
    if (on.includes(k)) return;
    sfx("pop");
    const n = [...on, k];
    setOn(n);
    if (n.length === 3) window.setTimeout(onSolve, 500);
  };
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="Три линии розлива">
      <rect width="400" height="300" fill="var(--blue-l)" />
      {items.map((it, k) => {
        const active = on.includes(k) || solved;
        const y = 70 + k * 78;
        return (
          <g key={k} onClick={() => tap(k)} style={{ cursor: "pointer" }} role="button" aria-label={`Линия ${it.label}`}>
            <rect x="10" y={y - 24} width="380" height="78" fill="transparent" />
            <rect x="20" y={y + 40} width="360" height="10" rx="5" fill="#4b4b4b" />
            {[0, 1, 2, 3].map((j) => (
              <motion.g key={j} initial={false} animate={active ? { x: [0, 90] } : { x: 0 }} transition={active ? { duration: 1.6, repeat: Infinity, ease: "linear" } : {}}>
                <g transform={`translate(${30 + j * 90} ${y - 6})`}>
                  <rect x="0" y="14" width="22" height="32" rx="7" fill={it.c} opacity={active ? 1 : 0.35} />
                  <rect x="6" y="2" width="10" height="14" rx="4" fill={it.c} opacity={active ? 1 : 0.35} />
                  <rect x="0" y="24" width="22" height="10" fill="#fff" opacity={active ? 0.9 : 0.3} />
                </g>
              </motion.g>
            ))}
            <motion.g initial={false} animate={{ scale: active ? 1 : 0.8, opacity: active ? 1 : 0.85 }}>
              <rect x="300" y={y - 18} width="84" height="26" rx="13" fill={active ? it.c : "#fff"} stroke={it.c} strokeWidth="3" />
              <text x="342" y={y} textAnchor="middle" fontWeight="900" fontSize="13" fill={active ? "#fff" : it.c}>
                {active ? it.label : "Нажми"}
              </text>
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
}

/* 1996: add starter, two kinds of bubbles appear */
function FermentScene({ solved, onSolve }: SP) {
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="Танк брожения">
        <rect width="400" height="300" fill="var(--amber-l)" />
        <defs>
          <clipPath id="hs-tank"><rect x="130" y="40" width="140" height="230" rx="60" /></clipPath>
        </defs>
        <rect x="130" y="40" width="140" height="230" rx="60" fill="#eef3f6" stroke="#afbcc5" strokeWidth="6" />
        <g clipPath="url(#hs-tank)">
          <rect x="120" y="110" width="160" height="170" fill="#b8620f" />
          {solved &&
            Array.from({ length: 16 }, (_, k) => (
              <circle
                key={k}
                cx={146 + ((k * 23) % 110)}
                cy={258}
                r={k % 2 ? 4 : 6}
                fill={k % 2 ? "#fff" : "#ffd84d"}
                style={{ animation: `hs-rise ${1.4 + (k % 4) * 0.3}s ease-in ${(k * 0.13) % 1.2}s infinite` }}
              />
            ))}
        </g>
        <style>{`@keyframes hs-rise{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(-150px);opacity:.2}}`}</style>
        {solved && (
          <g fontWeight="900" fontSize="12">
            <circle cx="40" cy="250" r="7" fill="#ffd84d" />
            <text x="54" y="254" fill="var(--ink)">дрожжи: спиртовое</text>
            <circle cx="40" cy="274" r="5" fill="#fff" stroke="#afafaf" />
            <text x="54" y="278" fill="var(--ink)">бактерии: молочнокислое</text>
          </g>
        )}
      </svg>
      {!solved && (
        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 14 }} onClick={onSolve} className="btn3d amber absolute bottom-4 left-1/2 -translate-x-1/2">
          Добавить закваску
        </motion.button>
      )}
    </div>
  );
}

/* 1998: slap the label onto the new dark kvass */
function LabelScene({ solved, onSolve }: SP) {
  return (
    <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="Бутылка кваса">
      <rect width="400" height="300" fill="var(--red-l)" />
      <g onClick={onSolve} style={{ cursor: solved ? "default" : "pointer" }} role="button" aria-label="Наклеить этикетку">
        <path d="M182 30 H218 V80 Q254 98 254 136 V262 Q254 276 240 276 H160 Q146 276 146 262 V136 Q146 98 182 80 Z" fill="#6b3410" />
        <rect x="176" y="20" width="48" height="18" rx="6" fill="var(--red)" />
        <path d="M162 130 Q158 190 162 250" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.3" fill="none" />
        <motion.g
          initial={false}
          animate={solved ? { y: 0, rotate: 0, scale: 1 } : { y: -110, rotate: -14, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          style={{ transformOrigin: "200px 190px" }}
        >
          <rect x="146" y="150" width="108" height="76" rx="6" fill="#ffc800" stroke="#e5a800" strokeWidth="3" />
          <text x="200" y="182" textAnchor="middle" fontWeight="900" fontSize="15" fill="#8a1c1c">
            Очаковский
          </text>
          <text x="200" y="204" textAnchor="middle" fontWeight="800" fontSize="11" fill="#8a1c1c">
            квас · 1998
          </text>
        </motion.g>
        {!solved && (
          <motion.text x="200" y="295" textAnchor="middle" fontWeight="900" fontSize="14" fill="var(--red)" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }}>
            Нажми на бутылку
          </motion.text>
        )}
      </g>
    </svg>
  );
}

/* 2000-2007: light up the map */
function MapScene({ solved, onSolve }: SP) {
  const [lit, setLit] = useState<string[]>([]);
  const [last, setLast] = useState<string | null>(null);
  const tap = (id: string) => {
    if (lit.includes(id)) return;
    sfx("pop");
    const n = [...lit, id];
    setLit(n);
    setLast(id);
    if (n.length === MAP_POINTS.length) window.setTimeout(onSolve, 700);
  };
  const lp = MAP_POINTS.find((p) => p.id === last);
  return (
    <svg viewBox="0 0 320 240" className="h-full w-full" role="img" aria-label="Карта предприятий">
      <rect width="320" height="240" fill="var(--blue-l)" />
      <path d="M60 120 Q55 80 90 70 Q120 40 170 52 Q210 30 260 40 Q300 36 312 70 Q318 110 296 130 Q270 150 240 140 Q210 150 180 160 Q150 170 120 180 Q105 214 88 210 Q76 194 84 170 Q66 160 60 120 Z" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="3" />
      {lit.length > 1 &&
        MAP_POINTS.filter((p) => lit.includes(p.id) && p.id !== "msk").map((p) => (
          <motion.line key={p.id} x1={104} y1={100} x2={p.x} y2={p.y} stroke="var(--purple)" strokeWidth="2.5" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
        ))}
      {MAP_POINTS.map((p) => {
        const on = lit.includes(p.id) || solved;
        return (
          <g key={p.id} onClick={() => tap(p.id)} style={{ cursor: "pointer" }} role="button" aria-label={p.name}>
            {!on && <motion.circle cx={p.x} cy={p.y} r="10" fill="none" stroke="var(--purple)" strokeWidth="3" animate={{ r: [8, 18], opacity: [1, 0] }} transition={{ duration: 1.3, repeat: Infinity }} />}
            <circle cx={p.x} cy={p.y} r="16" fill="transparent" />
            <motion.circle cx={p.x} cy={p.y} initial={false} animate={{ r: on ? 9 : 6, fill: on ? "var(--purple)" : "#afafaf" }} transition={{ type: "spring", stiffness: 500, damping: 12 }} stroke="#fff" strokeWidth="3" />
            {on && (
              <text x={p.x} y={p.y + p.dy} textAnchor="middle" fontWeight="900" fontSize="10" fill="var(--ink)">
                {p.name}
              </text>
            )}
          </g>
        );
      })}
      <AnimatePresence>
        {lp && !solved && (
          <motion.g key={lp.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <rect x="10" y="200" width="300" height="30" rx="10" fill="var(--purple)" />
            <text x="160" y="220" textAnchor="middle" fontWeight="900" fontSize="12" fill="#fff">
              {lp.year} · {lp.name}: {lp.what}
            </text>
          </motion.g>
        )}
      </AnimatePresence>
      <text x="300" y="20" textAnchor="end" fontWeight="900" fontSize="11" fill="var(--ink-faint)">
        {lit.length}/{MAP_POINTS.length}
      </text>
    </svg>
  );
}

/* 2013-2022: unwrap the new products */
function ShelfScene({ solved, onSolve }: SP) {
  const [open, setOpen] = useState<number[]>([]);
  const tap = (k: number) => {
    if (open.includes(k)) return;
    sfx("pop");
    const n = [...open, k];
    setOpen(n);
    if (n.length === SHELF_ITEMS.length) window.setTimeout(onSolve, 700);
  };
  return (
    <div className="grid h-full w-full grid-cols-2 gap-3 bg-[var(--surface-2)] p-4 sm:grid-cols-4">
      {SHELF_ITEMS.map((it, k) => {
        const on = open.includes(k) || solved;
        return (
          <motion.button key={it.name} onClick={() => tap(k)} whileTap={{ scale: 0.94 }} className="relative overflow-hidden rounded-2xl border-2 border-line bg-surface p-2 text-center" style={{ perspective: 600 }}>
            <AnimatePresence mode="wait" initial={false}>
              {on ? (
                <motion.div key="open" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="flex h-full flex-col items-center justify-center gap-1 py-2">
                  <span className="h-14 w-9 rounded-lg" style={{ background: it.color, boxShadow: "inset 0 -10px 0 rgba(0,0,0,.12)" }} />
                  <span className="text-sm font-black leading-tight text-ink">{it.name}</span>
                  <span className="text-xs font-black text-green">{it.year}</span>
                  <span className="text-[11px] font-bold leading-tight text-ink-soft">{it.what}</span>
                </motion.div>
              ) : (
                <motion.div key="wrap" exit={{ rotateY: -90 }} className="grid h-full min-h-[120px] place-items-center rounded-xl" style={{ background: "repeating-linear-gradient(45deg,var(--pink) 0 12px,#ff9fdc 12px 24px)" }}>
                  <span className="rounded-lg bg-surface px-2 py-1 text-xs font-black text-pink">Открыть</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
