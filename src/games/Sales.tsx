import { AnimatePresence, motion } from "motion/react";
import { Storefront, Truck } from "@phosphor-icons/react";
import { useState } from "react";
import { CONCEPTS, NEGOTIATION, ORDERS, PLANTS } from "../data/content";
import { FactCard, MentorCard } from "../components/Mentor";
import { sfx } from "../lib/sfx";
import { useGame } from "../state/store";
import { GameFrame, type GameProps } from "./common";

type Anchor = "start" | "middle" | "end";
const LBL: Record<string, { a: Anchor; dx: number; dy: number }> = {
  spb: { a: "start", dx: 11, dy: 4 },
  rnd: { a: "start", dx: 11, dy: 4 },
  kzn: { a: "start", dx: 11, dy: 4 },
  nsk: { a: "end", dx: -11, dy: 4 },
  ekb: { a: "middle", dx: 0, dy: 22 },
  msk: { a: "middle", dx: 0, dy: -13 },
  pnz: { a: "end", dx: -14, dy: 4 },
  krd: { a: "start", dx: 14, dy: 8 },
  tmn: { a: "middle", dx: 0, dy: -13 },
};

/* Equirectangular-ish projection for a stylized map of the western part of the country */
const proj = (lat: number, lon: number) => ({ x: 20 + (lon - 28) * 6.4, y: 20 + (62 - lat) * 15 });
function km(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371;
  const r = (d: number) => (d * Math.PI) / 180;
  const dLat = r(b.lat - a.lat);
  const dLon = r(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/* Shift 5: logistics map (ship each order from a plant) + negotiation with a retail chain
   whose arguments use your results from earlier shifts. */
export function Sales({ onFinish, onExit }: GameProps) {
  const { drink, setDrink, setSkill, unlock } = useGame();
  const [phase, setPhase] = useState<"map" | "talk" | "deal">("map");
  const [sel, setSel] = useState<string | null>(null);
  const [assign, setAssign] = useState<Record<string, string>>({});
  const [round, setRound] = useState(0);
  const [trust, setTrust] = useState(1);
  const [reply, setReply] = useState<string | null>(null);

  const nearest = (o: (typeof ORDERS)[number]) => PLANTS.reduce((b, p) => (km(o, p) < km(o, b) ? p : b), PLANTS[0]);
  const total = Object.entries(assign).reduce((s, [o, p]) => s + km(ORDERS.find((x) => x.id === o)!, PLANTS.find((x) => x.id === p)!), 0);
  const best = ORDERS.reduce((s, o) => s + km(o, nearest(o)), 0);
  const allSent = Object.keys(assign).length === ORDERS.length;
  const logiScore = allSent ? best / total : 0;

  const pickPlant = (pid: string) => {
    if (!sel) return;
    sfx("whoosh");
    setAssign({ ...assign, [sel]: pid });
    setSel(null);
  };

  const concept = CONCEPTS.find((c) => c.id === drink.concept);
  const evidence = (uses?: "qa" | "fit" | "lab") => {
    if (uses === "qa") return drink.qa !== null ? ` (брак пойман на ${Math.round(drink.qa * 100)}%)` : "";
    if (uses === "fit") return concept ? ` (концепт «${concept.name.toLowerCase()}», попадание ${Math.round(drink.fit * 100)}%)` : "";
    return "";
  };
  const bonus = (uses?: "qa" | "fit" | "lab") => {
    if (uses === "qa") return (drink.qa ?? 0.5) >= 0.8 ? 1 : 0;
    if (uses === "fit") return drink.fit >= 0.6 ? 1 : 0;
    return 0;
  };

  const say = (k: number) => {
    if (reply) return;
    const o = NEGOTIATION[round].options[k];
    const delta = o.trust + (o.trust > 0 ? bonus(o.uses) : 0);
    sfx(delta >= 2 ? "good" : delta > 0 ? "pop" : "bad");
    setTrust((t) => Math.max(0, Math.min(10, t + delta)));
    setReply(o.reply);
  };
  const nextRound = () => {
    setReply(null);
    if (round + 1 >= NEGOTIATION.length) {
      setPhase("deal");
      sfx("win");
      return;
    }
    setRound(round + 1);
  };

  const finish = () => {
    const talk = Math.min(1, trust / 9);
    const stores = Math.round(300 + talk * 2200 + logiScore * 300);
    setDrink({ stores });
    setSkill("communication", 0.5 * talk + 0.5 * logiScore);
    if (trust >= 9) unlock("negotiator");
    onFinish({ stars: talk >= 0.8 ? 3 : talk >= 0.5 ? 2 : 1, stat: `${stores} магазинов взяли партию` });
  };

  const progress = phase === "map" ? (Object.keys(assign).length / ORDERS.length) * 0.45 : phase === "talk" ? 0.45 + (round / NEGOTIATION.length) * 0.5 : 1;

  return (
    <GameFrame progress={progress} onExit={onExit} color="var(--blue)">
      <div className="mx-auto w-full max-w-[1040px] px-4 pb-16 pt-2 sm:px-8">
        {phase === "map" && (
          <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="tile overflow-hidden p-2">
              <svg viewBox="0 0 400 300" className="w-full" role="img" aria-label="Карта заводов и заказов">
                <rect width="400" height="300" rx="14" fill="var(--blue-l)" />
                <path d="M16 40 Q60 16 140 22 Q260 10 392 26 L392 292 L66 292 Q56 262 74 240 Q36 212 22 180 Q10 120 16 40 Z" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="3" />
                {/* routes */}
                {Object.entries(assign).map(([oid, pid]) => {
                  const o = ORDERS.find((x) => x.id === oid)!;
                  const p = PLANTS.find((x) => x.id === pid)!;
                  const a = proj(p.lat, p.lon);
                  const b = proj(o.lat, o.lon);
                  const good = nearest(o).id === pid;
                  return (
                    <g key={oid}>
                      <motion.line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={good ? "var(--green)" : "var(--amber)"} strokeWidth="3" strokeDasharray="6 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6 }} />
                      <motion.circle r="5" fill={good ? "var(--green)" : "var(--amber)"} initial={{ cx: a.x, cy: a.y }} animate={{ cx: [a.x, b.x], cy: [a.y, b.y] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} />
                    </g>
                  );
                })}
                {sel &&
                  PLANTS.map((p) => {
                    const a = proj(p.lat, p.lon);
                    const o = ORDERS.find((x) => x.id === sel)!;
                    const b = proj(o.lat, o.lon);
                    return <line key={p.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--ink-faint)" strokeWidth="1.5" strokeDasharray="3 4" />;
                  })}
                {/* orders */}
                {ORDERS.map((o) => {
                  const { x, y } = proj(o.lat, o.lon);
                  const done = !!assign[o.id];
                  const on = sel === o.id;
                  return (
                    <g key={o.id} onClick={() => !done && (sfx("tap"), setSel(o.id))} style={{ cursor: done ? "default" : "pointer" }} role="button" aria-label={`Заказ: ${o.name}`}>
                      {!done && <motion.circle cx={x} cy={y} r="10" fill="none" stroke="var(--red)" strokeWidth="2.5" animate={{ r: [8, 18], opacity: [1, 0] }} transition={{ duration: 1.3, repeat: Infinity }} />}
                      <circle cx={x} cy={y} r="14" fill="transparent" />
                      <rect x={x - 7} y={y - 7} width="14" height="14" rx="4" fill={done ? "var(--green)" : on ? "var(--blue)" : "var(--red)"} stroke="#fff" strokeWidth="2.5" />
                      <text x={x + LBL[o.id].dx} y={y + LBL[o.id].dy} textAnchor={LBL[o.id].a} fontSize="10" fontWeight="900" fill="var(--ink)">
                        {o.name}
                      </text>
                    </g>
                  );
                })}
                {/* plants */}
                {PLANTS.map((p) => {
                  const { x, y } = proj(p.lat, p.lon);
                  return (
                    <g key={p.id} onClick={() => pickPlant(p.id)} style={{ cursor: sel ? "pointer" : "default" }} role="button" aria-label={`Завод ${p.name}`}>
                      {sel && <motion.circle cx={x} cy={y} r="16" fill="var(--blue)" opacity="0.2" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.9, repeat: Infinity }} style={{ transformOrigin: `${x}px ${y}px` }} />}
                      <circle cx={x} cy={y} r="18" fill="transparent" />
                      <path d={`M${x - 10} ${y + 8} V${y - 2} L${x - 4} ${y - 7} V${y - 2} L${x + 2} ${y - 7} V${y - 2} L${x + 10} ${y - 8} V${y + 8} Z`} fill="var(--blue)" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
                      <text x={x + LBL[p.id].dx} y={y + LBL[p.id].dy} textAnchor={LBL[p.id].a} fontSize="10" fontWeight="900" fill="var(--blue-d)">
                        {p.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-black text-ink sm:text-3xl">Развези партию</h1>
              <MentorCard id="sales" text={sel ? `Заказ из города ${ORDERS.find((o) => o.id === sel)!.name}. С какого завода отгрузим? Чем ближе, тем дешевле и свежее.` : "Нажми на красный заказ, потом на завод, с которого его отгрузить."} compact />
              <div className="tile p-4">
                <div className="flex items-center justify-between font-extrabold text-ink">
                  <span className="flex items-center gap-2">
                    <Truck size={22} weight="fill" color="var(--blue)" /> Пробег фур
                  </span>
                  <span className="tabular-nums">{total.toLocaleString("ru")} км</span>
                </div>
                <div className="mt-1 text-sm font-bold text-ink-soft">
                  Отправлено {Object.keys(assign).length} из {ORDERS.length}
                  {allSent && ` · оптимально ${best.toLocaleString("ru")} км`}
                </div>
              </div>
              <FactCard show={allSent} color="var(--blue)">
                Заводы стоят в Москве, Пензе, Краснодаре и Тюмени. Тюменский открыли в 2007 году специально, чтобы снабжать Урал, Сибирь и Дальний Восток.
              </FactCard>
              {allSent && (
                <div className="flex gap-3">
                  <button className="btn3d ghost flex-1" onClick={() => (sfx("tap"), setAssign({}))}>
                    Переиграть
                  </button>
                  <button className="btn3d blue flex-1" onClick={() => (sfx("tap"), setPhase("talk"))}>
                    К переговорам
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {phase === "talk" && (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_300px]">
            <div>
              <AnimatePresence mode="wait">
                <motion.div key={round} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ type: "spring", stiffness: 320, damping: 30 }}>
                  <div className="flex items-start gap-3">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-surface-2">
                      <Storefront size={34} weight="duotone" color="var(--blue)" />
                    </span>
                    <div className="tile relative flex-1 px-4 py-3">
                      <div className="text-xs font-black uppercase tracking-wider text-ink-faint">Категорийный менеджер сети</div>
                      <div className="mt-1 text-lg font-black text-ink">«{NEGOTIATION[round].buyer}»</div>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {NEGOTIATION[round].options.map((o, k) => (
                      <motion.button key={k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: reply ? 0.6 : 1, y: 0 }} transition={{ delay: k * 0.07 }} disabled={!!reply} onClick={() => say(k)} className="tile tile-press px-5 py-4 text-left font-extrabold text-ink">
                        {o.text}
                        {o.uses && <span className="text-blue">{evidence(o.uses)}</span>}
                      </motion.button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {reply && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col gap-3 rounded-2xl bg-blue-l p-4 sm:flex-row sm:items-center">
                        <p className="flex-1 font-bold text-ink">Сеть: «{reply}»</p>
                        <button className="btn3d blue" onClick={nextRound}>
                          {round + 1 >= NEGOTIATION.length ? "Итог" : "Дальше"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>
            <aside className="tile p-5">
              <div className="font-black text-ink">Доверие сети</div>
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 10 }, (_, k) => (
                  <motion.span key={k} className="h-6 flex-1 rounded-md" animate={{ background: k < trust ? "var(--blue)" : "var(--line)", scale: k === trust - 1 ? [1, 1.3, 1] : 1 }} />
                ))}
              </div>
              <p className="mt-3 text-sm font-bold text-ink-soft">Аргументы, подкреплённые твоими результатами прошлых смен, работают сильнее.</p>
            </aside>
          </div>
        )}

        {phase === "deal" && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto flex max-w-[560px] flex-col items-center gap-5 pt-6 text-center">
            <Storefront size={80} weight="duotone" color="var(--blue)" />
            <h1 className="text-3xl font-black text-ink">{trust >= 7 ? "Сделка!" : trust >= 4 ? "Возьмём на пробу" : "Только тестовая поставка"}</h1>
            <p className="text-lg font-semibold text-ink-soft">Сеть ставит «{drink.name || "твой квас"}» на полки. Чем выше доверие, тем больше магазинов.</p>
            <FactCard show color="var(--blue)" title="Кто это делает на заводе">
              Менеджеры по ключевым клиентам ведут федеральные сети, торговые представители работают с магазинами в регионах, а логисты планируют отгрузки с четырёх заводов. Напитки «Очаково» уходят на экспорт более чем в 30 стран.
            </FactCard>
            <button className="btn3d blue w-full" onClick={finish}>
              Отгружаем!
            </button>
          </motion.div>
        )}
      </div>
    </GameFrame>
  );
}
