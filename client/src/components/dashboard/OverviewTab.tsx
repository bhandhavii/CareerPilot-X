import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Award, BookOpen, BrainCircuit, BriefcaseBusiness, Code2,
  FileText, Flame, Sparkles, Target, Trophy, Zap,
} from 'lucide-react';
import { User, DailyMission, AnalyticsData, DSAStats } from '../../types';
import { api } from '../../services/api';

interface OverviewTabProps {
  user: User;
  missions: DailyMission[];
  onOpenInterview: () => void;
  onOpenMissions: () => void;
  onOpenResume: () => void;
  onOpenReadiness: () => void;
  onOpenProjectMentor: () => void;
  onOpenLearning: () => void;
  onOpenAICoach: () => void;
  onOpenDSA?: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  user, missions, onOpenInterview, onOpenMissions, onOpenResume,
  onOpenReadiness, onOpenProjectMentor, onOpenLearning, onOpenAICoach, onOpenDSA,
}) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  }, []);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dsaStats, setDsaStats] = useState<DSAStats | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([api.getAnalytics(), api.getDSAStats()])
      .then(([summary, dsa]) => {
        if (active) {
          setAnalytics(summary);
          setDsaStats(dsa);
        }
      })
      .catch((error) => console.error('Dashboard metrics could not be loaded:', error));
    return () => { active = false; };
  }, [user.id]);

  const completedMissions = missions.filter((mission) => mission.completed).length;
  const missionPercent = missions.length ? Math.round((completedMissions / missions.length) * 100) : 0;
  const readiness = user.readinessScore ?? analytics?.readinessScore ?? null;
  const hasStarted = (analytics?.completedLessonsCount ?? 0) > 0
    || (dsaStats?.totalSolved ?? 0) > 0
    || completedMissions > 0
    || (user.xp || 0) > 0;

  const nextBestStep = useMemo(() => {
    const lessons = analytics?.completedLessonsCount ?? 0;
    const dsa = dsaStats?.totalSolved ?? 0;
    const projects = analytics?.completedProjectsCount ?? 0;
    const track = user.track || 'frontend';
    const trackLabel = track === 'frontend' ? 'Frontend' : track === 'backend' ? 'Backend' : 'Full Stack';

    if (lessons === 0) {
      return {
        title: `Begin ${trackLabel} Fundamentals`,
        description: `Start with lesson 1 of your ${trackLabel} curriculum to establish core syntax, architecture and mental models.`,
        actionText: 'Start Lesson 1',
        action: onOpenLearning,
        badge: 'Stage 1: Syntax & Core Web',
        icon: <BookOpen size={20} className="text-[#8DA7FF]" />,
      };
    }

    if (dsa === 0) {
      return {
        title: 'Solve Your First DSA Problem',
        description: 'Your syntax foundations are underway. Build your algorithm problem-solving habit by solving Two Sum in the DSA Arena.',
        actionText: 'Open DSA Arena',
        action: onOpenDSA,
        badge: 'Stage 2: Algorithmic Foundations',
        icon: <Code2 size={20} className="text-[#B7FF32]" />,
      };
    }

    if (dsa < 5) {
      return {
        title: 'Master Two-Pointer & Sliding Window Patterns',
        description: `You have solved ${dsa} DSA problem(s). Practise high-frequency array and string patterns to build pattern recognition.`,
        actionText: 'Practise In DSA Arena',
        action: onOpenDSA,
        badge: 'Stage 3: Pattern Mastery',
        icon: <Code2 size={20} className="text-[#245BFF]" />,
      };
    }

    if (projects === 0 && lessons >= 3) {
      return {
        title: 'Architect Your Portfolio Capstone',
        description: `You have completed ${lessons} lessons. Turn theoretical knowledge into verifiable code by generating a guided blueprint in Project Mentor.`,
        actionText: 'Launch Project Mentor',
        action: onOpenProjectMentor,
        badge: 'Stage 4: Real-World Portfolio',
        icon: <BriefcaseBusiness size={20} className="text-purple-400" />,
      };
    }

    if (!user.readinessScore || user.readinessScore < 50) {
      return {
        title: 'Calibrate Technical Interview Readiness',
        description: 'Rehearse a structured 1-on-1 mock interview with voice/text feedback to identify knowledge gaps before campus placements.',
        actionText: 'Start Mock Interview',
        action: onOpenInterview,
        badge: 'Stage 5: Interview Rehearsal',
        icon: <BrainCircuit size={20} className="text-cyan-400" />,
      };
    }

    return {
      title: 'Daily Mock Test & Placement Polish',
      description: 'Keep your streak alive: take the 15-minute daily timed assessment and run your resume through the ATS analyzer.',
      actionText: 'View Readiness Breakdown',
      action: onOpenReadiness,
      badge: 'Stage 6: Placement Polish',
      icon: <Target size={20} className="text-[#B7FF32]" />,
    };
  }, [analytics, dsaStats, user.track, user.readinessScore, onOpenLearning, onOpenDSA, onOpenProjectMentor, onOpenInterview, onOpenReadiness]);

  const quickStats = [
    { label: 'Lessons Completed', value: analytics?.completedLessonsCount ?? 0, icon: <BookOpen size={17} />, action: onOpenLearning },
    { label: 'DSA Problems Solved', value: dsaStats?.totalSolved ?? 0, icon: <Code2 size={17} />, action: onOpenDSA },
    { label: 'Daily Missions', value: `${completedMissions}/${missions.length}`, icon: <Zap size={17} />, action: onOpenMissions },
    { label: 'Study Streak', value: `${user.streakDays || 0} days`, icon: <Flame size={17} /> },
  ];

  const recommendations = [
    { label: 'Continue your learning path', detail: 'Open your next lesson and keep your learning progress moving.', icon: <BookOpen size={16} />, action: onOpenLearning },
    { label: 'Practice DSA problems', detail: 'Choose a topic from the DSA Arena and write and submit code in-app.', icon: <Code2 size={16} />, action: onOpenDSA },
    { label: 'Take a mock interview', detail: 'Practice explaining your approach and review the feedback.', icon: <BrainCircuit size={16} />, action: onOpenInterview },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-fadeIn">
      <div className="flex flex-col gap-4 border-b border-[#273244] pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-[#8DA7FF]"><span className="h-2 w-2 rounded-full bg-[#B7FF32]" /> Your placement preparation workspace</div>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">{greeting}, {user.name.split(' ')[0]}.</h1>
          <p className="mt-2 text-sm text-[#A8B0BC]">Career goal: <strong className="text-white">{user.careerGoal || 'Not selected yet'}</strong>{user.dreamCompany ? ` · Target: ${user.dreamCompany}` : ''}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={onOpenMissions} className="rounded-xl border border-[#273244] bg-[#101722] px-4 py-2.5 text-xs font-semibold text-[#A8B0BC] hover:text-white">Today’s Missions</button>
          <button onClick={onOpenInterview} className="inline-flex items-center gap-2 rounded-xl bg-[#245BFF] px-4 py-2.5 text-xs font-semibold text-white"><BrainCircuit size={14} /> Interview Center</button>
        </div>
      </div>

      {analytics && dsaStats && !hasStarted && (
        <section className="rounded-2xl border border-blue-500/25 bg-gradient-to-r from-blue-950/50 to-[#101722] p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><div className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Your first day starts here</div><h2 className="mt-2 text-xl font-bold text-white">Let’s build your placement preparation routine.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#A8B0BC]">Your dashboard is ready. Start with one lesson, solve a DSA question or complete a small mission. Your progress will appear here as you work.</p></div>
            <div className="flex flex-wrap gap-2"><button onClick={onOpenLearning} className="rounded-xl bg-[#245BFF] px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500">Start learning</button><button onClick={onOpenDSA} className="rounded-xl border border-[#273244] bg-[#0B1422] px-4 py-2.5 text-xs font-semibold text-[#C5CDDA] hover:text-white">Open DSA Arena</button></div>
          </div>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <button key={stat.label} onClick={stat.action} disabled={!stat.action} className="rounded-2xl border border-[#273244] bg-[#101722] p-5 text-left transition hover:border-[#536078] disabled:cursor-default">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8D9AAF]">{stat.label}</span>
              <span className="text-[#8DA7FF]">{stat.icon}</span>
            </div>
            <div className="mt-3 text-2xl font-bold text-white">{stat.value}</div>
          </button>
        ))}
      </section>

      {/* DYNAMIC: YOUR NEXT BEST STEP */}
      <section className="relative overflow-hidden rounded-3xl border border-[#245BFF]/35 bg-gradient-to-r from-[#101722] via-[#0E1624] to-[#141F30] p-6 md:p-7 shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#245BFF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#245BFF]/20 border border-[#245BFF]/40 text-[#8DA7FF] text-xs font-mono font-semibold">
              <Sparkles size={13} className="text-[#B7FF32]" />
              <span>YOUR NEXT BEST STEP</span>
              <span className="text-[#727E8F]">·</span>
              <span className="text-white">{nextBestStep.badge}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2.5">
              {nextBestStep.icon}
              <span>{nextBestStep.title}</span>
            </h2>
            <p className="text-xs md:text-sm text-[#A8B0BC] max-w-2xl leading-relaxed">
              {nextBestStep.description}
            </p>
          </div>
          <button
            onClick={nextBestStep.action}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#245BFF] hover:bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-glow-blue transition shrink-0 self-start md:self-auto"
          >
            <span>{nextBestStep.actionText}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-3xl border border-[#273244] bg-[#101722] p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8DA7FF]"><Target size={15} /> Placement readiness</div>
              <h2 className="mt-2 text-xl font-bold text-white">Your current activity score</h2>
            </div>
            <span className="rounded-full border border-[#273244] bg-[#0B1422] px-3 py-1 text-[10px] text-[#8D9AAF]">{readiness === null ? 'Not calculated yet' : 'Based on recorded activity'}</span>
          </div>
          <div className="mt-5 flex items-center gap-5">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path stroke="#273244" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                {readiness !== null && <path stroke="#B7FF32" strokeDasharray={`${readiness}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />}
              </svg>
              <span className="absolute text-xl font-bold text-white">{readiness === null ? '—' : `${readiness}%`}</span>
            </div>
            <div>
              <p className="text-sm leading-6 text-[#A8B0BC]">{readiness === null ? 'Start learning and practicing. Your readiness estimate will appear after the platform records relevant activity.' : 'This is an activity-based estimate, not a placement guarantee. Open the detailed view to see which activities contribute.'}</p>
              <button onClick={onOpenReadiness} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8DA7FF] hover:text-white">View readiness details <ArrowRight size={13} /></button>
            </div>
          </div>
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs"><span className="text-[#A8B0BC]">Today’s mission completion</span><span className="font-mono text-white">{missionPercent}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-[#273244]"><div className="h-full rounded-full bg-[#245BFF]" style={{ width: `${missionPercent}%` }} /></div>
            <p className="mt-2 text-[11px] text-[#71819A]">{completedMissions} of {missions.length} daily missions marked complete.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#273244] bg-[#101722] p-6 md:p-7">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8DA7FF]"><Sparkles size={15} /> CareerPilot X companion</div>
          <h2 className="mt-2 text-xl font-bold text-white">Need a little guidance?</h2>
          <p className="mt-3 text-sm leading-6 text-[#A8B0BC]">Ask about programming concepts, DSA approaches, coding errors, resume improvements, projects or interview preparation.</p>
          <button onClick={onOpenAICoach} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#245BFF] px-4 py-3 text-xs font-semibold text-white"><Sparkles size={14} /> Open AI Assistant</button>
          <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
            <button onClick={onOpenResume} className="flex items-center gap-2 rounded-xl border border-[#273244] bg-[#0B1422] p-3 text-[#A8B0BC] hover:text-white"><FileText size={15} /> Resume Analyzer</button>
            <button onClick={onOpenProjectMentor} className="flex items-center gap-2 rounded-xl border border-[#273244] bg-[#0B1422] p-3 text-[#A8B0BC] hover:text-white"><BriefcaseBusiness size={15} /> Project Mentor</button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-[#273244] bg-[#101722] p-6">
          <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-white">Today’s Focus</h2><button onClick={onOpenMissions} className="text-xs text-[#8DA7FF]">View all</button></div>
          <div className="mt-4 space-y-3">
            {missions.slice(0, 4).map((mission) => (
              <div key={mission.id} className="flex items-start gap-3 rounded-xl border border-[#273244] bg-[#0B1422] p-3">
                <span className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-md ${mission.completed ? 'bg-emerald-500/15 text-emerald-300' : 'bg-[#245BFF]/15 text-[#8DA7FF]'}`}>{mission.completed ? '✓' : '•'}</span>
                <div className="min-w-0"><div className={`text-xs font-semibold ${mission.completed ? 'text-[#71819A] line-through' : 'text-white'}`}>{mission.title}</div><p className="mt-1 text-[11px] text-[#71819A]">{mission.estimatedMinutes || mission.estimatedDuration || 15} min · {mission.completed ? 'Completed' : 'Pending'}</p></div>
              </div>
            ))}
            {!missions.length && <p className="text-xs text-[#71819A]">Your daily missions will appear here.</p>}
          </div>
        </div>
        <div className="rounded-3xl border border-[#273244] bg-[#101722] p-6">
          <h2 className="text-sm font-bold text-white">Recommended next steps</h2>
          <div className="mt-4 space-y-3">
            {recommendations.map((item) => (
              <button key={item.label} onClick={item.action} className="flex w-full items-start gap-3 rounded-xl border border-[#273244] bg-[#0B1422] p-3 text-left transition hover:border-[#536078]">
                <span className="mt-0.5 text-[#8DA7FF]">{item.icon}</span>
                <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-white">{item.label}</span><span className="mt-1 block text-[11px] leading-5 text-[#71819A]">{item.detail}</span></span>
                <ArrowRight size={14} className="mt-1 text-[#71819A]" />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
