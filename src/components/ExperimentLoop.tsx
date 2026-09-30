"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

import type { ThreadKey } from "./threads";

export type { ThreadKey };

export type Thumb =
  | { kind: "screen"; src: string; alt: string } // phone screenshot, bottom-aligned in an accent well
  | { kind: "cover"; src: string; alt: string } // desktop screenshot, cropped to the top-left
  | { kind: "stat"; value: string; label: string }
  | { kind: "date"; month: string; day: string };

export interface LoopItem {
  title: string;
  blurb: string;
  href: string;
  meta: string;
  thumb: Thumb;
}

export interface LoopThread {
  key: ThreadKey;
  label: string;
  context: string;
  count: string;
  items: LoopItem[];
  allHref: string;
  allLabel: string;
}

interface ExperimentLoopProps {
  threads: LoopThread[];
}

const ORDER: ThreadKey[] = ["building", "signals", "practice"];

// Tailwind gray/sky values, needed inline because the diagram is computed per frame.
const C = {
  ink: "#111827",
  inkStrong: "#1f2937",
  line: "#e5e7eb",
  dot: "#d1d5db",
  a50: "#f0f9ff",
  a100: "#e0f2fe",
  a200: "#bae6fd",
  a400: "#38bdf8",
  a500: "#0ea5e9",
  a600: "#0284c7",
};

const STAGE_H = 385;
const LIST_LEFT = 500;

// ---------- Geometry ----------

interface Geo {
  cx: number;
  cy: number;
  R: number;
  rot: number;
  d: Record<ThreadKey, number>;
}

interface Lane {
  f: ThreadKey;
  t: ThreadKey;
  d: string;
}

function target(s: ThreadKey | null, W: number): Geo {
  if (!s) return { cx: W - 404, cy: 220, R: 110, rot: -90, d: { building: 84, signals: 84, practice: 84 } };
  const d = {} as Record<ThreadKey, number>;
  ORDER.forEach((k) => (d[k] = k === s ? 110 : 62));
  // Rotate so the chosen node sits at 0deg, pointing at the list.
  return { cx: 190, cy: 195, R: 105, rot: -ORDER.indexOf(s) * 120, d };
}

function pos(g: Geo, k: ThreadKey): [number, number] {
  const a = ((g.rot + ORDER.indexOf(k) * 120) * Math.PI) / 180;
  return [g.cx + g.R * Math.cos(a), g.cy + g.R * Math.sin(a)];
}

// Two offset lanes per pair of nodes, one in each direction.
function lanes(g: Geo, gap: number): Lane[] {
  const out: Lane[] = [];
  const pairs: [ThreadKey, ThreadKey][] = [
    ["building", "signals"],
    ["signals", "practice"],
    ["practice", "building"],
  ];
  pairs.forEach(([a, b]) => {
    [[a, b], [b, a]].forEach(([f, t]) => {
      const A = pos(g, f);
      const B = pos(g, t);
      const dx = B[0] - A[0];
      const dy = B[1] - A[1];
      const L = Math.hypot(dx, dy);
      const ux = dx / L;
      const uy = dy / L;
      const nx = -uy * 7;
      const ny = ux * 7;
      const ra = g.d[f] / 2 + gap;
      const rb = g.d[t] / 2 + gap;
      out.push({
        f,
        t,
        d: `M${(A[0] + ux * ra + nx).toFixed(1)} ${(A[1] + uy * ra + ny).toFixed(1)}L${(B[0] - ux * rb + nx).toFixed(1)} ${(B[1] - uy * rb + ny).toFixed(1)}`,
      });
    });
  });
  return out;
}

const ease = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (next > 0) setW(next); // 0 while hidden by the other breakpoint
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

// ---------- Shared pieces ----------

export function NodeIcon({ k, size }: { k: ThreadKey; size: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (k === "building")
    return (
      <svg {...common}>
        <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
      </svg>
    );
  if (k === "signals")
    return (
      <svg {...common}>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M12 3l9 4.5-9 4.5-9-4.5z" />
      <path d="M3 12l9 4.5 9-4.5" />
      <path d="M3 16.5l9 4.5 9-4.5" />
    </svg>
  );
}

function nodeStyle(sel: boolean, hov: boolean): CSSProperties {
  return {
    background: sel ? C.ink : hov ? C.a50 : "#fff",
    borderColor: sel ? C.ink : hov ? C.a400 : C.line,
    color: sel ? "#fff" : hov ? C.a600 : C.inkStrong,
    outline: `8px solid ${sel ? C.a100 : "rgba(255,255,255,0)"}`,
    transform: hov ? "scale(1.05)" : "scale(1)",
    transition:
      "background 250ms ease-out, border-color 250ms ease-out, color 250ms ease-out, outline-color 250ms ease-out, transform 200ms ease-out",
  };
}

const labelColor = (sel: boolean, hov: boolean) => (hov && !sel ? C.a600 : sel ? C.ink : C.inkStrong);

interface EdgeLayerProps {
  W: number;
  H: number;
  drawn: Lane[];
  pulsePaths: Lane[];
  sel: ThreadKey | null;
  hov: ThreadKey | null;
  pulseKey: number;
  delay: number;
  loop: boolean;
  motion: boolean;
}

function EdgeLayer({ W, H, drawn, pulsePaths, sel, hov, pulseKey, delay, loop, motion }: EdgeLayerProps) {
  const uid = useId().replace(/:/g, "");
  const col = { sel: C.a500, hov: C.a200, off: C.dot };
  const tone = (l: Lane) =>
    l.f === sel || l.t === sel ? "sel" : l.f === hov || l.t === hov ? "hov" : "off";
  const dot = (d: string, size: number, color: string, animation: string): CSSProperties => ({
    position: "absolute",
    left: 0,
    top: 0,
    width: size,
    height: size,
    borderRadius: 999,
    background: color,
    offsetPath: `path('${d}')`,
    offsetRotate: "0deg",
    animation,
  });

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0">
        <defs>
          {(Object.keys(col) as (keyof typeof col)[]).map((k) => (
            <marker
              key={k}
              id={`${uid}${k}`}
              viewBox="0 0 10 10"
              refX={9}
              refY={5}
              markerWidth={6}
              markerHeight={6}
              orient="auto"
            >
              <path d="M0 0L10 5L0 10z" fill={col[k]} />
            </marker>
          ))}
        </defs>
        {drawn.map((l, i) => (
          <path
            key={i}
            d={l.d}
            fill="none"
            stroke={col[tone(l)]}
            strokeWidth={1.5}
            markerEnd={`url(#${uid}${tone(l)})`}
            style={{ transition: "stroke 200ms ease-out" }}
          />
        ))}
      </svg>
      {motion &&
        sel &&
        pulsePaths
          .filter((l) => l.f === sel || l.t === sel)
          .map((l, i) => (
            <div
              key={`${pulseKey}-${sel}-${i}`}
              style={dot(l.d, 9, C.a500, `kmPulse 800ms ease-in-out ${delay + (l.f === sel ? 0 : 550)}ms both`)}
            />
          ))}
      {motion &&
        loop &&
        pulsePaths.map((l, i) => (
          <div
            key={`loop-${i}`}
            style={dot(l.d, 7, C.a400, `kmPulse 2400ms ease-in-out ${i * 400}ms infinite both`)}
          />
        ))}
    </div>
  );
}

function ThumbView({ thumb, compact }: { thumb: Thumb; compact?: boolean }) {
  const box = "aspect-[16/10] rounded-lg overflow-hidden";
  switch (thumb.kind) {
    case "screen":
      return (
        <div className={`${box} bg-accent-50 border border-accent-100 flex justify-center items-end pt-2`}>
          <img src={thumb.src} alt={thumb.alt} loading="lazy" className="h-full w-auto rounded-t-[5px]" />
        </div>
      );
    case "cover":
      return (
        <div className={`${box} bg-gray-50 border border-gray-200`}>
          <img src={thumb.src} alt={thumb.alt} loading="lazy" className="w-full h-full object-cover object-left-top" />
        </div>
      );
    case "stat":
      return (
        <div className={`${box} bg-gray-900 flex items-end gap-1.5 px-2.5 py-2`}>
          <span
            className={`${compact ? "text-2xl" : "text-4xl"} font-extrabold tracking-[-0.05em] leading-[0.85] text-accent-400`}
          >
            {thumb.value}
          </span>
          <span className="text-[11px] text-gray-200 pb-0.5">{thumb.label}</span>
        </div>
      );
    case "date":
      return (
        <div className={`${box} bg-accent-50 border border-accent-100 flex flex-col justify-end px-2.5 py-2`}>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-accent-700">{thumb.month}</span>
          <span
            className={`${compact ? "text-2xl" : "text-[32px]"} font-extrabold tracking-[-0.04em] leading-[0.95] text-accent-600`}
          >
            {thumb.day}
          </span>
        </div>
      );
  }
}

function ThreadList({ thread, compact }: { thread: LoopThread; compact?: boolean }) {
  const delay = (i: number) => ({ animationDelay: `${80 * (i + 1)}ms` });
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 pb-3 mb-1 border-b border-gray-900 km-in">
        <h3
          className={`${compact ? "text-2xl" : "text-[26px]"} font-extrabold tracking-[-0.035em] leading-tight text-gray-900 text-balance`}
        >
          {thread.label}
        </h3>
        <p className="text-[15px] leading-normal text-gray-700 text-pretty">{thread.context}</p>
      </div>

      {thread.items.length === 0 ? (
        <div className="mt-3 p-7 rounded-xl bg-gray-50 flex flex-col gap-1.5 km-in" style={delay(0)}>
          <span className="text-lg font-bold tracking-tight text-gray-800">Nothing published yet.</span>
          <span className="text-[15px] leading-normal text-gray-600">Working notes will go here.</span>
        </div>
      ) : (
        thread.items.map((item, i) => (
          <a
            key={item.href}
            href={item.href}
            className={`group grid ${
              compact ? "grid-cols-[88px_minmax(0,1fr)] gap-4" : "grid-cols-[112px_minmax(0,1fr)_auto] gap-5"
            } items-center py-2.5 px-3 -mx-3 rounded-xl transition-colors hover:bg-accent-50 km-in`}
            style={delay(i)}
          >
            <ThumbView thumb={item.thumb} compact={compact} />
            <div className="flex flex-col gap-1 min-w-0">
              <span
                className={`${compact ? "text-base" : "text-[19px]"} font-extrabold tracking-[-0.03em] text-gray-800 group-hover:text-accent-700 transition-colors`}
              >
                {item.title}
              </span>
              <span className="text-sm leading-normal text-gray-600 text-pretty">{item.blurb}</span>
              {compact && <span className="text-[13px] text-gray-500">{item.meta} →</span>}
            </div>
            {!compact && <span className="text-[13px] text-gray-600 whitespace-nowrap">{item.meta} →</span>}
          </a>
        ))
      )}

      <a
        href={thread.allHref}
        className="pt-4 text-[15px] font-semibold text-accent-600 hover:text-accent-700 transition-colors km-in"
        style={delay(thread.items.length)}
      >
        {thread.allLabel} →
      </a>
    </div>
  );
}

// ---------- Desktop: the turning triangle ----------

function DesktopLoop({ byKey }: { byKey: Record<ThreadKey, LoopThread> }) {
  const [ref, W] = useWidth<HTMLDivElement>(1104);
  const reduce = useReducedMotion() ?? false;
  const [sel, setSel] = useState<ThreadKey | null>(null);
  const [shown, setShown] = useState<ThreadKey>("building"); // keeps the list rendered while it fades out
  const [hov, setHov] = useState<ThreadKey | null>(null);
  const [pulseKey, setPulseKey] = useState(0);
  const [g, setG] = useState<Geo>(() => target(null, 1104));
  const gRef = useRef(g);
  gRef.current = g;
  const lastSel = useRef<ThreadKey | null>(null);

  useEffect(() => {
    const to = target(sel, W);
    // A resize alone snaps; only a selection change animates.
    if (sel === lastSel.current || reduce) {
      lastSel.current = sel;
      setG(to);
      return;
    }
    lastSel.current = sel;
    const from = gRef.current;
    const dr = ((((to.rot - from.rot) % 360) + 540) % 360) - 180;
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / 650);
      const e = ease(p);
      const L = (a: number, b: number) => a + (b - a) * e;
      const d = {} as Record<ThreadKey, number>;
      ORDER.forEach((k) => (d[k] = L(from.d[k], to.d[k])));
      setG({ cx: L(from.cx, to.cx), cy: L(from.cy, to.cy), R: L(from.R, to.R), rot: p >= 1 ? to.rot : from.rot + dr * e, d });
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [sel, W, reduce]);

  useEffect(() => {
    if (!sel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSel(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  const choose = (k: ThreadKey) => {
    const next = sel === k ? null : k;
    setSel(next);
    if (next) setShown(next);
    setPulseKey((n) => n + 1);
  };

  const ctx = hov ? byKey[hov] : null;
  const open = sel !== null;
  const [topX, topY] = pos(g, "building"); // top of the triangle while nothing is selected

  return (
    <div ref={ref} className="relative w-full" style={{ height: STAGE_H }}>
      <EdgeLayer
        W={W}
        H={STAGE_H}
        drawn={lanes(g, 16)}
        pulsePaths={lanes(target(sel, W), 16)}
        sel={sel}
        hov={hov}
        pulseKey={pulseKey}
        delay={650}
        loop={!sel}
        motion={!reduce}
      />

      {/* Explainer, shown while nothing is selected */}
      <div
        className="absolute left-0 w-[360px] flex flex-col gap-4 pointer-events-none"
        style={{
          top: 75,
          opacity: open ? 0 : 1,
          transform: open ? "translateX(-24px)" : "none",
          transition: "opacity 300ms ease-out, transform 300ms ease-out",
        }}
        aria-hidden={open}
      >
        <h2 className="text-4xl font-extrabold tracking-[-0.035em] leading-[1.08] text-gray-900">
          My Experimentation Loop
        </h2>
        <p className="text-[17px] leading-relaxed text-gray-700 text-pretty">
          I keep an eye out for industry trends, build software, and practice using new tools to ensure my
          hypothesis stays sharp.
        </p>
      </div>

      {/* Hover context, beside the top node */}
      <div
        className="absolute w-60 flex flex-col items-center gap-2 text-center pointer-events-none"
        style={{
          left: topX + g.d.building / 2 + 64,
          top: topY,
          transform: "translateY(-50%)",
          opacity: !open && ctx ? 1 : 0,
          transition: "opacity 250ms ease-out",
        }}
        aria-hidden="true"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-700">{ctx?.label}</span>
        <span className="text-base leading-normal text-gray-700 text-pretty">{ctx?.context}</span>
      </div>

      {ORDER.map((k) => {
        const [x, y] = pos(g, k);
        const d = g.d[k];
        const isSel = sel === k;
        const isHov = hov === k;
        const ux = (x - g.cx) / g.R;
        const uy = (y - g.cy) / g.R;
        const rr = d / 2 + 14 + Math.abs(ux) * 100 + Math.abs(uy) * 30;
        // Open: small nodes sit in a column, so labels go straight above or below them.
        const labelLeft = open ? -100 : Math.max(ux * rr - 100, -x);
        const handlers = {
          onMouseEnter: () => setHov(k),
          onMouseLeave: () => setHov(null),
          onClick: () => choose(k),
        };
        return (
          <div key={k} className="absolute w-0 h-0" style={{ left: x, top: y }}>
            <button
              type="button"
              {...handlers}
              onFocus={() => setHov(k)}
              onBlur={() => setHov(null)}
              aria-pressed={isSel}
              aria-label={`${byKey[k].label}, ${byKey[k].count}`}
              className="absolute rounded-full border flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-4"
              style={{ left: -d / 2, top: -d / 2, width: d, height: d, ...nodeStyle(isSel, isHov) }}
            >
              <NodeIcon k={k} size={Math.round(d * (isSel ? 0.34 : 0.26))} />
            </button>
            <div
              {...handlers}
              aria-hidden="true"
              className="absolute w-[200px] flex flex-col gap-0.5 items-center text-center cursor-pointer"
              style={{
                left: labelLeft,
                top: open ? (uy < 0 ? -d / 2 - 10 : d / 2 + 10) : uy * rr - 30,
                transform: open && uy < 0 ? "translateY(-100%)" : "none",
                opacity: isSel ? 0 : 1,
                pointerEvents: isSel ? "none" : "auto",
                transition: "opacity 250ms ease-out",
              }}
            >
              <span
                className="text-[17px] font-bold tracking-[-0.025em]"
                style={{ color: labelColor(isSel, isHov), transition: "color 200ms ease-out" }}
              >
                {byKey[k].label}
              </span>
              <span className="text-[13px] text-gray-600">{byKey[k].count}</span>
            </div>
          </div>
        );
      })}

      {/* List panel */}
      <div
        className="absolute -top-3"
        style={{
          left: LIST_LEFT,
          width: Math.max(W - LIST_LEFT, 0),
          opacity: open ? 1 : 0,
          transform: open ? "none" : "translateX(32px)",
          visibility: open ? "visible" : "hidden",
          transition: open
            ? "opacity 400ms ease-out, transform 400ms ease-out, visibility 0s"
            : "opacity 400ms ease-out, transform 400ms ease-out, visibility 0s linear 400ms",
        }}
        aria-live="polite"
      >
        <ThreadList key={`${shown}-${pulseKey}`} thread={byKey[shown]} />
      </div>
    </div>
  );
}

// ---------- Compact: a fixed triangle used as tabs ----------

const COMPACT_H = 350;
const COMPACT_D = 76;

function CompactLoop({ byKey }: { byKey: Record<ThreadKey, LoopThread> }) {
  const [ref, W] = useWidth<HTMLDivElement>(360);
  const reduce = useReducedMotion() ?? false;
  const [sel, setSel] = useState<ThreadKey>("building");
  const [hov, setHov] = useState<ThreadKey | null>(null);
  const [pulseKey, setPulseKey] = useState(0);

  const R = Math.min(110, Math.max(80, W * 0.3));
  const g: Geo = {
    cx: W / 2,
    cy: 200,
    R,
    rot: -90,
    d: { building: COMPACT_D, signals: COMPACT_D, practice: COMPACT_D },
  };
  const drawn = lanes(g, 12);

  const choose = (k: ThreadKey) => {
    setSel(k);
    setPulseKey((n) => n + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-3xl font-extrabold tracking-[-0.035em] leading-tight text-gray-900">
          My Experimentation Loop
        </h2>
        <p className="text-base leading-relaxed text-gray-700 text-pretty">
          I keep an eye out for industry trends, build software, and practice using new tools to ensure my
          hypothesis stays sharp.
        </p>
      </div>

      <div ref={ref} className="relative w-full" style={{ height: COMPACT_H }}>
        <EdgeLayer
          W={W}
          H={COMPACT_H}
          drawn={drawn}
          pulsePaths={drawn}
          sel={sel}
          hov={hov}
          pulseKey={pulseKey}
          delay={0}
          loop={false}
          motion={!reduce && pulseKey > 0}
        />
        {ORDER.map((k) => {
          const [x, y] = pos(g, k);
          const isSel = sel === k;
          const isHov = hov === k;
          const above = y < g.cy;
          return (
            <div key={k} className="absolute w-0 h-0" style={{ left: x, top: y }}>
              <button
                type="button"
                onClick={() => choose(k)}
                onMouseEnter={() => setHov(k)}
                onMouseLeave={() => setHov(null)}
                aria-pressed={isSel}
                aria-label={`${byKey[k].label}, ${byKey[k].count}`}
                className="absolute rounded-full border flex items-center justify-center cursor-pointer focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-4"
                style={{
                  left: -COMPACT_D / 2,
                  top: -COMPACT_D / 2,
                  width: COMPACT_D,
                  height: COMPACT_D,
                  ...nodeStyle(isSel, isHov),
                }}
              >
                <NodeIcon k={k} size={24} />
              </button>
              <div
                aria-hidden="true"
                onClick={() => choose(k)}
                className="absolute w-[128px] -ml-16 flex flex-col items-center text-center cursor-pointer"
                style={
                  above
                    ? { bottom: COMPACT_D / 2 + 14 }
                    : { top: COMPACT_D / 2 + 14 }
                }
              >
                <span
                  className="text-sm font-bold tracking-[-0.02em] leading-tight"
                  style={{ color: labelColor(isSel, isHov) }}
                >
                  {byKey[k].label}
                </span>
                <span className="text-xs text-gray-600">{byKey[k].count}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div aria-live="polite">
        <ThreadList key={sel} thread={byKey[sel]} compact />
      </div>
    </div>
  );
}

export default function ExperimentLoop({ threads }: ExperimentLoopProps) {
  const byKey = Object.fromEntries(threads.map((t) => [t.key, t])) as Record<ThreadKey, LoopThread>;
  return (
    <>
      <div className="hidden min-[1008px]:block">
        <DesktopLoop byKey={byKey} />
      </div>
      <div className="min-[1008px]:hidden">
        <CompactLoop byKey={byKey} />
      </div>
    </>
  );
}
