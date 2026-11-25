import { useState } from 'react';
import { MonthCount } from '@/types';

interface Props {
  data: MonthCount[];
}

export default function LineChart({ data }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 520;
  const H = 220;
  const padL = 30;
  const padR = 16;
  const padT = 20;
  const padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const xStep = innerW / (data.length - 1);
  const points = data.map((d, i) => ({
    x: padL + i * xStep,
    y: padT + innerH - (d.count / max) * innerH,
    ...d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padT + innerH} L ${points[0].x} ${padT + innerH} Z`;

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-800">Claims per Month</h3>
        <span className="text-xs text-navy-400">Last 6 months</span>
      </div>
      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* gridlines */}
          {[0, 0.5, 1].map((f) => (
            <line
              key={f}
              x1={padL}
              x2={W - padR}
              y1={padT + innerH - innerH * f}
              y2={padT + innerH - innerH * f}
              stroke="#eef3fb"
              strokeWidth={1}
            />
          ))}
          <path d={areaPath} fill="url(#lineArea)" />
          <path
            d={linePath}
            fill="none"
            stroke="#214a8a"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((p, i) => (
            <g
              key={p.month}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="cursor-pointer"
            >
              <rect
                x={p.x - xStep / 2}
                y={padT}
                width={xStep}
                height={innerH + padB}
                fill="transparent"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={hover === i ? 6 : 4}
                fill="white"
                stroke="#214a8a"
                strokeWidth={2.5}
                className="transition-all duration-200"
              />
              <text x={p.x} y={H - 8} textAnchor="middle" className="fill-navy-500 text-[10px] font-medium">
                {p.month}
              </text>
            </g>
          ))}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-lg bg-navy-900 px-3 py-2 text-xs text-white shadow-cardLg animate-fade-in"
            style={{
              left: `${(points[hover].x / W) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="font-semibold">{data[hover].month}</p>
            <p className="text-navy-200">{data[hover].count} claims</p>
          </div>
        )}
      </div>
    </div>
  );
}
