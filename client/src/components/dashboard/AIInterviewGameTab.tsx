import React, { useState } from 'react';
import {
  Gamepad2,
  Trophy,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Binary,
  Bug,
  Code2,
} from 'lucide-react';
import { cyberAudio } from '../../utils/audio';
import { api } from '../../services/api';

interface GameRound {
  id: number;
  name: string;
  type: 'mcq' | 'output' | 'debugging' | 'hr';
  prompt: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const GAME_ROUNDS: GameRound[] = [
  {
    id: 1,
    name: 'Round 1: Rapid-Fire Technical MCQ',
    type: 'mcq',
    prompt: 'In Node.js, what is the default size of the libuv worker thread pool used for filesystem and DNS lookups?',
    options: ['1 worker thread', '4 worker threads (UV_THREADPOOL_SIZE)', '16 worker threads', 'Unlimited dynamic threads'],
    correctAnswer: 1,
    explanation: 'libuv defaults to a pool of 4 worker threads, configurable via the UV_THREADPOOL_SIZE environment variable up to a maximum of 1024.',
  },
  {
    id: 2,
    name: 'Round 2: Output Prediction Sprint',
    type: 'output',
    prompt: 'What will be logged to the console by this snippet?',
    codeSnippet: `const a = [1, 2, 3];
const b = a;
b.push(4);
console.log(a.length);`,
    options: ['3', '4', 'undefined', 'Throws TypeError'],
    correctAnswer: 1,
    explanation: 'Arrays in JavaScript are reference types. Variable `b` copies the memory pointer of `a`. Modifying `b` mutates the same underlying array, so a.length is 4.',
  },
  {
    id: 3,
    name: 'Round 3: Live Bug Hunting',
    type: 'debugging',
    prompt: 'A junior engineer wrote this JWT verification middleware. What critical security vulnerability exists?',
    codeSnippet: `function verify(token) {
  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));
  return payload.userId; // Verification?
}`,
    options: [
      'atob is deprecated in Node.js',
      'The code merely decodes Base64 without verifying the cryptographic HMAC/RSA signature; an attacker can tamper with userId arbitrarily',
      'parts[1] is the header, not payload',
      'JSON.parse throws on all tokens',
    ],
    correctAnswer: 1,
    explanation: 'Base64 decoding does not verify authenticity. Without verifying the signature using jwt.verify() and a secret key, any client can forge credentials and impersonate admins.',
  },
  {
    id: 4,
    name: 'Round 4: Behavioral & Engineering Leadership',
    type: 'hr',
    prompt: 'In a production postmortem meeting after a 30-minute database outage, how do you communicate the incident effectively?',
    options: [
      'Assign blame directly to the junior engineer who ran the migration script',
      'Present a blameless root-cause analysis (RCA) focusing on missing migration safeguards, telemetry alerts, and automated rollback scripts',
      'Downplay the downtime to avoid questions from management',
      'Delete the incident logs to prevent audit inquiries',
    ],
    correctAnswer: 1,
    explanation: 'Top-tier engineering cultures mandate blameless postmortems. Failures are viewed as systemic issues in processes, test coverage, and deployment safeguards rather than individual operator fault.',
  },
];

export const AIInterviewGameTab: React.FC = () => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const currentRound = GAME_ROUNDS[currentRoundIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    cyberAudio.playClick();
    setSelectedAnswer(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswered(true);

    const isCorrect = selectedAnswer === currentRound.correctAnswer;
    if (isCorrect) {
      cyberAudio.playSuccess();
      setScore((s) => s + 25);
    }
  };

  const handleNextRound = () => {
    cyberAudio.playClick();
    if (currentRoundIdx < GAME_ROUNDS.length - 1) {
      setCurrentRoundIdx((p) => p + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsGameOver(true);
      // Award score XP
      const user = api.getCurrentUser();
      if (user) {
        api.updateProfileStats({ xp: (user.xp || 0) + score });
      }
    }
  };

  const restartGame = () => {
    cyberAudio.playClick();
    setCurrentRoundIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setIsGameOver(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[.18em] text-[#8DA7FF] mb-2 font-semibold flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#B7FF32]" /> Interactive Simulation
          </div>
          <h1 className="text-3xl md:text-4xl font-serif-title text-white">
            AI Interview Simulation Game<span className="text-[#B7FF32]">.</span>
          </h1>
          <p className="text-sm text-[#A8B0BC] mt-1.5 max-w-2xl leading-relaxed">
            Gamified multi-round interview gauntlet: MCQs, output analysis, bug hunting, and engineering leadership.
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#101722] border border-[#273244] shrink-0">
          <Trophy size={18} className="text-[#B7FF32]" />
          <div className="text-xs font-mono">
            <div className="font-bold text-white">Score: {score} / 100</div>
            <div className="text-[10px] text-[#727E8F]">Round {Math.min(currentRoundIdx + 1, GAME_ROUNDS.length)} of {GAME_ROUNDS.length}</div>
          </div>
        </div>
      </div>

      {/* GAME IN PROGRESS */}
      {!isGameOver ? (
        <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono border-b border-[#273244] pb-3">
            <span className="text-[#8DA7FF] uppercase font-bold">{currentRound.name}</span>
            <span className="px-3 py-1 rounded-full bg-[#245BFF]/15 text-[#8DA7FF] font-bold">
              +25 XP Points
            </span>
          </div>

          <h2 className="text-base md:text-lg font-bold text-white leading-relaxed">
            {currentRound.prompt}
          </h2>

          {/* Code Snippet Box */}
          {currentRound.codeSnippet && (
            <div className="rounded-xl bg-[#080B10] border border-[#273244] p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-cyan-200 leading-relaxed">
                <code>{currentRound.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {currentRound.options.map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === currentRound.correctAnswer;

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-4 rounded-xl border text-left text-xs transition flex items-start gap-3 ${
                    isAnswered
                      ? isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                        : isSelected
                        ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                        : 'bg-[#080B10] border-[#273244] text-[#727E8F]'
                      : isSelected
                      ? 'bg-[#245BFF]/25 border-[#245BFF] text-white shadow-glow-blue'
                      : 'bg-[#080B10] border-[#273244] text-[#A8B0BC] hover:border-[#536078]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                    isSelected ? 'bg-[#245BFF] text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {isAnswered && (
            <div className={`p-4 rounded-xl text-xs leading-relaxed border ${
              selectedAnswer === currentRound.correctAnswer
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}>
              <div className="font-bold mb-1">
                {selectedAnswer === currentRound.correctAnswer ? '✓ Round Cleared!' : '✗ Round Failed'}
              </div>
              <div>{currentRound.explanation}</div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex justify-end gap-3 pt-2">
            {!isAnswered ? (
              <button
                disabled={selectedAnswer === null}
                onClick={handleConfirmAnswer}
                className="cyber-button-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow-blue disabled:opacity-40"
              >
                Confirm Round Answer
              </button>
            ) : (
              <button
                onClick={handleNextRound}
                className="cyber-button-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow-blue flex items-center gap-1.5"
              >
                <span>{currentRoundIdx < GAME_ROUNDS.length - 1 ? 'Advance to Next Round' : 'Finish Simulation'}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* GAME OVER SCORECARD */
        <div className="rounded-2xl border border-[#273244] bg-[#101722] p-8 md:p-12 text-center space-y-6">
          <div className="inline-flex p-5 rounded-3xl bg-[#245BFF]/15 border border-[#245BFF]/30 shadow-glow-blue">
            <span className="text-5xl md:text-6xl font-mono font-extrabold text-[#8DA7FF]">
              {score} / 100
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-serif-title text-white">
              Simulation Completed!
            </h2>
            <p className="text-sm text-[#A8B0BC] max-w-lg mx-auto leading-relaxed">
              {score >= 75
                ? 'Outstanding performance! You displayed strong technical aptitude, clear diagnostic precision, and sound systems thinking.'
                : 'Good effort! Review the missed diagnostic rounds in the Practice Arena to reinforce your runtime fundamentals.'}
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={restartGame}
              className="cyber-button-primary px-6 py-3 rounded-xl text-xs font-bold shadow-glow-blue flex items-center gap-2"
            >
              <RotateCcw size={14} />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
