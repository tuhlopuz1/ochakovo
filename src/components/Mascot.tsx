import { useEffect, useId, useRef } from "react";
import type { Accessory } from "../data/content";
import { useGame } from "../state/store";

export type Mood = "idle" | "happy" | "sad" | "wow" | "think";

interface Props {
  mood?: Mood;
  size?: number;
  accessories?: Accessory[];
  /** pupils follow the pointer */
  track?: boolean;
  /** use the player's equipped items */
  equipped?: boolean;
  className?: string;
  bounce?: boolean;
}

/**
 * "Бочик": the kvass-barrel mascot. Pure SVG, CSS keyframes for idle life
 * (bob, blink, rising bubbles), mood swaps the face.
 */
export function Mascot({ mood = "idle", size = 160, accessories, track = false, equipped = false, className = "", bounce = true }: Props) {
  const uid = useId().replace(/:/g, "");
  const eq = useGame((s) => s.equipped);
  const acc = accessories ?? (equipped ? eq : []);
  const svgRef = useRef<SVGSVGElement>(null);
  const pupils = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!track) return;
    const onMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      const p = pupils.current;
      if (!svg || !p) return;
      const r = svg.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.58;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 300) * 6;
      p.style.transform = `translate(${(dx / d) * k}px, ${(dy / d) * k}px)`;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [track]);

  const has = (a: Accessory) => acc.includes(a);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 230"
      width={size}
      height={(size * 230) / 200}
      className={className}
      role="img"
      aria-label="Бочик, маскот Очаково Квеста"
      style={{ overflow: "visible" }}
    >
      <style>{`
        .m-bob-${uid}{animation:mbob-${uid} 2.6s ease-in-out infinite;transform-box:fill-box;transform-origin:50% 100%}
        @keyframes mbob-${uid}{0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-6px) scale(.985,1.015)}}
        .m-blink-${uid}{animation:mblink-${uid} 4.2s infinite;transform-box:fill-box;transform-origin:center}
        @keyframes mblink-${uid}{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}
        .m-arm-l-${uid}{transform-box:fill-box;transform-origin:90% 20%;animation:${mood === "happy" ? `mwave-${uid} .5s ease-in-out infinite alternate` : "none"}}
        .m-arm-r-${uid}{transform-box:fill-box;transform-origin:10% 20%;animation:${mood === "happy" ? `mwave2-${uid} .5s ease-in-out infinite alternate` : "none"}}
        @keyframes mwave-${uid}{from{transform:rotate(10deg)}to{transform:rotate(-50deg)}}
        @keyframes mwave2-${uid}{from{transform:rotate(-10deg)}to{transform:rotate(50deg)}}
        .m-bub-${uid}{animation:rise 2.4s ease-out infinite;transform-box:fill-box}
        .m-pupils-${uid}{transition:transform .25s cubic-bezier(.2,.8,.2,1)}
        .m-jump-${uid}{animation:mjump-${uid} .7s cubic-bezier(.3,1.6,.5,1) infinite alternate;transform-box:fill-box;transform-origin:50% 100%}
        @keyframes mjump-${uid}{from{transform:translateY(0) scale(1.04,.96)}to{transform:translateY(-16px) scale(.97,1.03)}}
        .m-shake-${uid}{animation:mshake-${uid} .5s ease-in-out 2;transform-box:fill-box;transform-origin:50% 100%}
        @keyframes mshake-${uid}{0%,100%{transform:rotate(0)}25%{transform:rotate(-6deg)}75%{transform:rotate(6deg)}}
      `}</style>
      <defs>
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f08a00" />
          <stop offset="0.45" stopColor="#ffab2e" />
          <stop offset="1" stopColor="#e57f00" />
        </linearGradient>
        <radialGradient id={`lens-${uid}`} cx="0.35" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#bdeaff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#1cb0f6" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="100" cy="222" rx="52" ry="7" fill="#000" opacity="0.1" />

      <g className={bounce ? (mood === "happy" ? `m-jump-${uid}` : mood === "sad" ? `m-shake-${uid}` : `m-bob-${uid}`) : ""}>
        {/* feet */}
        <ellipse cx="78" cy="212" rx="15" ry="9" fill="#b85f00" />
        <ellipse cx="122" cy="212" rx="15" ry="9" fill="#b85f00" />

        {/* arms */}
        <path className={`m-arm-l-${uid}`} d="M48 140 Q26 150 30 172" stroke="#e57f00" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path className={`m-arm-r-${uid}`} d="M152 140 Q174 150 170 172" stroke="#e57f00" strokeWidth="13" strokeLinecap="round" fill="none" />

        {/* barrel */}
        <path d="M56 78 Q38 140 56 202 Q100 216 144 202 Q162 140 144 78 Q100 66 56 78 Z" fill={`url(#body-${uid})`} />
        {/* staves */}
        <path d="M80 72 Q72 140 80 210 M120 72 Q128 140 120 210" stroke="#d97700" strokeWidth="2.5" fill="none" opacity="0.45" />
        {/* hoops */}
        <path d="M47 104 Q100 118 153 104" stroke="#b85f00" strokeWidth="9" strokeLinecap="round" fill="none" />
        <path d="M47 184 Q100 198 153 184" stroke="#b85f00" strokeWidth="9" strokeLinecap="round" fill="none" />
        {/* shine */}
        <path d="M64 120 Q60 145 66 170" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.35" />

        {/* foam cap */}
        <g>
          <circle cx="62" cy="78" r="17" fill="var(--foam)" />
          <circle cx="84" cy="66" r="21" fill="var(--foam)" />
          <circle cx="114" cy="64" r="22" fill="var(--foam)" />
          <circle cx="139" cy="78" r="17" fill="var(--foam)" />
          <circle cx="100" cy="52" r="16" fill="var(--foam)" />
          <path d="M136 88 Q140 100 136 106 Q131 110 130 100 Z" fill="var(--foam)" />
          <circle cx="92" cy="56" r="4" fill="#fff" />
          <circle cx="120" cy="58" r="3" fill="#fff" />
          {/* rising bubbles */}
          {!has("helmet") && !has("cap") && !has("crown") && (
            <>
              <circle className={`m-bub-${uid}`} cx="76" cy="44" r="4" fill="var(--foam)" style={{ animationDelay: "0s" }} />
              <circle className={`m-bub-${uid}`} cx="118" cy="38" r="3" fill="var(--foam)" style={{ animationDelay: ".8s" }} />
              <circle className={`m-bub-${uid}`} cx="100" cy="32" r="2.5" fill="var(--foam)" style={{ animationDelay: "1.6s" }} />
            </>
          )}
        </g>

        {/* eyebrows by mood */}
        {mood === "sad" && (
          <g stroke="#7a3e00" strokeWidth="5" strokeLinecap="round">
            <path d="M64 108 L88 102" />
            <path d="M136 108 L112 102" />
          </g>
        )}
        {mood === "think" && (
          <g stroke="#7a3e00" strokeWidth="5" strokeLinecap="round" fill="none">
            <path d="M64 104 Q76 98 88 104" />
            <path d="M112 100 L136 100" />
          </g>
        )}

        {/* eyes */}
        <g className={`m-blink-${uid}`}>
          <ellipse cx="78" cy="132" rx="17" ry={mood === "wow" ? 21 : 19} fill="#fff" />
          <ellipse cx="122" cy="132" rx="17" ry={mood === "wow" ? 21 : 19} fill="#fff" />
          <g ref={pupils} className={`m-pupils-${uid}`}>
            <circle cx="80" cy="134" r={mood === "wow" ? 7 : 9} fill="#3c3c3c" />
            <circle cx="120" cy="134" r={mood === "wow" ? 7 : 9} fill="#3c3c3c" />
            <circle cx="83" cy="130" r="3" fill="#fff" />
            <circle cx="123" cy="130" r="3" fill="#fff" />
          </g>
          {mood === "happy" && (
            <g fill="#ffa21f">
              <ellipse cx="78" cy="152" rx="22" ry="12" />
              <ellipse cx="122" cy="152" rx="22" ry="12" />
            </g>
          )}
        </g>

        {/* cheeks */}
        <ellipse cx="60" cy="158" rx="9" ry="6" fill="#ff6b8a" opacity="0.45" />
        <ellipse cx="140" cy="158" rx="9" ry="6" fill="#ff6b8a" opacity="0.45" />

        {/* mouth */}
        {mood === "happy" && (
          <g>
            <path d="M84 158 Q100 182 116 158 Z" fill="#7a1f1f" />
            <path d="M92 168 Q100 176 108 168 Q100 164 92 168 Z" fill="#ff7a7a" />
          </g>
        )}
        {mood === "idle" && <path d="M88 161 Q100 172 112 161" stroke="#7a1f1f" strokeWidth="5" strokeLinecap="round" fill="none" />}
        {mood === "think" && <path d="M90 166 Q104 160 112 166" stroke="#7a1f1f" strokeWidth="5" strokeLinecap="round" fill="none" />}
        {mood === "sad" && <path d="M88 170 Q100 160 112 170" stroke="#7a1f1f" strokeWidth="5" strokeLinecap="round" fill="none" />}
        {mood === "wow" && <ellipse cx="100" cy="166" rx="8" ry="10" fill="#7a1f1f" />}

        {/* accessories */}
        {has("goggles") && (
          <g>
            <path d="M46 130 L154 130" stroke="#3c3c3c" strokeWidth="6" />
            <circle cx="78" cy="132" r="22" fill={`url(#lens-${uid})`} stroke="#4b4b4b" strokeWidth="5" />
            <circle cx="122" cy="132" r="22" fill={`url(#lens-${uid})`} stroke="#4b4b4b" strokeWidth="5" />
          </g>
        )}
        {has("bowtie") && (
          <g transform="translate(100 196)">
            <path d="M0 0 L-20 -11 L-20 11 Z M0 0 L20 -11 L20 11 Z" fill="var(--red)" stroke="var(--red-d)" strokeWidth="3" strokeLinejoin="round" />
            <circle r="6" fill="var(--red-d)" />
          </g>
        )}
        {has("helmet") && (
          <g>
            <path d="M50 70 Q50 18 100 16 Q150 18 150 70 Z" fill="var(--yellow)" />
            <path d="M88 18 Q86 44 90 70 M112 18 Q114 44 110 70" stroke="var(--yellow-d)" strokeWidth="5" fill="none" />
            <rect x="38" y="64" width="124" height="14" rx="7" fill="var(--yellow-d)" />
            <path d="M62 32 Q70 24 80 22" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.6" fill="none" />
          </g>
        )}
        {has("cap") && (
          <g>
            <path d="M54 72 Q54 22 100 20 Q146 22 146 72 Z" fill="var(--blue)" />
            <path d="M120 66 Q170 60 182 74 Q160 82 120 76 Z" fill="var(--blue-d)" />
            <circle cx="100" cy="22" r="6" fill="var(--blue-d)" />
            <path d="M100 22 L100 72" stroke="var(--blue-d)" strokeWidth="3" />
          </g>
        )}
        {has("crown") && (
          <g>
            <path d="M58 64 L56 18 L78 40 L100 10 L122 40 L144 18 L142 64 Z" fill="var(--yellow)" stroke="var(--yellow-d)" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="100" cy="46" r="7" fill="var(--red)" />
            <circle cx="74" cy="52" r="5" fill="var(--blue)" />
            <circle cx="126" cy="52" r="5" fill="var(--green)" />
          </g>
        )}
        {has("headphones") && (
          <g>
            <path d="M40 126 Q36 30 100 28 Q164 30 160 126" stroke="#4b4b4b" strokeWidth="10" fill="none" strokeLinecap="round" />
            <rect x="26" y="108" width="24" height="40" rx="11" fill="var(--purple)" stroke="var(--purple-d)" strokeWidth="4" />
            <rect x="150" y="108" width="24" height="40" rx="11" fill="var(--purple)" stroke="var(--purple-d)" strokeWidth="4" />
          </g>
        )}
      </g>
    </svg>
  );
}
