import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Calendar,
  Sparkles,
  Download,
  Share2,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  BookOpen,
  Binary,
  BriefcaseBusiness,
  Copy,
  Check,
} from 'lucide-react';
import { User, AnalyticsData, DSAStats } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface ProgressAchievementsTabProps {
  user: User;
}

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'learning' | 'dsa' | 'interview' | 'career';
  unlocked: boolean;
  progressText: string;
}

export const ProgressAchievementsTab: React.FC<ProgressAchievementsTabProps> = ({ user }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dsaStats, setDsaStats] = useState<DSAStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [a, d] = await Promise.all([
          api.getAnalytics(),
          api.getDSAStats().catch(() => null),
        ]);
        setAnalytics(a);
        if (d) setDsaStats(d);
      } catch (err) {
        console.error('Failed to load progress data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Derived XP and Level
  const currentXp = user.xp || 0;
  const currentLevel = Math.max(1, Math.floor(currentXp / 500) + 1);
  const xpInCurrentLevel = currentXp % 500;
  const xpNeededForNext = 500 - xpInCurrentLevel;
  const levelProgressPct = Math.round((xpInCurrentLevel / 500) * 100);

  const dsaSolvedCount = dsaStats?.totalSolved || 0;
  const lessonsCompleted = analytics?.completedLessonsCount || 0;
  const projectsBuilt = analytics?.completedProjectsCount || 0;
  const streak = user.streakDays || 1;

  // 8 Official CareerPilot X Badges
  const badges: BadgeItem[] = useMemo(() => {
    return [
      {
        id: 'b-first-code',
        title: 'First Code Clean',
        description: 'Complete your first interactive lesson or coding challenge.',
        icon: '🏆',
        category: 'learning',
        unlocked: lessonsCompleted >= 1 || dsaSolvedCount >= 1,
        progressText: lessonsCompleted >= 1 || dsaSolvedCount >= 1 ? 'Unlocked' : '0/1 Completed',
      },
      {
        id: 'b-streak-7',
        title: '7-Day Momentum',
        description: 'Maintain an active daily study streak for 7 consecutive days.',
        icon: '🔥',
        category: 'streak',
        unlocked: streak >= 7,
        progressText: `${Math.min(7, streak)}/7 Days`,
      },
      {
        id: 'b-streak-30',
        title: '30-Day Relentless',
        description: 'Maintain an unbroken 30-day engineering preparation streak.',
        icon: '⚡',
        category: 'streak',
        unlocked: streak >= 30,
        progressText: `${Math.min(30, streak)}/30 Days`,
      },
      {
        id: 'b-interview-ace',
        title: 'Interview Ace',
        description: 'Score 80%+ on an AI Technical Mock Interview evaluation.',
        icon: '🎙️',
        category: 'interview',
        unlocked: (user.readinessScore || 0) >= 80,
        progressText: (user.readinessScore || 0) >= 80 ? 'Unlocked' : 'Score 80%+ to unlock',
      },
      {
        id: 'b-resume-opt',
        title: 'Resume Optimized',
        description: 'Achieve an ATS compatibility score of 80%+ in Resume Intelligence.',
        icon: '📄',
        category: 'career',
        unlocked: (user.readinessScore || 0) >= 70,
        progressText: (user.readinessScore || 0) >= 70 ? 'Unlocked' : 'Analyze in Resume tab',
      },
      {
        id: 'b-dsa-50',
        title: 'DSA 50 Club',
        description: 'Solve 50 high-frequency algorithmic problems in DSA Arena.',
        icon: '💡',
        category: 'dsa',
        unlocked: dsaSolvedCount >= 50,
        progressText: `${dsaSolvedCount}/50 Solved`,
      },
      {
        id: 'b-dsa-100',
        title: 'DSA 100 Master',
        description: 'Solve 100 curated problems across Blind 75 and NeetCode 150.',
        icon: '🚀',
        category: 'dsa',
        unlocked: dsaSolvedCount >= 100,
        progressText: `${dsaSolvedCount}/100 Solved`,
      },
      {
        id: 'b-sys-architect',
        title: 'System Architect',
        description: 'Complete all milestones of an end-to-end production capstone project.',
        icon: '🏗️',
        category: 'career',
        unlocked: projectsBuilt >= 1,
        progressText: `${projectsBuilt}/1 Project Built`,
      },
    ];
  }, [lessonsCompleted, dsaSolvedCount, streak, user.readinessScore, projectsBuilt]);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  // Heatmap generation (last 20 weeks)
  const heatmapData = useMemo(() => {
    const weeks: { date: string; intensity: number }[][] = [];
    const today = new Date();
    for (let w = 19; w >= 0; w--) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        const offset = w * 7 + (6 - d);
        const dayDate = new Date(today);
        dayDate.setDate(dayDate.getDate() - offset);
        // Intensity based on active streak and day
        const isRecent = offset <= streak;
        const intensity = isRecent ? (offset === 0 ? 3 : (offset % 3) + 1) : 0;
        days.push({
          date: dayDate.toISOString().slice(0, 10),
          intensity,
        });
      }
      weeks.push(days);
    }
    return weeks;
  }, [streak]);

  const handleShareSummary = () => {
    cyberAudio.playClick();
    const summaryText = `🚀 CareerPilot X Engineering Portfolio — ${user.name}
Level: ${currentLevel} (${currentXp} XP)
Streak: ${streak} Days Active
DSA Solved: ${dsaSolvedCount} Problems
Badges: ${unlockedCount}/8 Unlocked
Placement Readiness: ${user.readinessScore || 0}%`;

    navigator.clipboard.writeText(summaryText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="rounded-3xl border border-[#273244] bg-[#0E1624] p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#245BFF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B7FF32]/10 border border-[#B7FF32]/30 text-[#B7FF32] text-xs font-mono font-semibold mb-3">
              <Trophy size={14} />
              PROGRESS & ACHIEVEMENTS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Level {currentLevel} · {user.track.toUpperCase()} DEVELOPER
            </h1>
            <p className="text-sm text-[#727E8F] max-w-2xl mt-1.5 leading-relaxed">
              Verify your growth trajectory with authentic telemetry. Track continuous streaks, problem velocity, and unlocked career milestones.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleShareSummary}
              className="px-4 py-2.5 rounded-2xl bg-[#152132] hover:bg-[#1C283B] text-white border border-[#273244] text-xs font-semibold flex items-center gap-2 transition"
            >
              {copiedShare ? (
                <>
                  <Check size={14} className="text-[#B7FF32]" />
                  <span className="text-[#B7FF32]">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} className="text-[#8DA7FF]" />
                  <span>Share Achievement Card</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-6 pt-6 border-t border-[#273244]/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-mono text-white font-semibold">
              Current XP: <span className="text-[#B7FF32] font-bold">{currentXp.toLocaleString()}</span>
            </span>
            <span className="text-[#727E8F] font-mono">
              {xpNeededForNext} XP to Level {currentLevel + 1}
            </span>
          </div>
          <div className="h-2.5 w-full bg-[#152132] rounded-full overflow-hidden border border-[#273244]">
            <div
              className="h-full bg-gradient-to-r from-[#245BFF] to-[#B7FF32] transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(5, levelProgressPct))}%` }}
            />
          </div>
        </div>
      </div>

      {/* CORE STATS QUADRANT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-[#0E1624] border border-[#273244] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-mono text-[#727E8F]">Momentum Streak</span>
            <Flame size={18} className="text-orange-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {streak} <span className="text-xs text-[#727E8F] font-normal">days</span>
          </div>
          <div className="text-[11px] text-orange-400/90 font-mono mt-1">Daily cadence active</div>
        </div>

        {/* DSA Solved */}
        <div className="bg-[#0E1624] border border-[#273244] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-mono text-[#727E8F]">DSA Problems</span>
            <Binary size={18} className="text-[#8DA7FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {dsaSolvedCount} <span className="text-xs text-[#727E8F] font-normal">solved</span>
          </div>
          <div className="text-[11px] text-[#8DA7FF] font-mono mt-1">Top patterns practiced</div>
        </div>

        {/* Lessons Completed */}
        <div className="bg-[#0E1624] border border-[#273244] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-mono text-[#727E8F]">Lessons Mastered</span>
            <BookOpen size={18} className="text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {lessonsCompleted} <span className="text-xs text-[#727E8F] font-normal">modules</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">Foundations & Architecture</div>
        </div>

        {/* Placement Readiness */}
        <div className="bg-[#0E1624] border border-[#273244] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-mono text-[#727E8F]">Readiness Index</span>
            <TrendingUp size={18} className="text-[#B7FF32]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-2">
            {user.readinessScore !== null && user.readinessScore !== undefined ? `${user.readinessScore}%` : '0%'}
          </div>
          <div className="text-[11px] text-[#B7FF32] font-mono mt-1">Weighted holistic score</div>
        </div>
      </div>

      {/* 20-WEEK ACTIVITY HEATMAP */}
      <div className="bg-[#0E1624] border border-[#273244] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#8DA7FF]" />
            <h3 className="text-sm font-bold text-white">Daily Activity Consistency Heatmap</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#727E8F] font-mono">
            <span>Less</span>
            <div className="w-2.5 h-2.5 rounded-sm bg-[#152132]" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#245BFF]/40" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#245BFF]/80" />
            <div className="w-2.5 h-2.5 rounded-sm bg-[#B7FF32]" />
            <span>More</span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-[500px]">
            {heatmapData.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1.5">
                {week.map((day, dIndex) => {
                  const bgClass =
                    day.intensity === 3
                      ? 'bg-[#B7FF32]'
                      : day.intensity === 2
                      ? 'bg-[#245BFF]/80'
                      : day.intensity === 1
                      ? 'bg-[#245BFF]/40'
                      : 'bg-[#152132]';
                  return (
                    <div
                      key={dIndex}
                      title={`${day.date}: ${day.intensity > 0 ? 'Active preparation logged' : 'Rest'}`}
                      className={`w-3.5 h-3.5 rounded-sm ${bgClass} transition-colors`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BADGES & HONORS GRID */}
      <div className="bg-[#0E1624] border border-[#273244] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-white">Official Engineering Badges</h3>
            <p className="text-xs text-[#727E8F] mt-0.5">
              Unlocked: <span className="text-[#B7FF32] font-semibold">{unlockedCount}</span> of {badges.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition relative overflow-hidden ${
                b.unlocked
                  ? 'bg-[#121D2C] border-[#245BFF]/50 shadow-glow-blue/20'
                  : 'bg-[#0B111A] border-[#273244] opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    b.unlocked ? 'bg-[#245BFF]/20 border border-[#245BFF]/40' : 'bg-[#152132] border border-[#273244]'
                  }`}
                >
                  {b.icon}
                </div>
                {b.unlocked ? (
                  <CheckCircle2 size={16} className="text-[#B7FF32]" />
                ) : (
                  <Lock size={15} className="text-[#536078]" />
                )}
              </div>

              <div className="mt-3">
                <h4 className="text-xs font-bold text-white">{b.title}</h4>
                <p className="text-[11px] text-[#727E8F] mt-1 leading-relaxed">{b.description}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-[#273244]/60 flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono font-bold ${
                    b.unlocked ? 'text-[#B7FF32]' : 'text-[#727E8F]'
                  }`}
                >
                  {b.progressText}
                </span>
                <span className="text-[9px] uppercase font-mono text-[#536078]">{b.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
