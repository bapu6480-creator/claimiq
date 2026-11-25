import { useEffect, useState } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { fetchClaims, fetchKpis, fetchClaimsByStage, fetchClaimsByType, fetchClaimsPerMonth } from '@/api';
import { Claim, Kpis, StageCount, TypeCount, MonthCount } from '@/types';
import BarChart from '@/components/BarChart';
import DonutChart from '@/components/DonutChart';
import LineChart from '@/components/LineChart';
import { StageBadge } from '@/components/Badges';

interface Props {
  onOpenClaim: (id: string) => void;
}

export default function DashboardPage({ onOpenClaim }: Props) {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [stageData, setStageData] = useState<StageCount[]>([]);
  const [typeData, setTypeData] = useState<TypeCount[]>([]);
  const [monthData, setMonthData] = useState<MonthCount[]>([]);
  const [recent, setRecent] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [k, s, t, m, c] = await Promise.all([
        fetchKpis(),
        fetchClaimsByStage(),
        fetchClaimsByType(),
        fetchClaimsPerMonth(),
        fetchClaims(),
      ]);
      if (!alive) return;
      setKpis(k);
      setStageData(s);
      setTypeData(t);
      setMonthData(m);
      setRecent(c.slice().sort((a, b) => b.filedDate.localeCompare(a.filedDate)).slice(0, 5));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const cards = [
    {
      label: 'Total Claims',
      value: kpis?.totalClaims ?? 0,
      icon: FileText,
      trend: '+12%',
      up: true,
      color: 'bg-navy-700',
    },
    {
      label: 'Pending Review',
      value: kpis?.pendingReview ?? 0,
      icon: Clock,
      trend: '+3',
      up: true,
      color: 'bg-amber-500',
    },
    {
      label: 'Approved Amount',
      value: `$${(kpis?.approvedAmount ?? 0).toLocaleString()}`,
      icon: CheckCircle2,
      trend: '+18%',
      up: true,
      color: 'bg-emerald-600',
    },
    {
      label: 'Avg Days to Close',
      value: `${kpis?.avgDaysToClose ?? 0}d`,
      icon: TrendingUp,
      trend: '-2d',
      up: false,
      color: 'bg-accent-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-navy-200 border-t-navy-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="text-sm text-navy-400">Claims intelligence overview — updated live.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card group p-5 transition-shadow hover:shadow-cardLg">
              <div className="flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color} shadow-sm`}>
                  <Icon size={20} className="text-white" />
                </div>
                <span
                  className={`flex items-center gap-0.5 text-xs font-semibold ${
                    c.up ? 'text-emerald-600' : 'text-emerald-600'
                  }`}
                >
                  {c.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {c.trend}
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-navy-900">{c.value}</p>
              <p className="text-sm text-navy-400">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChart data={stageData} />
        <DonutChart data={typeData} />
      </div>
      <LineChart data={monthData} />

      {/* Recent claims */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-navy-800">Recent Claims</h3>
          <span className="text-xs text-navy-400">{recent.length} most recent</span>
        </div>
        <div className="divide-y divide-navy-50">
          {recent.map((claim) => (
            <button
              key={claim.id}
              onClick={() => onOpenClaim(claim.id)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-left transition hover:bg-navy-50/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-100 text-xs font-bold text-navy-700">
                  {claim.claimant.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-800">{claim.claimant}</p>
                  <p className="text-xs text-navy-400">
                    {claim.id} · {claim.type} · Filed {claim.filedDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden text-sm font-semibold text-navy-700 sm:block">
                  ${claim.amount.toLocaleString()}
                </span>
                <StageBadge stage={claim.stage} size="sm" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
