"use client";
import { useState } from "react";
import { useReducedMotion } from "framer-motion";

export interface WorkBuild {
  slug: string;
  title: string;
  href: string;
  n: string; // "01", numbered oldest first
  scope: string; // "One app"
  date: string; // "Mar 2026"
  status: string;
  live: boolean;
  cats: string[];
  question: string;
  desc: string;
  tools: string;
  img: string;
  kind: "screen" | "cover";
}

interface WorkIndexProps {
  builds: WorkBuild[]; // newest first; the scope graphic only renders for exactly three
}

const CATS = ["All", "Live", "Manufacturing", "Personal software", "Agents"] as const;
type Cat = (typeof CATS)[number];

const CTX: Record<Exclude<Cat, "All">, string> = {
  Live: "Running and in use today.",
  Manufacturing: "ERP software for manufacturers, where the domain is the hard part.",
  "Personal software": "Software built for an audience of one, used every day.",
  Agents: "Skills and agent workflows that run a process, not just a prompt.",
};

const match = (b: WorkBuild, c: Cat) => c === "All" || (c === "Live" ? b.live : b.cats.includes(c));

// Scope graphic lanes (480 x 330 canvas), from the Work Index v2 design. Node positions and
// sizes, and the pulse paths along these lanes, live in global.css ("Builds scope graphic").
const LANES = ["M96.2 218.3L169.3 194.7", "M259.6 162.2L332.4 133"];
const SCOPE_SLOTS = 3;

function ScopeGraphic({
  builds,
  sel,
  hov,
  setHov,
  choose,
}: {
  builds: WorkBuild[]; // oldest first
  sel: string | null;
  hov: string | null;
  setHov: (k: string | null) => void;
  choose: (k: string) => void;
}) {
  const reduce = useReducedMotion() ?? false;
  const lit = (i: number) => [sel, hov].some((x) => x === builds[i].slug || x === builds[i + 1].slug);

  return (
    <div className="relative w-[480px] h-[330px]">
      <svg width={480} height={330} viewBox="0 0 480 330" className="absolute inset-0" aria-hidden="true">
        <defs>
          <marker id="heroArrowOn" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M0 0L10 5L0 10z" className="hero-arrow-on" />
          </marker>
          <marker id="heroArrowOff" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto">
            <path d="M0 0L10 5L0 10z" className="hero-arrow-off" />
          </marker>
        </defs>
        {LANES.map((d, i) => (
          <path key={d} d={d} className={`hero-lane${lit(i) ? " is-on" : ""}`} />
        ))}
        <path d="M24 318L456 318" className="scope-axis" />
      </svg>
      <span className="absolute right-6 top-[296px] text-xs font-semibold uppercase tracking-widest text-gray-600">
        Scope of the question
      </span>

      {!sel && !reduce && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {LANES.map((d) => (
            <div key={d} className="hero-pulse scope-pulse" />
          ))}
        </div>
      )}

      {builds.map((b, i) => {
        const s = sel === b.slug;
        const state = `${s ? " is-selected" : ""}${hov === b.slug ? " is-hover" : ""}`;
        return (
          <button
            key={b.slug}
            type="button"
            onClick={() => choose(b.slug)}
            onMouseEnter={() => setHov(b.slug)}
            onMouseLeave={() => setHov(null)}
            onFocus={() => setHov(b.slug)}
            onBlur={() => setHov(null)}
            aria-pressed={s}
            aria-label={`Feature ${b.title}`}
            className={`hero-node gap-3 scope-node--${i + 1}${state}`}
          >
            <span className="hero-node-circle font-extrabold">{b.n}</span>
            <span className="flex flex-col items-center gap-0.5">
              <span className="hero-node-label text-sm font-bold tracking-[-0.02em]">{b.title}</span>
              <span className="text-xs text-gray-400">{b.scope}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Thumb({ b, large }: { b: WorkBuild; large?: boolean }) {
  return (
    <div
      className={`relative aspect-[16/10] overflow-hidden border border-gray-100 bg-gray-50 ${
        large ? "rounded-xl" : "rounded-lg"
      }`}
    >
      {b.kind === "screen" ? (
        <div
          className={`absolute inset-0 bg-accent-50 flex justify-center items-end ${large ? "pt-5" : "pt-2"}`}
        >
          <img
            src={b.img}
            alt={b.title}
            className={`h-full w-auto ${large ? "rounded-t-[10px]" : "rounded-t-[5px]"}`}
          />
        </div>
      ) : (
        <img src={b.img} alt={b.title} className="w-full h-full object-cover object-left-top" />
      )}
    </div>
  );
}

function StatusDot({ live }: { live: boolean }) {
  return <span className={`w-[7px] h-[7px] rounded-full ${live ? "bg-green-600" : "bg-accent-500"}`} />;
}

function BuildRow({ b }: { b: WorkBuild }) {
  return (
    <a
      href={b.href}
      className="group grid grid-cols-[112px_minmax(0,1fr)] sm:grid-cols-[160px_minmax(0,1fr)_auto] gap-5 sm:gap-7 items-center p-4 -mx-4 rounded-xl transition-colors hover:bg-accent-50 km-in"
    >
      <Thumb b={b} />
      <div className="flex flex-col gap-1.5 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent-700">
          Build {b.n} · {b.scope} · {b.date}
        </span>
        <span className="text-lg sm:text-2xl font-extrabold tracking-[-0.03em] text-gray-800 group-hover:text-accent-700 transition-colors">
          {b.title}
        </span>
        <span className="text-[15px] sm:text-base leading-relaxed text-gray-600 text-pretty">{b.question}</span>
        <span className="sm:hidden flex items-center gap-2 text-[13px] font-semibold text-gray-700">
          <StatusDot live={b.live} />
          {b.status}
        </span>
      </div>
      <span className="hidden sm:flex items-center gap-2 text-[13px] font-semibold text-gray-700 whitespace-nowrap">
        <StatusDot live={b.live} />
        {b.status} <span className="text-gray-400 group-hover:text-accent-600 transition-colors">→</span>
      </span>
    </a>
  );
}

export default function WorkIndex({ builds }: WorkIndexProps) {
  const [sel, setSel] = useState<string | null>(null);
  const [hov, setHov] = useState<string | null>(null);
  const [cat, setCat] = useState<Cat>("All");

  const bySlug = (k: string | null) => builds.find((b) => b.slug === k) ?? null;
  const oldestFirst = [...builds].reverse();
  const choose = (k: string) => {
    setSel(sel === k ? null : k);
    setCat("All");
  };

  const capBuild = bySlug(hov ?? sel);
  const featured = bySlug(sel) ?? builds[0];
  const rest = builds.filter((b) => b !== featured);
  const catItems = builds.filter((b) => match(b, cat));
  const liveCount = builds.filter((b) => b.live).length;

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-14 md:pt-14 md:pb-16 grid lg:grid-cols-[minmax(0,1fr)_480px] gap-12 items-center">
          <div className="flex flex-col gap-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Builds</p>
            <h1 className="text-[40px] sm:text-5xl lg:text-[56px] leading-[1.04] font-extrabold tracking-[-0.04em] text-white text-balance">
              From one app to a <span className="text-accent-400">software factory.</span>
            </h1>
            <p className="text-lg leading-relaxed text-gray-200 max-w-[540px] text-pretty">
              Each build asks a bigger version of the same question: what changes when building software gets cheap?
            </p>
            <div className="hidden lg:flex h-[100px] max-w-[540px] flex-col gap-1" aria-live="polite">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent-400">
                {capBuild ? `Build ${capBuild.n} · ${capBuild.title}` : `${builds.length} builds · ${liveCount} live`}
              </span>
              <span className="text-[15px] leading-relaxed text-accent-200 text-pretty">
                {capBuild ? capBuild.question : "Pick a build to see the question it tests."}
              </span>
            </div>
          </div>
          <div className="hidden lg:block">
            {oldestFirst.length === SCOPE_SLOTS && (
              <ScopeGraphic builds={oldestFirst} sel={sel} hov={hov} setHov={setHov} choose={choose} />
            )}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-[61px] z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex gap-8 overflow-x-auto" role="tablist" aria-label="Filter builds">
          {CATS.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCat(c)}
                className={`shrink-0 flex gap-2 items-baseline pt-[18px] pb-4 border-b-2 transition-colors ${
                  active ? "text-gray-900 border-gray-900" : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                <span className="text-[15px] font-bold tracking-[-0.02em] whitespace-nowrap">{c}</span>
                <span className="text-[13px] text-gray-500">{builds.filter((b) => match(b, c)).length}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Builds */}
      <section className="max-w-6xl mx-auto px-6 pt-10 md:pt-14 pb-24 md:pb-28">
        {cat === "All" ? (
          <div key={`all-${featured.slug}`} className="flex flex-col gap-2">
            <a
              href={featured.href}
              className="group grid md:grid-cols-[440px_minmax(0,1fr)] gap-6 md:gap-12 items-center p-6 -mx-6 mb-6 rounded-2xl transition-colors hover:bg-accent-50 km-in"
            >
              <Thumb b={featured} large />
              <div className="flex flex-col gap-3.5 max-w-[600px]">
                <span className="text-xs font-semibold uppercase tracking-widest text-accent-700">
                  {sel ? `Build ${featured.n} · ${featured.scope}` : `Latest · ${featured.date}`}
                </span>
                <h2 className="text-[32px] md:text-[44px] leading-[1.05] tracking-[-0.04em] font-extrabold text-gray-900 group-hover:text-accent-700 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-lg leading-relaxed text-gray-700 text-pretty">{featured.desc}</p>
                <div className="flex gap-5 items-center flex-wrap pt-1">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <StatusDot live={featured.live} />
                    {featured.status}
                  </span>
                  <span className="font-mono text-xs text-gray-600">{featured.tools}</span>
                </div>
                <span className="text-[15px] font-semibold text-accent-600">Read the case study →</span>
              </div>
            </a>
            {rest.length > 0 && (
              <div className="border-t border-gray-900 pt-2 flex flex-col gap-1 km-stagger [--km-lead:100ms]">
                {rest.map((b) => (
                  <BuildRow key={b.slug} b={b} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div key={cat} className="flex flex-col gap-1">
            <div className="flex flex-col gap-2 pb-5 mb-2 border-b border-gray-900 km-in">
              <h2 className="text-[28px] md:text-[32px] font-extrabold tracking-[-0.035em] text-gray-900">{cat}</h2>
              <p className="text-base leading-normal text-gray-700">{CTX[cat]}</p>
            </div>
            <div className="flex flex-col gap-1 km-stagger [--km-lead:100ms]">
              {catItems.map((b) => (
                <BuildRow key={b.slug} b={b} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
