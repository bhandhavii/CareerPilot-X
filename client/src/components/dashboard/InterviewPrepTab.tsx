import React, { useState } from 'react';
import {
  BrainCircuit,
  Volume2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Send,
  CheckCircle2,
  HelpCircle,
  Mic,
} from 'lucide-react';
import { InterviewQuestion } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface InterviewModule {
  id: string;
  name: string;
  questions: InterviewQuestion[];
}

const INTERVIEW_CATALOG: InterviewModule[] = [
  {
    id: 'javascript',
    name: 'JavaScript & Web Runtime',
    questions: [
      {
        id: 'iq-js-1',
        role: 'Senior Frontend / Full-Stack',
        track: 'frontend',
        topic: 'Event Loop & Task Queuing',
        question: 'Explain the precise execution lifecycle between the Call Stack, Microtask queue, and Macrotask queue when handling Promises and timers.',
        suggestedPoints: [
          'V8 executes synchronous code on the call stack to completion.',
          'Resolved Promises and queueMicrotask callbacks are dispatched to the Microtask Queue.',
          'The event loop exhausts the entire Microtask queue before rendering or fetching the next Macrotask.',
          'Macrotasks include setTimeout, setInterval, setImmediate, and I/O callbacks.',
        ],
      },
      {
        id: 'iq-js-2',
        role: 'Frontend / Full-Stack',
        track: 'frontend',
        topic: 'Closures & Memory Management',
        question: 'What is a JavaScript closure, how is it created in memory, and how can careless closure usage lead to memory leaks?',
        suggestedPoints: [
          'A closure is the combination of a function bundled together with references to its surrounding lexical environment.',
          'Inner functions retain access to outer function variables even after the outer function has returned.',
          'Memory leaks happen when large objects or DOM references are captured in retained closures (e.g. uncleared event listeners or intervals).',
        ],
      },
    ],
  },
  {
    id: 'react',
    name: 'React 18 & Concurrent UI',
    questions: [
      {
        id: 'iq-react-1',
        role: 'React Engineer',
        track: 'frontend',
        topic: 'Fiber Architecture & Concurrency',
        question: 'How does React Fiber differ from the legacy stack reconciler, and how does it support interruptible rendering?',
        suggestedPoints: [
          'The legacy reconciler executed synchronously and recursively, freezing the browser frame if component trees were large.',
          'Fiber models components as a linked-list work-in-progress tree with lanes of scheduler priorities.',
          'High-priority updates (typing, user gestures) can pause and preempt low-priority background transitions.',
        ],
      },
    ],
  },
  {
    id: 'backend',
    name: 'Backend & Distributed Systems',
    questions: [
      {
        id: 'iq-be-1',
        role: 'Senior Backend Engineer',
        track: 'backend',
        topic: 'High-Concurrency Rate Limiting',
        question: 'How would you architect a distributed rate limiter across a cluster of 50 Node.js servers handling 500,000 requests per minute?',
        suggestedPoints: [
          'Avoid in-memory maps on single nodes due to cluster state desynchronization.',
          'Use Redis with sliding window log or token bucket algorithm implemented via atomic Lua scripts.',
          'Return standard HTTP headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After.',
          'Implement client IP hashing with fallbacks for reverse proxy X-Forwarded-For headers.',
        ],
      },
    ],
  },
  {
    id: 'behavioral',
    name: 'HR & Behavioral (STAR Method)',
    questions: [
      {
        id: 'iq-hr-1',
        role: 'Software Engineer',
        track: 'fullstack',
        topic: 'Conflict & Architecture Disagreements',
        question: 'Describe a situation where you strongly disagreed with a senior engineer or product manager on an architectural decision. How did you handle it?',
        suggestedPoints: [
          'Situation: Clearly state the engineering context and the conflicting proposals.',
          'Task: Frame the goal objectively around user impact, latency, or timeline.',
          'Action: Build an objective POC or benchmark metrics instead of subjective arguing; active listening.',
          'Result: The outcome, what was learned, and how team trust was maintained.',
        ],
      },
    ],
  },
];

export const InterviewPrepTab: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>(INTERVIEW_CATALOG[0].id);
  const [selectedQ, setSelectedQ] = useState<InterviewQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  const currentModule = INTERVIEW_CATALOG.find((m) => m.id === activeModule) || INTERVIEW_CATALOG[0];

  const handlePlayAudio = (text: string) => {
    cyberAudio.playClick();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleEvaluate = async () => {
    if (!selectedQ || !answerText.trim()) return;
    cyberAudio.playSuccess();
    setIsEvaluating(true);
    try {
      const res = await api.evaluateInterviewAnswer(selectedQ, answerText);
      setEvaluation(res);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-[.18em] text-[#8DA7FF] mb-2 font-semibold flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#B7FF32]" /> Interview Readiness
        </div>
        <h1 className="text-3xl md:text-4xl font-serif-title text-white">
          Technical Interview Studio<span className="text-[#B7FF32]">.</span>
        </h1>
        <p className="text-sm text-[#A8B0BC] mt-1.5 max-w-2xl leading-relaxed">
          Master high-stakes system design questions, core runtime internals, and behavioral STAR communication patterns.
        </p>
      </div>

      {/* Module Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {INTERVIEW_CATALOG.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              cyberAudio.playClick();
              setActiveModule(m.id);
              setSelectedQ(null);
              setEvaluation(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeModule === m.id
                ? 'bg-[#245BFF] text-white shadow-glow-blue'
                : 'bg-[#101722] border border-[#273244] text-[#A8B0BC] hover:border-[#536078]'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Questions List for Active Module */}
      <div className="space-y-4">
        {currentModule.questions.map((q) => {
          const isSelected = selectedQ?.id === q.id;

          return (
            <div
              key={q.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isSelected ? 'border-[#245BFF] bg-[#101722] shadow-glow-blue' : 'border-[#273244] bg-[#101722]/80 hover:border-[#536078]'
              }`}
            >
              <div className="p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#245BFF]/15 text-[#8DA7FF]">
                      {q.topic}
                    </span>
                    <span className="text-xs text-[#727E8F] font-mono">{q.role}</span>
                  </div>

                  <button
                    onClick={() => handlePlayAudio(q.question)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#151E2B] text-cyan-300 text-xs font-semibold hover:bg-cyan-950/40 transition self-start sm:self-auto"
                  >
                    <Volume2 size={13} />
                    <span>Listen</span>
                  </button>
                </div>

                <h3 className="text-base font-bold text-white leading-relaxed">
                  "{q.question}"
                </h3>

                {/* Key Architectural Talking Points */}
                <div className="p-4 rounded-xl bg-[#080B10] border border-[#273244] space-y-2">
                  <div className="text-[11px] font-mono font-bold text-[#B7FF32] uppercase">
                    Key Evaluation Talking Points
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#A8B0BC]">
                    {q.suggestedPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#245BFF] font-bold">✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      cyberAudio.playClick();
                      setSelectedQ(isSelected ? null : q);
                      setEvaluation(null);
                      setAnswerText('');
                    }}
                    className="cyber-button-primary px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-glow-blue"
                  >
                    {isSelected ? 'Close Practice Mode' : 'Practice Answering This Question'}
                  </button>
                </div>
              </div>

              {/* Interactive Answering Workspace */}
              {isSelected && (
                <div className="p-6 border-t border-[#273244] bg-[#090d1e] space-y-4 animate-fadeIn">
                  <div className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>Draft Your Technical Answer</span>
                    <span className="text-[11px] font-mono text-[#727E8F]">
                      Words: {answerText.trim().split(/\s+/).filter(Boolean).length}
                    </span>
                  </div>

                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Articulate your strategy, performance tradeoffs, and recovery mitigations..."
                    rows={5}
                    className="w-full p-4 rounded-xl bg-[#101722] border border-[#273244] text-xs text-white placeholder:text-[#536078] outline-none focus:border-[#245BFF] resize-none leading-relaxed"
                  />

                  <div className="flex justify-end gap-3">
                    <button
                      disabled={!answerText.trim() || isEvaluating}
                      onClick={handleEvaluate}
                      className="cyber-button-primary px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-glow-blue flex items-center gap-2 disabled:opacity-40"
                    >
                      <Send size={13} />
                      <span>{isEvaluating ? 'Evaluating Rubric...' : 'Submit to AI Rubric Evaluation'}</span>
                    </button>
                  </div>

                  {/* Rubric Scorecard */}
                  {evaluation && (
                    <div className="p-5 rounded-xl border border-cyan-500/35 bg-cyan-950/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-white">AI Rubric Evaluation Score</div>
                        <div className="text-xl font-mono font-bold text-cyan-300">{evaluation.score} / 100</div>
                      </div>
                      <p className="text-xs text-[#A8B0BC] leading-relaxed">{evaluation.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
