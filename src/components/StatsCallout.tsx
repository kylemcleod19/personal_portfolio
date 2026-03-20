"use client";
import { motion } from "framer-motion";

interface Stat {
  value: string;
  label: string;
}

interface StatsCalloutProps {
  stats: Stat[];
}

/**
 * Horizontal stats row for key metrics.
 * Usage in MDX:
 *   <StatsCallout
 *     stats={[
 *       { value: "4 hrs", label: "Zero to deployed" },
 *       { value: "~10", label: "Prompts to working app" },
 *       ...
 *     ]}
 *   />
 */
export default function StatsCallout({ stats }: StatsCalloutProps) {
  return (
    <div className="my-10 not-prose">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: idx * 0.08 }}
            className="p-5 rounded-xl border border-gray-100 bg-white text-center"
          >
            <p className="text-2xl font-bold text-sky-600 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
