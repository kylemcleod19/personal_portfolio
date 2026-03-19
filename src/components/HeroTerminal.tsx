"use client";
import { motion } from "framer-motion";

const lines = [
  { icon: "✓", text: "Led product at MacroFab", accent: false },
  { icon: "✓", text: "Shipped AI features", accent: false },
  { icon: "✓", text: "Defined AI-native product thesis", accent: false },
  { icon: "▸", text: "Testing what's possible", accent: true },
];

export default function HeroTerminal() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 font-mono text-sm shadow-sm">
      {/* Title bar */}
      <div className="flex items-center gap-1.5 mb-5">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
      </div>

      {/* Log lines */}
      <div className="space-y-3">
        {lines.map((line, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.4, duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-3"
          >
            <span
              className={
                line.accent
                  ? "text-accent-600 font-semibold"
                  : "text-green-600"
              }
            >
              {line.icon}
            </span>
            <span
              className={
                line.accent
                  ? "text-gray-900 font-medium"
                  : "text-gray-600"
              }
            >
              {line.text}
            </span>

            {/* Blinking cursor on last line */}
            {idx === lines.length - 1 && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 0.6,
                  delay: 0.3 + lines.length * 0.4 + 0.3,
                }}
                className="inline-block w-2 h-4 bg-accent-600 rounded-sm"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
