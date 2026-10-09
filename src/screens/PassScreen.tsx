import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { CheckCircle, Copy, X } from "@phosphor-icons/react";
import { useState, type FormEvent, type PointerEvent } from "react";
import { TRACKS, type TrackId } from "../data/content";
import { Mascot } from "../components/Mascot";
import { Confetti, KineticText } from "../components/ui";
import { sfx } from "../lib/sfx";
import { levelOf, useGame } from "../state/store";

/* Final reward: a personal holographic factory pass + a real call to action. */
export function PassScreen({ onClose }: { onClose: () => void }) {
  const g = useGame();
  const [sent, setSent] = useState(g.applied);
  const [copied, setCopied] = useState(false);
  const track = g.track ? TRACKS[g.track] : null;
  const passNo = "OCH-" + String(Math.abs(hash(g.name || "guest")) % 90000 + 10000);

  // tilt + holo glare following the pointer
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-12, 12]), { stiffness: 200, damping: 18 });
  const glare = useTransform([mx, my], ([x, y]) => `radial-gradient(circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(255,255,255,.55), transparent 45%), linear-gradient(${(x as number) * 180 + 90}deg, rgba(255,0,170,.18), rgba(0,200,255,.18), rgba(255,220,0,.18))`);
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };

  const share = async () => {
    const text = `Я прошёл(а) Очаково Квест и получил пропуск ${passNo}! Моё направление: ${track?.title ?? "ещё ищу"}.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      sfx("coin");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 overflow-y-auto bg-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Confetti count={140} origin={{ x: 0.5, y: 0.2 }} />
      <button onClick={onClose} aria-label="Закрыть" className="fixed right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-ink-soft hover:text-ink">
        <X size={26} weight="bold" />
      </button>
      <div className="mx-auto grid max-w-[1080px] items-start gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[1fr_1fr]">
        {/* pass card on a lanyard */}
        <div className="flex flex-col items-center">
          <h1 className="text-center text-3xl font-black text-ink sm:text-4xl">
            <KineticText text="Ты свой человек на заводе!" />
          </h1>
          <motion.div initial={{ y: -500, rotate: -20 }} animate={{ y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 120, damping: 9, delay: 0.3 }} className="mt-4 flex flex-col items-center" style={{ perspective: 900 }}>
            <div className="h-16 w-6 rounded-b-md" style={{ background: "repeating-linear-gradient(180deg,var(--green) 0 10px,var(--green-d) 10px 20px)" }} />
            <motion.div
              onPointerMove={onMove}
              onPointerLeave={() => {
                mx.set(0.5);
                my.set(0.5);
              }}
              style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
              className="relative w-[300px] overflow-hidden rounded-[28px] border-2 border-line bg-surface"
            >
              <div className="bg-green px-5 pb-4 pt-5 text-white">
                <div className="mx-auto mb-3 h-3 w-14 rounded-full bg-black/20" />
                <div className="text-xs font-black uppercase tracking-[0.2em] opacity-90">Пропуск на завод</div>
                <div className="text-2xl font-black">Очаково</div>
              </div>
              <div className="flex flex-col items-center px-5 pb-5 pt-4">
                <div className="grid h-36 w-36 place-items-center rounded-full bg-amber-l">
                  <Mascot size={110} equipped mood="happy" bounce={false} />
                </div>
                <div className="mt-3 text-2xl font-black text-ink">{g.name || "Гость"}</div>
                <div className="font-extrabold" style={{ color: track?.color ?? "var(--ink-soft)" }}>
                  {track?.title ?? "Направление в поиске"}
                </div>
                <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center">
                  {[
                    ["Уровень", levelOf(g.xp).cur.name.split(" ")[0]],
                    ["Опыт", g.xp],
                    ["Значки", g.achievements.length],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-surface-2 py-2">
                      <div className="text-[11px] font-black uppercase tracking-wider text-ink-faint">{k}</div>
                      <div className="font-black text-ink">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex h-10 w-full items-end gap-[3px]" aria-hidden>
                  {Array.from({ length: 42 }, (_, i) => (
                    <span key={i} className="bg-ink" style={{ width: (hash(passNo + i) % 3) + 1, height: "100%" }} />
                  ))}
                </div>
                <div className="mt-1 font-black tracking-widest text-ink-soft">{passNo}</div>
              </div>
              <motion.div className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: glare }} />
            </motion.div>
          </motion.div>
          <button onClick={share} className="btn3d ghost mt-6">
            {copied ? <CheckCircle size={20} weight="fill" /> : <Copy size={20} weight="bold" />}
            {copied ? "Скопировано" : "Поделиться"}
          </button>
        </div>

        {/* application */}
        <div className="tile p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" exit={{ opacity: 0, x: -30 }}>
                <h2 className="text-2xl font-black text-ink">Хочешь на настоящую стажировку?</h2>
                <p className="mt-1 font-semibold text-ink-soft">Оставь контакты, и HR «Очаково» расскажет о практике и вакансиях для студентов.</p>
                <ApplyForm defaultTrack={g.track} defaultName={g.name} onSent={() => setSent(true)} />
              </motion.div>
            ) : (
              <motion.div key="ok" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 text-center">
                <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400, damping: 12 }}>
                  <CheckCircle size={96} weight="fill" color="var(--green)" />
                </motion.div>
                <h2 className="mt-3 text-2xl font-black text-ink">Заявка отправлена!</h2>
                <p className="mt-2 max-w-[38ch] font-semibold text-ink-soft">Мы свяжемся с тобой. А пока можно переиграть уровни на три звезды и собрать все значки.</p>
                <p className="mt-4 text-xs font-bold text-ink-faint">Демо-версия: заявка сохраняется только в этом браузере.</p>
                <button className="btn3d mt-6" onClick={onClose}>
                  На карту
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

function ApplyForm({ defaultTrack, defaultName, onSent }: { defaultTrack: TrackId | null; defaultName: string; onSent: () => void }) {
  const [name, setName] = useState(defaultName);
  const [contact, setContact] = useState("");
  const [uni, setUni] = useState("");
  const [track, setTrack] = useState<TrackId>(defaultTrack ?? "tech");
  const [agree, setAgree] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (name.trim().length < 2) er.name = "Как к тебе обращаться?";
    if (!/^(@[\w\d_]{4,}|[^\s@]+@[^\s@]+\.[^\s@]+)$/.test(contact.trim())) er.contact = "Нужен email или ник в Telegram через @";
    if (!agree) er.agree = "Нужно согласие на обработку данных";
    setErr(er);
    if (Object.keys(er).length) {
      sfx("bad");
      return;
    }
    const s = useGame.getState();
    s.apply();
    s.unlock("pass");
    s.markDone("pass");
    try {
      localStorage.setItem("ochakovo-application", JSON.stringify({ name, contact, uni, track, at: new Date().toISOString() }));
    } catch {
      /* storage unavailable */
    }
    sfx("win");
    onSent();
  };

  const field = "mt-2 w-full rounded-2xl border-2 bg-surface-2 px-4 py-3 text-base font-bold text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-blue focus:bg-surface";

  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-4" noValidate>
      <label className="font-extrabold text-ink">
        Имя
        <input className={field} style={{ borderColor: err.name ? "var(--red)" : "var(--line)" }} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
        {err.name && <span className="mt-1 block text-sm text-red">{err.name}</span>}
      </label>
      <label className="font-extrabold text-ink">
        Email или Telegram
        <input className={field} style={{ borderColor: err.contact ? "var(--red)" : "var(--line)" }} value={contact} onChange={(e) => setContact(e.target.value)} placeholder="name@mail.ru или @nickname" inputMode="email" />
        {err.contact && <span className="mt-1 block text-sm text-red">{err.contact}</span>}
      </label>
      <label className="font-extrabold text-ink">
        Вуз и курс
        <input className={field} style={{ borderColor: "var(--line)" }} value={uni} onChange={(e) => setUni(e.target.value)} placeholder="Например, МГУПП, 3 курс" />
      </label>
      <fieldset>
        <legend className="font-extrabold text-ink">Направление</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(Object.keys(TRACKS) as TrackId[]).map((t) => (
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

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
