import { motion } from "motion/react";
import { forwardRef } from "react";
import { CONCEPTS, type ArtifactArt } from "../data/content";
import type { Drink } from "../state/store";

/* Museum exhibit illustrations: small static drawings inside a colored medallion */
export function ArtifactIcon({ art, color, size = 88, locked = false }: { art: ArtifactArt; color: string; size?: number; locked?: boolean }) {
  const c = locked ? "var(--line-strong)" : color;
  const f = locked ? "var(--line)" : "#fff";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <circle cx="50" cy="50" r="46" fill={locked ? "var(--surface-2)" : c} opacity={locked ? 1 : 0.18} />
      <circle cx="50" cy="50" r="46" fill="none" stroke={c} strokeWidth="4" strokeDasharray={locked ? "6 6" : undefined} />
      <g fill={locked ? "var(--line-strong)" : c} stroke={locked ? "var(--line-strong)" : c}>
        {art === "switch" && (
          <g>
            <rect x="32" y="30" width="36" height="46" rx="6" fill={f} strokeWidth="4" />
            <rect x="46" y="20" width="8" height="34" rx="4" transform="rotate(-25 50 54)" stroke="none" />
            <circle cx="50" cy="56" r="7" stroke="none" />
          </g>
        )}
        {art === "bottles" && (
          <g stroke="none">
            <path d="M30 36 h10 v8 q6 4 6 12 v20 h-22 v-20 q0 -8 6 -12z" />
            <path d="M58 36 h10 v8 q6 4 6 12 v20 h-22 v-20 q0 -8 6 -12z" opacity="0.6" />
          </g>
        )}
        {art === "flask" && (
          <g>
            <path d="M42 24 h16 v18 l14 28 q2 6 -4 6 h-36 q-6 0 -4 -6 l14 -28z" fill={f} strokeWidth="4" strokeLinejoin="round" />
            <path d="M34 62 h32 l4 8 q1 4 -3 4 h-34 q-4 0 -3 -4z" stroke="none" />
            <circle cx="46" cy="54" r="3" stroke="none" />
            <circle cx="55" cy="48" r="2" stroke="none" />
          </g>
        )}
        {art === "label" && (
          <g>
            <rect x="26" y="34" width="48" height="32" rx="6" fill={f} strokeWidth="4" />
            <rect x="34" y="44" width="32" height="5" rx="2" stroke="none" />
            <rect x="38" y="54" width="24" height="4" rx="2" stroke="none" opacity="0.6" />
          </g>
        )}
        {art === "map" && (
          <g>
            <path d="M22 34 l18 -8 20 8 18 -8 v40 l-18 8 -20 -8 -18 8z" fill={f} strokeWidth="4" strokeLinejoin="round" />
            <circle cx="40" cy="46" r="4" stroke="none" />
            <circle cx="62" cy="52" r="4" stroke="none" />
          </g>
        )}
        {art === "shelf" && (
          <g stroke="none">
            <rect x="24" y="66" width="52" height="5" rx="2" />
            <rect x="28" y="40" width="12" height="26" rx="3" />
            <rect x="44" y="34" width="12" height="32" rx="3" opacity="0.7" />
            <rect x="60" y="44" width="12" height="22" rx="3" opacity="0.5" />
          </g>
        )}
        {art === "survey" && (
          <g>
            <rect x="32" y="24" width="36" height="52" rx="6" fill={f} strokeWidth="4" />
            {[38, 50, 62].map((y) => (
              <g key={y} stroke="none">
                <circle cx="41" cy={y} r="3" />
                <rect x="47" y={y - 2} width="15" height="4" rx="2" opacity="0.6" />
              </g>
            ))}
          </g>
        )}
        {art === "tube" && (
          <g>
            <rect x="42" y="22" width="16" height="56" rx="8" fill={f} strokeWidth="4" />
            <rect x="44" y="50" width="12" height="26" rx="6" stroke="none" />
          </g>
        )}
        {art === "tank" && (
          <g>
            <path d="M34 30 q0 -10 16 -10 q16 0 16 10 v32 l-16 14 -16 -14z" fill={f} strokeWidth="4" strokeLinejoin="round" />
            <path d="M36 46 h28 v16 l-14 12 -14 -12z" stroke="none" />
          </g>
        )}
        {art === "medal" && (
          <g>
            <path d="M40 22 l10 18 10 -18" fill="none" strokeWidth="6" />
            <circle cx="50" cy="58" r="18" fill={f} strokeWidth="5" />
            <path d="M42 58 l6 6 10 -12" fill="none" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}
        {art === "globe" && (
          <g fill="none" strokeWidth="4">
            <circle cx="50" cy="50" r="22" fill={f} />
            <ellipse cx="50" cy="50" rx="10" ry="22" />
            <path d="M28 50 h44 M32 38 h36 M32 62 h36" />
          </g>
        )}
      </g>
    </svg>
  );
}

/* The player's own bottle with a generated label. forwardRef so the final screen can export it as PNG. */
export const DrinkBottle = forwardRef<SVGSVGElement, { drink: Drink; owner?: string; size?: number; fill?: number; showLabel?: boolean }>(function DrinkBottle(
  { drink, owner, size = 220, fill = 1, showLabel = true },
  ref,
) {
  const concept = CONCEPTS.find((c) => c.id === drink.concept);
  const liquid = concept?.liquid ?? "#d9d2c5";
  const name = drink.name || "Без названия";
  const words = splitName(name);
  const top = 70 + (1 - fill) * 250;
  return (
    <svg ref={ref} viewBox="0 0 200 320" width={size * 0.625} height={size} xmlns="http://www.w3.org/2000/svg" role="img" aria-label={`Бутылка «${name}»`}>
      <defs>
        <clipPath id="db-clip">
          <path d="M80 10 H120 V62 Q160 84 160 126 V294 Q160 312 142 312 H58 Q40 312 40 294 V126 Q40 84 80 62 Z" />
        </clipPath>
      </defs>
      <path d="M80 10 H120 V62 Q160 84 160 126 V294 Q160 312 142 312 H58 Q40 312 40 294 V126 Q40 84 80 62 Z" fill="#efe7da" opacity="0.6" />
      <g clipPath="url(#db-clip)">
        <motion.rect x="0" width="200" height="320" fill={liquid} initial={false} animate={{ y: top }} transition={{ type: "spring", stiffness: 90, damping: 16 }} />
        {!drink.filtered && drink.filtered !== null && <rect x="40" y="292" width="120" height="22" fill="#000" opacity="0.15" />}
      </g>
      <path d="M80 10 H120 V62 Q160 84 160 126 V294 Q160 312 142 312 H58 Q40 312 40 294 V126 Q40 84 80 62 Z" fill="none" stroke="#5c2c04" strokeOpacity="0.5" strokeWidth="5" />
      <rect x="74" y="0" width="52" height="22" rx="7" fill="var(--red)" />
      <path d="M58 120 Q54 200 58 280" stroke="#fff" strokeWidth="8" strokeLinecap="round" opacity="0.45" fill="none" />
      {showLabel && (
        <motion.g initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 16 }} style={{ transformOrigin: "100px 200px" }}>
          <rect x="44" y="148" width="112" height="112" rx="10" fill={drink.labelColor} />
          <rect x="50" y="154" width="100" height="100" rx="7" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" strokeDasharray="4 4" />
          <text x="100" y="172" textAnchor="middle" fontFamily="Nunito Variable, Nunito, sans-serif" fontWeight="900" fontSize="9" fill="#fff" opacity="0.85" letterSpacing="1.5">
            ОЧАКОВО
          </text>
          {words.map((w, i) => (
            <text key={i} x="100" y={198 + i * 19 - (words.length - 1) * 8} textAnchor="middle" fontFamily="Nunito Variable, Nunito, sans-serif" fontWeight="900" fontSize={w.length > 9 ? 15 : 18} fill="#fff">
              {w}
            </text>
          ))}
          <text x="100" y="238" textAnchor="middle" fontFamily="Nunito Variable, Nunito, sans-serif" fontWeight="800" fontSize="7.5" fill="#fff" opacity="0.9">
            {concept ? concept.name.split(" ").slice(0, 2).join(" ").toLowerCase() : "квас"}
          </text>
          {owner && (
            <text x="100" y="250" textAnchor="middle" fontFamily="Nunito Variable, Nunito, sans-serif" fontWeight="800" fontSize="7" fill="#fff" opacity="0.8">
              партия №1 · {owner}
            </text>
          )}
        </motion.g>
      )}
    </svg>
  );
});

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1 || name.length <= 10) return [name.trim()];
  const mid = Math.ceil(parts.length / 2);
  return [parts.slice(0, mid).join(" "), parts.slice(mid).join(" ")];
}

/* Five-stage progress of the player's batch, shown on the path */
export const STAGES = [
  { id: "marketing", label: "Идея" },
  { id: "lab", label: "Рецепт" },
  { id: "production", label: "Варка" },
  { id: "qc", label: "Проверка" },
  { id: "sales", label: "На полке" },
];
