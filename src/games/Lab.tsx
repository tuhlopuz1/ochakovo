import { AnimatePresence, motion } from "motion/react";
import { Flask } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { CONCEPTS } from "../data/content";
import { FactCard, MentorCard } from "../components/Mentor";
import { Mascot } from "../components/Mascot";
import { sfx } from "../lib/sfx";
import { useGame } from "../state/store";
import { GameFrame, type GameProps } from "./common";

type Dim = "sweet" | "sour" | "body" | "gas";
const DIM_NAME: Record<Dim, string> = { sweet: "Сладость", sour: "Кислинка", body: "Насыщенность", gas: "Газация" };
const MAX_TRIES = 4;

interface Recipe {
  malt: number;
  sugar: number;
  time: number;
  gas: number;
  roast: boolean;
}

/* Taste model: acidity is not a knob, it comes from fermentation time; yeast eats sugar. */
function taste(r: Recipe): Record<Dim, number> {
  const clamp = (v: number) => Math.max(0, Math.min(5, v));
  return {
    body: clamp(r.malt + (r.roast ? 0.5 : 0)),
    sour: clamp((r.time / 24) * 5),
    sweet: clamp(r.sugar - (r.time / 24) * 2),
    gas: r.gas,
  };
}

/* Shift 2: balance a recipe for the concept chosen in marketing. Tasting panel gives feedback. */
export function Lab({ onFinish, onExit }: GameProps) {
  const { drink, setDrink, setSkill, unlock } = useGame();
  const concept = CONCEPTS.find((c) => c.id === drink.concept) ?? CONCEPTS[0];
  const [r, setR] = useState<Recipe>({ malt: 2, sugar: 4, time: 6, gas: 2, roast: false });
  const [tries, setTries] = useState(0);
  const [result, setResult] = useState<null | { ok: boolean; notes: string[]; t: Record<Dim, number> }>(null);
  const [brewing, setBrewing] = useState(false);
  const t = useMemo(() => taste(r), [r]);

  const test = () => {
    sfx("bubble");
    setBrewing(true);
    window.setTimeout(() => {
      const tt = taste(r);
      const notes: string[] = [];
      const tg = concept.target;
      const off = (d: Dim) => (tt[d] < tg[d][0] ? -1 : tt[d] > tg[d][1] ? 1 : 0);
      if (r.roast !== tg.roast) notes.push(tg.roast ? "Цвет бледный. Для такого кваса солод обжаривают." : "Слишком тёмный. Здесь солод не обжаривают.");
      if (off("sweet") > 0) notes.push("Приторно. Меньше сахара или пусть бродит дольше: дрожжи съедят сахар.");
      if (off("sweet") < 0) notes.push("Совсем не сладко. Добавь сахара.");
      if (off("sour") < 0) notes.push("Не хватает кислинки. Дай квасу побродить подольше.");
      if (off("sour") > 0) notes.push("Слишком кисло. Сократи время брожения.");
      if (off("body") < 0) notes.push("Пустовато. Нужно больше солода.");
      if (off("body") > 0) notes.push("Тяжеловато. Чуть меньше солода.");
      if (off("gas") < 0) notes.push("Мало пузырьков.");
      if (off("gas") > 0) notes.push("Слишком газированный, щиплет язык.");
      const ok = notes.length === 0;
      const n = tries + 1;
      setTries(n);
      setBrewing(false);
      setResult({ ok, notes, t: tt });
      sfx(ok ? "win" : "bad");
    }, 1100);
  };

  const finish = (solvedByMentor = false) => {
    const recipe = solvedByMentor ? mentorRecipe(concept.target) : r;
    setDrink({ recipe, labTries: tries });
    const score = solvedByMentor ? 0.35 : [1, 0.85, 0.65, 0.5][tries - 1] ?? 0.5;
    setSkill("precision", score);
    if (tries === 1 && !solvedByMentor) unlock("chemist");
    onFinish({ stars: solvedByMentor ? 1 : tries <= 2 ? 3 : 2, stat: solvedByMentor ? "Рецепт довела наставница" : `Попыток: ${tries}` });
  };

  const done = result?.ok;
  const outOfTries = !done && tries >= MAX_TRIES;
  const liquid = r.roast ? "#6b3410" : r.malt >= 4 ? "#b8620f" : "#d8b86a";

  return (
    <GameFrame progress={done ? 1 : tries / MAX_TRIES} onExit={onExit} color="var(--purple)" right={<span className="whitespace-nowrap text-sm font-black text-purple">{Math.max(0, MAX_TRIES - tries)} пробы</span>}>
      <div className="mx-auto grid w-full max-w-[1040px] items-start gap-8 px-4 pb-16 pt-2 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-2xl font-black text-ink sm:text-3xl">Рецепт: {concept.name.toLowerCase()}</h1>
          <div className="mt-4">
            <MentorCard id="tech" text={`${concept.desc}. Подбери рецепт и отдай на дегустацию. Кислоту не добавляем: она появляется сама, пока квас бродит.`} compact />
          </div>

          <div className="tile mt-5 flex flex-col gap-5 p-5">
            <Knob label="Солод" value={r.malt} min={1} max={5} onChange={(v) => setR({ ...r, malt: v })} disabled={done} />
            <Knob label="Сахар" value={r.sugar} min={1} max={5} onChange={(v) => setR({ ...r, sugar: v })} disabled={done} />
            <Knob label="Брожение, часов" value={r.time} min={4} max={24} step={2} onChange={(v) => setR({ ...r, time: v })} disabled={done} />
            <Knob label="Газация" value={r.gas} min={1} max={5} onChange={(v) => setR({ ...r, gas: v })} disabled={done} />
            <label className="flex cursor-pointer items-center justify-between font-extrabold text-ink">
              Обжарить солод
              <button
                role="switch"
                aria-checked={r.roast}
                disabled={done}
                onClick={() => (sfx("tap"), setR({ ...r, roast: !r.roast }))}
                className="relative h-8 w-14 rounded-full transition-colors"
                style={{ background: r.roast ? "var(--kvass)" : "var(--line)" }}
              >
                <motion.span layout className="absolute top-1 h-6 w-6 rounded-full bg-white shadow" style={{ left: r.roast ? 28 : 4 }} transition={{ type: "spring", stiffness: 600, damping: 30 }} />
              </button>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="tile flex items-center gap-5 p-5">
            <Beaker color={liquid} gas={r.gas} brewing={brewing} />
            <div className="flex-1 space-y-3">
              {(Object.keys(DIM_NAME) as Dim[]).map((d) => (
                <TasteBar key={d} label={DIM_NAME[d]} value={t[d]} band={tries > 0 ? concept.target[d] : null} />
              ))}
              <div className="text-xs font-bold text-ink-faint">{tries > 0 ? "Зелёная зона: что ждут дегустаторы" : "Зоны вкуса откроются после первой пробы"}</div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div key={tries} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-2xl p-4" style={{ background: result.ok ? "var(--green-l)" : "var(--red-l)" }}>
                <div className="flex items-center gap-3">
                  <Mascot size={56} mood={result.ok ? "happy" : "think"} bounce={false} />
                  <div className="text-lg font-black" style={{ color: result.ok ? "var(--green-d)" : "var(--red-d)" }}>
                    {result.ok ? "Дегустаторы в восторге!" : "Дегустаторы говорят:"}
                  </div>
                </div>
                {!result.ok && (
                  <ul className="mt-2 space-y-1.5">
                    {result.notes.map((n, k) => (
                      <motion.li key={n} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: k * 0.12 }} className="font-bold text-ink">
                        {n}
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <FactCard show={!!done} color="var(--purple)">
            Квас «Очаково» двойного брожения: фирменная закваска из чистых культур дрожжей и молочнокислых бактерий. Зерно компания выращивает сама, а солод делает на своей солодовне в Липецкой области.
          </FactCard>

          {done ? (
            <button className="btn3d purple w-full" onClick={() => finish()}>
              Рецепт утверждён
            </button>
          ) : outOfTries ? (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-surface-2 p-4 font-bold text-ink">Марина: «Бывает! С первой партией у всех так. Давай я подкручу, а ты запоминай».</div>
              <button className="btn3d purple w-full" onClick={() => finish(true)}>
                Принять рецепт наставницы
              </button>
            </div>
          ) : (
            <button className="btn3d purple w-full" disabled={brewing} onClick={test}>
              <Flask size={20} weight="fill" /> {brewing ? "Бродит..." : "Сварить пробную партию"}
            </button>
          )}
        </div>
      </div>
    </GameFrame>
  );
}

function mentorRecipe(tg: (typeof CONCEPTS)[number]["target"]): Recipe {
  // invert the taste model to the middle of each target band
  const mid = (b: [number, number]) => (b[0] + b[1]) / 2;
  const time = Math.round(((mid(tg.sour) / 5) * 24) / 2) * 2;
  return { malt: Math.round(mid(tg.body) - (tg.roast ? 0.5 : 0)), sugar: Math.round(mid(tg.sweet) + (time / 24) * 2), time, gas: Math.round(mid(tg.gas)), roast: tg.roast };
}

function Knob({ label, value, min, max, step = 1, onChange, disabled }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; disabled?: boolean }) {
  const steps = Math.round((max - min) / step) + 1;
  return (
    <div className={disabled ? "opacity-60" : ""}>
      <div className="flex items-baseline justify-between font-extrabold text-ink">
        <span>{label}</span>
        <motion.span key={value} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="text-xl font-black tabular-nums text-purple">
          {value}
        </motion.span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {Array.from({ length: steps }, (_, k) => {
          const v = min + k * step;
          const on = v <= value;
          return (
            <button
              key={v}
              disabled={disabled}
              aria-label={`${label}: ${v}`}
              onClick={() => (sfx("tap"), onChange(v))}
              className="h-7 flex-1 rounded-lg transition-colors"
              style={{ background: on ? "var(--purple)" : "var(--line)", boxShadow: on ? "inset 0 -3px 0 var(--purple-d)" : "inset 0 -3px 0 var(--line-strong)" }}
            />
          );
        })}
      </div>
    </div>
  );
}

function TasteBar({ label, value, band }: { label: string; value: number; band: [number, number] | null }) {
  const inBand = band && value >= band[0] && value <= band[1];
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm font-extrabold text-ink">
        <span>{label}</span>
        <span style={{ color: band ? (inBand ? "var(--green)" : "var(--red)") : "var(--ink-faint)" }}>{value.toFixed(1)}</span>
      </div>
      <div className="relative h-3 rounded-full bg-line">
        {band && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-y-0 rounded-full bg-green/40" style={{ left: `${(band[0] / 5) * 100}%`, width: `${((band[1] - band[0]) / 5) * 100}%` }} />}
        <motion.div className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-surface" animate={{ left: `${(value / 5) * 100}%` }} transition={{ type: "spring", stiffness: 300, damping: 22 }} style={{ background: band ? (inBand ? "var(--green)" : "var(--red)") : "var(--purple)" }} />
      </div>
    </div>
  );
}

function Beaker({ color, gas, brewing }: { color: string; gas: number; brewing: boolean }) {
  return (
    <motion.svg viewBox="0 0 100 140" width="96" className="shrink-0" animate={brewing ? { rotate: [0, -6, 6, -4, 4, 0] } : { rotate: 0 }} transition={{ duration: 1 }} aria-hidden>
      <defs>
        <clipPath id="lab-beaker"><path d="M30 10 H70 V48 L92 118 Q96 132 82 132 H18 Q4 132 8 118 L30 48 Z" /></clipPath>
      </defs>
      <g clipPath="url(#lab-beaker)">
        <rect x="0" y="0" width="100" height="140" fill="#f3f7f9" />
        <motion.rect x="0" y="62" width="100" height="80" animate={{ fill: color }} transition={{ duration: 0.5 }} />
        {Array.from({ length: gas * 3 + (brewing ? 8 : 0) }, (_, k) => (
          <circle key={k} cx={20 + ((k * 17) % 60)} cy={128} r={1.5 + (k % 3)} fill="#fff" opacity="0.85" style={{ animation: `lab-rise ${0.9 + (k % 4) * 0.3}s ease-in ${(k * 0.17) % 1}s infinite` }} />
        ))}
      </g>
      <path d="M30 10 H70 V48 L92 118 Q96 132 82 132 H18 Q4 132 8 118 L30 48 Z" fill="none" stroke="var(--purple-d)" strokeWidth="5" strokeLinejoin="round" />
      <path d="M24 6 H76" stroke="var(--purple-d)" strokeWidth="6" strokeLinecap="round" />
      <style>{`@keyframes lab-rise{0%{transform:translateY(0);opacity:0}20%{opacity:1}100%{transform:translateY(-62px);opacity:0}}`}</style>
    </motion.svg>
  );
}
