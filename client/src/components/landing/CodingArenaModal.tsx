import React, { useState } from 'react';
import { X, Play, CheckCircle2, XCircle, Lightbulb, Terminal, RotateCcw } from 'lucide-react';
import { CodingChallenge } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface CodingArenaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodingArenaModal: React.FC<CodingArenaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const challenges = api.getCodingChallenges();
  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge>(challenges[0]);
  const [code, setCode] = useState(challenges[0].starterCode);
  const [showHint, setShowHint] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    passed: boolean;
    logs: string[];
    results: { testIndex: number; passed: boolean; output: string; expected: string }[];
  } | null>(null);

  if (!isOpen) return null;

  const handleRunCode = () => {
    cyberAudio.playClick();
    const res = api.runCodeSandbox(code, selectedChallenge);
    setExecutionResult(res);
    if (res.passed) {
      cyberAudio.playSuccess();
    }
  };

  const handleSelectChallenge = (c: CodingChallenge) => {
    setSelectedChallenge(c);
    setCode(c.starterCode);
    setExecutionResult(null);
    setShowHint(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl cyber-glass-glow rounded-3xl p-6 md:p-8 border border-violet-500/40 shadow-glow-violet max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-violet-950/70 border border-violet-500/40 text-violet-300 text-xs font-mono font-bold uppercase">
              Coding Arena
            </span>
            <div className="flex gap-2">
              {challenges.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectChallenge(c)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                    selectedChallenge.id === c.id
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {c.title}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-6 overflow-y-auto flex-1">
          {/* Left Column: Challenge Description */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-mono font-bold">
                  {selectedChallenge.difficulty}
                </span>
                <span className="text-xs text-slate-400 font-mono uppercase">
                  {selectedChallenge.track}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {selectedChallenge.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedChallenge.description}
              </p>
            </div>

            {/* Test Cases Preview */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="text-xs font-mono font-bold text-cyan-400 mb-2 uppercase">
                Expected Assertions
              </div>
              <div className="space-y-2 text-xs">
                {selectedChallenge.testCases.map((tc, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-black/40 border border-slate-800 font-mono">
                    <div className="text-slate-400 text-[10px]">{tc.description}</div>
                    <div className="text-cyan-300 mt-1">Input: {tc.input}</div>
                    <div className="text-emerald-400">Output: {tc.expectedOutput}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hint Box */}
            <div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-semibold"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Architectural Hints' : 'Reveal Architectural Hints'}</span>
              </button>
              {showHint && (
                <div className="mt-2 p-3 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-slate-300 space-y-1">
                  {selectedChallenge.hints.map((h, i) => (
                    <div key={i}>• {h}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Code Editor & Execution Console */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="relative rounded-2xl bg-[#090d1e] border border-cyan-500/20 overflow-hidden flex-1 flex flex-col shadow-inner">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  solution.js
                </span>
                <button
                  onClick={() => setCode(selectedChallenge.starterCode)}
                  className="flex items-center gap-1 text-[11px] hover:text-cyan-400"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              {/* Monospace Code Editor Area */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                rows={12}
                className="w-full p-4 bg-transparent font-mono text-xs text-cyan-200 outline-none resize-none leading-relaxed selection:bg-cyan-500 selection:text-black flex-1"
              />
            </div>

            {/* Execution Console Output */}
            {executionResult && (
              <div
                className={`p-4 rounded-2xl border text-xs font-mono ${
                  executionResult.passed
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold mb-2">
                  {executionResult.passed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>All Test Cases Passed! (+200 XP Awarded)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Test Failures Detected</span>
                    </>
                  )}
                </div>

                <div className="space-y-1.5 text-[11px]">
                  {executionResult.results.map((r) => (
                    <div key={r.testIndex} className="p-2 rounded bg-black/50 border border-slate-800">
                      <div>Test #{r.testIndex}: {r.passed ? 'PASSED ✓' : 'FAILED ✗'}</div>
                      <div>Expected: {r.expected}</div>
                      <div>Received: {r.output}</div>
                    </div>
                  ))}
                  {executionResult.logs.map((log, idx) => (
                    <div key={idx} className="text-slate-400">{log}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleRunCode}
                className="cyber-button-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-glow-cyan flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Run Code & Verify</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
