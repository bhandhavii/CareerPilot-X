import React, { useState } from 'react';
import {
  Code2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  RotateCcw,
  Bug,
  Binary,
  Lightbulb,
  ArrowRight,
  Target,
} from 'lucide-react';
import { CareerTrack } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

type ArenaSection = 'mcq' | 'output' | 'debugging' | 'timed';

interface PracticeItem {
  id: string;
  type: ArenaSection;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prompt: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  brokenCode?: string;
  solutionCode?: string;
}

const PRACTICE_BANK: PracticeItem[] = [
  // Output Prediction
  {
    id: 'out-1',
    type: 'output',
    topic: 'Event Loop Microtasks',
    difficulty: 'Intermediate',
    prompt: 'What is printed to the console when the following code executes?',
    codeSnippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
    options: ['1, 2, 3, 4', '1, 4, 3, 2', '1, 4, 2, 3', '3, 1, 4, 2'],
    correctAnswer: 1,
    explanation: 'Synchronous code runs first (1, 4). Next, the microtask queue (Promise.then) is completely exhausted (3). Finally, the macrotask queue (setTimeout callback) executes (2). Output: 1, 4, 3, 2.',
  },
  {
    id: 'out-2',
    type: 'output',
    topic: 'Closures & Var Scope',
    difficulty: 'Beginner',
    prompt: 'What will be output by this loop?',
    codeSnippet: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 50);
}`,
    options: ['0, 1, 2', '3, 3, 3', 'undefined, undefined, undefined', '0, 0, 0'],
    correctAnswer: 1,
    explanation: '`var` is function-scoped rather than block-scoped. By the time the setTimeout callbacks execute 50ms later, the loop has completed and `i` has incremented to 3. Each closure references the same outer variable `i`.',
  },

  // Debugging
  {
    id: 'deb-1',
    type: 'debugging',
    topic: 'React State Mutation Bug',
    difficulty: 'Intermediate',
    prompt: 'Identify the bug that prevents React from re-rendering the updated list.',
    codeSnippet: `function ItemList() {
  const [items, setItems] = useState(['Apple', 'Banana']);

  const addItem = () => {
    items.push('Orange'); // BUG HERE
    setItems(items);
  };

  return <div>{items.length}</div>;
}`,
    options: [
      'Items state must be an object instead of an array',
      'Directly mutating state with items.push() fails React shallow comparison (items === items); state should be updated immutably with [...items, "Orange"]',
      'The component needs a key prop on the root div',
      'useState does not support arrays',
    ],
    correctAnswer: 1,
    explanation: 'React compares state references using Object.is. Mutating the existing array in-place does not alter the reference pointer, causing React to skip re-rendering. Creating a new array `[...items, "Orange"]` creates a new reference.',
  },
  {
    id: 'deb-2',
    type: 'debugging',
    topic: 'Express Async Error Handling',
    difficulty: 'Advanced',
    prompt: 'Why does this asynchronous Express route handler crash the server on database error instead of returning HTTP 500?',
    codeSnippet: `app.get('/users/:id', async (req, res, next) => {
  const user = await db.find(req.params.id);
  res.json(user);
});`,
    options: [
      'Async route handlers are forbidden in Express',
      'In Express 4, unhandled promise rejections in async routes are not passed to next(err) unless wrapped in a try/catch block or express-async-errors',
      'req.params cannot be used with async/await',
      'res.json must be awaited',
    ],
    correctAnswer: 1,
    explanation: 'Express 4 does not automatically catch rejected Promises from async functions. Without try/catch passing the error to `next(err)`, it results in an unhandledRejection error that crashes the Node process.',
  },

  // MCQs
  {
    id: 'mcq-1',
    type: 'mcq',
    topic: 'Database Indexing',
    difficulty: 'Intermediate',
    prompt: 'When indexing a MongoDB collection with `{ status: 1, createdAt: -1 }`, which query can NOT utilize the index prefix?',
    options: [
      'db.orders.find({ status: "active" })',
      'db.orders.find({ status: "pending", createdAt: { $gt: date } })',
      'db.orders.find({ createdAt: { $gt: date } })',
      'db.orders.find({ status: "completed" }).sort({ createdAt: -1 })',
    ],
    correctAnswer: 2,
    explanation: 'Compound indexes can only be used from left to right (index prefix). Searching solely on `createdAt` skips the lead field `status`, forcing MongoDB to perform an unindexed collection scan.',
  },
  {
    id: 'mcq-2',
    type: 'mcq',
    topic: 'HTTP Security Headers',
    difficulty: 'Advanced',
    prompt: 'Which HTTP response header prevents your web application from being rendered inside an iframe, protecting against Clickjacking attacks?',
    options: [
      'Access-Control-Allow-Origin',
      'X-Frame-Options: DENY (or CSP frame-ancestors)',
      'Strict-Transport-Security',
      'X-Content-Type-Options: nosniff',
    ],
    correctAnswer: 1,
    explanation: '`X-Frame-Options: DENY` (and CSP `frame-ancestors "none"`) instructs compliant browsers never to embed the page in frames or iframes, preventing malicious clickjacking overlays.',
  },
];

export const PracticeArenaTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<ArenaSection>('output');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [attemptsCount, setAttemptsCount] = useState(0);

  const filteredItems = PRACTICE_BANK.filter((item) => item.type === activeSection);
  const currentItem = filteredItems[currentIndex] || filteredItems[0];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    cyberAudio.playClick();
    setSelectedAnswer(idx);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || !currentItem) return;
    cyberAudio.playSuccess();
    setIsSubmitted(true);
    setAttemptsCount((p) => p + 1);

    const isCorrect = selectedAnswer === currentItem.correctAnswer;
    if (isCorrect) setScore((p) => p + 1);

    // Save attempt to backend
    api.submitAssessment('fullstack', { [currentItem.id]: selectedAnswer }, [
      {
        id: currentItem.id,
        track: 'fullstack',
        topic: currentItem.topic,
        question: currentItem.prompt,
        options: currentItem.options || [],
        correctAnswer: Number(currentItem.correctAnswer),
        explanation: currentItem.explanation,
        difficulty: 'medium',
      },
    ]);
  };

  const handleNext = () => {
    cyberAudio.playClick();
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setCurrentIndex((p) => (p + 1) % filteredItems.length);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[.18em] text-[#8DA7FF] mb-2 font-semibold flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#B7FF32]" /> Deliberate Practice
          </div>
          <h1 className="text-3xl md:text-4xl font-serif-title text-white">
            Practice Arena<span className="text-[#B7FF32]">.</span>
          </h1>
          <p className="text-sm text-[#A8B0BC] mt-1.5 max-w-2xl leading-relaxed">
            Hone your diagnostic skills with real code snippets, bug hunting drills, and output prediction scenarios.
          </p>
        </div>

        {/* Score Pill */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#101722] border border-[#273244] shrink-0">
          <Target size={18} className="text-[#B7FF32]" />
          <div className="text-xs">
            <div className="font-mono font-bold text-white">Score: {score} / {attemptsCount}</div>
            <div className="text-[10px] text-[#727E8F]">Saved to profile</div>
          </div>
        </div>
      </div>

      {/* Mode Navigation */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'output', label: 'Output Prediction', icon: <Binary size={16} /> },
          { id: 'debugging', label: 'Bug Hunting', icon: <Bug size={16} /> },
          { id: 'mcq', label: 'Architecture MCQs', icon: <HelpCircle size={16} /> },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => {
              cyberAudio.playClick();
              setActiveSection(sec.id as ArenaSection);
              setCurrentIndex(0);
              setSelectedAnswer(null);
              setIsSubmitted(false);
            }}
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
              activeSection === sec.id
                ? 'bg-[#245BFF]/20 border-[#245BFF] text-white shadow-glow-blue'
                : 'bg-[#101722] border-[#273244] text-[#A8B0BC] hover:border-[#536078]'
            }`}
          >
            {sec.icon}
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* Practice Challenge Card */}
      {currentItem && (
        <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#8DA7FF] uppercase font-bold">{currentItem.topic}</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold uppercase text-[10px]">
              {currentItem.difficulty}
            </span>
          </div>

          <h2 className="text-base md:text-lg font-bold text-white leading-snug">
            {currentItem.prompt}
          </h2>

          {/* Code Snippet Box */}
          {currentItem.codeSnippet && (
            <div className="rounded-xl bg-[#080B10] border border-[#273244] p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-cyan-200 leading-relaxed">
                <code>{currentItem.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Options */}
          {currentItem.options && (
            <div className="space-y-3">
              {currentItem.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrect = idx === currentItem.correctAnswer;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-4 rounded-xl border text-left text-xs transition flex items-start gap-3 ${
                      isSubmitted
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
          )}

          {/* Explanation Banner */}
          {isSubmitted && (
            <div className={`p-4 rounded-xl text-xs leading-relaxed border ${
              selectedAnswer === currentItem.correctAnswer
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}>
              <div className="font-bold mb-1">
                {selectedAnswer === currentItem.correctAnswer ? '✓ Correct Rationale' : '✗ Incorrect'}
              </div>
              <div>{currentItem.explanation}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            {!isSubmitted ? (
              <button
                disabled={selectedAnswer === null}
                onClick={handleSubmit}
                className="cyber-button-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow-blue disabled:opacity-40"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="cyber-button-primary px-6 py-2.5 rounded-xl text-xs font-bold shadow-glow-blue flex items-center gap-1.5"
              >
                <span>Next Scenario</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
