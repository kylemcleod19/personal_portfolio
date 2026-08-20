import { motion } from "framer-motion";

interface SaasQuadrantProps {
  era?: "before" | "after";
  title?: string;
}

export default function SaasQuadrant({ era = "before", title }: SaasQuadrantProps) {
  const isAfter = era === "after";

  return (
    <div className="my-10 not-prose font-sans">
      {title && (
        <p className="diagram-eyebrow mb-5">
          {title}
        </p>
      )}

      {/* Era badge + caption */}
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            isAfter
              ? "bg-accent-50 text-accent-600 border-accent-100"
              : "bg-orange-50 text-orange-600 border-orange-100"
          }`}
        >
          {isAfter ? "With AI" : "Before AI"}
        </span>
        <span className="text-xs text-gray-500">
          {isAfter
            ? "Build cost still rises toward Adaptive Systems, but at a much lower rate"
            : "Build cost increases toward Adaptive Systems"}
        </span>
      </div>

      <div className="flex gap-3 items-stretch">
        {/* Y-axis label */}
        <div className="flex flex-col justify-between py-8 pb-2 items-center w-8 shrink-0">
          <span className="text-xs font-semibold text-gray-600 [writing-mode:vertical-rl] rotate-180 tracking-wide">
            Bespoke
          </span>
          <span className="text-xs font-semibold text-gray-500 [writing-mode:vertical-rl] rotate-180 tracking-wide">
            Productized
          </span>
        </div>

        <div className="flex-1 min-w-0">
          {/* X-axis column headers */}
          <div className="grid grid-cols-2 mb-1.5">
            <p className="text-xs font-semibold text-gray-500 text-center tracking-wide">
              Flexible
            </p>
            <p className="text-xs font-semibold text-gray-600 text-center tracking-wide">
              Guided
            </p>
          </div>

          {/* Grid */}
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <div className="grid grid-cols-2">
              {/* Top-left: DIY Systems */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="p-5 border-b border-r border-gray-200 bg-white min-h-[130px]"
              >
                <p className="text-sm font-semibold text-gray-800">DIY Systems</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">
                  User-built, highly flexible. No enforced structure.
                </p>
              </motion.div>

              {/* Top-right: Adaptive Systems */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="p-5 border-b border-gray-200 bg-white min-h-[130px]"
              >
                <p className="text-sm font-semibold text-gray-800">Adaptive Systems</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">
                  Custom-built, structured workflows.
                </p>
                <div
                  className={`mt-3 inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${
                    isAfter
                      ? "bg-accent-50 text-accent-600 border-accent-100"
                      : "bg-red-50 text-red-500 border-red-100"
                  }`}
                >
                  {isAfter ? "Cost barrier collapsing" : "Enterprise-only"}
                </div>
              </motion.div>

              {/* Bottom-left: Tool Platforms */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="p-5 border-r border-gray-200 bg-white min-h-[130px]"
              >
                <p className="text-sm font-semibold text-gray-800">Tool Platforms</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">
                  General-purpose, user-defined workflows.
                </p>
              </motion.div>

              {/* Bottom-right: Workflow Software */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="p-5 bg-white min-h-[130px]"
              >
                <p className="text-sm font-semibold text-gray-800">Workflow Software</p>
                <p className="text-xs text-gray-600 mt-1 leading-snug">
                  Off-the-shelf, opinionated processes.
                </p>
                {!isAfter && (
                  <div className="mt-3 inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-600 border-amber-100">
                    Where most B2B buyers land
                  </div>
                )}
              </motion.div>
            </div>

            {/* Cost gradient overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: isAfter
                  ? "linear-gradient(to top right, transparent 20%, rgba(239, 68, 68, 0.05) 100%)"
                  : "linear-gradient(to top right, transparent 20%, rgba(239, 68, 68, 0.18) 100%)",
              }}
            />
          </div>

          {/* Cost legend */}
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="text-[10px] text-gray-500">Build cost</span>
            <div
              className="h-1.5 w-20 rounded-full"
              style={{
                background: isAfter
                  ? "linear-gradient(to right, #fef3c7, rgba(239, 68, 68, 0.15))"
                  : "linear-gradient(to right, #fef3c7, #f97316)",
              }}
            />
            <span className="text-[10px] text-gray-600 font-medium">
              {isAfter ? "increasing (slower)" : "increasing"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
