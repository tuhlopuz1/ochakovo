import type { LessonKind } from "../data/content";

/* Hand-built animated SVG scenes. Animations are CSS keyframes inside each SVG
   (transform/opacity only) plus a few SMIL path morphs for liquids. */

export function FactoryScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 340" className={className} role="img" aria-label="Завод Очаково: резервуары, конвейер и грузовик">
      <style>{`
        .fs-cloud{animation:fs-drift 26s linear infinite}
        .fs-cloud2{animation:fs-drift 38s linear infinite;animation-delay:-14s}
        @keyframes fs-drift{from{transform:translateX(-160px)}to{transform:translateX(700px)}}
        .fs-rays{animation:spin 20s linear infinite;transform-box:fill-box;transform-origin:center}
        .fs-steam{animation:fs-steam 3.2s ease-out infinite;transform-box:fill-box;transform-origin:center}
        @keyframes fs-steam{0%{transform:translate(0,0) scale(.4);opacity:0}20%{opacity:.95}100%{transform:translate(18px,-70px) scale(1.5);opacity:0}}
        .fs-belt{animation:fs-belt 4s linear infinite}
        @keyframes fs-belt{from{transform:translateX(0)}to{transform:translateX(80px)}}
        .fs-truck{animation:fs-truck 9s cubic-bezier(.5,0,.5,1) infinite}
        @keyframes fs-truck{0%{transform:translateX(-140px)}45%,55%{transform:translateX(250px)}100%{transform:translateX(720px)}}
        .fs-wheel{animation:spin .6s linear infinite;transform-box:fill-box;transform-origin:center}
        .fs-bub{animation:rise 2.6s ease-out infinite;transform-box:fill-box}
        .fs-blink{animation:fs-blink 1.6s steps(1) infinite}
        @keyframes fs-blink{50%{opacity:.25}}
      `}</style>
      <defs>
        <linearGradient id="fs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bdeaff" />
          <stop offset="1" stopColor="#ddf4ff" />
        </linearGradient>
        <linearGradient id="fs-kvass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9801c" />
          <stop offset="1" stopColor="#8a4508" />
        </linearGradient>
        <clipPath id="fs-tank1"><rect x="96" y="96" width="70" height="150" rx="35" /></clipPath>
        <clipPath id="fs-tank2"><rect x="180" y="120" width="60" height="126" rx="30" /></clipPath>
        <clipPath id="fs-frame"><rect width="600" height="340" rx="28" /></clipPath>
      </defs>
      <g clipPath="url(#fs-frame)">
        <rect width="600" height="340" fill="url(#fs-sky)" />
        {/* sun */}
        <g transform="translate(510 70)">
          <g className="fs-rays">
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x="-4" y="-56" width="8" height="18" rx="4" fill="#ffc800" transform={`rotate(${i * 30})`} />
            ))}
          </g>
          <circle r="30" fill="#ffc800" />
          <circle r="22" fill="#ffd84d" />
        </g>
        {/* clouds */}
        <g className="fs-cloud" opacity="0.95">
          <g transform="translate(0 60)">
            <ellipse cx="40" cy="20" rx="40" ry="18" fill="#fff" />
            <ellipse cx="70" cy="10" rx="28" ry="20" fill="#fff" />
            <ellipse cx="96" cy="22" rx="30" ry="15" fill="#fff" />
          </g>
        </g>
        <g className="fs-cloud2" opacity="0.8">
          <g transform="translate(0 120) scale(.7)">
            <ellipse cx="40" cy="20" rx="40" ry="18" fill="#fff" />
            <ellipse cx="70" cy="10" rx="28" ry="20" fill="#fff" />
            <ellipse cx="96" cy="22" rx="30" ry="15" fill="#fff" />
          </g>
        </g>
        {/* hills */}
        <path d="M0 250 Q120 200 260 240 T600 230 V340 H0 Z" fill="#89e219" />
        <path d="M0 280 Q160 250 320 272 T600 262 V340 H0 Z" fill="#58cc02" />

        {/* building */}
        <rect x="260" y="130" width="230" height="130" rx="14" fill="#fff" stroke="#e5e5e5" strokeWidth="4" />
        <path d="M260 140 L300 100 L340 140 L380 100 L420 140 L460 100 L490 130 L490 140 Z" fill="#ff4b4b" />
        <rect x="430" y="56" width="30" height="80" rx="6" fill="#d0d0d0" />
        <rect x="426" y="50" width="38" height="12" rx="6" fill="#afafaf" />
        <circle className="fs-steam" cx="445" cy="44" r="14" fill="#fff" style={{ animationDelay: "0s" }} />
        <circle className="fs-steam" cx="445" cy="44" r="14" fill="#fff" style={{ animationDelay: "1.1s" }} />
        <circle className="fs-steam" cx="445" cy="44" r="14" fill="#fff" style={{ animationDelay: "2.2s" }} />
        {/* windows */}
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={282 + i * 50} y="160" width="34" height="30" rx="8" fill="#ddf4ff" stroke="#1cb0f6" strokeWidth="3" />
        ))}
        <rect x="350" y="206" width="50" height="54" rx="8" fill="#ff9600" />
        <rect x="290" y="208" width="44" height="12" rx="6" fill="#58cc02" className="fs-blink" />

        {/* tanks */}
        {[
          { x: 96, y: 96, w: 70, h: 150, clip: "fs-tank1", lvl: 140 },
          { x: 180, y: 120, w: 60, h: 126, clip: "fs-tank2", lvl: 160 },
        ].map((t, i) => (
          <g key={i}>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={t.w / 2} fill="#eef3f6" stroke="#c5d3dc" strokeWidth="4" />
            <g clipPath={`url(#${t.clip})`}>
              <path fill="url(#fs-kvass)">
                <animate
                  attributeName="d"
                  dur={`${3 + i}s`}
                  repeatCount="indefinite"
                  values={`M${t.x} ${t.lvl} Q${t.x + t.w / 4} ${t.lvl - 8} ${t.x + t.w / 2} ${t.lvl} T${t.x + t.w} ${t.lvl} V${t.y + t.h} H${t.x} Z;
                           M${t.x} ${t.lvl} Q${t.x + t.w / 4} ${t.lvl + 8} ${t.x + t.w / 2} ${t.lvl} T${t.x + t.w} ${t.lvl} V${t.y + t.h} H${t.x} Z;
                           M${t.x} ${t.lvl} Q${t.x + t.w / 4} ${t.lvl - 8} ${t.x + t.w / 2} ${t.lvl} T${t.x + t.w} ${t.lvl} V${t.y + t.h} H${t.x} Z`}
                />
              </path>
              {[0, 1, 2, 3].map((b) => (
                <circle
                  key={b}
                  className="fs-bub"
                  cx={t.x + 14 + b * (t.w / 5)}
                  cy={t.y + t.h - 10}
                  r={3 + (b % 2)}
                  fill="#ffe0a8"
                  style={{ animationDelay: `${b * 0.6 + i * 0.3}s` }}
                />
              ))}
            </g>
            <rect x={t.x + 10} y={t.y + 14} width="8" height={t.h - 40} rx="4" fill="#fff" opacity="0.7" />
          </g>
        ))}
        <path d="M166 200 H180 M240 210 H260" stroke="#afafaf" strokeWidth="8" strokeLinecap="round" />

        {/* conveyor with bottles */}
        <rect x="40" y="276" width="520" height="14" rx="7" fill="#4b4b4b" />
        <g className="fs-belt">
          {Array.from({ length: 9 }, (_, i) => (
            <g key={i} transform={`translate(${-40 + i * 80} 236)`}>
              <rect x="0" y="12" width="22" height="30" rx="7" fill="#8a4508" />
              <rect x="5" y="2" width="12" height="14" rx="4" fill="#8a4508" />
              <rect x="4" y="-2" width="14" height="6" rx="2" fill="#ff4b4b" />
              <rect x="0" y="20" width="22" height="12" fill="#ffc800" />
            </g>
          ))}
        </g>

        {/* truck */}
        <g className="fs-truck">
          <g transform="translate(0 296)">
            <rect x="0" y="0" width="80" height="34" rx="6" fill="#1cb0f6" />
            <rect x="8" y="10" width="64" height="6" rx="3" fill="#fff" opacity="0.7" />
            <path d="M80 8 H100 L112 22 V34 H80 Z" fill="#1899d6" />
            <rect x="88" y="12" width="14" height="10" rx="2" fill="#ddf4ff" />
            <g className="fs-wheel" transform="translate(20 36)">
              <circle r="9" fill="#3c3c3c" />
              <rect x="-1.5" y="-7" width="3" height="14" fill="#afafaf" />
            </g>
            <g className="fs-wheel" transform="translate(94 36)">
              <circle r="9" fill="#3c3c3c" />
              <rect x="-1.5" y="-7" width="3" height="14" fill="#afafaf" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}

/* Small looping illustration per lesson kind. Used on intro cards and path decorations. */
export function LessonArt({ kind, size = 160 }: { kind: LessonKind; size?: number }) {
  return (
    <svg viewBox="0 0 160 160" width={size} height={size} aria-hidden style={{ overflow: "visible" }}>
      <style>{`
        .la-spin{animation:spin 6s linear infinite;transform-box:fill-box;transform-origin:center}
        .la-spin-fast{animation:spin 1.2s linear infinite;transform-origin:80px 80px}
        .la-spin-slow{animation:spin 9s linear infinite;transform-origin:80px 80px}
        .la-swing{animation:la-swing 2.2s ease-in-out infinite;transform-origin:80px 80px}
        @keyframes la-swing{0%,100%{transform:rotate(-35deg)}50%{transform:rotate(25deg)}}
        .la-bub{animation:rise 2.2s ease-out infinite;transform-box:fill-box}
        .la-belt{animation:la-belt 2.4s linear infinite}
        @keyframes la-belt{from{transform:translateX(0)}to{transform:translateX(40px)}}
        .la-hop{animation:la-hop 2.4s cubic-bezier(.3,1.4,.5,1) infinite}
        @keyframes la-hop{0%{transform:translate(0,0)}25%{transform:translate(26px,-26px)}50%{transform:translate(52px,-52px)}75%{transform:translate(78px,-78px)}100%{transform:translate(0,0)}}
        .la-lid{animation:la-lid 1.8s ease-in-out infinite;transform-origin:30px 70px}
        @keyframes la-lid{0%,60%,100%{transform:rotate(0)}75%{transform:rotate(-14deg)}85%{transform:rotate(-4deg)}}
        .la-spark{animation:la-spark 1.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
        @keyframes la-spark{0%,100%{transform:scale(0);opacity:0}50%{transform:scale(1);opacity:1}}
        .la-sway{animation:la-sway 3s ease-in-out infinite;transform-origin:80px 0px}
        @keyframes la-sway{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
      `}</style>
      {kind === "time" && (
        <g>
          <circle cx="80" cy="80" r="70" fill="none" stroke="var(--green)" strokeWidth="4" strokeDasharray="10 14" className="la-spin-slow" />
          <circle cx="80" cy="80" r="52" fill="#fff" stroke="var(--green-d)" strokeWidth="8" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x="78" y="34" width="4" height={i % 3 ? 6 : 10} rx="2" fill="#afafaf" transform={`rotate(${i * 30} 80 80)`} />
          ))}
          <rect x="77" y="46" width="6" height="36" rx="3" fill="#3c3c3c" className="la-spin-slow" />
          <rect x="78" y="38" width="4" height="44" rx="2" fill="var(--red)" className="la-spin-fast" />
          <circle cx="80" cy="80" r="6" fill="#3c3c3c" />
        </g>
      )}
      {kind === "brew" && (
        <g>
          <defs>
            <clipPath id="la-tank"><rect x="40" y="26" width="80" height="116" rx="40" /></clipPath>
          </defs>
          <rect x="40" y="26" width="80" height="116" rx="40" fill="#eef3f6" stroke="#c5d3dc" strokeWidth="6" />
          <g clipPath="url(#la-tank)">
            <path fill="#b8620f">
              <animate attributeName="d" dur="2.6s" repeatCount="indefinite"
                values="M40 74 Q60 64 80 74 T120 74 V150 H40 Z;M40 74 Q60 84 80 74 T120 74 V150 H40 Z;M40 74 Q60 64 80 74 T120 74 V150 H40 Z" />
            </path>
            <rect x="40" y="70" width="80" height="10" fill="#fff7e6" opacity="0.8" />
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} className="la-bub" cx={52 + i * 14} cy="134" r={3 + (i % 2) * 2} fill="#ffd28a" style={{ animationDelay: `${i * 0.45}s` }} />
            ))}
          </g>
          <rect x="52" y="40" width="8" height="70" rx="4" fill="#fff" opacity="0.6" />
          <rect x="66" y="142" width="28" height="12" rx="4" fill="#afafaf" />
        </g>
      )}
      {kind === "bottle" && (
        <g>
          <rect x="6" y="122" width="148" height="12" rx="6" fill="#4b4b4b" />
          <circle cx="20" cy="128" r="3" fill="#afafaf" />
          <circle cx="140" cy="128" r="3" fill="#afafaf" />
          <clipPath id="la-belt-clip"><rect x="0" y="20" width="160" height="104" /></clipPath>
          <g clipPath="url(#la-belt-clip)">
            <g className="la-belt">
              {[-40, 0, 40, 80, 120].map((x, i) => (
                <g key={x} transform={`translate(${x + 8} 62)`}>
                  <rect x="0" y="18" width="26" height="42" rx="9" fill="#8a4508" />
                  <rect x="7" y="0" width="12" height="22" rx="5" fill="#8a4508" />
                  {i !== 2 && <rect x="5" y="-5" width="16" height="7" rx="3" fill="var(--red)" />}
                  <rect x="0" y="30" width="26" height="14" fill="var(--yellow)" />
                </g>
              ))}
            </g>
          </g>
          <g className="la-spark" transform="translate(98 40)">
            <circle r="14" fill="none" stroke="var(--blue)" strokeWidth="5" />
            <path d="M10 10 L22 22" stroke="var(--blue)" strokeWidth="6" strokeLinecap="round" />
          </g>
        </g>
      )}
      {kind === "compass" && (
        <g>
          <circle cx="80" cy="80" r="64" fill="var(--purple)" />
          <circle cx="80" cy="80" r="52" fill="#fff" />
          {["С", "В", "Ю", "З"].map((l, i) => (
            <text key={l} x="80" y="44" textAnchor="middle" fontWeight="900" fontSize="14" fill="#afafaf" transform={`rotate(${i * 90} 80 80)`}>
              {l}
            </text>
          ))}
          <g className="la-swing">
            <path d="M80 36 L92 80 L68 80 Z" fill="var(--red)" />
            <path d="M80 124 L92 80 L68 80 Z" fill="#cfd8dc" />
          </g>
          <circle cx="80" cy="80" r="7" fill="#3c3c3c" />
        </g>
      )}
      {kind === "year" && (
        <g>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={20 + i * 30} y={120 - i * 26} width="34" height={20 + i * 26} rx="6" fill={["var(--green)", "var(--blue)", "var(--amber)", "var(--purple)"][i]} />
          ))}
          <g className="la-hop">
            <circle cx="37" cy="108" r="9" fill="var(--pink)" stroke="#fff" strokeWidth="3" />
          </g>
          <path d="M126 18 V48" stroke="#4b4b4b" strokeWidth="4" strokeLinecap="round" />
          <path d="M128 18 L150 26 L128 34 Z" fill="var(--red)" />
        </g>
      )}
      {kind === "chest" && (
        <g>
          <g className="la-spark" transform="translate(30 30)"><path d="M0 -10 L3 -3 L10 0 L3 3 L0 10 L-3 3 L-10 0 L-3 -3 Z" fill="var(--yellow)" /></g>
          <g className="la-spark" transform="translate(132 40)" style={{ animationDelay: ".6s" }}><path d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill="var(--yellow)" /></g>
          <rect x="30" y="76" width="100" height="62" rx="10" fill="#c86f00" />
          <rect x="30" y="96" width="100" height="10" fill="#8a4508" />
          <g className="la-lid">
            <path d="M30 76 Q30 40 80 40 Q130 40 130 76 Z" fill="#ff9600" />
            <path d="M74 40 H86 V76 H74 Z" fill="var(--yellow)" />
          </g>
          <rect x="72" y="88" width="16" height="22" rx="4" fill="var(--yellow)" stroke="var(--yellow-d)" strokeWidth="3" />
        </g>
      )}
      {kind === "pass" && (
        <g className="la-sway">
          <path d="M60 0 L74 46 M100 0 L86 46" stroke="var(--blue)" strokeWidth="6" />
          <rect x="34" y="44" width="92" height="110" rx="14" fill="#fff" stroke="var(--line)" strokeWidth="5" />
          <rect x="34" y="44" width="92" height="28" rx="12" fill="var(--green)" />
          <rect x="66" y="52" width="28" height="8" rx="4" fill="#fff" />
          <circle cx="80" cy="100" r="18" fill="var(--amber)" />
          <rect x="52" y="126" width="56" height="8" rx="4" fill="#e5e5e5" />
          <rect x="60" y="140" width="40" height="6" rx="3" fill="#e5e5e5" />
        </g>
      )}
    </svg>
  );
}
