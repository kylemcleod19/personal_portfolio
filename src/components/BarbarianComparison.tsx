import { motion } from "framer-motion";

interface Row {
  dimension: string;
  lbo: string;
  ai: string;
}

interface BarbarianComparisonProps {
  rows: Row[];
  title?: string;
}

/**
 * Side-by-side comparison table with hover highlight.
 * Usage in MDX:
 *   <BarbarianComparison
 *     title="The Parallel"
 *     rows={[
 *       { dimension: "Weapon", lbo: "Junk bonds", ai: "AI dev tools" },
 *       ...
 *     ]}
 *   />
 */
export default function BarbarianComparison({ rows, title }: BarbarianComparisonProps) {
  return (
    <div className="my-8 not-prose">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">{title}</p>
      )}
      <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-3 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100">
          <div className="p-4"></div>
          <div className="p-4 text-center">1980s LBO Raiders</div>
          <div className="p-4 text-center">AI-Enabled Builders</div>
        </div>
        {/* Rows */}
        {rows.map((row, idx) => (
          <motion.div
            key={idx}
            whileHover={{ backgroundColor: "rgba(14, 165, 233, 0.04)" }}
            className={`grid grid-cols-3 text-sm ${
              idx < rows.length - 1 ? "border-b border-gray-50" : ""
            }`}
            aria-label={`${row.dimension}: ${row.lbo} versus ${row.ai}`}
          >
            <div className="p-4 font-medium text-gray-700">{row.dimension}</div>
            <div className="p-4 text-gray-500 text-center">{row.lbo}</div>
            <div className="p-4 text-sky-700 text-center font-medium">{row.ai}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
