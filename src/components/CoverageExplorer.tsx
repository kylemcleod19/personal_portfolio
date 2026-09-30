import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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

/* Ported from the "SaaS Coverage Explorer" Claude Design prototype. The design-system tokens it
   references are defined on the root element, so the markup keeps the prototype's var() names. */

const TOKENS = {
  "--paper": "#ffffff",
  "--paper-alt": "#f9fafb",
  "--paper-tint": "#f3f4f6",
  "--ink": "#111827",
  "--ink-strong": "#1f2937",
  "--ink-body": "#374151",
  "--ink-muted": "#4b5563",
  "--ink-soft": "#6b7280",
  "--ink-faint": "#9ca3af",
  "--line": "#f3f4f6",
  "--line-strong": "#e5e7eb",
  "--accent-50": "#f0f9ff",
  "--accent-100": "#e0f2fe",
  "--accent-500": "#0ea5e9",
  "--accent-600": "#0284c7",
  "--accent-wash": "rgba(14,165,233,0.04)",
  "--warn-500": "#f59e0b",
  "--warn-600": "#d97706",
  "--risk-500": "#f97316",
  "--stop-50": "#fef2f2",
  "--stop-100": "#fee2e2",
  "--stop-400": "#f87171",
  "--stop-500": "#ef4444",
  "--stop-600": "#dc2626",
  "--surface-well": "var(--paper-alt)",
  "--text-heading": "var(--ink)",
  "--text-subheading": "var(--ink-strong)",
  "--text-body": "var(--ink-body)",
  "--text-body-secondary": "var(--ink-muted)",
  "--text-caption": "var(--ink-muted)",
  "--text-eyebrow": "var(--ink-soft)",
} as CSSProperties;

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

const eyebrowStyle: CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  fontWeight: 600,
  color: "var(--text-eyebrow)",
};

const Dot = ({ color, size = 8 }: { color: string; size?: number }) => (
  <span style={{ width: size, height: size, borderRadius: 999, background: color, flex: `0 0 ${size}px`, display: "inline-block" }} />
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
          style={{ transition: "opacity 200ms, stroke-width 200ms" }}
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
              style={{ cursor: "crosshair" }}
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
            style={{ cursor: "crosshair" }}
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
    <div style={{ marginBottom: 10 }}>
      <div style={{ ...eyebrowStyle, fontSize: 11 }}>{eyebrow}</div>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.015em", color: "var(--text-subheading)", margin: "4px 0 3px" }}>
        {title}
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-body-secondary)", margin: 0, minHeight: 36 }}>{sub}</p>
    </div>
  );
}

/* ---------- shops and products, listed as rows ---------- */
function ListTable({ children }: { children: ReactNode }) {
  return <div style={{ border: "1px solid var(--line-strong)", borderRadius: 12, overflow: "hidden" }}>{children}</div>;
}

function ListRow({
  dot,
  title,
  meta,
  body,
  last,
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
  last?: boolean;
  dim?: boolean;
  selected?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="grid grid-cols-1 sm:grid-cols-[8.5rem_minmax(0,1fr)]"
      style={{
        gap: "2px 14px",
        padding: "10px 14px",
        borderBottom: last ? "none" : "1px solid var(--line)",
        background: selected ? "var(--accent-wash)" : "var(--paper)",
        opacity: dim ? 0.45 : 1,
        transition: "opacity 160ms, background 160ms",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Dot color={dot} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-subheading)", letterSpacing: "-0.015em" }}>{title}</span>
      </div>
      <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>
        <span style={{ fontWeight: 600, color: "var(--ink-strong)" }}>{meta}.</span>{" "}
        <span style={{ color: "var(--text-body-secondary)" }}>{body}</span>
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
  const cols = "minmax(7.5rem,1fr) repeat(3, 64px) minmax(9rem,1.3fr)";
  return (
    <div style={{ border: "1px solid var(--line-strong)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 520 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: cols,
              background: "var(--surface-well)",
              borderBottom: "1px solid var(--line-strong)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              fontWeight: 600,
              color: "var(--text-eyebrow)",
            }}
          >
            <div style={{ padding: "10px 14px" }}>Shop</div>
            {SOLUTIONS.map((s) => (
              <div key={s.id} style={{ padding: "10px 4px", textAlign: "center" }}>
                {s.short}
              </div>
            ))}
            <div style={{ padding: "10px 14px" }}>Best fit</div>
          </div>
          {COMPANIES.map((c) => {
            const best = bestFit(c);
            const score = fit(c, best);
            const on = selected === c.id;
            return (
              <div
                key={c.id}
                onMouseEnter={() => onHover(c.id)}
                onMouseLeave={() => onHover(null)}
                style={{
                  display: "grid",
                  gridTemplateColumns: cols,
                  alignItems: "center",
                  borderBottom: "1px solid var(--line)",
                  background: on ? "var(--accent-wash)" : hovered === c.id ? "var(--paper-tint)" : "transparent",
                  transition: "background 160ms",
                }}
              >
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  style={{
                    font: "inherit",
                    textAlign: "left",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: "11px 14px",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <Dot color={c.color} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-subheading)", letterSpacing: "-0.015em" }}>
                    {c.label}
                  </span>
                </button>
                {SOLUTIONS.map((s) => {
                  const v = fit(c, s);
                  const isBest = s.id === best.id;
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => onSelect(c.id, s.id)}
                      title={`${c.label} vs ${s.label}: short ${shortOf(c, s).toFixed(1)}, excess ${overOf(c, s).toFixed(1)}`}
                      style={{
                        font: "inherit",
                        border: "none",
                        cursor: "pointer",
                        padding: "11px 4px",
                        textAlign: "center",
                        background: isBest ? "var(--paper-tint)" : "none",
                        color: isBest ? "var(--ink-strong)" : "var(--ink-muted)",
                        fontWeight: isBest ? 700 : 500,
                        fontSize: 13,
                      }}
                    >
                      {v.toFixed(1)}
                    </button>
                  );
                })}
                <div style={{ padding: "9px 14px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-strong)" }}>{best.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 5,
                        background: "var(--paper-tint)",
                        borderRadius: 999,
                        overflow: "hidden",
                        display: "flex",
                      }}
                    >
                      <div style={{ width: ((shortOf(c, best) / worst) * 100).toFixed(0) + "%", height: "100%", background: "var(--stop-400)" }} />
                      <div style={{ width: ((overOf(c, best) / worst) * 100).toFixed(0) + "%", height: "100%", background: "var(--warn-500)" }} />
                    </div>
                    <span style={{ fontSize: 11, color: "var(--ink-soft)", minWidth: 24, textAlign: "right" }}>{score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "10px 14px", fontSize: 12, lineHeight: 1.5, color: "var(--text-caption)", background: "var(--surface-well)" }}>
        Avg distance = mean gap across the eight needs, counting both{" "}
        <span style={{ color: "var(--stop-500)", fontWeight: 600 }}>shortfall</span> (need the product misses) and{" "}
        <span style={{ color: "var(--warn-600)", fontWeight: 600 }}>excess</span> (capability paid for and never used). Lower is a
        closer fit. Click any cell to load that pairing into the radar.
      </div>
    </div>
  );
}

const NEED_HUE = "#111827";
const COV_HUE = "#0284c7";
/* The picker must measure the SAME ink it paints, so the text color is a literal, not a token. */
const INK_TEXT = "#111827";
/* Real WCAG contrast, so the text color is chosen by measurement rather than a shortcut. */
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
    <div style={{ padding: "7px 4px", textAlign: "center", position: "relative" }}>
      <span style={{ position: "absolute", inset: "2px 3px", borderRadius: 4, background: hue, opacity: a }} />
      <span style={{ position: "relative", fontSize: 12, color: useWhite ? "#fff" : INK_TEXT, fontWeight: v >= 65 ? 700 : 500 }}>
        {v}
      </span>
    </div>
  );
}

function NeedsTable({ highlight, onHover }: { highlight: string | null; onHover: (id: string | null) => void }) {
  const cols = "minmax(6.5rem,1.3fr) repeat(5, minmax(0,1fr)) 10px repeat(3, minmax(0,1fr))";
  const headStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: cols,
    background: "var(--surface-well)",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "var(--text-eyebrow)",
  };
  const groupHead: CSSProperties = {
    padding: "8px 4px",
    textAlign: "center",
    borderLeft: "1px solid var(--line-strong)",
    borderBottom: "1px solid var(--line)",
  };
  return (
    <div style={{ border: "1px solid var(--line-strong)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 520 }}>
          <div style={headStyle}>
            <div />
            <div style={{ ...groupHead, gridColumn: "span 5" }}>Need by shop</div>
            <div />
            <div style={{ ...groupHead, gridColumn: "span 3" }}>Coverage by product</div>
          </div>
          <div style={{ ...headStyle, borderBottom: "1px solid var(--line-strong)" }}>
            <div style={{ padding: "8px 12px" }}>Need</div>
            {COMPANIES.map((c) => (
              <div
                key={c.id}
                onMouseEnter={() => onHover(c.id)}
                onMouseLeave={() => onHover(null)}
                style={{
                  padding: "8px 2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  color: highlight === c.id ? "var(--ink-strong)" : undefined,
                }}
              >
                <Dot color={c.color} size={7} />
                {c.id}
              </div>
            ))}
            <div />
            {SOLUTIONS.map((s) => (
              <div key={s.id} style={{ padding: "8px 2px", textAlign: "center" }}>
                {s.short}
              </div>
            ))}
          </div>
          {NEEDS.map((need, i) => (
            <div
              key={need}
              style={{
                display: "grid",
                gridTemplateColumns: cols,
                alignItems: "center",
                borderBottom: i === NEEDS.length - 1 ? "none" : "1px solid var(--line)",
              }}
            >
              <div style={{ padding: "6px 12px", fontSize: 12.5, color: "var(--text-body)" }} title={need}>
                {SHORT[i]}
              </div>
              {COMPANIES.map((c) => (
                <div
                  key={c.id}
                  onMouseEnter={() => onHover(c.id)}
                  onMouseLeave={() => onHover(null)}
                  style={{ opacity: highlight && highlight !== c.id ? 0.35 : 1, transition: "opacity 160ms" }}
                >
                  <HeatCell v={c.importance[i]} hue={NEED_HUE} />
                </div>
              ))}
              <div style={{ borderLeft: "1px solid var(--line-strong)", height: "100%" }} />
              {SOLUTIONS.map((s) => (
                <div key={s.id}>
                  <HeatCell v={s.coverage[i]} hue={COV_HUE} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: "10px 14px",
          fontSize: 12,
          color: "var(--text-caption)",
          background: "var(--surface-well)",
          borderTop: "1px solid var(--line-strong)",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 18px",
          alignItems: "center",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 34,
              height: 10,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${NEED_HUE}14, ${NEED_HUE}4d 60%, ${NEED_HUE} 62%)`,
            }}
          />
          Shop need, low → high
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 34,
              height: 10,
              borderRadius: 3,
              background: `linear-gradient(90deg, ${COV_HUE}14, ${COV_HUE}4d 60%, ${COV_HUE} 62%)`,
            }}
          />
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
    <div className="not-prose font-sans my-10" style={TOKENS}>
      <div style={{ ...eyebrowStyle, marginBottom: 10 }}>The five shops</div>
      <ListTable>
        {COMPANIES.map((c, i) => (
          <ListRow
            key={c.id}
            dot={c.color}
            title={c.label}
            meta={c.persona}
            body={c.description}
            last={i === COMPANIES.length - 1}
            selected={companyId === c.id}
            dim={!!legendHL && legendHL !== c.id}
            onEnter={() => setRowHL(c.id)}
            onLeave={() => setRowHL(null)}
            onClick={() => select(c.id)}
          />
        ))}
      </ListTable>

      <div style={{ ...eyebrowStyle, margin: "22px 0 10px" }}>What's on the shelf</div>
      <ListTable>
        {SOLUTIONS.map((s, i) => (
          <ListRow key={s.id} dot={s.raw} title={s.label} meta={s.sub} body={s.description} last={i === SOLUTIONS.length - 1} />
        ))}
      </ListTable>

      <div style={{ ...eyebrowStyle, margin: "32px 0 10px" }}>Needs and solutions, scored</div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ display: "flex", border: "1px solid var(--line-strong)", borderRadius: 999, overflow: "hidden", flex: "0 0 auto" }}>
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
              style={{
                font: "inherit",
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 14px",
                cursor: "pointer",
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: view === v ? "var(--ink)" : "var(--paper)",
                color: view === v ? "#fff" : "var(--text-eyebrow)",
              }}
            >
              {icon}
              {l}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--text-body-secondary)", margin: 0, flex: "1 1 16rem" }}>
          How much each shop needs each capability (0-100), and how well each product covers it. Same numbers, two views.
        </p>
      </div>

      {view === "table" ? (
        <NeedsTable highlight={legendHL} onHover={setRowHL} />
      ) : (
        <div className="grid sm:grid-cols-2" style={{ gap: "28px 32px" }}>
          <div className="max-w-xs mx-auto sm:max-w-none w-full">
            <ChartHead eyebrow="1 · The disparity" title="Five shops, five shapes" sub="No typical shop for a product to aim at." />
            <ShopSpread highlight={legendHL} onHighlight={setSpreadHL} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", marginTop: 12 }}>
              {COMPANIES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onMouseEnter={() => setSpreadHL(c.id)}
                  onMouseLeave={() => setSpreadHL(null)}
                  onClick={() => select(c.id)}
                  style={{
                    font: "inherit",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 600,
                    color: legendHL && legendHL !== c.id ? "var(--ink-faint)" : "var(--ink-strong)",
                  }}
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 12 }}>
              {COMPANIES.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => select(c.id)}
                  aria-pressed={companyId === c.id}
                  style={{
                    font: "inherit",
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "4px 9px",
                    borderRadius: 999,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    border: "1px solid " + (companyId === c.id ? c.color : "var(--line-strong)"),
                    background: companyId === c.id ? "var(--paper-tint)" : "var(--paper)",
                    color: companyId === c.id ? "var(--ink-strong)" : "var(--ink-muted)",
                  }}
                >
                  <Dot color={c.color} size={7} />
                  {c.id}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px 14px",
                marginTop: 10,
                paddingTop: 10,
                borderTop: "1px solid var(--line)",
              }}
            >
              {SOLUTIONS.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setActive((a) => ({ ...a, [s.id]: !a[s.id] }))}
                  aria-pressed={active[s.id]}
                  style={{
                    font: "inherit",
                    border: "none",
                    background: "none",
                    padding: 0,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: active[s.id] ? "var(--ink-strong)" : "var(--ink-faint)",
                    textDecoration: active[s.id] ? "none" : "line-through",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: active[s.id] ? s.color : "transparent",
                      border: "1px solid " + (active[s.id] ? s.color : "var(--line-strong)"),
                    }}
                  />
                  {s.short}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-caption)", marginTop: 10, minHeight: 36 }}>
              {vertex === null ? (
                "Hover an axis for exact values."
              ) : (
                <span>
                  <strong style={{ color: "var(--ink-strong)" }}>{NEEDS[vertex]}:</strong> {company.label} needs{" "}
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

      <div style={{ ...eyebrowStyle, margin: "32px 0 10px" }}>Every shop, scored against every product</div>
      <CompanyTable selected={companyId} onSelect={select} onHover={setRowHL} hovered={rowHL} />

      <div style={{ marginTop: 20, background: "var(--paper)", border: "1px solid var(--line-strong)", borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <Dot color={company.color} size={9} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-subheading)", letterSpacing: "-0.015em" }}>
            {company.label} buys {best.label}
          </span>
          <span
            className="badge"
            style={
              bestScore > 14
                ? { background: "var(--stop-50)", color: "var(--stop-600)", borderColor: "var(--stop-100)", fontWeight: 600 }
                : { background: "var(--accent-50)", color: "var(--accent-600)", borderColor: "var(--accent-100)", fontWeight: 600 }
            }
          >
            {bestScore > 14 ? "Poor fit" : "Close fit"}
          </span>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text-body)", margin: 0 }}>
          Closest available is {best.label.toLowerCase()} at {bestScore.toFixed(1)} avg distance: {shortOf(company, best).toFixed(1)} of
          unmet need and {overOf(company, best).toFixed(1)} of capability it pays for and never uses.
          {company.id === "C" && " This is the shop the category was built around."}
        </p>
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ink-soft)", marginTop: 12 }}>
        Scores are illustrative, set to show the shape of the argument, not to benchmark named vendors.
      </p>
    </div>
  );
}
