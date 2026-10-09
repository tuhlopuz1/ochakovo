import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { CheckCircle, DownloadSimple, ShareNetwork, X } from "@phosphor-icons/react";
import { useRef, useState, type FormEvent, type PointerEvent } from "react";
import { SKILLS, TRACKS, type SkillId } from "../data/content";
import { DrinkBottle } from "../components/Collect";
import { Confetti, KineticText } from "../components/ui";
import { sfx } from "../lib/sfx";
import { topSkill, useGame } from "../state/store";

/* Finale: your own bottle with a generated label, a skill profile built from how you played,
   the matching career ladder and a one-tap application. */
export function FinalScreen({ onClose }: { onClose: () => void }) {
  const g = useGame();
  const [sent, setSent] = useState(g.applied);
  const [shared, setShared] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const top = topSkill(g.skills);
  const track = TRACKS[top];

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-14, 14]), { stiffness: 200, damping: 18 });
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const download = async () => {
    const blob = await labelPng(svgRef.current, g.drink.name || "Первая партия", g.name);
    if (!blob) return;
    const file = new File([blob], "pervaya-partiya.png", { type: "image/png" });
    const text = `Я выпустил(а) свой квас «${g.drink.name}» в Очаково Квесте!`;
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        setShared(true);
        return;
      }
    } catch {
      /* share cancelled, fall back to download */
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(a.href);
    sfx("coin");
    setShared(true);
  };

  return (
    <motion.div className="fixed inset-0 z-50 overflow-y-auto bg-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Confetti count={150} origin={{ x: 0.5, y: 0.2 }} />
      <button onClick={onClose} aria-label="Закрыть" className="fixed right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-ink-soft hover:text-ink">
        <X size={26} weight="bold" />
      </button>

      {/* the bottle */}
      <section className="mx-auto grid max-w-[1080px] items-center gap-8 px-4 pb-6 pt-12 sm:px-8 lg:grid-cols-[1fr_1fr]">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <div className="text-sm font-black uppercase tracking-[0.2em] text-green">Первая партия готова</div>
          <h1 className="mt-2 text-4xl font-black leading-[1.05] text-ink sm:text-5xl">
            <KineticText text={`«${g.drink.name || "Без названия"}» на полке!`} />
          </h1>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["Магазинов", g.drink.stores ?? "-"],
              ["Брак пойман", g.drink.qa !== null ? `${Math.round(g.drink.qa * 100)}%` : "-"],
              ["Проб рецепта", g.drink.labTries || "-"],
            ].map(([k, v], i) => (
              <motion.div key={k} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="tile px-2 py-3 text-center">
                <div className="text-2xl font-black text-ink">{v}</div>
                <div className="text-xs font-extrabold text-ink-soft">{k}</div>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:justify-start">
            <button className="btn3d" onClick={download}>
              {shared ? <CheckCircle size={20} weight="fill" /> : "canShare" in navigator ? <ShareNetwork size={20} weight="bold" /> : <DownloadSimple size={20} weight="bold" />}
              {shared ? "Готово" : "Поделиться этикеткой"}
            </button>
          </div>
        </div>
        <motion.div
          initial={{ y: -400, rotate: -25 }}
          animate={{ y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 110, damping: 10, delay: 0.2 }}
          className="order-1 flex justify-center lg:order-2"
          style={{ perspective: 900 }}
          onPointerMove={onMove}
          onPointerLeave={() => (mx.set(0.5), my.set(0.5))}
        >
          <motion.div style={{ rotateX: rx, rotateY: ry }} className="relative">
            <div className="absolute inset-x-6 bottom-0 h-6 rounded-full bg-black/10 blur-md" />
            <DrinkBottle ref={svgRef} drink={g.drink} owner={g.name} size={360} />
          </motion.div>
        </motion.div>
      </section>

      {/* skill profile */}
      <section className="mx-auto grid max-w-[1080px] items-start gap-6 px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="tile p-6">
          <h2 className="text-2xl font-black text-ink">Твой профиль</h2>
          <p className="mt-1 font-semibold text-ink-soft">Собран из того, как ты играл, а не из теста.</p>
          <Radar skills={g.skills} />
        </div>
        <div className="overflow-hidden rounded-3xl text-white" style={{ background: track.color, boxShadow: `0 6px 0 ${track.colorD}` }}>
          <div className="p-6">
            <div className="text-sm font-black uppercase tracking-widest opacity-90">Тебе подходит</div>
            <h2 className="mt-1 text-3xl font-black leading-tight">{track.title}</h2>
            <p className="mt-2 text-lg font-bold opacity-95">{track.pitch}</p>
          </div>
          <div className="bg-black/10 p-6">
            <div className="font-black">Как можно вырасти</div>
            <ol className="mt-4 space-y-3">
              {track.ladder.map((step, i) => (
                <motion.li key={step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="flex items-center gap-3 font-extrabold">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm font-black" style={{ color: track.colorD }}>
                    {i + 1}
                  </span>
                  {step}
                </motion.li>
              ))}
            </ol>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {track.programs.map((p) => (
                <div key={p.title} className="rounded-2xl bg-white/20 p-4">
                  <div className="font-black">{p.title}</div>
                  <div className="text-sm font-bold opacity-95">{p.text}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs font-bold opacity-80">Примеры направлений. Актуальные вакансии и программы уточняются у HR «Очаково».</p>
          </div>
        </div>
      </section>

      {/* application */}
      <section className="mx-auto max-w-[720px] px-4 pb-16 sm:px-8">
        <div className="tile p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-black text-ink">Хочешь на настоящую стажировку?</h2>
                <p className="mt-1 font-semibold text-ink-soft">Данные из пропуска стажёра уже подставлены. Проверь и отправь.</p>
                <ApplyForm defaultTrack={top} onSent={() => setSent(true)} />
              </motion.div>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 text-center">
                <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 12 }}>
                  <CheckCircle size={96} weight="fill" color="var(--green)" />
                </motion.div>
                <h2 className="mt-3 text-2xl font-black text-ink">Заявка отправлена!</h2>
                <p className="mt-2 max-w-[40ch] font-semibold text-ink-soft">HR свяжется с тобой. А пока можно переиграть смены на три звезды и собрать весь музей.</p>
                <p className="mt-4 text-xs font-bold text-ink-faint">Демо-версия: заявка сохраняется только в этом браузере.</p>
                <button className="btn3d mt-6" onClick={onClose}>
                  На завод
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </motion.div>
  );
}

export function Radar({ skills, size = 300 }: { skills: Partial<Record<SkillId, number>>; size?: number }) {
  const keys = Object.keys(SKILLS) as SkillId[];
  const c = 150;
  const R = 100;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (i / keys.length) * Math.PI * 2;
    return [c + Math.cos(a) * R * v, c + Math.sin(a) * R * v];
  };
  const poly = keys.map((k, i) => pt(i, Math.max(0.08, skills[k] ?? 0)).join(",")).join(" ");
  return (
    <svg viewBox="-36 -6 372 312" width="100%" style={{ maxWidth: size }} className="mx-auto mt-2 block" role="img" aria-label="Диаграмма навыков">
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <polygon key={r} points={keys.map((_, i) => pt(i, r).join(",")).join(" ")} fill="none" stroke="var(--line)" strokeWidth="2" />
      ))}
      {keys.map((_, i) => {
        const [x, y] = pt(i, 1);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--line)" strokeWidth="2" />;
      })}
      <motion.polygon points={poly} fill="var(--green)" fillOpacity="0.3" stroke="var(--green)" strokeWidth="4" strokeLinejoin="round" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 120, damping: 12 }} style={{ transformOrigin: "150px 150px" }} />
      {keys.map((k, i) => {
        const [x, y] = pt(i, 1.24);
        return (
          <g key={k}>
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="13" fontWeight="900" fill={SKILLS[k].color}>
              {SKILLS[k].name}
            </text>
            <text x={x} y={y + 15} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="800" fill="var(--ink-faint)">
              {Math.round((skills[k] ?? 0) * 100)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ApplyForm({ defaultTrack, onSent }: { defaultTrack: SkillId; onSent: () => void }) {
  const g = useGame.getState();
  const [name, setName] = useState(g.name);
  const [contact, setContact] = useState("");
  const [uni, setUni] = useState(g.uni);
  const [track, setTrack] = useState<SkillId>(defaultTrack);
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (name.trim().length < 2) er.name = "Как к тебе обращаться?";
    if (!/^(@[\w\d_]{4,}|[^\s@]+@[^\s@]+\.[^\s@]+)$/.test(contact.trim())) er.contact = "Нужен email или ник в Telegram через @";
    if (!agree) er.agree = "Нужно согласие на обработку данных";
    setErr(er);
    if (Object.keys(er).length) return sfx("bad");
    const s = useGame.getState();
    s.apply();
    s.unlock("pass");
    s.markDone("final");
    try {
      localStorage.setItem("ochakovo-application", JSON.stringify({ name, contact, uni, track, skills: s.skills, drink: s.drink.name, at: new Date().toISOString() }));
    } catch {
      /* storage unavailable */
    }
    sfx("win");
    onSent();
  };

  const field = "mt-2 w-full rounded-2xl border-2 bg-surface-2 px-4 py-3 text-base font-bold text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-blue focus:bg-surface";
  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="font-extrabold text-ink">
          Имя
          <input className={field} style={{ borderColor: err.name ? "var(--red)" : "var(--line)" }} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
          {err.name && <span className="mt-1 block text-sm text-red">{err.name}</span>}
        </label>
        <label className="font-extrabold text-ink">
          Вуз и курс
          <input className={field} style={{ borderColor: "var(--line)" }} value={uni} onChange={(e) => setUni(e.target.value)} placeholder="Например, Росбиотех, 3 курс" />
        </label>
      </div>
      <label className="font-extrabold text-ink">
        Email или Telegram
        <input className={field} style={{ borderColor: err.contact ? "var(--red)" : "var(--line)" }} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="name@mail.ru или @nickname" inputMode="email" />
        {err.contact && <span className="mt-1 block text-sm text-red">{err.contact}</span>}
      </label>
      <fieldset>
        <legend className="font-extrabold text-ink">Направление</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(TRACKS) as SkillId[]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTrack(t)}
              className="rounded-xl border-2 px-3 py-1.5 text-sm font-extrabold transition-colors"
              style={track === t ? { borderColor: TRACKS[t].color, background: TRACKS[t].color, color: "#fff" } : { borderColor: "var(--line)", color: "var(--ink-soft)" }}
            >
              {TRACKS[t].short}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="flex items-start gap-3 text-sm font-bold text-ink-soft">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[var(--green)]" />
        <span>
          Даю согласие на обработку персональных данных
          {err.agree && <span className="mt-1 block text-red">{err.agree}</span>}
        </span>
      </label>
      <button type="submit" className="btn3d mt-2 w-full">
        Отправить заявку
      </button>
    </form>
  );
}

/* Render the bottle SVG into a shareable PNG card (CSS variables are resolved first) */
async function labelPng(svg: SVGSVGElement | null, title: string, owner: string): Promise<Blob | null> {
  if (!svg) return null;
  const css = getComputedStyle(document.documentElement);
  let markup = new XMLSerializer().serializeToString(svg);
  markup = markup.replace(/var\((--[\w-]+)\)/g, (_, v) => css.getPropertyValue(v).trim() || "#ff4b4b");
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup);
  await img.decode();
  const W = 1080;
  const H = 1350;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#ddf4ff");
  grad.addColorStop(1, "#d7ffb8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const bh = 980;
  const bw = bh * 0.625;
  ctx.drawImage(img, (W - bw) / 2, 80, bw, bh);
  ctx.fillStyle = "#3c3c3c";
  ctx.textAlign = "center";
  ctx.font = "900 64px 'Nunito Variable', Nunito, sans-serif";
  ctx.fillText(`«${title}»`, W / 2, 1150);
  ctx.font = "800 36px 'Nunito Variable', Nunito, sans-serif";
  ctx.fillStyle = "#58a700";
  ctx.fillText(`Первая партия ${owner ? "· " + owner : ""} · Очаково Квест`, W / 2, 1220);
  return new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
}
