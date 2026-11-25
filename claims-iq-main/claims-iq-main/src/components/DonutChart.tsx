import { useState } from 'react';
import { TypeCount } from '@/types';

interface Props {
  data: TypeCount[];
}

const COLORS = ['#214a8a', '#3b82f6', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981'];

export default function DonutChart({ data }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const R = 70;
  const r = 42;
  const cx = 90;
  const cy = 90;
  const circ = 2 * Math.PI * R;

  let offset = 0;
  const segments = data.map((d, i) => {
    const frac = d.count / total;
    const len = frac * circ;
    const seg = {
      ...d,
      color: COLORS[i % COLORS.length],
      dasharray: `${len} ${circ - len}`,
      dashoffset: -offset,
      frac,
    };
    offset += len;
    return seg;
  });

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-800">Claims by Type</h3>
        <span className="text-xs text-navy-400">{total} total</span>
      </div>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <svg width={180} height={180} viewBox="0 0 180 180">
            {segments.map((s, i) => (
              <circle
                key={s.type}
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={hover === i ? 30 : 26}
                strokeDasharray={s.dasharray}
                strokeDashoffset={s.dashoffset}
                transform={`rotate(-90 ${cx} ${cy})`}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
            ))}
            <circle cx={cx} cy={cy} r={r} fill="white" />
            <text x={cx} y={cy - 4} textAnchor="middle" className="fill-navy-900 text-2xl font-bold">
              {hover !== null ? data[hover].count : total}
            </text>
            <text x={cx} y={cy + 14} textAnchor="middle" className="fill-navy-400 text-[10px] font-medium uppercase tracking-wide">
              {hover !== null ? data[hover].type : 'Total'}
            </text>
          </svg>
        </div>
        <div className="flex w-full flex-col gap-1.5 sm:w-auto">
          {segments.map((s, i) => (
            <button
              key={s.type}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className={`flex items-center justify-between gap-4 rounded-lg px-2.5 py-1.5 text-xs transition ${
                hover === i ? 'bg-navy-50' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                <span className="font-medium text-navy-700">{s.type}</span>
              </span>
              <span className="font-semibold text-navy-500">
                {s.count} <span className="text-navy-300">({Math.round(s.frac * 100)}%)</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
