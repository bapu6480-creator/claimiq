import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Shield,
  ClipboardCheck,
  Check,
  Circle,
  Send,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  DollarSign,
  Brain,
  Loader2,
} from 'lucide-react';
import {
  fetchClaim,
  sendChatMessage,
  recommendNextStage,
  advanceStage,
} from '@/api';
import { Claim, ChatMessage, Role, Stage } from '@/types';
import { StageBadge, StatusBadge, STAGES, stageColor } from '@/components/Badges';

interface Props {
  claimId: string;
  role: Role;
  onBack: () => void;
}

const DOC_ICON: Record<Claim['documents'][number]['type'], typeof FileText> = {
  pdf: FileText,
  image: ImageIcon,
  policy: Shield,
  report: ClipboardCheck,
};

const DOC_COLOR: Record<Claim['documents'][number]['type'], string> = {
  pdf: 'bg-red-50 text-red-600',
  image: 'bg-violet-50 text-violet-600',
  policy: 'bg-navy-50 text-navy-600',
  report: 'bg-amber-50 text-amber-600',
};

export default function ClaimDetailPage({ claimId, role, onBack }: Props) {
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    nextStage: Stage;
    rationale: string;
  } | null>(null);
  const [recommending, setRecommending] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setRecommendation(null);
    setActionMsg(null);
    (async () => {
      const c = await fetchClaim(claimId);
      if (!alive) return;
      setClaim(c);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [claimId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [claim?.chat, chatSending]);

  const handleSend = async () => {
    if (!chatInput.trim() || !claim) return;
    const userMsg: ChatMessage = {
      id: `${claim.id}-u-${Date.now()}`,
      role: 'user',
      text: chatInput.trim(),
      timestamp: new Date().toISOString(),
    };
    setClaim((c) => (c ? { ...c, chat: [...c.chat, userMsg] } : c));
    setChatInput('');
    setChatSending(true);
    try {
      const reply = await sendChatMessage(claim.id, userMsg.text);
      setClaim((c) => (c ? { ...c, chat: [...c.chat, reply] } : c));
    } finally {
      setChatSending(false);
    }
  };

  const handleRecommend = async () => {
    if (!claim) return;
    setRecommending(true);
    try {
      const rec = await recommendNextStage(claim.id);
      setRecommendation(rec);
    } finally {
      setRecommending(false);
    }
  };

  const handleApprove = async () => {
    if (!claim) return;
    setActionMsg(null);
    const next = STAGES[Math.min(STAGES.indexOf(claim.stage) + 1, STAGES.length - 1)];
    const updated = await advanceStage(claim.id, next);
    if (updated) {
      setClaim(updated);
      setRecommendation(null);
      setActionMsg({ type: 'success', text: `Claim advanced to ${next}.` });
    }
  };

  const handleReject = async () => {
    if (!claim) return;
    setActionMsg(null);
    const updated = await advanceStage(claim.id, 'Approved/Rejected');
    if (updated) {
      setClaim(updated);
      setRecommendation(null);
      setActionMsg({ type: 'error', text: 'Claim moved to Approved/Rejected for review.' });
    }
  };

  const handlePay = async () => {
    if (!claim) return;
    const updated = await advanceStage(claim.id, 'Paid');
    if (updated) {
      setClaim(updated);
      setRecommendation(null);
      setActionMsg({ type: 'success', text: 'Claim marked as Paid and closed.' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-navy-200 border-t-navy-700" />
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-navy-500">Claim not found.</p>
        <button onClick={onBack} className="btn-secondary mt-4">
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    );
  }

  const isAdmin = role === 'admin';
  const canApproveReject = isAdmin && claim.stage !== 'Paid';
  const canPay = isAdmin && claim.stage === 'Approved/Rejected';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 bg-white text-navy-600 transition hover:bg-navy-50">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-navy-900">{claim.claimant}</h1>
              <StageBadge stage={claim.stage} size="sm" />
              <StatusBadge status={claim.status} />
            </div>
            <p className="text-sm text-navy-400">
              {claim.id} · {claim.type} · Adjuster: {claim.adjuster}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="rounded-lg bg-navy-50 px-3.5 py-2 text-sm">
            <span className="text-navy-400">Amount: </span>
            <span className="font-bold text-navy-800">${claim.amount.toLocaleString()}</span>
          </div>
          {canApproveReject && (
            <button onClick={handleApprove} className="btn-success">
              <CheckCircle2 size={16} /> Approve
            </button>
          )}
          {canApproveReject && (
            <button onClick={handleReject} className="btn-danger">
              <XCircle size={16} /> Reject
            </button>
          )}
          {canPay && (
            <button onClick={handlePay} className="btn-primary">
              <DollarSign size={16} /> Mark Paid
            </button>
          )}
        </div>
      </div>

      {actionMsg && (
        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium animate-fade-in ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
          }`}
        >
          {actionMsg.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          {actionMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left: timeline + docs */}
        <div className="space-y-5 lg:col-span-2">
          {/* Stage timeline */}
          <div className="card p-5">
            <h3 className="mb-5 text-sm font-semibold text-navy-800">Stage Timeline</h3>
            <div className="relative">
              {claim.timeline.map((ev, i) => {
                const isLast = i === claim.timeline.length - 1;
                const color = stageColor(ev.stage);
                return (
                  <div key={ev.stage} className="flex gap-3.5">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                          ev.status === 'done'
                            ? 'bg-emerald-500 text-white'
                            : ev.status === 'current'
                              ? `${color.dot} text-white ring-4 ring-offset-2 ${color.ring}`
                              : 'bg-navy-100 text-navy-300'
                        }`}
                      >
                        {ev.status === 'done' ? (
                          <Check size={16} />
                        ) : ev.status === 'current' ? (
                          <Circle size={10} className="fill-white" />
                        ) : (
                          <Circle size={10} />
                        )}
                      </div>
                      {!isLast && (
                        <div
                          className={`my-1 w-0.5 flex-1 ${
                            ev.status === 'done' ? 'bg-emerald-300' : 'bg-navy-100'
                          }`}
                          style={{ minHeight: '36px' }}
                        />
                      )}
                    </div>
                    <div className={`flex-1 ${isLast ? '' : 'pb-5'}`}>
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold ${
                            ev.status === 'pending' ? 'text-navy-400' : 'text-navy-800'
                          }`}
                        >
                          {ev.stage}
                        </p>
                        {ev.status === 'current' && (
                          <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[10px] font-semibold text-navy-500">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-navy-400">{ev.note}</p>
                      {ev.timestamp && (
                        <p className="mt-0.5 text-[11px] text-navy-300">
                          {new Date(ev.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Documents */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
              <h3 className="text-sm font-semibold text-navy-800">Documents</h3>
              <span className="text-xs text-navy-400">{claim.documents.length} files</span>
            </div>
            <div className="divide-y divide-navy-50">
              {claim.documents.map((doc) => {
                const Icon = DOC_ICON[doc.type];
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-navy-50/50"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${DOC_COLOR[doc.type]}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy-800">{doc.name}</p>
                      <p className="text-xs text-navy-400">
                        {doc.pages} pages · {(doc.sizeKb / 1024).toFixed(1)} MB · {doc.uploadedAt}
                      </p>
                    </div>
                    <button className="rounded-lg p-2 text-navy-400 transition hover:bg-navy-100 hover:text-navy-700">
                      <FileText size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Claim info */}
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-navy-800">Claim Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-navy-400">Claim ID</p>
                <p className="font-semibold text-navy-800">{claim.id}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400">Type</p>
                <p className="font-semibold text-navy-800">{claim.type}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400">Adjuster</p>
                <p className="font-semibold text-navy-800">{claim.adjuster}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400">Filed Date</p>
                <p className="font-semibold text-navy-800">{claim.filedDate}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400">Closed Date</p>
                <p className="font-semibold text-navy-800">{claim.closedDate ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-navy-400">Amount</p>
                <p className="font-semibold text-navy-800">${claim.amount.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-navy-50 pt-4">
              <p className="text-xs text-navy-400">Description</p>
              <p className="mt-1 text-sm text-navy-700">{claim.description}</p>
            </div>
          </div>
        </div>

        {/* Right: AI chat */}
        <div className="lg:col-span-1">
          <div className="card flex h-[calc(100vh-220px)] min-h-[500px] flex-col overflow-hidden lg:sticky lg:top-4">
            {/* Chat header */}
            <div className="flex items-center gap-2.5 border-b border-navy-100 bg-gradient-to-r from-navy-700 to-navy-800 px-4 py-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500">
                <Brain size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI Assistant</h3>
                <p className="text-[11px] text-navy-200">Cited evidence from claim docs</p>
              </div>
            </div>

            {/* Recommend button */}
            <div className="border-b border-navy-100 px-3 py-3">
              <button
                onClick={handleRecommend}
                disabled={recommending}
                className="btn-secondary w-full !py-2 !text-xs"
              >
                {recommending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                Recommend next stage
              </button>
              {recommendation && (
                <div className="mt-2.5 rounded-lg border border-accent-200 bg-accent-50 px-3 py-2.5 animate-fade-in">
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={13} className="text-accent-600" />
                    <span className="text-xs font-bold text-accent-700">
                      Recommended: {recommendation.nextStage}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-accent-700/80">{recommendation.rationale}</p>
                  <div className="mt-2 flex gap-1.5">
                    <button
                      onClick={handleApprove}
                      className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-emerald-600 ring-1 ring-emerald-200 transition hover:bg-emerald-50"
                    >
                      <ThumbsUp size={11} /> Accept
                    </button>
                    <button
                      onClick={() => setRecommendation(null)}
                      className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-navy-400 ring-1 ring-navy-200 transition hover:bg-navy-50"
                    >
                      <ThumbsDown size={11} /> Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chat messages */}
            <div className="flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
              {claim.chat.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
                >
                  <div
                    className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-xs ${
                      msg.role === 'user'
                        ? 'bg-navy-700 text-white'
                        : 'bg-navy-50 text-navy-800'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-navy-200/30 pt-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">
                          Sources
                        </p>
                        {msg.citations.map((cit, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-1.5 text-[10px]"
                          >
                            <FileText size={10} className="shrink-0 opacity-70" />
                            <span className="font-medium">{cit.file}</span>
                            <span className="opacity-60">· p.{cit.page}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatSending && (
                <div className="flex justify-start animate-slide-in">
                  <div className="flex items-center gap-1.5 rounded-xl bg-navy-50 px-3.5 py-2.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-navy-400 animate-pulse-dot"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-navy-100 p-3">
              <div className="flex items-end gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about this claim…"
                  className="input !py-2 !text-xs"
                />
                <button
                  onClick={handleSend}
                  disabled={!chatInput.trim() || chatSending}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-700 text-white transition hover:bg-navy-800 disabled:opacity-50"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
