import { useEffect, useRef, useState } from 'react';
import {
  Brain,
  Send,
  X,
  FileText,
  Sparkles,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { sendGlobalChatMessage, getGlobalChatSuggestions } from '@/api';
import { GlobalChatMessage } from '@/types';

interface Props {
  onOpenClaim: (id: string) => void;
}

const WELCOME: GlobalChatMessage = {
  id: 'global-welcome',
  role: 'assistant',
  text: "Hi! I'm your ClaimsIQ assistant. I can answer questions about any claim across the system — ask me about specific claims, claimants, stages, adjusters, or aggregate stats.",
  timestamp: new Date().toISOString(),
};

export default function GlobalChatAgent({ onOpenClaim }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<GlobalChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const suggestions = getGlobalChatSuggestions();

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, sending, open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    const userMsg: GlobalChatMessage = {
      id: `global-u-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setSending(true);
    setHasInteracted(true);
    try {
      const reply = await sendGlobalChatMessage(trimmed);
      setMessages((m) => [...m, reply]);
    } finally {
      setSending(false);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME]);
    setHasInteracted(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`group fixed bottom-5 right-5 z-40 flex items-center gap-2.5 rounded-full shadow-cardLg transition-all duration-300 lg:bottom-6 lg:right-6 ${
          open
            ? 'bg-navy-800 px-3.5 py-3 text-white'
            : 'bg-navy-700 px-4 py-3.5 text-white hover:bg-navy-800 hover:shadow-xl'
        }`}
        aria-label="Open AI assistant"
      >
        {open ? (
          <X size={22} />
        ) : (
          <>
            <div className="relative">
              <Brain size={22} />
              {!hasInteracted && (
                <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-500" />
                </span>
              )}
            </div>
            <span className="text-sm font-semibold">Ask AI</span>
          </>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-3 z-40 flex h-[min(560px,calc(100vh-7rem))] w-[calc(100vw-1.5rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-navy-200 bg-white shadow-cardLg animate-fade-in lg:right-6 lg:bottom-24">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-navy-800 to-navy-900 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-500 shadow-sm">
                <Brain size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">ClaimsIQ Assistant</h3>
                <p className="text-[11px] text-navy-300">Ask about any claim</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-navy-300 transition hover:bg-navy-700/60 hover:text-white"
            >
              <Trash2 size={12} /> Clear
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3.5 py-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
              >
                <div
                  className={`max-w-[92%] rounded-xl px-3.5 py-2.5 text-xs ${
                    msg.role === 'user'
                      ? 'bg-navy-700 text-white'
                      : 'bg-navy-50 text-navy-800'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                  {/* Citation sources */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-navy-200/40 pt-2">
                      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide opacity-60">
                        <FileText size={10} /> Sources
                      </p>
                      {msg.citations.map((cit, i) => (
                        <button
                          key={i}
                          onClick={() => onOpenClaim(cit.claimId)}
                          className="flex w-full items-center gap-1.5 rounded-md bg-white/70 px-1.5 py-1 text-left text-[10px] transition hover:bg-white"
                        >
                          <FileText size={10} className="shrink-0 opacity-70" />
                          <span className="truncate font-medium">{cit.file}</span>
                          <span className="opacity-50">· p.{cit.page}</span>
                          <ArrowRight size={10} className="ml-auto shrink-0 opacity-50" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick-open claim links */}
                  {msg.claimIds && msg.claimIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 border-t border-navy-200/40 pt-2">
                      {msg.claimIds.slice(0, 6).map((cid) => (
                        <button
                          key={cid}
                          onClick={() => onOpenClaim(cid)}
                          className="rounded-md bg-navy-700/10 px-2 py-0.5 text-[10px] font-semibold text-navy-700 transition hover:bg-navy-700/20"
                        >
                          {cid}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
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
          </div>

          {/* Suggestions */}
          {!hasInteracted && (
            <div className="border-t border-navy-100 px-3.5 py-2.5">
              <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-navy-400">
                <Sparkles size={10} /> Try asking
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-navy-200 bg-white px-2.5 py-1 text-[11px] font-medium text-navy-600 transition hover:border-navy-400 hover:bg-navy-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-navy-100 p-3">
            <div className="flex items-end gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about any claim…"
                className="input !py-2 !text-xs"
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || sending}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-700 text-white transition hover:bg-navy-800 disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
