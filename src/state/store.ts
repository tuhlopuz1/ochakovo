import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ALL_LESSONS, ARTIFACTS, LEVELS, type Accessory, type AchievementId, type ConceptId, type SkillId } from "../data/content";

const today = () => new Date().toISOString().slice(0, 10);
const dayDiff = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

export type Tab = "path" | "museum" | "profile" | "league" | "shop";

interface Daily {
  day: string;
  xp: number;
  games: number;
  shop: boolean;
  claimed: string[];
}

/* The player's drink, built up shift by shift. Later shifts read earlier results. */
export interface Drink {
  concept: ConceptId | null;
  fit: number; // 0..1, marketing
  name: string;
  labelColor: string;
  recipe: { malt: number; sugar: number; time: number; gas: number; roast: boolean } | null;
  labTries: number;
  filtered: boolean | null;
  qa: number | null; // accuracy 0..1
  stores: number | null; // stores that listed the drink
}

export interface GameState {
  name: string;
  uni: string;
  onboarded: boolean;
  xp: number;
  caps: number;
  done: Record<string, { stars: number; plays: number }>;
  achievements: AchievementId[];
  artifacts: string[];
  owned: Accessory[];
  equipped: Accessory[];
  streak: number;
  lastDay: string | null;
  daily: Daily;
  drink: Drink;
  skills: Partial<Record<SkillId, number>>; // 0..1 per skill, from play style
  sound: boolean;
  applied: boolean;

  setName: (n: string) => void;
  setUni: (u: string) => void;
  finishOnboarding: () => void;
  touchStreak: () => void;
  completeLesson: (id: string, r: { xp: number; caps: number; stars: number }) => void;
  markDone: (id: string) => void;
  addCaps: (n: number) => void;
  unlock: (id: AchievementId) => void;
  addArtifact: (id: string) => void;
  setDrink: (p: Partial<Drink>) => void;
  setSkill: (s: SkillId, v: number) => void;
  buy: (id: Accessory, price: number) => boolean;
  toggleEquip: (id: Accessory) => void;
  markShop: () => void;
  claimQuest: (id: string, caps: number) => void;
  toggleSound: () => void;
  apply: () => void;
  reset: () => void;
}

const freshDaily = (): Daily => ({ day: today(), xp: 0, games: 0, shop: false, claimed: [] });
export const freshDrink = (): Drink => ({ concept: null, fit: 0, name: "", labelColor: "#58cc02", recipe: null, labTries: 0, filtered: null, qa: null, stores: null });

const initial = {
  name: "",
  uni: "",
  onboarded: false,
  xp: 0,
  caps: 10,
  done: {},
  achievements: [] as AchievementId[],
  artifacts: [] as string[],
  owned: [] as Accessory[],
  equipped: [] as Accessory[],
  streak: 0,
  lastDay: null as string | null,
  daily: freshDaily(),
  drink: freshDrink(),
  skills: {},
  sound: true,
  applied: false,
};

const HEAD: Accessory[] = ["helmet", "cap", "crown", "headphones"];

/* Toasts are UI-only, not persisted */
export type ToastItem = { kind: "ach"; id: AchievementId } | { kind: "artifact"; id: string };
export const useToasts = create<{ queue: ToastItem[]; push: (a: ToastItem) => void; shift: () => void }>((set) => ({
  queue: [],
  push: (a) => set((s) => ({ queue: [...s.queue, a] })),
  shift: () => set((s) => ({ queue: s.queue.slice(1) })),
}));

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...initial,
      setName: (name) => set({ name }),
      setUni: (uni) => set({ uni }),
      finishOnboarding: () => set({ onboarded: true }),
      touchStreak: () => {
        const t = today();
        const { lastDay, streak, daily } = get();
        const patch: Partial<GameState> = {};
        if (daily.day !== t) patch.daily = freshDaily();
        if (lastDay !== t) {
          const gap = lastDay ? dayDiff(lastDay, t) : 99;
          patch.streak = gap === 1 ? streak + 1 : 1;
          patch.lastDay = t;
        }
        set(patch);
      },
      completeLesson: (id, r) => {
        const s = get();
        const prev = s.done[id];
        // Replays give a smaller reward so the path stays the main progression
        const factor = prev ? 0.4 : 1;
        const xp = Math.round(r.xp * factor);
        const caps = Math.round(r.caps * factor);
        set({
          xp: s.xp + xp,
          caps: s.caps + caps,
          done: { ...s.done, [id]: { stars: Math.max(prev?.stars ?? 0, r.stars), plays: (prev?.plays ?? 0) + 1 } },
          daily: { ...s.daily, xp: s.daily.xp + xp, games: s.daily.games + 1 },
        });
        get().unlock("first");
      },
      markDone: (id) => set((s) => ({ done: { ...s.done, [id]: { stars: 3, plays: (s.done[id]?.plays ?? 0) + 1 } } })),
      addCaps: (n) => set((s) => ({ caps: s.caps + n })),
      unlock: (id) => {
        if (get().achievements.includes(id)) return;
        set((s) => ({ achievements: [...s.achievements, id] }));
        useToasts.getState().push({ kind: "ach", id });
      },
      addArtifact: (id) => {
        if (get().artifacts.includes(id)) return;
        const next = [...get().artifacts, id];
        set({ artifacts: next });
        useToasts.getState().push({ kind: "artifact", id });
        if (ARTIFACTS.every((a) => next.includes(a.id))) get().unlock("curator");
      },
      setDrink: (p) => set((s) => ({ drink: { ...s.drink, ...p } })),
      setSkill: (k, v) => set((s) => ({ skills: { ...s.skills, [k]: Math.max(0, Math.min(1, v)) } })),
      buy: (id, price) => {
        const s = get();
        if (s.owned.includes(id) || s.caps < price) return false;
        set({ caps: s.caps - price, owned: [...s.owned, id] });
        get().toggleEquip(id);
        get().unlock("stylist");
        return true;
      },
      toggleEquip: (id) =>
        set((s) => {
          if (s.equipped.includes(id)) return { equipped: s.equipped.filter((e) => e !== id) };
          const base = HEAD.includes(id) ? s.equipped.filter((e) => !HEAD.includes(e)) : s.equipped;
          return { equipped: [...base, id] };
        }),
      markShop: () => set((s) => ({ daily: { ...s.daily, shop: true } })),
      claimQuest: (id, caps) =>
        set((s) => (s.daily.claimed.includes(id) ? {} : { caps: s.caps + caps, daily: { ...s.daily, claimed: [...s.daily.claimed, id] } })),
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      apply: () => set({ applied: true }),
      reset: () => set({ ...initial, daily: freshDaily(), drink: freshDrink() }),
    }),
    { name: "ochakovo-quest-v2" },
  ),
);

export function levelOf(xp: number) {
  let i = 0;
  LEVELS.forEach((l, idx) => {
    if (xp >= l.xp) i = idx;
  });
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  const pct = next ? (xp - cur.xp) / (next.xp - cur.xp) : 1;
  return { index: i, cur, next, pct };
}

export function lessonStatus(done: GameState["done"]) {
  const firstOpen = ALL_LESSONS.findIndex((l) => !done[l.id]);
  return (idx: number): "done" | "current" | "locked" => {
    if (done[ALL_LESSONS[idx].id]) return "done";
    if (idx === firstOpen) return "current";
    return "locked";
  };
}

/* Strongest skill from play style; falls back to precision */
export function topSkill(skills: Partial<Record<SkillId, number>>): SkillId {
  const entries = Object.entries(skills) as [SkillId, number][];
  if (!entries.length) return "precision";
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

export const QUESTS = [
  { id: "xp", title: "Набери 40 XP", goal: 40, caps: 10, get: (d: Daily) => d.xp },
  { id: "games", title: "Отработай 2 смены", goal: 2, caps: 10, get: (d: Daily) => d.games },
  { id: "shop", title: "Загляни в магазин", goal: 1, caps: 5, get: (d: Daily) => (d.shop ? 1 : 0) },
];
