"use client";
import { motion } from "framer-motion";

const lines = [
  { icon: "✓", text: "Led product at MacroFab", accent: false },
  { icon: "✓", text: "Shipped AI features", accent: false },
  { icon: "✓", text: "Built products with AI tools", accent: false },
  { icon: "▸", text: "Testing what changes", accent: true },
];

export default function HeroTerminal() {
  return (
    <div className="terminal-card">
      {/* Title bar */}
      <div className="terminal-dots">
        <span className="terminal-dot" />
        <span className="terminal-dot" />
        <span className="terminal-dot" />
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
                  ? "terminal-icon-active"
                  : "terminal-icon-done"
              }
            >
              {line.icon}
            </span>
            <span
              className={
                line.accent
                  ? "terminal-label-active"
                  : "terminal-label"
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
                className="terminal-cursor"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
