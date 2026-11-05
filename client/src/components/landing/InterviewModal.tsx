import React, { useState } from 'react';
import { X, Volume2, Mic, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { InterviewQuestion } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InterviewModal: React.FC<InterviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  const questions = api.getInterviewQuestions();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<{
    score: number;
    breakdown: { technical: number; communication: number; architecture: number };
    strengths: string[];
    improvements: string[];
    feedback: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentQ: InterviewQuestion = questions[currentQIndex];

  // Text-To-Speech SpeechSynthesis for question playback
  const handlePlayQuestionAudio = () => {
    cyberAudio.playClick();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQ.question);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleEvaluate = async () => {
    if (!answer.trim()) return;
    cyberAudio.playSuccess();
    setIsEvaluating(true);
    try {
      const res = await api.evaluateInterviewAnswer(currentQ, answer);
      setEvaluation(res);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl cyber-glass-glow rounded-3xl p-6 md:p-8 border border-cyan-500/40 shadow-glow-cyan max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase">
              AI Interview Studio
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {currentQ.role}
            </span>
          </div>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Area */}
        <div className="py-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-cyan-500/20 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">
                {currentQ.topic}
              </span>
              <button
                onClick={handlePlayQuestionAudio}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold transition-all shadow-glow-cyan"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen to Question</span>
              </button>
            </div>
            <h3 className="text-base md:text-lg font-bold text-white leading-relaxed">
              "{currentQ.question}"
            </h3>
          </div>

          {/* User Answer Input */}
          {!evaluation ? (
            <div className="space-y-4">
              <div className="relative rounded-2xl bg-[#090d1e] border border-slate-700 p-4">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Articulate your technical strategy, architectural tradeoffs, and performance considerations..."
                  rows={6}
                  className="w-full bg-transparent text-sm text-slate-200 outline-none resize-none leading-relaxed placeholder:text-slate-500 font-sans"
                />
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400 font-mono">
                  <span>Words: {answer.trim().split(/\s+/).filter(Boolean).length}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-violet-400 flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5" /> Voice Ready
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => {
                    setCurrentQIndex((p) => (p + 1) % questions.length);
                    setAnswer('');
                    setEvaluation(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Switch to Next Scenario →
                </button>

                <button
                  disabled={!answer.trim() || isEvaluating}
                  onClick={handleEvaluate}
                  className="cyber-button-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-glow-cyan flex items-center gap-2 disabled:opacity-40"
                >
                  {isEvaluating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Scoring Rubric...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for AI Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Evaluation Results */
            <div className="space-y-6 pt-2">
              <div className="p-6 rounded-2xl cyber-glass border border-cyan-500/40 shadow-glow-cyan flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-cyan-950/80 border border-cyan-400 flex flex-col items-center justify-center shrink-0 shadow-glow-cyan">
                  <span className="text-3xl font-mono font-bold text-cyan-300">
                    {evaluation.score}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Rubric Score</span>
                </div>
                <div className="flex-1 text-left">
                  <h4 className="text-base font-bold text-white mb-1">
                    AI Evaluation & Rubric Feedback
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {evaluation.feedback}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <div className="text-xs font-bold text-cyan-400">{evaluation.breakdown.technical}%</div>
                      <div className="text-[10px] text-slate-400">Technical</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <div className="text-xs font-bold text-violet-400">{evaluation.breakdown.architecture}%</div>
                      <div className="text-[10px] text-slate-400">Architecture</div>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <div className="text-xs font-bold text-fuchsia-400">{evaluation.breakdown.communication}%</div>
                      <div className="text-[10px] text-slate-400">Clarity</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <div className="text-xs font-bold text-emerald-300 uppercase mb-2 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strengths Identified
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30">
                  <div className="text-xs font-bold text-violet-300 uppercase mb-2 flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-3.5 h-3.5" /> High-Impact Improvements
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5">
                    {evaluation.improvements.map((imp, i) => (
                      <li key={i}>• {imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setEvaluation(null);
                    setAnswer('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                >
                  Try Another Answer
                </button>
                <button
                  onClick={onClose}
                  className="cyber-button-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-glow-cyan"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
