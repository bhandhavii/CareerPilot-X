import React, { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { CareerTrack, Question, AssessmentResult } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: CareerTrack;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  track,
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // Initialize questions
  useEffect(() => {
    if (isOpen) {
      const q = api.getQuestions(track);
      setQuestions(q);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setTimeLeft(300);
      setIsSubmitted(false);
      setResult(null);
      setTabSwitches(0);
    }
  }, [isOpen, track]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isSubmitted) return;
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
  }, [isOpen, isSubmitted]);

  // Tab switch detection (Exam integrity deterrent)
  useEffect(() => {
    if (!isOpen || isSubmitted) return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const next = prev + 1;
          setShowTabWarning(true);
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isOpen, isSubmitted]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted || !currentQ) return;
    cyberAudio.playClick();
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    cyberAudio.playSuccess();
    const res = await api.submitAssessment(track, selectedAnswers, questions);
    setResult(res);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl cyber-glass-glow rounded-3xl p-6 md:p-8 border border-cyan-500/40 shadow-glow-cyan max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold uppercase">
              {track} Track Mock Exam
            </span>
            {!isSubmitted && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch warning alert */}
        {showTabWarning && !isSubmitted && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Integrity Alert: Tab switch detected ({tabSwitches} time{tabSwitches > 1 ? 's' : ''}). Switching tabs is monitored during technical assessments.
              </span>
            </div>
            <button
              onClick={() => setShowTabWarning(false)}
              className="text-amber-400 font-bold hover:underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* QUESTION VIEW */}
        {!isSubmitted && currentQ && (
          <div className="py-6">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>QUESTION {currentIndex + 1} OF {questions.length}</span>
              <span className="text-cyan-400">{currentQ.topic}</span>
            </div>

            <h3 className="text-lg md:text-xl font-bold text-white mb-6 leading-snug">
              {currentQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-glow-cyan'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isSelected
                          ? 'bg-cyan-400 text-black'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Nav controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((p) => p - 1)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex((p) => p + 1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="cyber-button-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-glow-cyan flex items-center gap-1.5"
                >
                  <span>Submit Exam</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* RESULTS VIEW */}
        {isSubmitted && result && (
          <div className="py-6 space-y-6">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-3xl bg-cyan-950/60 border border-cyan-500/40 shadow-glow-cyan mb-4">
                <span className="text-5xl font-mono font-extrabold text-cyan-400">
                  {result.percentage}%
                </span>
              </div>
              <h3 className="text-2xl font-serif-title font-bold text-white mb-2">
                Assessment Complete!
              </h3>
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                {result.feedback}
              </p>
            </div>

            {/* Questions Review with Explanations */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider font-mono">
                Detailed Question Review
              </h4>
              {questions.map((q, qIdx) => {
                const userAns = selectedAnswers[q.id];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border ${
                      isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500/30'
                        : 'bg-rose-950/30 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 mb-2">
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="text-sm font-bold text-white">
                          {qIdx + 1}. {q.question}
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                          Correct: <span className="text-emerald-400 font-semibold">{q.options[q.correctAnswer]}</span>
                        </div>
                        {userAns !== undefined && !isCorrect && (
                          <div className="text-xs text-rose-300 mt-0.5">
                            Your answer: <span className="font-semibold">{q.options[userAns]}</span>
                          </div>
                        )}
                        <p className="text-xs text-slate-400 mt-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-cyan-400 font-mono font-semibold">Explanation: </span>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  const q = api.getQuestions(track);
                  setQuestions(q);
                  setCurrentIndex(0);
                  setSelectedAnswers({});
                  setTimeLeft(300);
                  setIsSubmitted(false);
                  setResult(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Mock Exam</span>
              </button>
              <button
                onClick={onClose}
                className="cyber-button-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-glow-cyan"
              >
                Done & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
