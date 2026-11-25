import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, ArrowRight, AlertCircle } from 'lucide-react';
import { fetchClaims } from '@/api';
import { Claim, STAGES, Stage } from '@/types';
import { stageColor, StageBadge } from '@/components/Badges';

interface Props {
  onOpenClaim: (id: string) => void;
}

export default function ClaimsPage({ onOpenClaim }: Props) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<Stage | 'all'>('all');

  useEffect(() => {
    let alive = true;
    (async () => {
      const c = await fetchClaims();
      if (!alive) return;
      setClaims(c);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return claims.filter((c) => {
      const matchesSearch =
        !search ||
        c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.claimant.toLowerCase().includes(search.toLowerCase()) ||
        c.type.toLowerCase().includes(search.toLowerCase()) ||
        c.adjuster.toLowerCase().includes(search.toLowerCase());
      const matchesStage = stageFilter === 'all' || c.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [claims, search, stageFilter]);

  const columns = STAGES.map((stage) => ({
    stage,
    items: filtered.filter((c) => c.stage === stage),
  }));

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-navy-200 border-t-navy-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-navy-900">Claims Board</h1>
        <p className="text-sm text-navy-400">Track every claim through its lifecycle.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by claim ID, claimant, type, or adjuster…"
            className="input pl-10"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as Stage | 'all')}
            className="input min-w-[180px] cursor-pointer appearance-none pl-10 pr-8"
          >
            <option value="all">All stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const c = stageColor(col.stage);
          return (
            <div
              key={col.stage}
              className="flex w-72 shrink-0 flex-col rounded-xl border border-navy-100 bg-navy-50/40"
            >
              <div className="flex items-center justify-between px-3.5 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
                  <h3 className="text-sm font-semibold text-navy-800">{col.stage}</h3>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-navy-500 ring-1 ring-navy-100">
                  {col.items.length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 px-2.5 pb-3">
                {col.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-navy-200 py-8 text-center">
                    <AlertCircle size={18} className="text-navy-300" />
                    <p className="mt-1.5 text-xs text-navy-400">No claims</p>
                  </div>
                ) : (
                  col.items.map((claim) => (
                    <button
                      key={claim.id}
                      onClick={() => onOpenClaim(claim.id)}
                      className="group rounded-lg border border-navy-100 bg-white p-3.5 text-left shadow-sm transition-all hover:border-navy-300 hover:shadow-cardLg animate-slide-in"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-navy-500">{claim.id}</span>
                        <span className="text-xs font-semibold text-navy-800">
                          ${claim.amount.toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-navy-800 line-clamp-1">
                        {claim.claimant}
                      </p>
                      <p className="mt-0.5 text-xs text-navy-400 line-clamp-2">{claim.description}</p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="rounded-md bg-navy-50 px-2 py-0.5 text-[11px] font-medium text-navy-600">
                          {claim.type}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-navy-300 transition group-hover:text-navy-500">
                          Open
                          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
