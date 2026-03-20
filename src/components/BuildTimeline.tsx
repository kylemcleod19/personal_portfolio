"use client";
import { motion } from "framer-motion";

interface Milestone {
  phase: string;
  description: string;
  stats: { value: string; label: string }[];
  active?: boolean;
  done?: boolean;
}

interface BuildTimelineProps {
  milestones: Milestone[];
}

/**
 * Terminal-styled build timeline with per-phase stats.
 * Matches HeroTerminal visual style (dot title bar, monospace, staggered reveal).
 *
 * Usage in MDX:
 *   <BuildTimeline
 *     milestones={[
 *       { phase: "Core App", description: "Voice logging, trip history, basic UI", stats: [{ value: "4 hrs", label: "build time" }] },
 *       { phase: "Integrations", description: "USGS stream data, maps", stats: [{ value: "~10", label: "prompts" }], active: true },
 *     ]}
 *   />
 */
export default function BuildTimeline({ milestones }: BuildTimelineProps) {
  return (
    <div className="my-10 not-prose">
      <div className="rounded-xl border border-gray-200 bg-white p-6 font-mono text-sm shadow-sm">
        {/* Title bar dots */}
        <div className="flex items-center gap-1.5 mb-5">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
          <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
        </div>

        {/* Timeline entries */}
        <div className="space-y-3">
          {milestones.map((milestone, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.4, ease: "easeOut" }}
            >
              {/* Phase line */}
              <div className="flex items-center gap-3">
                {(milestone.active || milestone.done) && (
                <span className={milestone.active ? "text-accent-600 font-semibold" : "text-green-600"}>
                  {milestone.active ? "▸" : "✓"}
                </span>
                )}
                {!milestone.active && !milestone.done && (
                <span className="w-3" />
                )}
                <span className={milestone.active ? "text-gray-900 font-medium" : "text-gray-600"}>
                  {milestone.phase}
                </span>

                {/* Inline stats */}
                <span className="flex items-center gap-3 ml-auto">
                  {milestone.stats.map((stat, sIdx) => (
                    <span key={sIdx} className="text-gray-400">
                      <span className="text-accent-600 font-semibold">{stat.value}</span>{" "}
                      {stat.label}
                    </span>
                  ))}
                </span>

                {/* Blinking cursor on active line if no later milestone is also active */}
                {milestone.active && !milestones.slice(idx + 1).some(m => m.active) && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 0.6,
                      delay: milestones.length * 0.15 + 0.3,
                    }}
                    className="inline-block w-2 h-4 bg-accent-600 rounded-sm"
                  />
                )}
              </div>

              {/* Description */}
              <div className="ml-7 mt-0.5">
                <span className="text-gray-400 text-xs">{milestone.description}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
