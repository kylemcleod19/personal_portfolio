import { motion } from "framer-motion";

interface LeverageShiftProps {
  title?: string;
}

/**
 * Before/after diagram showing the old translation-heavy software
 * development model vs. the new AI-collapsed model.
 * Emphasizes the barrier that existed between domain expertise and code.
 *
 * Usage in MDX:
 *   <LeverageShift title="The Translation Layer" />
 */
export default function LeverageShift({ title }: LeverageShiftProps) {
  const oldSteps = [
    { label: "Domain Expert", sub: "Understands the problem" },
    { label: "Requirements Docs", sub: "Weeks of translation" },
    { label: "Product Team", sub: "Interprets and prioritizes" },
    { label: "Engineering Team", sub: "Builds what they understood" },
    { label: "Iteration Cycles", sub: "Months of back-and-forth" },
    { label: "Working Product", sub: "Finally ships" },
  ];

  const newSteps = [
    { label: "Domain Expert", sub: "Understands the problem" },
    { label: "AI Dev Tools", sub: "Encodes logic directly" },
    { label: "Working Prototype", sub: "Days, not months" },
  ];

  const barrierIndex = 1; // The wall sits after the first step in the old model

  return (
    <div className="my-8 not-prose">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">{title}</p>
      )}

      <div className="space-y-6">
        {/* Old Model */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Before: The Translation Gauntlet</p>
          <div className="flex items-center gap-0 flex-wrap">
            {oldSteps.map((step, idx) => (
              <div key={idx} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: idx * 0.06 }}
                  className="px-3 py-3 rounded-lg border border-gray-100 bg-white text-center min-w-[100px]"
                >
                  <p className="text-xs font-semibold text-gray-700 leading-tight">{step.label}</p>
                  <p className="text-[10px] text-gray-400 mt-1 leading-tight">{step.sub}</p>
                </motion.div>
                {idx < oldSteps.length - 1 && (
                  idx === barrierIndex ? (
                    <div className="flex flex-col items-center mx-1 flex-shrink-0">
                      <div className="w-8 h-10 rounded border-2 border-dashed border-red-300 bg-red-50 flex items-center justify-center">
                        <span className="text-red-400 text-[10px] font-bold rotate-90 whitespace-nowrap">WALL</span>
                      </div>
                    </div>
                  ) : (
                    <span className="px-1 text-gray-300 text-sm flex-shrink-0">→</span>
                  )
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400 mt-2 italic">Each arrow is a lossy translation. Meaning degrades at every handoff.</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* New Model */}
        <div>
          <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-3">After: The Wall Collapses</p>
          <div className="flex items-center gap-0">
            {newSteps.map((step, idx) => (
              <div key={idx} className="flex items-center">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: idx * 0.08 }}
                  className={`px-4 py-3 rounded-lg border text-center min-w-[120px] ${
                    idx === 1
                      ? "border-sky-200 bg-sky-50"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <p className={`text-xs font-semibold leading-tight ${
                    idx === 1 ? "text-sky-700" : "text-gray-700"
                  }`}>{step.label}</p>
                  <p className={`text-[10px] mt-1 leading-tight ${
                    idx === 1 ? "text-sky-500" : "text-gray-400"
                  }`}>{step.sub}</p>
                </motion.div>
                {idx < newSteps.length - 1 && (
                  <span className="px-2 text-sky-400 text-sm flex-shrink-0">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
