import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FactoryScene } from "../components/Art";
import { Mascot } from "../components/Mascot";
import { Bubble, CapIcon, KineticText } from "../components/ui";
import { sfx } from "../lib/sfx";
import { useGame } from "../state/store";
import { UNIVERSITIES } from "../data/content";

export function Onboarding() {
  const [step, setStep] = useState(0);
  const { name, setName, uni, setUni, finishOnboarding } = useGame();

  const go = (n: number) => {
    sfx("tap");
    setStep(n);
  };

  return (
    <div className="min-h-[100dvh] overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.section key="hero" exit={{ opacity: 0, x: -80 }} transition={{ duration: 0.3 }} className="mx-auto grid min-h-[100dvh] max-w-[1180px] items-center gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
            <div className="order-2 lg:order-1">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-2 text-xl font-black text-green">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-green text-white" style={{ boxShadow: "0 3px 0 var(--green-d)" }}>
                  О
                </span>
                очаково квест
              </motion.div>
              <h1 className="text-4xl font-black leading-[1.08] text-ink sm:text-5xl lg:text-[54px] lg:[&>span]:whitespace-nowrap">
                <span>
                  <KineticText text="Выпусти свой квас." delay={0.1} />
                </span>
                <br />
                <span className="text-green">
                  <KineticText text="Пока понарошку." delay={0.4} />
                </span>
              </h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-5 max-w-[44ch] text-lg font-semibold leading-relaxed text-ink-soft">
                Пять смен на заводе «Очаково»: придумай напиток, подбери рецепт, свари, проверь и договорись с сетью. В финале: своя этикетка и путь в стажировку.
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button className="btn3d px-10 py-4 text-base" onClick={() => go(1)}>
                  Начать игру
                </button>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-extrabold text-ink-faint">
                <span>5 смен</span>
                <span>Музей истории</span>
                <span>Без регистрации</span>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.9, rotate: 2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 18 }} className="relative order-1 lg:order-2">
              <div className="overflow-hidden rounded-[32px] border-2 border-line" style={{ boxShadow: "0 8px 0 var(--line)" }}>
                <FactoryScene className="block h-auto w-full" />
              </div>
              <motion.div initial={{ y: 120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6, type: "spring", stiffness: 220, damping: 14 }} className="absolute -bottom-8 -left-2 origin-bottom-left scale-[0.62] sm:-left-10 sm:scale-100">
                <Mascot size={150} mood="happy" track />
              </motion.div>
            </motion.div>
          </motion.section>
        )}

        {step === 1 && (
          <motion.section key="name" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="mx-auto flex min-h-[100dvh] max-w-[640px] flex-col justify-center px-4 py-10">
            <div className="flex items-center gap-4">
              <Mascot size={130} mood="idle" track />
              <Bubble className="flex-1">Привет! Я Бочик, хранитель кваса. Проведу тебя по заводу. Как тебя зовут?</Bubble>
            </div>
            <form
              className="mt-8"
              onSubmit={(e) => {
                e.preventDefault();
                if (name.trim()) go(3);
              }}
            >
              <label htmlFor="nm" className="font-extrabold text-ink">
                Твоё имя
              </label>
              <input
                id="nm"
                autoFocus
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-2xl border-2 border-line bg-surface-2 px-5 py-4 text-xl font-extrabold text-ink outline-none transition-colors focus:border-blue focus:bg-surface"
                placeholder="Например, Лиза"
              />
              <button type="submit" disabled={!name.trim()} className="btn3d mt-6 w-full">
                Дальше
              </button>
            </form>
          </motion.section>
        )}

        {step === 3 && (
          <motion.section key="uni" initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -80 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="mx-auto flex min-h-[100dvh] max-w-[640px] flex-col justify-center px-4 py-10">
            <div className="flex items-center gap-4">
              <Mascot size={130} mood="wow" track />
              <Bubble className="flex-1">Где учишься, {name.trim()}? Твой опыт пойдёт в зачёт вуза в Кубке вузов.</Bubble>
            </div>
            <form
              className="mt-8"
              onSubmit={(e) => {
                e.preventDefault();
                go(2);
              }}
            >
              <label htmlFor="uni" className="font-extrabold text-ink">
                Вуз или колледж
              </label>
              <input
                id="uni"
                autoFocus
                list="uni-list"
                maxLength={40}
                value={uni}
                onChange={(e) => setUni(e.target.value)}
                className="mt-2 w-full rounded-2xl border-2 border-line bg-surface-2 px-5 py-4 text-xl font-extrabold text-ink outline-none transition-colors focus:border-blue focus:bg-surface"
                placeholder="Например, Росбиотех"
              />
              <datalist id="uni-list">
                {UNIVERSITIES.map((u) => (
                  <option key={u.name} value={u.name} />
                ))}
              </datalist>
              <div className="mt-6 flex gap-3">
                <button type="button" className="btn3d ghost flex-1" onClick={() => (setUni(""), go(2))}>
                  Пропустить
                </button>
                <button type="submit" disabled={!uni.trim()} className="btn3d flex-1">
                  Дальше
                </button>
              </div>
            </form>
          </motion.section>
        )}

        {step === 2 && (
          <motion.section key="gift" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="mx-auto flex min-h-[100dvh] max-w-[560px] flex-col items-center justify-center px-4 py-10 text-center">
            <Mascot size={170} mood="happy" />
            <h1 className="mt-4 text-3xl font-black text-ink">
              <KineticText text={`Рад знакомству, ${name.trim()}!`} />
            </h1>
            <p className="mt-2 text-lg font-semibold text-ink-soft">Вот твой пропуск стажёра и стартовые крышечки. За них в магазине можно одеть меня в каску или даже корону. А теперь на экскурсию!</p>
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 12 }} className="mt-6 flex items-center gap-2 rounded-2xl border-2 border-yellow bg-amber-l px-5 py-3 text-3xl font-black text-amber">
              <CapIcon size={36} /> +10
            </motion.div>
            <button
              className="btn3d mt-10 w-full"
              onClick={() => {
                sfx("win");
                finishOnboarding();
              }}
            >
              На завод!
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
