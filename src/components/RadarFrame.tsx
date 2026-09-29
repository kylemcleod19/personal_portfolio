import type { ReactNode } from "react";
import { CX, CY, N, NEEDS, SHORT, poly, pt } from "./coverageData";

/* Axis labels are drawn larger than the prototype's so they stay legible at the smaller radar size */
export default function RadarFrame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="-70 -34 460 408" style={{ width: "100%", display: "block", overflow: "visible" }}>
      {[25, 50, 75, 100].map((step) => (
        <polygon
          key={step}
          points={poly(Array(N).fill(step))}
          fill="none"
          stroke={step === 100 ? "#e5e7eb" : "#f3f4f6"}
          strokeWidth="1"
        />
      ))}
      {NEEDS.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="#f3f4f6" strokeWidth="1" />;
      })}
      {children}
      {NEEDS.map((need, i) => {
        const [x, y] = pt(i, 100);
        const dx = x - CX;
        const dy = y - CY;
        const lx = CX + dx * 1.16;
        const ly = CY + dy * 1.16;
        const anchor = Math.abs(dx) < 1 ? "middle" : dx > 0 ? "start" : "end";
        return (
          <text
            key={need}
            x={lx}
            y={ly + (Math.abs(dy) < 1 ? 5 : dy > 0 ? 14 : -6)}
            fontSize="15"
            fill="#4b5563"
            textAnchor={anchor}
          >
            <title>{need}</title>
            {SHORT[i]}
          </text>
        );
      })}
    </svg>
  );
}
