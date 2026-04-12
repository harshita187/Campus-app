import React, { useMemo } from "react";

/**
 * Tiny area sparkline from 7-ish daily counts (no external chart lib).
 */
export function MiniSparkline({ values = [], color = "#6366f1", height = 36 }) {
  const points = useMemo(() => {
    const v = Array.isArray(values) ? values.map((n) => Number(n) || 0) : [];
    if (!v.length) return "";
    const max = Math.max(...v, 1);
    const min = Math.min(...v);
    const range = max - min || 1;
    const w = 100;
    const h = height;
    const pad = 2;
    return v
      .map((n, i) => {
        const x = pad + (i / Math.max(v.length - 1, 1)) * (w - pad * 2);
        const norm = (n - min) / range;
        const y = h - pad - norm * (h - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [values, height]);

  if (!points) {
    return (
      <svg className="mini-sparkline" width="100%" height={height} viewBox="0 0 100 36" preserveAspectRatio="none" aria-hidden>
        <line x1="4" y1="18" x2="96" y2="18" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className="mini-sparkline" width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        opacity="0.9"
      />
    </svg>
  );
}
