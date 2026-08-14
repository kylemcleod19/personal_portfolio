import { motion } from "framer-motion";

interface QuadrantInfo {
  name: string;
  subtitle: string;
  benefits: string[];
  constraints: string[];
  cost: "Low" | "Moderate" | "High" | "Very High";
  example: string;
}

const quadrants: QuadrantInfo[] = [
  {
    name: "DIY Systems",
    subtitle: "Bespoke · Flexible",
    benefits: ["Maximum flexibility", "Zero vendor lock-in", "Built to exact need"],
    constraints: ["High user effort", "Hard to scale", "Requires technical skill"],
    cost: "High",
    example: "Excel models, custom scripts, Notion-as-CRM",
  },
  {
    name: "Adaptive Systems",
    subtitle: "Bespoke · Guided",
    benefits: ["Perfect fit to operations", "Structured workflows", "Competitive advantage"],
    constraints: [
      "Historically required large IT budget",
      "Long build cycles",
      "Expensive to maintain",
    ],
    cost: "Very High",
    example: "Custom enterprise ERP, AI-built workflows (e.g. ERPForge)",
  },
  {
    name: "Tool Platforms",
    subtitle: "Productized · Flexible",
    benefits: ["Low cost", "Quick to start", "Broad applicability"],
    constraints: ["User must define all processes", "Breaks at scale", "Clumsy when pushed hard"],
    cost: "Low",
    example: "Airtable, Retool, Notion",
  },
  {
    name: "Workflow Software",
    subtitle: "Productized · Guided",
    benefits: ["Battle-tested workflows", "Scalable", "Ecosystem of integrations"],
    constraints: ["Generic fit", "Expensive customization", "Vendor lock-in"],
    cost: "Moderate",
    example: "Shopify, Salesforce, industry-specific ERPs",
  },
];

const costStyles: Record<QuadrantInfo["cost"], string> = {
  Low: "bg-gray-100 text-gray-500",
  Moderate: "bg-amber-50 text-amber-600",
  High: "bg-orange-100 text-orange-600",
  "Very High": "bg-red-100 text-red-600",
};

export default function QuadrantDetails({ title }: { title?: string }) {
  return (
    <div className="my-10 not-prose font-sans">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5">
          {title}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quadrants.map((q, i) => (
          <motion.div
            key={q.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: i * 0.06 }}
            className="border border-gray-200 rounded-xl p-5 bg-white flex flex-col gap-4"
          >
            {/* Header */}
            <div>
              <p className="text-sm font-semibold text-gray-800">{q.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{q.subtitle}</p>
            </div>

            {/* Cost */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                Build Cost
              </p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${costStyles[q.cost]}`}>
                {q.cost}
              </span>
            </div>

            {/* Benefits */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                Benefits
              </p>
              <ul className="space-y-1">
                {q.benefits.map((b) => (
                  <li key={b} className="text-xs text-gray-600 flex gap-1.5 items-start">
                    <span className="text-gray-300 mt-0.5 shrink-0">+</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Constraints */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
                Constraints
              </p>
              <ul className="space-y-1">
                {q.constraints.map((c) => (
                  <li key={c} className="text-xs text-gray-500 flex gap-1.5 items-start">
                    <span className="text-gray-300 mt-0.5 shrink-0">–</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>

            {/* Example */}
            <div className="mt-auto pt-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Example
              </p>
              <p className="text-xs text-gray-500 italic">{q.example}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
