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
      <div className="terminal-card">
        {/* Title bar dots */}
        <div className="terminal-dots">
          <span className="terminal-dot" />
          <span className="terminal-dot" />
          <span className="terminal-dot" />
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
                <span className={milestone.active ? "terminal-icon-active" : "terminal-icon-done"}>
                  {milestone.active ? "▸" : "✓"}
                </span>
                )}
                {!milestone.active && !milestone.done && (
                <span className="w-3" />
                )}
                <span className={milestone.active ? "terminal-label-active" : "terminal-label"}>
                  {milestone.phase}
                </span>

                {/* Inline stats */}
                <span className="flex items-center gap-3 ml-auto">
                  {milestone.stats.map((stat, sIdx) => (
                    <span key={sIdx} className="text-gray-500">
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
                    className="terminal-cursor"
                  />
                )}
              </div>

              {/* Description */}
              <div className="ml-7 mt-0.5">
                <span className="text-gray-600 text-xs">{milestone.description}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
