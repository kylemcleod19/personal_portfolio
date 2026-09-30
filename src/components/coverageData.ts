/* Shared data for the coverage visuals. Shops are composites from work with manufacturers;
   scores are illustrative, not benchmarks of named vendors. */

export const NEEDS = [
  "Work orders & scheduling",
  "Inventory & BOM",
  "Lot/batch traceability",
  "Quality & inspection",
  "Engineering change control",
  "Custom quoting & costing",
  "Shop floor data collection",
  "Capacity planning",
];
export const SHORT = ["Work orders", "Inventory / BOM", "Traceability", "Quality", "Change control", "Quoting", "Shop floor", "Capacity"];

export interface Company {
  id: string;
  label: string;
  persona: string;
  description: string;
  importance: number[];
  color: string;
}

export interface Solution {
  id: string;
  label: string;
  short: string;
  sub: string;
  description: string;
  coverage: number[];
  color: string;
  fill: string;
}

export const COMPANIES: Company[] = [
  {
    id: "A",
    label: "Company A",
    persona: "Regulated medical device contract manufacturer",
    description: "Audited quality system. Every lot traced, every BOM change signed off. Quoting barely matters.",
    importance: [70, 65, 95, 95, 85, 30, 55, 50],
    color: "#0284c7",
  },
  {
    id: "B",
    label: "Company B",
    persona: "High-mix, low-volume job shop",
    description: "Every job quoted fresh, so pricing decides the margin. Capacity is daily triage.",
    importance: [75, 60, 25, 35, 40, 90, 60, 85],
    color: "#ea580c",
  },
  {
    id: "C",
    label: "Company C",
    persona: "Standard contract manufacturer, mid-volume repeat parts",
    description: "Same 40-50 SKUs on repeat. Schedule and stock on hand. The shop the software was built for.",
    importance: [85, 80, 30, 45, 35, 20, 65, 55],
    color: "#111827",
  },
  {
    id: "D",
    label: "Company D",
    persona: "Aerospace / defense supplier",
    description: "Company A's regulatory weight, plus complex routings through CNC, heat treat, and NDT.",
    importance: [70, 65, 90, 90, 80, 40, 50, 80],
    color: "#15803d",
  },
  {
    id: "E",
    label: "Company E",
    persona: "General fabrication, price-sensitive",
    description: "Simple jobs, thin margins. Anything past schedule and stock is overhead.",
    importance: [60, 55, 15, 25, 20, 45, 40, 35],
    color: "#b91c1c",
  },
];

export const SOLUTIONS: Solution[] = [
  {
    id: "full",
    label: "Full-featured",
    short: "Full",
    sub: "General",
    description: "Strong on the shared core, moderate elsewhere.",
    coverage: [85, 80, 40, 55, 45, 35, 70, 65],
    color: "#0ea5e9",
    fill: "rgba(14,165,233,0.10)",
  },
  {
    id: "budget",
    label: "Budget",
    short: "Budget",
    sub: "General",
    description: "Solid on the shared core, weak everywhere else.",
    coverage: [70, 65, 15, 20, 15, 10, 25, 20],
    color: "#6b7280",
    fill: "rgba(107,114,128,0.10)",
  },
  {
    id: "niche",
    label: "Niche / vertical",
    short: "Niche",
    sub: "Specialized",
    description: "Deep on traceability and quality, shallow everywhere else.",
    coverage: [45, 45, 75, 70, 40, 40, 40, 40],
    color: "#f97316",
    fill: "rgba(249,115,22,0.10)",
  },
];


/* fit = mean absolute distance between what the shop needs and what the product covers.
   Counts both directions: shortfall (unmet need) and overshoot (capability bought and not used). */
export const shortOf = (c: Company, s: Solution) =>
  c.importance.reduce((t, v, i) => t + Math.max(0, v - s.coverage[i]), 0) / NEEDS.length;
export const overOf = (c: Company, s: Solution) =>
  c.importance.reduce((t, v, i) => t + Math.max(0, s.coverage[i] - v), 0) / NEEDS.length;
/* shortfall + excess reduces to mean absolute gap, which also works for in-between (animated) profiles */
export const distance = (need: number[], cover: number[]) =>
  need.reduce((t, v, i) => t + Math.abs(v - cover[i]), 0) / NEEDS.length;
export const fit = (c: Company, s: Solution) => distance(c.importance, s.coverage);
export const bestFit = (c: Company) => SOLUTIONS.reduce((a, b) => (fit(c, b) < fit(c, a) ? b : a));

/* A tailored build covers each need to the nearest 10: close, not a perfect copy */
export const tailoredFor = (need: number[]) => need.map((v) => Math.round(v / 10) * 10);

/* ---------- geometry ---------- */
export const R = 108;
export const CX = 160;
export const CY = 160;
export const N = 8;
export const pt = (i: number, v: number) => {
  const a = ((-90 + i * (360 / N)) * Math.PI) / 180;
  const r = R * (v / 100);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};
export const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).map((n) => n.toFixed(1)).join(",")).join(" ");
