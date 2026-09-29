"use client";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { NodeIcon } from "./ExperimentLoop";
import { THREADS } from "./threads";
import type { ThreadKey } from "./threads";

export interface WritingPost {
  title: string;
  description: string;
  href: string;
  month: string;
  day: string;
  thread: ThreadKey;
}

interface WritingIndexProps {
  posts: WritingPost[]; // newest first
  buildTitles: string[];
}

type Filter = ThreadKey | "all";

const TAB_ORDER: Filter[] = ["all", "practice", "building", "signals"];
const isFilter = (v: string | null): v is Filter => v !== null && (TAB_ORDER as string[]).includes(v);

const C = {
  ink: "#111827",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray600: "#4b5563",
  a400: "#38bdf8",
  a500: "#0ea5e9",
};

// Mini triangle geometry (340 x 310), from the Blog Index design.
const NODES: Record<ThreadKey, { x: number; y: number; labelAbove: boolean }> = {
  building: { x: 170, y: 60, labelAbove: true },
  practice: { x: 68, y: 246, labelAbove: false },
  signals: { x: 272, y: 246, labelAbove: false },
};
const LANES: { pair: [ThreadKey, ThreadKey]; d: string }[] = [
  { pair: ["building", "signals"], d: "M188.6 126L245 213.4" },
  { pair: ["building", "signals"], d: "M253.4 208L197 120.6" },
  { pair: ["signals", "practice"], d: "M230 241L110 241" },
  { pair: ["signals", "practice"], d: "M110 251L230 251" },
  { pair: ["practice", "building"], d: "M95 213.4L151.4 126" },
  { pair: ["practice", "building"], d: "M143 120.6L86.6 208" },
];

function MiniLoop({
  filter,
  hov,
  setHov,
  choose,
}: {
  filter: Filter;
  hov: ThreadKey | null;
  setHov: (k: ThreadKey | null) => void;
  choose: (k: ThreadKey) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const lit = (a: ThreadKey, b: ThreadKey) => filter === a || filter === b || hov === a || hov === b;

  return (
    <div className="relative w-[340px] h-[310px]">
      <svg width={340} height={310} viewBox="0 0 340 310" className="absolute inset-0" aria-hidden="true">
        <defs>
          <marker id="wiOn" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M0 0L10 5L0 10z" fill={C.a400} />
          </marker>
          <marker id="wiOff" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M0 0L10 5L0 10z" fill={C.gray600} />
          </marker>
        </defs>
        {LANES.map((l, i) => {
          const on = lit(...l.pair);
          return (
            <path
              key={i}
              d={l.d}
              fill="none"
              strokeWidth={1.5}
              stroke={on ? C.a400 : C.gray600}
              markerEnd={`url(#${on ? "wiOn" : "wiOff"})`}
              style={{ transition: "stroke 200ms ease-out" }}
            />
          );
        })}
      </svg>

      {filter === "all" && !reduce && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {LANES.map((l, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: 6,
                height: 6,
                borderRadius: 999,
                background: C.a400,
                offsetPath: `path('${l.d}')`,
                offsetRotate: "0deg",
                animation: `kmPulse 2400ms ease-in-out ${i * 400}ms infinite both`,
              }}
            />
          ))}
        </div>
      )}

      {(Object.keys(NODES) as ThreadKey[]).map((k) => {
        const n = NODES[k];
        const sel = filter === k;
        const on = hov === k;
        const circle: CSSProperties = {
          background: sel ? "#fff" : "transparent",
          borderColor: sel ? "#fff" : on ? C.a400 : C.gray600,
          color: sel ? C.ink : on ? C.a400 : C.gray200,
          outline: `5px solid ${sel ? C.a500 : "rgba(0,0,0,0)"}`,
          transform: on ? "scale(1.06)" : "scale(1)",
          transition: "all 250ms ease-out",
        };
        const label = (
          <span
            className="text-[13px] font-semibold"
            style={{ color: sel ? "#fff" : on ? C.a400 : C.gray300, transition: "color 200ms ease-out" }}
          >
            {THREADS[k].shortLabel}
          </span>
        );
        return (
          <button
            key={k}
            type="button"
            onClick={() => choose(k)}
            onMouseEnter={() => setHov(k)}
            onMouseLeave={() => setHov(null)}
            onFocus={() => setHov(k)}
            onBlur={() => setHov(null)}
            aria-pressed={sel}
            aria-label={`Show ${THREADS[k].label}`}
            className="absolute w-[140px] flex flex-col items-center gap-2.5 cursor-pointer rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            style={{ left: n.x - 70, top: n.labelAbove ? n.y - 60 : n.y - 32 }}
          >
            {n.labelAbove && label}
            <span className="w-16 h-16 rounded-full border flex items-center justify-center" style={circle}>
              <NodeIcon k={k} size={24} />
            </span>
            {!n.labelAbove && label}
          </button>
        );
      })}
    </div>
  );
}

function DateTile({ month, day }: { month: string; day: string }) {
  return (
    <div className="aspect-[16/11] rounded-[10px] bg-accent-50 border border-accent-100 flex flex-col justify-end px-2.5 sm:px-3 py-2.5">
      <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide sm:tracking-widest whitespace-nowrap text-accent-700">{month}</span>
      <span className="text-2xl sm:text-4xl font-extrabold tracking-[-0.04em] leading-[0.95] text-accent-600">{day}</span>
    </div>
  );
}

function PostRow({ post, showThread, index }: { post: WritingPost; showThread: boolean; index: number }) {
  return (
    <a
      href={post.href}
      className="group grid grid-cols-[88px_minmax(0,1fr)] sm:grid-cols-[120px_minmax(0,1fr)_auto] gap-5 sm:gap-7 items-center p-4 -mx-4 rounded-xl transition-colors hover:bg-accent-50 km-in"
      style={{ animationDelay: `${100 + index * 80}ms` }}
    >
      <DateTile month={post.month} day={post.day} />
      <div className="flex flex-col gap-1.5 min-w-0">
        {showThread && (
          <span className="text-xs font-semibold uppercase tracking-widest text-accent-700">
            {THREADS[post.thread].label}
          </span>
        )}
        <span className="text-lg sm:text-2xl font-extrabold tracking-[-0.03em] text-gray-800 group-hover:text-accent-700 transition-colors">
          {post.title}
        </span>
        <span className="text-[15px] sm:text-base leading-relaxed text-gray-600 text-pretty">{post.description}</span>
      </div>
      <span className="hidden sm:block text-lg text-gray-400 group-hover:text-accent-600 transition-colors">→</span>
    </a>
  );
}

function listJoin(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export default function WritingIndex({ posts, buildTitles }: WritingIndexProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [hov, setHov] = useState<ThreadKey | null>(null);

  // ?thread=practice deep-links a filter (the homepage loop links here).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("thread");
    if (isFilter(t)) setFilter(t);
  }, []);

  const apply = (f: Filter) => {
    setFilter(f);
    const url = new URL(window.location.href);
    if (f === "all") url.searchParams.delete("thread");
    else url.searchParams.set("thread", f);
    window.history.replaceState(null, "", url);
  };
  const choose = (k: ThreadKey) => apply(filter === k ? "all" : k);

  const count = (f: Filter) => (f === "all" ? posts.length : posts.filter((p) => p.thread === f).length);
  const captionKey = hov ?? (filter !== "all" ? filter : null);
  const [featured, ...rest] = posts;
  const filtered = filter === "all" ? [] : posts.filter((p) => p.thread === filter);

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-14 md:pt-14 md:pb-16 grid md:grid-cols-[minmax(0,1fr)_340px] gap-14 items-center">
          <div className="flex flex-col gap-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Writing</p>
            <h1 className="text-[40px] sm:text-5xl lg:text-[56px] leading-[1.04] font-extrabold tracking-[-0.04em] text-white text-balance">
              Notes from the <span className="text-accent-400">experimentation loop.</span>
            </h1>
            <p className="text-lg leading-relaxed text-gray-200 max-w-[560px] text-pretty">
              What I'm seeing in the industry, what I'm building to test it, and how I actually work with AI tools.
            </p>
            <p
              className="hidden md:block min-h-[26px] text-[15px] leading-relaxed text-accent-200 max-w-[560px]"
              style={{ opacity: captionKey ? 1 : 0, transition: "opacity 200ms ease-out" }}
              aria-live="polite"
            >
              {captionKey ? THREADS[captionKey].context : ""}
            </p>
          </div>
          <div className="hidden md:block">
            <MiniLoop filter={filter} hov={hov} setHov={setHov} choose={choose} />
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-[61px] z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex gap-8 overflow-x-auto" role="tablist" aria-label="Filter posts">
          {TAB_ORDER.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => apply(f)}
                className={`shrink-0 flex gap-2 items-baseline pt-[18px] pb-4 border-b-2 transition-colors ${
                  active ? "text-gray-900 border-gray-900" : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                <span className="text-[15px] font-bold tracking-[-0.02em] whitespace-nowrap">
                  {f === "all" ? "All" : THREADS[f].label}
                </span>
                <span className="text-[13px] text-gray-500">{count(f)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Posts */}
      <section className="max-w-6xl mx-auto px-6 pt-10 md:pt-14 pb-24 md:pb-28">
        {filter === "all" ? (
          <div key="all" className="flex flex-col gap-2">
            {featured && (
              <a
                href={featured.href}
                className="group grid md:grid-cols-[220px_minmax(0,1fr)] gap-6 md:gap-10 items-center p-6 -mx-6 mb-6 rounded-2xl transition-colors hover:bg-accent-50 km-in"
              >
                <div className="aspect-[3/1] md:aspect-square rounded-xl bg-gray-900 flex flex-col justify-between p-4 md:p-5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent-400">Latest</span>
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px] font-semibold uppercase tracking-widest text-gray-200">
                      {featured.month}
                    </span>
                    <span className="text-5xl md:text-[88px] font-extrabold tracking-[-0.05em] leading-[0.85] text-white">
                      {featured.day}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-3.5 max-w-[720px]">
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent-700">
                    {THREADS[featured.thread].label}
                  </span>
                  <h2 className="text-[32px] md:text-[44px] leading-[1.05] tracking-[-0.04em] font-extrabold text-gray-900 text-balance group-hover:text-accent-700 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-700 text-pretty">{featured.description}</p>
                  <span className="text-[15px] font-semibold text-accent-600">Read →</span>
                </div>
              </a>
            )}
            {rest.length > 0 && (
              <div className="border-t border-gray-900 pt-2 flex flex-col gap-1">
                {rest.map((p, i) => (
                  <PostRow key={p.href} post={p} showThread index={i} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div key={filter} className="flex flex-col gap-1">
            <div className="flex flex-col gap-2 pb-5 mb-2 border-b border-gray-900 km-in">
              <h2 className="text-[28px] md:text-[32px] font-extrabold tracking-[-0.035em] text-gray-900">
                {THREADS[filter].label}
              </h2>
              <p className="text-base leading-normal text-gray-700">{THREADS[filter].context}</p>
            </div>
            {filtered.length > 0 ? (
              filtered.map((p, i) => <PostRow key={p.href} post={p} showThread={false} index={i} />)
            ) : filter === "building" ? (
              <div className="mt-3 p-7 rounded-xl bg-gray-50 flex flex-wrap justify-between items-center gap-6 km-in">
                <div className="flex flex-col gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-gray-800">No build write-ups yet.</span>
                  <span className="text-[15px] leading-normal text-gray-600">
                    {listJoin(buildTitles)} have case studies on the Work page.
                  </span>
                </div>
                <a href="/work" className="text-[15px] font-semibold text-accent-600 hover:text-accent-700 transition-colors">
                  See the work →
                </a>
              </div>
            ) : (
              <div className="mt-3 p-7 rounded-xl bg-gray-50 km-in">
                <span className="text-lg font-bold tracking-tight text-gray-800">Nothing published here yet.</span>
              </div>
            )}
          </div>
        )}
      </section>
    </>
  );
}
