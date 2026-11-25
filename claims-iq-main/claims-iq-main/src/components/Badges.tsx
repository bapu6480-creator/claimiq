import { STAGES, Stage } from '@/types';

const STAGE_COLORS: Record<Stage, { bg: string; text: string; dot: string; ring: string }> = {
  Submitted: { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-500', ring: 'ring-sky-200' },
  Validated: { bg: 'bg-cyan-50', text: 'text-cyan-700', dot: 'bg-cyan-500', ring: 'ring-cyan-200' },
  Extracted: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', ring: 'ring-violet-200' },
  'Under Review': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', ring: 'ring-amber-200' },
  'Approved/Rejected': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', ring: 'ring-rose-200' },
  Paid: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', ring: 'ring-emerald-200' },
};

export function stageColor(stage: Stage) {
  return STAGE_COLORS[stage] ?? STAGE_COLORS['Submitted'];
}

export function StageBadge({ stage, size = 'md' }: { stage: Stage; size?: 'sm' | 'md' }) {
  const c = stageColor(stage);
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${c.bg} ${c.text} ${pad} ring-1 ${c.ring}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {stage}
    </span>
  );
}

export function StatusBadge({ status }: { status: 'open' | 'closed' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
        status === 'open'
          ? 'bg-navy-50 text-navy-700 ring-navy-200'
          : 'bg-slate-100 text-slate-600 ring-slate-200'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'open' ? 'bg-navy-500 animate-pulse-dot' : 'bg-slate-400'}`} />
      {status === 'open' ? 'Open' : 'Closed'}
    </span>
  );
}

export { STAGES };
