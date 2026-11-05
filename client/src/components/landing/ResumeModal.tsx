import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle, Sparkles, Upload } from 'lucide-react';
import { CareerTrack, ResumeAnalysisResult } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: CareerTrack;
}



export const ResumeModal: React.FC<ResumeModalProps> = ({
  isOpen,
  onClose,
  track,
}) => {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    cyberAudio.playSuccess();
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeResumeText(resumeText, track);
      setResult(res);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl cyber-glass-glow rounded-3xl p-6 md:p-8 border border-cyan-500/40 shadow-glow-cyan max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase">
              AI Resume & ATS Optimizer
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Target: {track.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-6 space-y-6">
          {!result ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Paste or Edit Resume Markdown / Text
                </span>

              </div>

              <div className="relative rounded-2xl bg-[#090d1e] border border-slate-700 p-4">
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={10}
                  placeholder="Paste your own resume text here…"
                  className="w-full bg-transparent font-mono text-xs text-cyan-200 outline-none resize-none leading-relaxed selection:bg-cyan-500 selection:text-black"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  disabled={!resumeText.trim() || isAnalyzing}
                  onClick={handleAnalyze}
                  className="cyber-button-primary px-7 py-3 rounded-xl text-white text-xs font-bold shadow-glow-cyan flex items-center gap-2 disabled:opacity-40"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
                      <span>Parsing Keywords & ATS Compatibility...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                      <span>Scan & Score Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-6">
              <div className="p-6 rounded-2xl cyber-glass border border-cyan-500/40 shadow-glow-cyan flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-cyan-950/80 border border-cyan-400 flex flex-col items-center justify-center shrink-0 shadow-glow-cyan">
                  <span className="text-3xl font-mono font-bold text-cyan-300">
                    {result.score}%
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">ATS Match</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    ATS Audit & Keyword Breakdown
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Detected vs Missing Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/30">
                  <div className="text-xs font-bold text-emerald-400 uppercase font-mono mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Keywords ({result.detectedSkills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.detectedSkills.map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-300 font-mono">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-amber-500/30">
                  <div className="text-xs font-bold text-amber-400 uppercase font-mono mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    High-Priority Additions ({result.missingKeywords.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((sk) => (
                      <span key={sk} className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300 font-mono">
                        +{sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/30 space-y-2">
                <div className="text-xs font-bold text-violet-300 uppercase font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
                  Tactical Resume Optimization Checklist
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {result.improvements.map((imp, idx) => (
                    <li key={idx}>• {imp}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                >
                  Edit Resume Again
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
