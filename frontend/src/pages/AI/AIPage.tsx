import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import {
  Sparkles,
  Send,
  FileCheck2,
  Users,
  Shield,
  ExternalLink,
  Bot,
  User,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const AIPage: React.FC = () => {
  const {
    aiMessages,
    isAILoading,
    askAI,
    selectEntity,
    selectEvidence,
    navigate,
    currentCaseId,
  } = useInvestigation();

  const [inputPrompt, setInputPrompt] = useState('');

  const suggestedPrompts = [
    'Summarize the strongest connections around Viktor V. Rao',
    'Why was this relationship between Case 101 and Case 205 prioritized?',
    'Identify potential gaps in evidence or unverified witnesses',
    'Detect encoded communication or financial structuring patterns',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isAILoading) return;
    askAI(inputPrompt);
    setInputPrompt('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 p-6 max-w-5xl mx-auto text-white">
      {/* Top Header */}
      <div className="shrink-0 flex items-center justify-between border-b border-white/5 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-purple-400 uppercase">
            <Sparkles size={13} />
            <span>EXPLAINABLE INVESTIGATION REASONING COPILOT</span>
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white uppercase mt-1">
            AI Investigation Assistant
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            Grounded reasoning anchored strictly to ingested case documents, extracted entities, and evidence citations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-purple-950/60 border border-purple-800/40 text-purple-300">
            SCOPE: {currentCaseId}
          </span>
        </div>
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div className="shrink-0 flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
        <span className="text-[10px] text-white/40 uppercase tracking-wider shrink-0">Inquiries:</span>
        {suggestedPrompts.map((sp, idx) => (
          <button
            key={idx}
            onClick={() => askAI(sp)}
            className="shrink-0 px-3 py-1 text-xs bg-white/[0.03] hover:bg-purple-950/50 hover:text-purple-200 border border-white/10 hover:border-purple-600/50 rounded-lg text-white/70 transition"
          >
            {sp}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10">
        {aiMessages.map((msg) => {
          const isUser = msg.sender === 'USER';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-purple-950/70 border border-purple-600/50 flex items-center justify-center text-purple-300 shrink-0 mt-0.5 shadow-sm">
                  <Sparkles size={16} />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-2xl border space-y-3 ${
                  isUser
                    ? 'bg-purple-950/40 border-purple-700/50 text-white rounded-br-none'
                    : 'bg-[#0E1118] border-white/10 text-white/90 rounded-bl-none shadow-xl'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                  <span className="font-semibold tracking-wider font-mono">
                    {isUser ? 'ANALYST PROMPT' : 'INVESTIGATION REASONING'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

                {/* Evidence Citations Footnote */}
                {msg.evidenceCitations && msg.evidenceCitations.length > 0 && (
                  <div className="pt-2.5 border-t border-white/10 space-y-1.5">
                    <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1">
                      <FileCheck2 size={11} />
                      <span>Forensic Evidence Grounding</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.evidenceCitations.map((evId) => (
                        <button
                          key={evId}
                          onClick={() => {
                            selectEvidence(evId);
                            navigate(`/evidence/${evId}`);
                          }}
                          className="px-2 py-0.5 text-[10px] bg-teal-950/60 hover:bg-teal-900/80 border border-teal-700/50 text-teal-300 rounded font-mono flex items-center gap-1 transition"
                        >
                          <span>{evId}</span>
                          <ExternalLink size={9} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked Entities Mentioned */}
                {msg.linkedEntityIds && msg.linkedEntityIds.length > 0 && (
                  <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-white/40">
                    <Users size={10} />
                    <span>Entities Mentioned:</span>
                    <div className="flex flex-wrap gap-1">
                      {msg.linkedEntityIds.map((entId) => (
                        <button
                          key={entId}
                          onClick={() => {
                            selectEntity(entId);
                            navigate(`/entities/${entId}`);
                          }}
                          className="text-purple-300 hover:underline font-mono"
                        >
                          {entId}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white/80 shrink-0 mt-0.5">
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}

        {isAILoading && (
          <div className="flex gap-3 text-xs justify-start">
            <div className="w-8 h-8 rounded-lg bg-purple-950/70 border border-purple-600/50 flex items-center justify-center text-purple-300 shrink-0 animate-pulse">
              <Sparkles size={16} />
            </div>
            <div className="p-4 rounded-2xl bg-[#0E1118] border border-white/10 text-white/60 space-y-2 rounded-bl-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                <span className="text-purple-300 font-mono text-[11px]">
                  Correlating evidence documents & path weights...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="shrink-0 mt-4 relative">
        <div className="relative">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask AI to trace links, detect contradictions, or summarize evidence..."
            className="w-full pl-4 pr-24 py-3 bg-[#0E1118] border border-white/15 focus:border-purple-500 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none shadow-2xl transition"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isAILoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Analyze</span>
            <Send size={12} />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-white/30 px-1 mt-2">
          <span>Explainable Reasoning Standard: AI suggests leads. Investigator verifies evidence.</span>
          <span>Target Case: {currentCaseId}</span>
        </div>
      </form>
    </div>
  );
};
