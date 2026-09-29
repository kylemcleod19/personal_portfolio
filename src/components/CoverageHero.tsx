import { useEffect, useRef, useState } from "react";
import { COMPANIES, bestFit, distance, poly, tailoredFor } from "./coverageData";
import RadarFrame from "./RadarFrame";

/* Looping headline animation: one shop's needs, the best off-the-shelf product, then that product
   reshaped toward the shop. Then the next shop. */

const CYCLE = COMPANIES;

const NEED_INK = "#111827";
const GENERIC = [156, 163, 175]; // gray-400
const TAILORED = [14, 165, 233]; // accent-500

// Phase lengths in ms: needs draw in, product appears, product reshapes, then fade out
const T = { needIn: 900, needHold: 1300, saasIn: 600, saasHold: 1900, morph: 1800, fitHold: 2600, out: 500 };
const B1 = T.needIn + T.needHold;
const B2 = B1 + T.saasIn + T.saasHold;
const B3 = B2 + T.morph + T.fitHold;
const CYCLE_MS = B3 + T.out;
const REST_T = B3 - 1; // fully reshaped, used for reduced motion

const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rgb = (c: number[]) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;

function StepIcon({ step, color }: { step: number; color: string }) {
  if (step === 1) {
    return (
      <svg width="18" height="10" aria-hidden="true" className="shrink-0 mt-1">
        <line x1="0" y1="5" x2="18" y2="5" stroke={NEED_INK} strokeWidth="2" strokeDasharray="4 3" />
      </svg>
    );
  }
  return <span className="inline-block w-2.5 h-2.5 rounded-sm shrink-0 mt-1.5 mx-1" style={{ background: color }} />;
}

export default function CoverageHero() {
  const [{ idx, t }, setFrame] = useState({ idx: 0, t: 0 });
  const clock = useRef({ idx: 0, t: 0 });
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useRef(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Only advance the clock while the animation is on screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) return;
    let id = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (visible.current) {
        const c = clock.current;
        c.t += dt;
        if (c.t >= CYCLE_MS) {
          c.t = 0;
          c.idx = (c.idx + 1) % CYCLE.length;
        }
        setFrame({ idx: c.idx, t: c.t });
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [reduced]);

  const now = reduced ? REST_T : t;
  const company = CYCLE[idx];
  const best = bestFit(company);
  const target = tailoredFor(company.importance);

  const needK = ease(clamp(now / T.needIn));
  const saasK = clamp((now - B1) / T.saasIn);
  const morphK = ease(clamp((now - B2) / T.morph));
  const fade = 1 - clamp((now - B3) / T.out);
  const step = now < B1 ? 1 : now < B2 ? 2 : 3;

  const need = company.importance.map((v) => v * needK);
  const cover = best.coverage.map((v, i) => lerp(v, target[i], morphK));
  const color = rgb(GENERIC.map((v, i) => lerp(v, TAILORED[i], morphK)));
  const gap = distance(company.importance, cover);

  const jump = (i: number) => {
    clock.current = { idx: i, t: 0 };
    setFrame({ idx: i, t: 0 });
  };

  const steps = [
    {
      title: "Company needs",
      body: `The dashed outline: how much ${company.label} needs each of eight MRP capabilities, scored 0-100.`,
      color: NEED_INK,
    },
    {
      title: "Traditional SaaS",
      body: `Its best off-the-shelf option, ${best.label.toLowerCase()}, built for the average shop.`,
      color: rgb(GENERIC),
    },
    {
      title: "Hyper-verticalized SaaS",
      body: "The bet: software built around how this shop actually operates. This is what ERPForge is testing.",
      color: rgb(TAILORED),
    },
  ];

  return (
    <div ref={rootRef} className="not-prose font-sans my-10 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0" style={{ opacity: fade, transition: "opacity 150ms" }}>
          <div className="diagram-eyebrow">The bet, one shop at a time</div>
          <div className="text-sm font-semibold text-gray-900 mt-2 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: company.color }} />
            {company.label}
          </div>
          <div className="text-xs text-gray-500 mt-0.5 pl-4">{company.persona}</div>
        </div>
        <div className="flex gap-1 shrink-0" role="group" aria-label="Choose a shop">
          {CYCLE.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => jump(i)}
              aria-pressed={i === idx}
              className={`w-7 h-7 rounded-full text-xs font-semibold border transition-colors ${
                i === idx ? "border-gray-900 text-gray-900" : "border-gray-200 text-gray-400 hover:text-gray-900"
              }`}
            >
              {c.id}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] gap-6 sm:gap-8 items-center">
        <div className="max-w-[18rem] w-full mx-auto">
          <RadarFrame>
            <polygon
              points={poly(cover)}
              fill={color}
              fillOpacity={0.14}
              stroke={color}
              strokeWidth="2"
              opacity={saasK * fade}
            />
            <polygon
              points={poly(need)}
              fill="none"
              stroke={NEED_INK}
              strokeWidth="2"
              strokeDasharray="5 3"
              opacity={fade}
            />
          </RadarFrame>
        </div>

        <div>
          <ol className="space-y-3">
            {steps.map((s, i) => {
              const n = i + 1;
              const state = reduced || step > n ? "done" : step === n ? "active" : "todo";
              return (
                <li
                  key={s.title}
                  className="flex gap-2.5 pl-3 border-l-2 transition-all duration-300"
                  style={{
                    borderColor: state === "active" ? s.color : "transparent",
                    opacity: state === "active" ? 1 : state === "done" ? 0.65 : 0.3,
                  }}
                >
                  <StepIcon step={n} color={s.color} />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{s.title}</div>
                    <div className="text-xs text-gray-600 leading-relaxed mt-0.5">{s.body}</div>
                  </div>
                </li>
              );
            })}
          </ol>

        </div>
      </div>
    </div>
  );
}
