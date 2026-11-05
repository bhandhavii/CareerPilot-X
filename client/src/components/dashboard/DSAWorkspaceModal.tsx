import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Send,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  BookOpen,
  Code2,
  HelpCircle,
  History,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { DSAProblemItem, User } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface DSAWorkspaceModalProps {
  problem: DSAProblemItem;
  user: User;
  onClose: () => void;
  onSolved: (problemId: string, xpGained: number) => void;
}

export const DSAWorkspaceModal: React.FC<DSAWorkspaceModalProps> = ({
  problem,
  user,
  onClose,
  onSolved,
}) => {
  const [activeTab, setActiveTab] = useState<'description' | 'hints' | 'editorial' | 'submissions'>('description');
  const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java' | 'c'>('javascript');
  const [code, setCode] = useState<string>('');
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [execResult, setExecResult] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [xpCelebration, setXpCelebration] = useState<number | null>(null);

  // Load problem details & past submissions
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        const [probDetail, pastSubs] = await Promise.all([
          api.getDSAProblemDetail(problem.id),
          api.getDSASubmissions(problem.id).catch(() => []),
        ]);
        if (isMounted) {
          setDetails(probDetail);
          setSubmissions(pastSubs);
          const starter = probDetail.starterCode?.[language] || `// Solution for ${probDetail.title}\nfunction solution() {\n  \n}`;
          setCode(starter);
        }
      } catch (err) {
        console.error('Failed to load problem workspace details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [problem.id]);

  // Update starter code when language changes
  const handleLanguageChange = (newLang: 'javascript' | 'python' | 'cpp' | 'java' | 'c') => {
    cyberAudio.playClick();
    setLanguage(newLang);
    if (details?.starterCode?.[newLang]) {
      setCode(details.starterCode[newLang]);
    }
  };

  const handleResetCode = () => {
    cyberAudio.playClick();
    if (details?.starterCode?.[language]) {
      setCode(details.starterCode[language]);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCode = async () => {
    if (running || submitting || !code.trim()) return;
    cyberAudio.playClick();
    setRunning(true);
    setExecResult(null);
    try {
      const res = await api.runDSACode(problem.id, code, language);
      setExecResult(res);
      if (res.status === 'Accepted') {
        cyberAudio.playSuccess();
      }
    } catch (err: any) {
      setExecResult({
        status: 'Runtime Error',
        errorMessage: err.message || 'Execution failed',
        testCaseResults: [],
        passedCount: 0,
        totalCount: details?.sampleTestCases?.length || 1,
        runtimeMs: 0,
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (running || submitting || !code.trim()) return;
    cyberAudio.playClick();
    setSubmitting(true);
    setExecResult(null);
    try {
      const res = await api.submitDSACode(problem.id, code, language);
      setExecResult(res.result);
      if (res.result.status === 'Accepted') {
        cyberAudio.playSuccess();
        if (res.xpGained > 0) {
          setXpCelebration(res.xpGained);
        }
        onSolved(problem.id, res.xpGained || 0);
        // Refresh submissions
        const refreshedSubs = await api.getDSASubmissions(problem.id).catch(() => []);
        setSubmissions(refreshedSubs);
      }
    } catch (err: any) {
      setExecResult({
        status: 'Runtime Error',
        errorMessage: err.message || 'Submission evaluation failed',
        testCaseResults: [],
        passedCount: 0,
        totalCount: 1,
        runtimeMs: 0,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const diffColor =
    problem.difficulty === 'Easy'
      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      : problem.difficulty === 'Medium'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      : 'bg-rose-500/15 text-rose-400 border-rose-500/30';

  return (
    <div className="fixed inset-0 z-50 bg-[#080B10]/95 backdrop-blur-xl flex flex-col overflow-hidden animate-fadeIn">
      {/* Top Navigation Bar */}
      <header className="h-14 px-5 border-b border-[#273244] bg-[#0E1624] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A8B0BC] hover:text-white hover:bg-[#152132] transition"
            title="Return to problem list"
          >
            <X size={18} />
          </button>
          <div className="h-4 w-px bg-[#273244]" />
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-[#727E8F]">#{problem.number || 1}</span>
            <h1 className="text-sm font-bold text-white truncate max-w-sm md:max-w-md">{problem.title}</h1>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${diffColor}`}>
              {problem.difficulty}
            </span>
            <span className="hidden sm:inline text-[11px] text-[#A8B0BC] bg-[#16202E] px-2.5 py-0.5 rounded-md border border-[#273244]">
              {problem.category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={
              problem.leetcodeUrl && problem.leetcodeUrl.includes('/problems/') && !problem.leetcodeUrl.includes('problemset')
                ? problem.leetcodeUrl
                : `https://leetcode.com/problemset/all/?search=${encodeURIComponent(problem.title)}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 text-xs text-[#727E8F] hover:text-[#8DA7FF] px-2.5 py-1.5 rounded-lg border border-[#273244] hover:border-[#8DA7FF]/40 transition"
            title="Open verified problem on LeetCode"
          >
            <span>LeetCode Reference</span>
            <ExternalLink size={12} />
          </a>
          <button
            onClick={handleRunCode}
            disabled={running || submitting}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#152132] hover:bg-[#1a293f] border border-[#273244] text-xs font-semibold text-white transition disabled:opacity-50"
          >
            <Play size={13} className="text-emerald-400" />
            <span>{running ? 'Running...' : 'Run Code'}</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={running || submitting}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#245BFF] hover:bg-blue-600 text-xs font-semibold text-white shadow-glow-blue transition disabled:opacity-50"
          >
            <Send size={13} />
            <span>{submitting ? 'Evaluating...' : 'Submit Solution'}</span>
          </button>
        </div>
      </header>

      {/* XP Celebration Toast */}
      {xpCelebration && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 text-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" />
            <span><strong>Accepted!</strong> All test cases passed successfully. You earned <strong>+{xpCelebration} XP</strong>.</span>
          </div>
          <button onClick={() => setXpCelebration(null)} className="text-emerald-400 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Workspace Body: Left (Problem / Hints / Editorial) | Right (Code Editor & Tests) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* LEFT COLUMN: Problem Details */}
        <div className="border-r border-[#273244] flex flex-col overflow-hidden bg-[#0B111A]">
          {/* Left Tabs */}
          <div className="h-11 px-4 border-b border-[#273244] bg-[#0E1624] flex items-center gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'description' ? 'bg-[#152132] text-white' : 'text-[#727E8F] hover:text-[#A8B0BC]'
              }`}
            >
              <BookOpen size={13} />
              <span>Description</span>
            </button>
            <button
              onClick={() => setActiveTab('hints')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'hints' ? 'bg-[#152132] text-white' : 'text-[#727E8F] hover:text-[#A8B0BC]'
              }`}
            >
              <HelpCircle size={13} />
              <span>Hints ({details?.hints?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab('editorial')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'editorial' ? 'bg-[#152132] text-white' : 'text-[#727E8F] hover:text-[#A8B0BC]'
              }`}
            >
              <Code2 size={13} />
              <span>Approach & Editorial</span>
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'submissions' ? 'bg-[#152132] text-white' : 'text-[#727E8F] hover:text-[#A8B0BC]'
              }`}
            >
              <History size={13} />
              <span>Submissions ({submissions.length})</span>
            </button>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="py-20 text-center text-xs text-[#727E8F]">
                Loading problem details and test cases...
              </div>
            ) : activeTab === 'description' ? (
              <div className="space-y-6 text-sm text-[#C5CDDA] leading-relaxed">
                {/* Description */}
                <div className="whitespace-pre-line leading-7">
                  {details?.description || problem.title}
                </div>

                {/* Examples */}
                {details?.examples && details.examples.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider text-[#8DA7FF]">
                      Examples
                    </h3>
                    {details.examples.map((ex: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-[#080B10] border border-[#273244] space-y-2">
                        <div className="text-xs font-bold text-white">Example {idx + 1}:</div>
                        <div className="font-mono text-xs text-[#A8B0BC] space-y-1">
                          <div><span className="text-[#727E8F]">Input:</span> {ex.input}</div>
                          <div><span className="text-[#727E8F]">Output:</span> {ex.output}</div>
                          {ex.explanation && (
                            <div><span className="text-[#727E8F]">Explanation:</span> {ex.explanation}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {details?.constraints && (
                  <div className="space-y-2">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider text-[#8DA7FF]">
                      Constraints
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs font-mono text-[#8D9AAF]">
                      {details.constraints.map((c: string, idx: number) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : activeTab === 'hints' ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8DA7FF]">Algorithmic Hints</h3>
                {details?.hints && details.hints.length > 0 ? (
                  details.hints.map((hint: string, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#080B10] border border-[#273244] space-y-1">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <HelpCircle size={14} className="text-[#B7FF32]" />
                        <span>Hint {idx + 1}</span>
                      </div>
                      <p className="text-xs text-[#A8B0BC] leading-relaxed pl-5">{hint}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#727E8F]">No specific hints for this problem. Break down with two pointers or hash map.</p>
                )}
              </div>
            ) : activeTab === 'editorial' ? (
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8DA7FF]">Optimal Approach & Solution</h3>
                {details?.complexity && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#080B10] border border-[#273244]">
                      <div className="text-[10px] text-[#727E8F] uppercase font-mono">Time Complexity</div>
                      <div className="text-xs font-bold text-white mt-0.5">{details.complexity.time}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#080B10] border border-[#273244]">
                      <div className="text-[10px] text-[#727E8F] uppercase font-mono">Space Complexity</div>
                      <div className="text-xs font-bold text-white mt-0.5">{details.complexity.space}</div>
                    </div>
                  </div>
                )}
                <div className="p-4 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-[#C5CDDA] leading-relaxed whitespace-pre-line">
                  {details?.editorial || 'Optimal analysis for this algorithmic pattern.'}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8DA7FF]">Past Submissions</h3>
                {submissions.length > 0 ? (
                  submissions.map((sub, idx) => (
                    <div key={sub.id || idx} className="p-3.5 rounded-xl bg-[#080B10] border border-[#273244] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold flex items-center gap-1 ${sub.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {sub.passed ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                            {sub.passed ? 'Accepted' : 'Wrong Answer'}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-[#727E8F]">
                          {new Date(sub.date).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (sub.code) setCode(sub.code);
                        }}
                        className="text-xs font-semibold text-[#8DA7FF] hover:underline"
                      >
                        Load Code
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#727E8F]">No previous submissions found for this problem.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Code Editor + Test Cases / Execution Results */}
        <div className="flex flex-col overflow-hidden bg-[#080B10]">
          {/* Editor Header Toolbar */}
          <div className="h-11 px-4 border-b border-[#273244] bg-[#0E1624] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <label htmlFor="lang-select" className="text-[11px] text-[#727E8F]">Language:</label>
              <select
                id="lang-select"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as any)}
                className="bg-[#152132] border border-[#273244] rounded-md px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#245BFF]"
              >
                <option value="javascript">JavaScript (Node v20)</option>
                <option value="python">Python 3.11</option>
                <option value="cpp">C++ 20</option>
                <option value="java">Java 21</option>
                <option value="c">C (gcc)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyCode}
                className="p-1.5 rounded-md text-[#727E8F] hover:text-white hover:bg-[#152132] transition"
                title="Copy code"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              <button
                onClick={handleResetCode}
                className="p-1.5 rounded-md text-[#727E8F] hover:text-white hover:bg-[#152132] transition"
                title="Reset starter code"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Interactive Code Editor TextArea */}
          <div className="flex-1 relative flex overflow-hidden">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-4 bg-[#080B10] text-[#F5F7FA] font-mono text-xs md:text-sm leading-6 resize-none outline-none border-none selection:bg-[#245BFF]/40"
              placeholder="// Write your solution here..."
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  setCode(code.substring(0, start) + '  ' + code.substring(end));
                  setTimeout(() => {
                    const el = e.target as HTMLTextAreaElement;
                    if (el) el.selectionStart = el.selectionEnd = start + 2;
                  }, 0);
                }
              }}
            />
          </div>

          {/* Bottom Execution Results / Test Cases Panel */}
          <div className="h-64 border-t border-[#273244] bg-[#0B111A] flex flex-col shrink-0">
            {/* Panel Tabs Header */}
            <div className="h-9 px-4 border-b border-[#273244] bg-[#0E1624] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#727E8F]">
                  {execResult ? 'Execution Result' : 'Sample Test Cases'}
                </span>
                {execResult && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      execResult.status === 'Accepted'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {execResult.status} ({execResult.passedCount || 0}/{execResult.totalCount || 0} passed)
                  </span>
                )}
                {execResult?.runtimeMs !== undefined && (
                  <span className="text-[10px] font-mono text-[#727E8F] flex items-center gap-1">
                    <Clock size={11} /> {execResult.runtimeMs}ms
                  </span>
                )}
              </div>

              {/* Test Case Selectors */}
              <div className="flex items-center gap-1">
                {(details?.sampleTestCases || [{ input: '1', expectedOutput: '1' }]).map((_: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCaseIndex(idx)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                      activeCaseIndex === idx
                        ? 'bg-[#245BFF] text-white'
                        : 'text-[#727E8F] hover:text-white bg-[#152132]'
                    }`}
                  >
                    Case {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Results / Testcase Details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {execResult?.errorMessage ? (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-200 whitespace-pre-wrap leading-relaxed">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle size={14} className="text-rose-400" />
                    <span>{execResult.status}</span>
                  </div>
                  <div>{execResult.errorMessage}</div>
                </div>
              ) : execResult?.testCaseResults?.[activeCaseIndex] ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[#727E8F]">Status:</span>
                    <span className={execResult.testCaseResults[activeCaseIndex].passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {execResult.testCaseResults[activeCaseIndex].passed ? 'Passed ✓' : 'Failed ✗'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#727E8F]">Input: </span>
                    <span className="text-white bg-[#152132] px-2 py-0.5 rounded border border-[#273244] inline-block">
                      {execResult.testCaseResults[activeCaseIndex].input}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#727E8F]">Your Output: </span>
                    <span className="text-white bg-[#152132] px-2 py-0.5 rounded border border-[#273244] inline-block">
                      {execResult.testCaseResults[activeCaseIndex].actualOutput}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#727E8F]">Expected: </span>
                    <span className="text-white bg-[#152132] px-2 py-0.5 rounded border border-[#273244] inline-block">
                      {execResult.testCaseResults[activeCaseIndex].expectedOutput}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <span className="text-[#727E8F]">Input: </span>
                    <span className="text-white bg-[#152132] px-2 py-0.5 rounded border border-[#273244] inline-block">
                      {details?.sampleTestCases?.[activeCaseIndex]?.input || 'Sample Input'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#727E8F]">Expected Output: </span>
                    <span className="text-white bg-[#152132] px-2 py-0.5 rounded border border-[#273244] inline-block">
                      {details?.sampleTestCases?.[activeCaseIndex]?.expectedOutput || 'Sample Output'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#727E8F] font-sans pt-1">
                    Click <strong>Run Code</strong> to test against sample test cases, or <strong>Submit Solution</strong> to run against all hidden test cases.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
