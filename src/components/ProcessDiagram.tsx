import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Step {
  id: string;
  label: string;
  description: string;
  icon?: string;
}

interface Props {
  steps: Step[];
  title?: string;
}

/**
 * Hover-activated process diagram.
 * Usage in MDX:
 *   <ProcessDiagram
 *     title="Discovery Process"
 *     steps={[
 *       { id: "1", label: "Research", description: "18 user interviews over 3 weeks." },
 *       { id: "2", label: "Synthesis", description: "Affinity mapping and theme extraction." },
 *       ...
 *     ]}
 *   />
 */
export default function ProcessDiagram({ steps, title }: Props) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="my-8 not-prose">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">{title}</p>
      )}
      <div className="flex items-start gap-0">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex-1 relative">
              <motion.button
                onHoverStart={() => setActive(step.id)}
                onHoverEnd={() => setActive(null)}
                onFocus={() => setActive(step.id)}
                onBlur={() => setActive(null)}
                whileHover={{ scale: 1.05 }}
                className={`w-full p-4 rounded-xl border text-left transition-colors ${
                  active === step.id
                    ? 'bg-sky-50 border-sky-200'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{step.label}</span>
                </div>
                <AnimatePresence>
                  {active === step.id && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-gray-500 leading-relaxed overflow-hidden"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
            {/* Connector arrow (not after last step) */}
            {idx < steps.length - 1 && (
              <div className="px-2 text-gray-300 text-lg flex-shrink-0">→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
