import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ACHIEVEMENTS, ALL_LESSONS, LEVELS, type Accessory, type AchievementId, type TrackId } from "../data/content";

const today = () => new Date().toISOString().slice(0, 10);
const dayDiff = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

export type Tab = "path" | "profile" | "league" | "shop";

interface Daily {
  day: string;
  xp: number;
  games: number;
  shop: boolean;
  claimed: string[];
}

export interface GameState {
  name: string;
  onboarded: boolean;
  xp: number;
  caps: number;
  done: Record<string, { stars: number; plays: number }>;
  achievements: AchievementId[];
  owned: Accessory[];
  equipped: Accessory[];
  streak: number;
  lastDay: string | null;
  daily: Daily;
  track: TrackId | null;
  trackScores: Partial<Record<TrackId, number>>;
  yearOutcome: "skill" | "team" | "drive" | null;
  sound: boolean;
  applied: boolean;

  setName: (n: string) => void;
  finishOnboarding: () => void;
  touchStreak: () => void;
  completeLesson: (id: string, r: { xp: number; caps: number; stars: number }) => void;
  addCaps: (n: number) => void;
  markDone: (id: string) => void;
  unlock: (id: AchievementId) => void;
  buy: (id: Accessory, price: number) => boolean;
  toggleEquip: (id: Accessory) => void;
  setTrack: (t: TrackId, scores: Partial<Record<TrackId, number>>) => void;
  setYearOutcome: (o: "skill" | "team" | "drive") => void;
  markShop: () => void;
  claimQuest: (id: string, caps: number) => void;
  toggleSound: () => void;
  apply: () => void;
  reset: () => void;
}

const freshDaily = (): Daily => ({ day: today(), xp: 0, games: 0, shop: false, claimed: [] });

const initial = {
  name: "",
  onboarded: false,
  xp: 0,
  caps: 10,
  done: {},
  achievements: [] as AchievementId[],
  owned: [] as Accessory[],
  equipped: [] as Accessory[],
  streak: 0,
  lastDay: null as string | null,
  daily: freshDaily(),
  track: null,
  trackScores: {},
  yearOutcome: null,
  sound: true,
  applied: false,
};

/* Head accessories are mutually exclusive, the rest stack */
const HEAD: Accessory[] = ["helmet", "cap", "crown", "headphones"];

/* Achievement toasts are UI-only, not persisted */
export const useToasts = create<{ queue: AchievementId[]; push: (a: AchievementId) => void; shift: () => void }>((set) => ({
  queue: [],
  push: (a) => set((s) => ({ queue: [...s.queue, a] })),
  shift: () => set((s) => ({ queue: s.queue.slice(1) })),
}));

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...initial,
      setName: (name) => set({ name }),
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
      addCaps: (n) => set((s) => ({ caps: s.caps + n })),
      markDone: (id) => set((s) => ({ done: { ...s.done, [id]: { stars: 3, plays: (s.done[id]?.plays ?? 0) + 1 } } })),
      unlock: (id) => {
        if (get().achievements.includes(id)) return;
        set((s) => ({ achievements: [...s.achievements, id] }));
        useToasts.getState().push(id);
      },
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
      setTrack: (track, trackScores) => set({ track, trackScores }),
      setYearOutcome: (yearOutcome) => set({ yearOutcome }),
      markShop: () => set((s) => ({ daily: { ...s.daily, shop: true } })),
      claimQuest: (id, caps) =>
        set((s) => (s.daily.claimed.includes(id) ? {} : { caps: s.caps + caps, daily: { ...s.daily, claimed: [...s.daily.claimed, id] } })),
      toggleSound: () => set((s) => ({ sound: !s.sound })),
      apply: () => {
        set({ applied: true });
      },
      reset: () => set({ ...initial, daily: freshDaily() }),
    }),
    { name: "ochakovo-quest-v1" },
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

/* First lesson that isn't done is the "current" one; everything after is locked */
export function lessonStatus(done: GameState["done"]) {
  const firstOpen = ALL_LESSONS.findIndex((l) => !done[l.id]);
  return (idx: number): "done" | "current" | "locked" => {
    if (done[ALL_LESSONS[idx].id]) return "done";
    if (idx === firstOpen) return "current";
    return "locked";
  };
}

export const achievementMeta = (id: AchievementId) => ACHIEVEMENTS.find((a) => a.id === id)!;

export const QUESTS = [
  { id: "xp", title: "Набери 40 XP", goal: 40, caps: 10, get: (d: Daily) => d.xp },
  { id: "games", title: "Пройди 2 игры", goal: 2, caps: 10, get: (d: Daily) => d.games },
  { id: "shop", title: "Загляни в магазин", goal: 1, caps: 5, get: (d: Daily) => (d.shop ? 1 : 0) },
];
