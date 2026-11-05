import React, { useState } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Terminal,
  Clock,
  Sparkles,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { CodingChallenge } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

const EXTENDED_CHALLENGES: CodingChallenge[] = [
  ...api.getCodingChallenges(),
  {
    id: 'cc-3',
    title: 'Valid Parentheses String',
    difficulty: 'easy',
    track: 'dsa',
    description: 'Given a string `s` containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. Open brackets must be closed by the same type of brackets in the correct order.',
    starterCode: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };

  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    }
  }

  return stack.length === 0;
}`,
    testCases: [
      { input: 'isValid("()[]{}")', expectedOutput: 'true', description: 'Matching ordered brackets' },
      { input: 'isValid("(]")', expectedOutput: 'false', description: 'Mismatched closing bracket' },
    ],
    explanation: 'A classic LIFO stack problem. Push open brackets onto stack; when encountering a closing bracket, verify that the popped opening bracket matches.',
    hints: ['Use an array as a stack.', 'Store matching pairs in a lookup object.'],
  },
  {
    id: 'cc-4',
    title: 'Debounce Function Implementation',
    difficulty: 'medium',
    track: 'frontend',
    description: 'Implement a `debounce(fn, delay)` utility that limits the rate at which a function `fn` gets invoked.',
    starterCode: `function debounce(fn, delay) {
  let timerId;
  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}`,
    testCases: [
      { input: 'typeof debounce(() => {}, 100)', expectedOutput: '"function"', description: 'Should return a wrapper function' },
    ],
    explanation: 'Debouncing ensures that subsequent calls reset the timer, only firing once execution pauses for the duration of the delay.',
    hints: ['Store timerId in closure.', 'Clear timeout on each new trigger.'],
  },
];

export const CodingChallengesTab: React.FC = () => {
  const [challenges] = useState<CodingChallenge[]>(EXTENDED_CHALLENGES);
  const [selectedChallenge, setSelectedChallenge] = useState<CodingChallenge>(challenges[0]);
  const [code, setCode] = useState(challenges[0].starterCode);
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'java' | 'cpp'>('javascript');
  const [showHints, setShowHints] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    passed: boolean;
    logs: string[];
    results: { testIndex: number; passed: boolean; output: string; expected: string }[];
  } | null>(null);

  const handleSelectChallenge = (c: CodingChallenge) => {
    cyberAudio.playClick();
    setSelectedChallenge(c);
    setCode(c.starterCode);
    setExecutionResult(null);
    setShowHints(false);
  };

  const handleRunCode = () => {
    if (selectedLanguage !== 'javascript') {
      cyberAudio.playClick();
      setExecutionResult({
        passed: false,
        logs: [
          `Note: The in-browser execution sandbox currently runs JavaScript (V8). Execution engine for ${selectedLanguage.toUpperCase()} requires connecting a remote Docker container runner. Switch to JavaScript to execute and verify your solution immediately.`,
        ],
        results: [],
      });
      return;
    }

    cyberAudio.playClick();
    const res = api.runCodeSandbox(code, selectedChallenge);
    setExecutionResult(res);
    if (res.passed) cyberAudio.playSuccess();
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[.18em] text-[#8DA7FF] mb-2 font-semibold flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#B7FF32]" /> Interactive Sandbox
          </div>
          <h1 className="text-3xl md:text-4xl font-serif-title text-white">
            Coding Challenges<span className="text-[#B7FF32]">.</span>
          </h1>
          <p className="text-sm text-[#A8B0BC] mt-1.5 max-w-2xl leading-relaxed">
            Write, execute, and verify solutions against automated unit test suites in an isolated sandbox.
          </p>
        </div>

        {/* Challenge Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {challenges.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectChallenge(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedChallenge.id === c.id
                  ? 'bg-[#245BFF] text-white shadow-glow-blue'
                  : 'bg-[#101722] border border-[#273244] text-[#A8B0BC] hover:border-[#536078]'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Challenge Description */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                selectedChallenge.difficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400' :
                selectedChallenge.difficulty === 'medium' ? 'bg-amber-500/15 text-amber-400' :
                'bg-purple-500/15 text-purple-400'
              }`}>
                {selectedChallenge.difficulty}
              </span>
              <span className="text-xs font-mono text-[#727E8F] uppercase">
                {selectedChallenge.track}
              </span>
            </div>

            <h2 className="text-xl font-bold text-white">{selectedChallenge.title}</h2>
            <p className="text-xs text-[#A8B0BC] leading-relaxed">
              {selectedChallenge.description}
            </p>

            {/* Test Assertions Preview */}
            <div className="p-3.5 rounded-xl bg-[#080B10] border border-[#273244] space-y-2">
              <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase">
                Expected Test Assertions
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                {selectedChallenge.testCases.map((tc, idx) => (
                  <div key={idx} className="p-2 rounded bg-[#101722] border border-[#273244]">
                    <div className="text-[#727E8F] text-[10px]">{tc.description}</div>
                    <div className="text-cyan-300 mt-0.5">Input: {tc.input}</div>
                    <div className="text-[#B7FF32]">Output: {tc.expectedOutput}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hints Box */}
            <div>
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-xs font-semibold text-[#8DA7FF] hover:text-white flex items-center gap-1.5"
              >
                <Lightbulb size={14} />
                <span>{showHints ? 'Hide Architectural Hints' : 'Reveal Architectural Hints'}</span>
              </button>
              {showHints && (
                <div className="mt-2 p-3 rounded-xl bg-[#245BFF]/10 border border-[#245BFF]/30 text-xs text-[#A8B0BC] space-y-1">
                  {selectedChallenge.hints.map((h, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-[#8DA7FF]">•</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Output */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="rounded-2xl border border-[#273244] bg-[#090d1e] overflow-hidden flex flex-col flex-1 shadow-2xl">
            {/* Editor Toolbar */}
            <div className="p-3 px-4 bg-[#050814] border-b border-[#273244] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[#8DA7FF]">
                  <Terminal size={14} />
                  <span>solution.js</span>
                </span>

                {/* Language Switcher */}
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="bg-[#101722] border border-[#273244] rounded px-2 py-1 text-[11px] text-[#A8B0BC] outline-none"
                >
                  <option value="javascript">JavaScript (ESNext Sandbox)</option>
                  <option value="python">Python 3 (Docker Engine Required)</option>
                  <option value="java">Java (Docker Engine Required)</option>
                  <option value="cpp">C++ (Docker Engine Required)</option>
                </select>
              </div>

              <button
                onClick={() => setCode(selectedChallenge.starterCode)}
                className="text-[#727E8F] hover:text-white flex items-center gap-1"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* Code Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={14}
              className="w-full p-4 bg-transparent font-mono text-xs text-cyan-200 outline-none resize-none leading-relaxed selection:bg-cyan-500 selection:text-black flex-1"
            />

            {/* Run Bar */}
            <div className="p-3 px-4 bg-[#050814] border-t border-[#273244] flex items-center justify-between">
              <div className="text-[11px] text-[#727E8F] font-mono">
                {selectedLanguage === 'javascript' ? 'Sandboxed client-side execution' : 'External execution runner required'}
              </div>

              <button
                onClick={handleRunCode}
                className="cyber-button-primary px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-glow-blue flex items-center gap-2"
              >
                <Play size={14} className="fill-white" />
                <span>Run Code & Verify</span>
              </button>
            </div>
          </div>

          {/* Test Results Output Panel */}
          {executionResult && (
            <div className={`p-4 rounded-2xl border text-xs font-mono ${
              executionResult.passed
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-2">
                {executionResult.passed ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>All Test Assertions Satisfied! (+200 XP Awarded)</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-rose-400" />
                    <span>Execution Verification Results</span>
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
        </div>
      </div>
    </div>
  );
};
