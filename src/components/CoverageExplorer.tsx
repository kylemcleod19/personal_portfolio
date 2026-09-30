import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  COMPANIES,
  NEEDS,
  SHORT,
  SOLUTIONS,
  bestFit,
  fit,
  overOf,
  poly,
  pt,
  shortOf,
  type Company,
} from "./coverageData";
import RadarFrame from "./RadarFrame";

/* Ported from the "SaaS Coverage Explorer" Claude Design prototype. Shared pieces are the cov-*
   classes in global.css; only data-driven values (company and product colors, bar widths,
   heatmap intensity) stay inline. */

type Active = Record<string, boolean>;

function useTween(target: number[], dur = 420) {
  const key = target.join(",");
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    const a = cur.current;
    const b = target;
    const t0 = performance.now();
    cur.current = b;
    let id = 0;
    let frames = 0;
    const step = (t: number) => {
      frames++;
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setV(k < 1 ? a.map((x, i) => x + (b[i] - x) * e) : b);
      if (k < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    const fb = setTimeout(() => {
      if (frames === 0) {
        cancelAnimationFrame(id);
        setV(b);
      }
    }, 60);
    const fb2 = setTimeout(() => setV(b), dur + 80);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(fb);
      clearTimeout(fb2);
    };
  }, [key]);
  return v;
}

const DOT_SIZE = { 7: "w-[7px] h-[7px]", 8: "w-2 h-2", 9: "w-[9px] h-[9px]" } as const;

const Dot = ({ color, size = 8 }: { color: string; size?: keyof typeof DOT_SIZE }) => (
  <span className={`inline-block shrink-0 rounded-full ${DOT_SIZE[size]}`} style={{ background: color }} />
);

/* ---------- left: all five shops ---------- */
function ShopSpread({ highlight, onHighlight }: { highlight: string | null; onHighlight: (id: string | null) => void }) {
  return (
    <RadarFrame>
      {COMPANIES.map((c) => (
        <polygon
          key={c.id}
          points={poly(c.importance)}
          fill={highlight === c.id ? c.color + "14" : "none"}
          stroke={c.color}
          strokeWidth={highlight === c.id ? 2.5 : 1.5}
          opacity={!highlight || highlight === c.id ? 1 : 0.14}
          className="transition-[opacity,stroke-width] duration-200"
        />
      ))}
      {COMPANIES.map((c) =>
        highlight === c.id
          ? c.importance.map((v, i) => {
              const [x, y] = pt(i, v);
              return <circle key={c.id + i} cx={x} cy={y} r="2.5" fill={c.color} />;
            })
          : null
      )}
      {COMPANIES.map((c) =>
        c.importance.map((v, i) => {
          const [x, y] = pt(i, v);
          return (
            <circle
              key={"h" + c.id + i}
              cx={x}
              cy={y}
              r="7"
              fill="transparent"
              onMouseEnter={() => onHighlight(c.id)}
              onMouseLeave={() => onHighlight(null)}
              className="cursor-crosshair"
            />
          );
        })
      )}
    </RadarFrame>
  );
}

/* ---------- right: one shop against the software ---------- */
function FitMap({ company, active, onVertex }: { company: Company; active: Active; onVertex: (i: number | null) => void }) {
  const imp = useTween(company.importance);
  const shown = SOLUTIONS.filter((s) => active[s.id]);
  return (
    <RadarFrame>
      {shown.map((s) => (
        <polygon key={s.id} points={poly(s.coverage)} fill={s.fill} stroke={s.color} strokeWidth="2" />
      ))}
      <polygon points={poly(imp)} fill="none" stroke={company.color} strokeWidth="2" strokeDasharray="5 3" />
      {shown.map((s) =>
        s.coverage.map((v, i) => {
          const [x, y] = pt(i, v);
          return <circle key={s.id + i} cx={x} cy={y} r="2.5" fill={s.color} />;
        })
      )}
      {NEEDS.map((_, i) => {
        const [x, y] = pt(i, Math.max(company.importance[i], ...shown.map((s) => s.coverage[i]), 0));
        return (
          <circle
            key={"hv" + i}
            cx={x}
            cy={y}
            r="9"
            fill="transparent"
            className="cursor-crosshair"
            onMouseEnter={() => onVertex(i)}
            onMouseLeave={() => onVertex(null)}
          />
        );
      })}
    </RadarFrame>
  );
}

function ChartHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="mb-2.5">
      <div className="cov-eyebrow text-[11px]">{eyebrow}</div>
      <div className="cov-title text-[15px] mt-1 mb-[3px]">{title}</div>
      <p className="cov-note text-xs min-h-9">{sub}</p>
    </div>
  );
}

/* ---------- shops and products, listed as rows ---------- */
function ListTable({ children }: { children: ReactNode }) {
  return <div className="cov-table">{children}</div>;
}

function ListRow({
  dot,
  title,
  meta,
  body,
  dim,
  selected,
  onEnter,
  onLeave,
  onClick,
}: {
  dot: string;
  title: string;
  meta: string;
  body: string;
  dim?: boolean;
  selected?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}) {
  const state = `${selected ? " is-selected" : ""}${dim ? " is-dim" : ""}${onClick ? " cursor-pointer" : ""}`;
  return (
    <div onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick} className={`cov-list-row${state}`}>
      <div className="flex items-center gap-2">
        <Dot color={dot} />
        <span className="cov-title">{title}</span>
      </div>
      <div className="text-[12.5px] leading-normal">
        <span className="font-semibold text-gray-800">{meta}.</span>{" "}
        <span className="text-gray-600">{body}</span>
      </div>
    </div>
  );
}

function CompanyTable({
  selected,
  onSelect,
  onHover,
  hovered,
}: {
  selected: string;
  onSelect: (id: string, solId?: string) => void;
  onHover: (id: string | null) => void;
  hovered: string | null;
}) {
  const worst = Math.max(...COMPANIES.map((c) => fit(c, bestFit(c))));
  const pct = (n: number) => ((n / worst) * 100).toFixed(0) + "%";
  return (
    <div className="cov-table">
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="cov-company-grid cov-thead tracking-[0.07em] border-b border-gray-200">
            <div className="px-3.5 py-2.5">Shop</div>
            {SOLUTIONS.map((s) => (
              <div key={s.id} className="px-1 py-2.5 text-center">
                {s.short}
              </div>
            ))}
            <div className="px-3.5 py-2.5">Best fit</div>
          </div>
          {COMPANIES.map((c) => {
            const best = bestFit(c);
            const score = fit(c, best);
            const state = selected === c.id ? " is-selected" : hovered === c.id ? " is-hover" : "";
            return (
              <div
                key={c.id}
                onMouseEnter={() => onHover(c.id)}
                onMouseLeave={() => onHover(null)}
                className={`cov-company-grid cov-company-row${state}`}
              >
                <button type="button" onClick={() => onSelect(c.id)} className="cov-plain-btn px-3.5 py-[11px] flex gap-2 items-center text-left">
                  <Dot color={c.color} />
                  <span className="cov-title">{c.label}</span>
                </button>
                {SOLUTIONS.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => onSelect(c.id, s.id)}
                    title={`${c.label} vs ${s.label}: short ${shortOf(c, s).toFixed(1)}, excess ${overOf(c, s).toFixed(1)}`}
                    className={`cov-plain-btn cov-score${s.id === best.id ? " is-best" : ""}`}
                  >
                    {fit(c, s).toFixed(1)}
                  </button>
                ))}
                <div className="px-3.5 py-[9px]">
                  <div className="text-xs font-semibold text-gray-800">{best.label}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="cov-bar">
                      <div className="h-full bg-red-400" style={{ width: pct(shortOf(c, best)) }} />
                      <div className="h-full bg-amber-500" style={{ width: pct(overOf(c, best)) }} />
                    </div>
                    <span className="text-[11px] text-gray-500 min-w-6 text-right">{score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="cov-caption">
        Avg distance = mean gap across the eight needs, counting both{" "}
        <span className="text-red-500 font-semibold">shortfall</span> (need the product misses) and{" "}
        <span className="text-amber-600 font-semibold">excess</span> (capability paid for and never used). Lower is a
        closer fit. Click any cell to load that pairing into the radar.
      </div>
    </div>
  );
}

/* Heatmap hues; the matching legend gradients are .cov-swatch-need / .cov-swatch-cov in global.css. */
const NEED_HUE = "#111827";
const COV_HUE = "#0284c7";
/* Real WCAG contrast, so the text color is chosen by measurement rather than a shortcut.
   Dark text is text-gray-900 (#111827, rgb 17 24 39). */
const srgb = (k: number) => {
  const c = k / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const relLum = (r: number, g: number, b: number) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ratio = (l1: number, l2: number) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
/* Two-band ramp: the light band tops out at 0.30 alpha (ink text), the high band starts at
   0.82 (white text). Nothing lands in the ~0.18-0.24 luminance dead band where neither
   ink nor white clears 4.5:1. */
const bandAlpha = (v: number) => (v >= 65 ? 0.82 + ((v - 65) / 35) * 0.18 : 0.06 + (v / 65) * 0.24);

function HeatCell({ v, hue }: { v: number; hue: string }) {
  const a = bandAlpha(v);
  const n = parseInt(hue.slice(1), 16);
  const mix = (k: number) => 255 + (k - 255) * a;
  const L = relLum(mix((n >> 16) & 255), mix((n >> 8) & 255), mix(n & 255));
  const useWhite = ratio(L, 1) > ratio(L, relLum(17, 24, 39));
  return (
    <div className="relative px-1 py-[7px] text-center">
      <span className="absolute inset-x-[3px] inset-y-0.5 rounded" style={{ background: hue, opacity: a }} />
      <span className={`relative text-xs ${useWhite ? "text-white" : "text-gray-900"} ${v >= 65 ? "font-bold" : "font-medium"}`}>
        {v}
      </span>
    </div>
  );
}

function NeedsTable({ highlight, onHover }: { highlight: string | null; onHover: (id: string | null) => void }) {
  return (
    <div className="cov-table">
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="cov-needs-grid cov-thead tracking-[0.05em]">
            <div />
            <div className="cov-group-head col-span-5">Need by shop</div>
            <div />
            <div className="cov-group-head col-span-3">Coverage by product</div>
          </div>
          <div className="cov-needs-grid cov-thead tracking-[0.05em] border-b border-gray-200">
            <div className="px-3 py-2">Need</div>
            {COMPANIES.map((c) => (
              <div
                key={c.id}
                onMouseEnter={() => onHover(c.id)}
                onMouseLeave={() => onHover(null)}
                className={`px-0.5 py-2 flex items-center justify-center gap-[5px]${highlight === c.id ? " text-gray-800" : ""}`}
              >
                <Dot color={c.color} size={7} />
                {c.id}
              </div>
            ))}
            <div />
            {SOLUTIONS.map((s) => (
              <div key={s.id} className="px-0.5 py-2 text-center">
                {s.short}
              </div>
            ))}
          </div>
          {NEEDS.map((need, i) => (
            <div key={need} className="cov-needs-grid cov-needs-row">
              <div className="px-3 py-1.5 text-[12.5px] text-gray-700" title={need}>
                {SHORT[i]}
              </div>
              {COMPANIES.map((c) => (
                <div
                  key={c.id}
                  onMouseEnter={() => onHover(c.id)}
                  onMouseLeave={() => onHover(null)}
                  className={`transition-opacity duration-150${highlight && highlight !== c.id ? " opacity-[0.35]" : ""}`}
                >
                  <HeatCell v={c.importance[i]} hue={NEED_HUE} />
                </div>
              ))}
              <div className="border-l border-gray-200 h-full" />
              {SOLUTIONS.map((s) => (
                <div key={s.id}>
                  <HeatCell v={s.coverage[i]} hue={COV_HUE} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="cov-caption border-t border-gray-200 flex flex-wrap items-center gap-x-[18px] gap-y-1.5">
        <span className="inline-flex items-center gap-1.5">
          <span className="cov-swatch-need" />
          Shop need, low → high
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="cov-swatch-cov" />
          Product coverage, low → high
        </span>
      </div>
    </div>
  );
}

const TableIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="1.75" y="1.75" width="12.5" height="12.5" rx="2" />
    <path d="M1.75 6h12.5M1.75 10h12.5M6 1.75v12.5" />
  </svg>
);

const RadarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M8 1.5 14.2 6 11.8 13.5H4.2L1.8 6Z" />
    <path d="M8 5 11 7.2 9.8 11H6.4L5.2 7.4Z" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

export default function CoverageExplorer() {
  const [companyId, setCompanyId] = useState("C");
  const [spreadHL, setSpreadHL] = useState<string | null>(null);
  const [rowHL, setRowHL] = useState<string | null>(null);
  const [active, setActive] = useState<Active>({ full: true, budget: true, niche: true });
  const [view, setView] = useState<"table" | "charts">("charts");
  const [vertex, setVertex] = useState<number | null>(null);
  const company = COMPANIES.find((c) => c.id === companyId)!;
  const best = bestFit(company);
  const bestScore = fit(company, best);
  const select = (id: string, solId?: string) => {
    setCompanyId(id);
    if (solId) setActive({ full: solId === "full", budget: solId === "budget", niche: solId === "niche" });
  };
  const legendHL = spreadHL || rowHL;

  return (
    <div className="not-prose font-sans my-10">
      <div className="cov-eyebrow mb-2.5">The five shops</div>
      <ListTable>
        {COMPANIES.map((c) => (
          <ListRow
            key={c.id}
            dot={c.color}
            title={c.label}
            meta={c.persona}
            body={c.description}
            selected={companyId === c.id}
            dim={!!legendHL && legendHL !== c.id}
            onEnter={() => setRowHL(c.id)}
            onLeave={() => setRowHL(null)}
            onClick={() => select(c.id)}
          />
        ))}
      </ListTable>

      <div className="cov-eyebrow mt-[22px] mb-2.5">What's on the shelf</div>
      <ListTable>
        {SOLUTIONS.map((s) => (
          <ListRow key={s.id} dot={s.color} title={s.label} meta={s.sub} body={s.description} />
        ))}
      </ListTable>

      <div className="cov-eyebrow mt-8 mb-2.5">Needs and solutions, scored</div>
      <div className="flex items-center gap-3.5 mb-3.5 flex-wrap">
        <div className="flex flex-none border border-gray-200 rounded-full overflow-hidden">
          {(
            [
              ["charts", "Radar", <RadarIcon key="r" />],
              ["table", "Heatmap", <TableIcon key="t" />],
            ] as const
          ).map(([v, l, icon]) => (
            <button
              type="button"
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`cov-view-btn${view === v ? " is-active" : ""}`}
            >
              {icon}
              {l}
            </button>
          ))}
        </div>
        <p className="cov-note text-[12.5px] flex-[1_1_16rem]">
          How much each shop needs each capability (0-100), and how well each product covers it. Same numbers, two views.
        </p>
      </div>

      {view === "table" ? (
        <NeedsTable highlight={legendHL} onHover={setRowHL} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
          <div className="max-w-xs mx-auto sm:max-w-none w-full">
            <ChartHead eyebrow="1 · The disparity" title="Five shops, five shapes" sub="No typical shop for a product to aim at." />
            <ShopSpread highlight={legendHL} onHighlight={setSpreadHL} />
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-3">
              {COMPANIES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onMouseEnter={() => setSpreadHL(c.id)}
                  onMouseLeave={() => setSpreadHL(null)}
                  onClick={() => select(c.id)}
                  className={`cov-plain-btn inline-flex items-center gap-[5px] text-xs font-semibold ${
                    legendHL && legendHL !== c.id ? "text-gray-400" : "text-gray-800"
                  }`}
                >
                  <Dot color={c.color} />
                  {c.id}
                </button>
              ))}
            </div>
          </div>
          <div className="max-w-xs mx-auto sm:max-w-none w-full">
            <ChartHead
              eyebrow="2 · The fit"
              title={company.label + " vs. the market"}
              sub="Dashed is what the shop needs. Filled is what it can buy."
            />
            <FitMap company={company} active={active} onVertex={setVertex} />
            <div className="flex flex-wrap gap-[5px] mt-3">
              {COMPANIES.map((c) => {
                const on = companyId === c.id;
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => select(c.id)}
                    aria-pressed={on}
                    className={`cov-chip${on ? " is-active" : ""}`}
                    style={on ? { borderColor: c.color } : undefined}
                  >
                    <Dot color={c.color} size={7} />
                    {c.id}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 mt-2.5 pt-2.5 border-t border-gray-100">
              {SOLUTIONS.map((s) => {
                const on = active[s.id];
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setActive((a) => ({ ...a, [s.id]: !a[s.id] }))}
                    aria-pressed={on}
                    className={`cov-plain-btn inline-flex items-center gap-1.5 text-xs font-semibold ${
                      on ? "text-gray-800" : "text-gray-400 line-through"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-[3px] border border-gray-200"
                      style={on ? { background: s.color, borderColor: s.color } : undefined}
                    />
                    {s.short}
                  </button>
                );
              })}
            </div>
            <div className="cov-note text-xs mt-2.5 min-h-9">
              {vertex === null ? (
                "Hover an axis for exact values."
              ) : (
                <span>
                  <strong className="text-gray-800">{NEEDS[vertex]}:</strong> {company.label} needs{" "}
                  {company.importance[vertex]}.{" "}
                  {SOLUTIONS.filter((s) => active[s.id])
                    .map((s) => s.short + " covers " + s.coverage[vertex])
                    .join(" · ")}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="cov-eyebrow mt-8 mb-2.5">Every shop, scored against every product</div>
      <CompanyTable selected={companyId} onSelect={select} onHover={setRowHL} hovered={rowHL} />

      <div className="mt-5 bg-white border border-gray-200 rounded-xl px-[18px] py-4">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <Dot color={company.color} size={9} />
          <span className="cov-title text-sm">
            {company.label} buys {best.label}
          </span>
          <span
            className={`badge font-semibold ${
              bestScore > 14 ? "bg-red-50 text-red-600 border-red-100" : "bg-accent-50 text-accent-600 border-accent-100"
            }`}
          >
            {bestScore > 14 ? "Poor fit" : "Close fit"}
          </span>
        </div>
        <p className="text-[13px] leading-relaxed text-gray-700 m-0">
          Closest available is {best.label.toLowerCase()} at {bestScore.toFixed(1)} avg distance: {shortOf(company, best).toFixed(1)} of
          unmet need and {overOf(company, best).toFixed(1)} of capability it pays for and never uses.
          {company.id === "C" && " This is the shop the category was built around."}
        </p>
      </div>
      <p className="text-xs leading-normal text-gray-500 mt-3">
        Scores are illustrative, set to show the shape of the argument, not to benchmark named vendors.
      </p>
    </div>
  );
}
