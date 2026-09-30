import { useId } from "react";
import { COMPANIES, bestFit, poly, tailoredFor } from "./coverageData";
import RadarFrame from "./RadarFrame";

/* One shop's needs against its current software.
   "want": adds a solution shaped to the shop.
   "gap":  fills the area where needs exceed the current product, the work done in low-code tools. */

interface ShopFitRadarProps {
  mode: "want" | "gap";
  companyId?: string;
}

const NEED_INK = "#111827";
const CURRENT = "#6b7280"; // gray-500
const TAILORED = "#0ea5e9"; // accent-500
const WORKAROUND = "#f87171"; // red-400

function Swatch({ kind, color }: { kind: "line" | "dashed" | "fill"; color: string }) {
  if (kind === "fill") {
    return <span className="inline-block w-3 h-3 rounded-sm shrink-0 mt-0.5 opacity-[0.55]" style={{ background: color }} />;
  }
  return (
    <svg width="18" height="10" aria-hidden="true" className="shrink-0 mt-1">
      <line x1="0" y1="5" x2="18" y2="5" stroke={color} strokeWidth="2" strokeDasharray={kind === "dashed" ? "4 3" : undefined} />
    </svg>
  );
}

export default function ShopFitRadar({ mode, companyId = "B" }: ShopFitRadarProps) {
  const maskId = useId();
  const company = COMPANIES.find((c) => c.id === companyId)!;
  const current = bestFit(company);
  const need = company.importance;
  const tailored = tailoredFor(need);

  const legend =
    mode === "want"
      ? [
          { kind: "line" as const, color: NEED_INK, label: `${company.label} needs` },
          { kind: "dashed" as const, color: CURRENT, label: `Current: ${current.label.toLowerCase()}, its best off-the-shelf fit` },
          { kind: "fill" as const, color: TAILORED, label: "A solution shaped to the shop" },
        ]
      : [
          { kind: "line" as const, color: NEED_INK, label: `${company.label} needs` },
          { kind: "dashed" as const, color: CURRENT, label: `Current: ${current.label.toLowerCase()}` },
          { kind: "fill" as const, color: WORKAROUND, label: "Filled with Airtable, Retool, and spreadsheets" },
        ];

  return (
    <div className="not-prose font-sans my-8 rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="diagram-eyebrow">{mode === "want" ? "What the shop wants" : "Where the workarounds live"}</div>
      <div className="text-sm font-semibold text-gray-900 mt-2 flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: company.color }} />
        {company.label}
      </div>
      <div className="text-xs text-gray-500 mt-0.5 pl-4 mb-4">{company.persona}</div>

      <div className="grid sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] gap-6 sm:gap-8 items-center">
        <div className="max-w-[18rem] w-full mx-auto">
          <RadarFrame>
            {mode === "want" ? (
              <polygon points={poly(tailored)} fill={TAILORED} fillOpacity={0.16} stroke={TAILORED} strokeWidth="2" />
            ) : (
              <>
                {/* need minus coverage: the need polygon with the current product's area masked out */}
                <mask id={maskId}>
                  <rect x="-100" y="-100" width="600" height="600" fill="white" />
                  <polygon points={poly(current.coverage)} fill="black" />
                </mask>
                <polygon points={poly(need)} fill={WORKAROUND} fillOpacity={0.45} mask={`url(#${maskId})`} />
              </>
            )}
            <polygon points={poly(current.coverage)} fill="none" stroke={CURRENT} strokeWidth="2" strokeDasharray="5 3" />
            <polygon points={poly(need)} fill="none" stroke={NEED_INK} strokeWidth="2" />
          </RadarFrame>
        </div>

        <div>
          <ul className="space-y-2">
            {legend.map((l) => (
              <li key={l.label} className="flex gap-2.5 text-xs text-gray-700 leading-snug">
                <Swatch kind={l.kind} color={l.color} />
                {l.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
