import { useState } from 'react';
import { StageCount } from '@/types';
import { stageColor } from './Badges';

interface Props {
  data: StageCount[];
}

export default function BarChart({ data }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.count), 1);
  const chartH = 220;
  const barW = 44;
  const gap = 28;

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-navy-800">Claims per Stage</h3>
        <span className="text-xs text-navy-400">{data.reduce((s, d) => s + d.count, 0)} total</span>
      </div>
      <div className="relative">
        <svg
          width="100%"
          height={chartH + 50}
          viewBox={`0 0 ${data.length * (barW + gap) + gap} ${chartH + 50}`}
          className="overflow-visible"
        >
          {/* gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={gap - 8}
              x2={data.length * (barW + gap) + gap}
              y1={chartH - chartH * f + 4}
              y2={chartH - chartH * f + 4}
              stroke="#eef3fb"
              strokeWidth={1}
            />
          ))}
          {data.map((d, i) => {
            const h = (d.count / max) * chartH;
            const x = gap + i * (barW + gap);
            const y = chartH - h + 4;
            const c = stageColor(d.stage);
            const isHover = hover === i;
            return (
              <g
                key={d.stage}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={Math.max(h, 2)}
                  rx={6}
                  className={`transition-all duration-300 ${c.dot}`}
                  opacity={isHover ? 1 : 0.85}
                />
                <text
                  x={x + barW / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="fill-navy-800 text-[11px] font-semibold"
                >
                  {d.count}
                </text>
                {/* x labels */}
                <text
                  x={x + barW / 2}
                  y={chartH + 22}
                  textAnchor="middle"
                  className="fill-navy-500 text-[10px]"
                >
                  {d.stage.length > 10 ? d.stage.slice(0, 9) + '…' : d.stage}
                </text>
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <div
            className="pointer-events-none absolute -top-2 z-10 rounded-lg bg-navy-900 px-3 py-2 text-xs text-white shadow-cardLg animate-fade-in"
            style={{ left: `calc(${gap + hover * (barW + gap) + barW / 2}px)`, transform: 'translateX(-50%)' }}
          >
            <p className="font-semibold">{data[hover].stage}</p>
            <p className="text-navy-200">{data[hover].count} claims</p>
          </div>
        )}
      </div>
    </div>
  );
}
