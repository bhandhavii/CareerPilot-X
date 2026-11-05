import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User as UserIcon,
  Code2,
  HelpCircle,
  Bug,
  RotateCcw,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Compass,
  ArrowRight,
  BrainCircuit,
  Award,
  Layers,
} from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface AICoachTabProps {
  user: User;
}

export const AICoachTab: React.FC<AICoachTabProps> = ({ user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'diagnostic' | 'chat'>('chat');
  const storageKey = `cpx_ai_conversation_${user.id}`;
  const [messages, setMessages] = useState<
    { id: string; role: 'user' | 'assistant'; text: string; time: string }[]
  >(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{
      id: 'init',
      role: 'assistant',
      text: `Hello ${user.name.split(' ')[0]}! Ask me about programming, DSA, coding errors, interviews, resumes, projects or placement preparation.`,
      time: 'Just now',
    }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSubTab === 'chat') {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeSubTab]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {}
  }, [messages, storageKey]);

  // Dynamic Career Diagnostic calculation based on User Goal, Skills, Interview, and DSA
  const diagnostics = useMemo(() => {
    const goal = user.careerGoal || (user.track === 'frontend' ? 'Frontend Developer' : user.track === 'backend' ? 'Backend Developer' : 'Full Stack Developer');
    const skills = user.currentSkills || [];
    const targetCompany = user.dreamCompany || 'Top Tech Companies';
    const xp = user.xp || 0;
    const completedTasksCount = user.completedTasks?.length || 0;

    // Strengths calculation
    const strengths: { title: string; desc: string; tag: string }[] = [];
    if (skills.length > 0) {
      strengths.push({
        title: `Core Technology Baseline (${skills.slice(0, 3).join(', ')})`,
        desc: `You already have hands-on exposure to key stack components, giving you an advantage in foundational syntax and tooling.`,
        tag: 'Technical Baseline',
      });
    }
    if (user.dailyStudyHours && user.dailyStudyHours >= 2) {
      strengths.push({
        title: `Study commitment: ${user.dailyStudyHours} hours/day`,
        desc: 'This is the daily study time recorded in your profile.',
        tag: 'Profile',
      });
    } else if (user.dailyStudyHours && user.dailyStudyHours > 0) {
      strengths.push({
        title: `Study commitment: ${user.dailyStudyHours} hour(s)/day`,
        desc: 'This is the daily study time recorded in your profile.',
        tag: 'Profile',
      });
    }
    if (user.streakDays && user.streakDays > 0) {
      strengths.push({
        title: `${user.streakDays}-Day Momentum Streak`,
        desc: `Active continuity accelerates neuroplastic habit formation required for competitive tech placement.`,
        tag: 'Momentum',
      });
    } else if (user.careerGoal || user.dreamCompany) {
      strengths.push({
        title: 'Career goal recorded',
        desc: `Your profile lists ${user.careerGoal || goal}${user.dreamCompany ? ` and ${user.dreamCompany} as a target company` : ''}.`,
        tag: 'Profile',
      });
    }

    // Profile skill gaps (skills not listed in the profile)
    const weaknesses: { title: string; desc: string; severity: 'high' | 'medium' }[] = [];
    if (!skills.includes('TypeScript') && (user.track === 'frontend' || user.track === 'fullstack')) {
      weaknesses.push({
        title: 'TypeScript Generics & Strict Typing Gaps',
        desc: `${targetCompany} requires TypeScript is not currently listed in your profile. Add it if you have learned it.`,
        severity: 'high',
      });
    }
    if (!skills.includes('Data Structures & Algorithms') && !skills.includes('C++') && !skills.includes('Java')) {
      weaknesses.push({
        title: 'DSA Problem-Solving Under Pressure',
        desc: 'This skill is not currently listed in your profile. Add it if you have studied it, or include it in your learning plan.',
        severity: 'high',
      });
    }
    if (!skills.includes('MongoDB') && !skills.includes('PostgreSQL') && !skills.includes('SQL')) {
      weaknesses.push({
        title: 'Database Schema Design & Query Optimization',
        desc: 'Database technologies are not currently listed in your profile. Add the ones you have used or studied.',
        severity: 'medium',
      });
    }
    if (weaknesses.length === 0) {
      weaknesses.push({
        title: 'System Design & High-Concurrency Architecture',
        desc: 'Transitioning from building single-user apps to distributed caching, load balancers, and rate limiters.',
        severity: 'medium',
      });
    }

    // Next Steps
    const nextSteps = [
      {
        step: 1,
        title: `Complete 2 Medium DSA Challenges (${goal === 'Frontend Developer' ? 'Strings & Trees' : 'Arrays & Hashing'})`,
        time: 'Today',
        action: 'Practice Arena',
      },
      {
        step: 2,
        title: `Master ${user.track === 'frontend' ? 'React State & Hooks (useEffect, useRef)' : 'Express Middleware & Async Error Handling'}`,
        time: 'Next 2 Days',
        action: 'My Learning',
      },
      {
        step: 3,
        title: `Conduct 1 AI Mock Interview calibrated for ${targetCompany}`,
        time: 'This Weekend',
        action: 'AI Interview Studio',
      },
      {
        step: 4,
        title: `Build & Deploy Milestone in your Capstone Project with Git Commits`,
        time: 'Next Week',
        action: 'Projects',
      },
    ];

    // Personalized Recommendations
    const recommendations = [
      {
        area: 'DSA Progress',
        recommendation: 'Solve at least 2 LeetCode-style challenges every morning before reviewing new theoretical modules.',
        resource: 'Coding Challenges Tab',
      },
      {
        area: 'Interview Readiness',
        recommendation: `Practice the STAR method (Situation, Task, Action, Result) for behavioral questions asked at ${targetCompany}.`,
        resource: 'AI Interview Game',
      },
      {
        area: 'Project Portfolio',
        recommendation: 'Ensure your GitHub repository has a production-ready README with architecture diagrams and API specs.',
        resource: 'Projects Tab',
      },
    ];

    return { goal, targetCompany, strengths, weaknesses, nextSteps, recommendations, xp, completedTasksCount };
  }, [user]);

  const handleSend = async (queryToSend?: string) => {
    const text = queryToSend || input;
    if (!text.trim() || isLoading) return;

    cyberAudio.playClick();
    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((p) => [...p, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.text }));
      const reply = await api.sendCoachMessage(text, history, user);
      cyberAudio.playSuccess();
      setMessages((p) => [
        ...p,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const PROMPT_CHIPS = [
    { label: 'How to prepare for Google interview rounds?', prompt: `What specific technical and behavioral preparation should I focus on for ${user.dreamCompany || 'Google'} interviews?` },
    { label: 'Review my career roadmap weaknesses', prompt: 'Analyze my current weaknesses and suggest a 14-day recovery sprint.' },
    { label: 'Explain React Fiber Concurrency', prompt: 'Can you explain React Fiber reconciliation and concurrent rendering in simple terms?' },
    { label: 'Top Node.js backend interview questions', prompt: 'What are the top 5 Node.js event-loop and async architecture questions asked in interviews?' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#273244]">
        <div>
          <div className="text-xs uppercase tracking-[.18em] text-[#8DA7FF] font-semibold flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#B7FF32]" /> AI Assistant
          </div>
          <h1 className="text-3xl font-serif-title text-white mt-1">
            AI Assistant<span className="text-[#B7FF32]">.</span>
          </h1>
          <p className="text-xs text-[#A8B0BC] mt-0.5">
            Ask beginner-friendly questions about your placement preparation. Current goal: <strong className="text-white">{diagnostics.goal}</strong> targeting <strong className="text-[#8DA7FF]">{diagnostics.targetCompany}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#080B10] border border-[#273244] shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubTab('diagnostic')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'diagnostic'
                ? 'bg-[#245BFF] text-white shadow-md'
                : 'text-[#A8B0BC] hover:text-white'
            }`}
          >
            <BrainCircuit size={14} />
            <span>Career Diagnostic</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('chat')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeSubTab === 'chat'
                ? 'bg-[#245BFF] text-white shadow-md'
                : 'text-[#A8B0BC] hover:text-white'
            }`}
          >
            <Bot size={14} />
            <span>Live AI Mentor Chat</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: CAREER DIAGNOSTIC & PLACEMENT READINESS REPORT */}
      {activeSubTab === 'diagnostic' && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="rounded-[24px] border border-[#245BFF]/30 bg-[radial-gradient(ellipse_at_top_right,rgba(36,91,255,0.15),transparent_60%),#101722] p-6 md:p-8 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#245BFF]/20 text-[#8DA7FF] text-xs font-mono font-semibold border border-[#245BFF]/30">
                  <Award size={13} className="text-[#B7FF32]" />
                  <span>AI Placement Readiness Calibration</span>
                </div>
                <h2 className="text-2xl font-serif-title text-white">
                  Target: {diagnostics.goal} at {diagnostics.targetCompany}
                </h2>
                <p className="text-xs md:text-sm text-[#A8B0BC] max-w-2xl leading-relaxed">
                  Based on your registered competencies, daily study commitment ({user.dailyStudyHours || 2}h/day), and assessment baseline, our AI model has synthesized your placement readiness profile.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('chat')}
                  className="cyber-button-primary rounded-xl px-5 py-3 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Bot size={14} />
                  <span>Ask Coach for Guidance</span>
                </button>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <div className="rounded-2xl border border-emerald-500/25 bg-[#101722] p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle2 size={18} />
                <span>Identified Strengths & Advantages</span>
              </div>
              <div className="space-y-3">
                {diagnostics.strengths.map((s, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#080B10] border border-[#1f2d3a] space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{s.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">
                        {s.tag}
                      </span>
                    </div>
                    <p className="text-xs text-[#8d9ab0] leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weaknesses / Gaps Card */}
            <div className="rounded-2xl border border-amber-500/25 bg-[#101722] p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <AlertTriangle size={18} />
                <span>Placement Gaps & Weak Topics</span>
              </div>
              <div className="space-y-3">
                {diagnostics.weaknesses.map((w, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#080B10] border border-[#2a2418] space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white">{w.title}</h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        w.severity === 'high' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'
                      }`}>
                        {w.severity.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <p className="text-xs text-[#8d9ab0] leading-relaxed">{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Steps (Actionable Roadmap) */}
          <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#8DA7FF] font-semibold text-sm">
                <TrendingUp size={18} />
                <span>Next Steps for this Week</span>
              </div>
              <span className="text-[11px] font-mono text-[#727E8F]">Prioritized by Placement ROI</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {diagnostics.nextSteps.map((ns) => (
                <div key={ns.step} className="p-4 rounded-xl bg-[#080B10] border border-[#273244] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-lg bg-[#245BFF]/20 text-[#8DA7FF] font-mono font-bold text-xs flex items-center justify-center">
                        {ns.step}
                      </span>
                      <span className="text-[10px] font-mono text-[#B7FF32] bg-[#B7FF32]/10 px-2 py-0.5 rounded">
                        {ns.time}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white leading-snug">{ns.title}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#1a2332] text-[11px] text-[#727E8F] flex items-center justify-between">
                    <span>Module:</span>
                    <strong className="text-[#8DA7FF]">{ns.action}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Recommendations */}
          <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6 space-y-4">
            <div className="flex items-center gap-2 text-[#B7FF32] font-semibold text-sm">
              <Zap size={18} />
              <span>Personalized Recommendations</span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {diagnostics.recommendations.map((r, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#080B10] border border-[#273244] space-y-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#8DA7FF]">
                    {r.area}
                  </span>
                  <p className="text-xs text-[#A8B0BC] leading-relaxed">{r.recommendation}</p>
                  <div className="pt-2 text-[10px] text-[#727E8F]">
                    Recommended Tool: <strong className="text-white">{r.resource}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LIVE AI MENTOR CHAT */}
      {activeSubTab === 'chat' && (
        <div className="space-y-4 flex flex-col h-[650px] rounded-2xl border border-[#273244] bg-[#101722] p-4 md:p-6">
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-[#245BFF]/20 border border-[#245BFF]/40 text-[#8DA7FF] flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isAssistant
                        ? 'bg-[#080B10] border border-[#273244] text-[#DCE2EE]'
                        : 'bg-[#245BFF] text-white shadow-lg'
                    }`}
                  >
                    <div className="whitespace-pre-line">{m.text}</div>
                    <div
                      className={`text-[10px] mt-2 font-mono ${
                        isAssistant ? 'text-[#727E8F]' : 'text-blue-100'
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
                      <UserIcon size={16} />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-[#245BFF]/20 border border-[#245BFF]/40 text-[#8DA7FF] flex items-center justify-center shrink-0 animate-pulse">
                  <Bot size={16} />
                </div>
                <div className="rounded-2xl p-4 bg-[#080B10] border border-[#273244] text-xs text-[#8DA7FF] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B7FF32] animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-[#B7FF32] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-[#B7FF32] animate-bounce [animation-delay:0.4s]" />
                  <span className="font-mono text-[11px] text-[#A8B0BC]">AI Coach analyzing placement context...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="pt-2 border-t border-[#273244] shrink-0">
            <div className="text-[10px] font-mono uppercase text-[#727E8F] mb-2">Suggested Inquiries:</div>
            <div className="flex flex-wrap gap-2">
              {PROMPT_CHIPS.map((chip, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(chip.prompt)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-[#080B10] border border-[#273244] text-[#A8B0BC] hover:border-[#245BFF] hover:text-white transition"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="flex items-center gap-2 shrink-0 pt-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything: mock interview prep, code reviews, algorithm breakdowns..."
              className="flex-1 px-4 py-3 rounded-xl bg-[#080B10] border border-[#273244] text-xs text-white outline-none focus:border-[#245BFF]"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="cyber-button-primary px-5 py-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
            >
              <Send size={14} />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
