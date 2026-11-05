import React, { useState, useEffect } from 'react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Target,
  Trophy,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { CareerTrack, Question, AssessmentResult } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface SkillAssessmentTabProps {
  initialTrack?: CareerTrack;
  onAssessmentCompleted?: (result: AssessmentResult) => void;
}

export const SkillAssessmentTab: React.FC<SkillAssessmentTabProps> = ({
  initialTrack = 'fullstack',
  onAssessmentCompleted,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<CareerTrack>(initialTrack);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [inProgress, setInProgress] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const startExam = () => {
    cyberAudio.playClick();
    const q = api.getQuestions(selectedTrack);
    setQuestions(q);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setTimeLeft(300);
    setIsSubmitted(false);
    setResult(null);
    setTabSwitches(0);
    setInProgress(true);
  };

  useEffect(() => {
    if (!inProgress || isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [inProgress, isSubmitted]);

  // Anti-cheat detection
  useEffect(() => {
    if (!inProgress || isSubmitted) return;
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches((p) => p + 1);
        setShowWarning(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [inProgress, isSubmitted]);

  const handleSelectOption = (idx: number) => {
    if (isSubmitted || !questions[currentIndex]) return;
    cyberAudio.playClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [questions[currentIndex].id]: idx,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    cyberAudio.playSuccess();
    const res = await api.submitAssessment(selectedTrack, selectedAnswers, questions);
    setResult(res);
    setIsSubmitted(true);
    setInProgress(false);
    if (onAssessmentCompleted) onAssessmentCompleted(res);
  };

  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // LOBBY / PRE-EXAM VIEW
  if (!inProgress && !isSubmitted) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-[#245BFF]/15 text-[#8DA7FF] mb-2">
            <Target size={28} />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif-title text-white">
            AI Skill Assessment<span className="text-[#B7FF32]">.</span>
          </h1>
          <p className="text-sm text-[#A8B0BC] max-w-xl mx-auto leading-relaxed">
            Take a 5-minute timed technical assessment. We evaluate core programming fundamentals, runtime architecture, and system concepts to benchmark your employability readiness score.
          </p>
        </div>

        {/* Track Selection */}
        <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Select Assessment Track
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { id: 'frontend', name: 'Frontend', desc: 'HTML, CSS, React, JS Engine' },
              { id: 'backend', name: 'Backend', desc: 'Node.js, Express, DBs, Auth' },
              { id: 'fullstack', name: 'Full-Stack', desc: 'Architecture, APIs, DevOps' },
              { id: 'dsa', name: 'DSA', desc: 'Big-O, Arrays, Trees, Sorting' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTrack(t.id as CareerTrack)}
                className={`p-4 rounded-xl border text-left transition ${
                  selectedTrack === t.id
                    ? 'bg-[#245BFF]/20 border-[#245BFF] text-white shadow-glow-blue'
                    : 'bg-[#080B10] border-[#273244] text-[#A8B0BC] hover:border-[#536078]'
                }`}
              >
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-[11px] text-[#727E8F] mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Exam Protocol Guidelines */}
        <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#8DA7FF]">
            <ShieldAlert size={16} /> Exam Integrity Protocol
          </div>
          <ul className="space-y-2 text-xs text-[#A8B0BC]">
            <li className="flex items-start gap-2">
              <span className="text-[#8DA7FF]">•</span>
              <span><strong>5-Minute Strict Countdown:</strong> Incomplete submissions are automatically evaluated when timer reaches 00:00.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8DA7FF]">•</span>
              <span><strong>Tab-Switch Monitoring:</strong> Switching browser tabs is logged as an integrity alert.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8DA7FF]">•</span>
              <span><strong>Dynamic Adaptation:</strong> Scoring directly updates your Career Readiness Index and adjusts your roadmap priority topics.</span>
            </li>
          </ul>

          <div className="pt-3">
            <button
              onClick={startExam}
              className="cyber-button-primary w-full py-4 rounded-xl text-sm font-bold shadow-glow-blue flex items-center justify-center gap-2"
            >
              <span>Begin {selectedTrack.toUpperCase()} Assessment</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EXAM IN PROGRESS VIEW
  if (inProgress && currentQ) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
        {/* Header with Timer & Progress */}
        <div className="p-4 rounded-2xl border border-[#273244] bg-[#101722] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#245BFF]/15 text-[#8DA7FF] uppercase">
              {selectedTrack} Assessment
            </span>
            <span className="text-xs font-mono text-[#727E8F]">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#080B10] border border-[#273244] text-xs font-mono text-cyan-300">
            <Clock size={14} className="text-cyan-400" />
            <span>{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Tab Switch Alert */}
        {showWarning && (
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-400 shrink-0" />
              <span>Integrity Notice: Tab switch detected ({tabSwitches} time{tabSwitches > 1 ? 's' : ''}). Remain focused on the assessment.</span>
            </div>
            <button onClick={() => setShowWarning(false)} className="text-amber-400 font-bold hover:underline">Dismiss</button>
          </div>
        )}

        {/* Question Card */}
        <div className="p-6 md:p-8 rounded-2xl border border-[#273244] bg-[#101722] space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-[#727E8F]">
            <span className="text-[#8DA7FF]">{currentQ.topic}</span>
            <span className="capitalize">{currentQ.difficulty} Difficulty</span>
          </div>

          <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
            {currentQ.question}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl border text-left text-xs md:text-sm transition flex items-start gap-3 ${
                    isSelected
                      ? 'bg-[#245BFF]/25 border-[#245BFF] text-white shadow-glow-blue'
                      : 'bg-[#080B10] border-[#273244] text-[#A8B0BC] hover:border-[#536078]'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                    isSelected ? 'bg-[#245BFF] text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#273244]">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((p) => p - 1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#727E8F] hover:text-white disabled:opacity-30"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((p) => p + 1)}
                className="px-5 py-2.5 rounded-xl bg-[#151E2B] border border-[#273244] text-white text-xs font-semibold hover:border-[#8DA7FF] transition flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="cyber-button-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow-blue flex items-center gap-2"
              >
                <CheckCircle2 size={15} />
                <span>Submit & Complete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RESULTS VIEW
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {result && (
        <>
          <div className="p-8 rounded-2xl border border-[#273244] bg-[#101722] text-center space-y-4">
            <div className="inline-flex p-5 rounded-3xl bg-[#245BFF]/15 border border-[#245BFF]/30 shadow-glow-blue">
              <span className="text-5xl md:text-6xl font-mono font-extrabold text-[#8DA7FF]">
                {result.percentage}%
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif-title text-white">
              Assessment Completed!
            </h2>
            <p className="text-sm text-[#A8B0BC] max-w-xl mx-auto leading-relaxed">
              {result.feedback}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#B7FF32]/15 text-[#B7FF32] border border-[#B7FF32]/30">
                Score: {result.score} / {result.total} Correct
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#245BFF]/15 text-[#8DA7FF] border border-[#245BFF]/30">
                XP Earned: +{result.score * 50} XP
              </span>
            </div>
          </div>

          {/* Question Breakdown with In-Depth Explanations */}
          <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Detailed Question Analysis
            </h3>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAns = selectedAnswers[q.id];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border ${
                      isCorrect
                        ? 'bg-emerald-950/20 border-emerald-500/30'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1.5 flex-1">
                        <div className="text-sm font-semibold text-white">
                          {idx + 1}. {q.question}
                        </div>
                        <div className="text-xs text-emerald-300">
                          Correct Answer: <span className="font-semibold">{q.options[q.correctAnswer]}</span>
                        </div>
                        {userAns !== undefined && !isCorrect && (
                          <div className="text-xs text-rose-300">
                            Your Choice: <span className="font-semibold">{q.options[userAns]}</span>
                          </div>
                        )}
                        <p className="text-xs text-[#A8B0BC] bg-[#080B10] p-3 rounded-lg border border-[#273244] mt-2">
                          <strong className="text-[#8DA7FF]">Architectural Rationale: </strong>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={startExam}
              className="px-5 py-2.5 rounded-xl border border-[#273244] bg-[#151E2B] text-xs font-semibold text-white hover:border-[#8DA7FF] transition flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Retake Assessment</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
