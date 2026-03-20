"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Company {
  name: string;
  logo: string;
  description: string;
}

const companies: Company[] = [
  {
    name: "Schlumberger",
    logo: "/images/logos/schlumberger.svg",
    description:
      "Global oilfield services leader (now SLB). I worked in the drilling pressure control division — designing and delivering ~$40M equipment packages for offshore rigs in highly-regulated environments.",
  },
  {
    name: "AWL",
    logo: "/images/logos/awl.svg",
    description:
      "A  ~$200M ARR personal insurance marketplace connecting consumers with the best coverage options and giving agencies high-intent leads. I owned acquisition and call-center platforms.",
  },
  {
    name: "MacroFab",
    logo: "/images/logos/macrofab.png",
    description:
      "A ~$35M ARR digital platform and manufacturing marketplace for custom PCB assembly at volume. I led product strategy and built pricing engines and operational frameworks.",
  },
];

export default function CompanyLogos() {
  const [active, setActive] = useState<string | null>(null);

  const toggle = (name: string) => {
    setActive(active === name ? null : name);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
      {companies.map((company) => (
        <div key={company.name} className="flex-shrink-0">
          <button
            onClick={() => toggle(company.name)}
            aria-label={`Learn more about ${company.name}`}
            aria-expanded={active === company.name}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              src={company.logo}
              alt={company.name}
              className={`h-10 w-auto transition-all duration-300 ${
                active === company.name
                  ? "grayscale-0 opacity-100"
                  : "grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100"
              }`}
            />
            <span
              className={`text-xs transition-colors duration-200 ${
                active === company.name ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {active === company.name ? "−" : "+"}
            </span>
          </button>
          <AnimatePresence>
            {active === company.name && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-sm text-gray-500 leading-relaxed mt-2 max-w-sm overflow-hidden"
              >
                {company.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
