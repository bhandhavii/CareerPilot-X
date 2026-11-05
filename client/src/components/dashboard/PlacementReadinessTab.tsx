import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, Award, BookOpen, BriefcaseBusiness, CheckCircle2, Code2, FileText, BrainCircuit, Target, TrendingUp } from 'lucide-react';
import { User, AnalyticsData, DSAStats, TrackInfo } from '../../types';
import { api } from '../../services/api';

interface PlacementReadinessTabProps {
  user: User;
  onOpenInterview?: () => void;
  onOpenCodingArena?: () => void;
  onOpenResume?: () => void;
  onOpenProjects?: () => void;
}

type ReadinessData = {
  analytics: AnalyticsData | null;
  dsa: DSAStats | null;
  tracks: TrackInfo[];
  mockAttempts: any[];
  missions: any[];
  projects: any[];
  interviewAttempts: any[];
  resumeVersions: any[];
};

export const PlacementReadinessTab: React.FC<PlacementReadinessTabProps> = ({
  user,
  onOpenInterview,
  onOpenCodingArena,
  onOpenResume,
  onOpenProjects,
}) => {
  const [data, setData] = useState<ReadinessData>({
    analytics: null,
    dsa: null,
    tracks: [],
    mockAttempts: [],
    missions: [],
    projects: [],
    interviewAttempts: [],
    resumeVersions: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [analytics, dsa, tracks, practiceHistory, projects] = await Promise.all([
          api.getAnalytics(),
          api.getDSAStats(),
          api.getTracks(),
          api.getPracticeHistory(),
          api.getProjects(),
        ]);
        const readLocal = (key: string) => {
          try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
        };
        if (!active) return;
        setData({
          analytics,
          dsa,
          tracks,
          mockAttempts: practiceHistory.filter((item) => item.category === 'mock_test'),
          missions: readLocal('cpx_full_daily_missions'),
          projects,
          interviewAttempts: readLocal('cpx_interview_history'),
          resumeVersions: readLocal('cpx_resume_versions'),
        });
      } catch (error) {
        console.error('Could not load readiness data:', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [user.id]);

  const lessonTotal = data.tracks.reduce(
    (sum, track) => sum + track.modules.reduce((moduleSum, module) => moduleSum + module.lessonIds.length, 0),
    0
  );
  const lessonCompleted = data.analytics?.completedLessonsCount || 0;
  const learningPercent = lessonTotal ? Math.min(100, Math.round((lessonCompleted / lessonTotal) * 100)) : 0;
  const dsaPercent = data.dsa?.completionPercentage || 0;
  const mockAverage = data.mockAttempts.length
    ? Math.round(data.mockAttempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / data.mockAttempts.length)
    : null;
  const completedMissions = data.missions.filter((mission) => mission.completed).length;
  const missionPercent = data.missions.length ? Math.round((completedMissions / data.missions.length) * 100) : null;
  const projectMilestones = data.projects.flatMap((project) => project.milestones || []);
  const completedProjectMilestones = projectMilestones.filter((milestone) => milestone.completed).length;
  const projectPercent = projectMilestones.length
    ? Math.round((completedProjectMilestones / projectMilestones.length) * 100)
    : null;
  const interviewCount = data.interviewAttempts.length;
  const resumeCount = data.resumeVersions.length;
  const metrics = [
    { name: 'DSA Arena', value: dsaPercent, detail: `${data.dsa?.totalSolved || 0} / ${data.dsa?.totalProblems || 0} problems solved`, available: Boolean(data.dsa), icon: <Code2 size={18} />, action: onOpenCodingArena },
    { name: 'My Learning', value: learningPercent, detail: `${lessonCompleted} / ${lessonTotal} lessons completed`, available: lessonTotal > 0, icon: <BookOpen size={18} /> },
    { name: 'Daily Mock Tests', value: mockAverage, detail: mockAverage === null ? 'No mock test submitted yet' : `${data.mockAttempts.length} tests · average accuracy`, available: mockAverage !== null, icon: <Target size={18} /> },
    { name: 'Daily Missions', value: missionPercent, detail: missionPercent === null ? 'No saved mission activity yet' : `${completedMissions} / ${data.missions.length} completed`, available: missionPercent !== null, icon: <CheckCircle2 size={18} /> },
    { name: 'Project Progress', value: projectPercent, detail: projectPercent === null ? 'No project milestones recorded' : `${completedProjectMilestones} / ${projectMilestones.length} milestones completed`, available: projectPercent !== null, icon: <BriefcaseBusiness size={18} />, action: onOpenProjects },
    { name: 'Resume Analyzer', value: null, detail: resumeCount ? `${resumeCount} saved resume version(s) · review latest analysis` : 'Upload a resume to measure this area', available: false, icon: <FileText size={18} />, action: onOpenResume },
    { name: 'Interview Center', value: null, detail: interviewCount ? `${interviewCount} saved interview session(s)` : 'Complete an interview session to measure this area', available: false, icon: <BrainCircuit size={18} />, action: onOpenInterview },
  ];

  const scoredMetrics = metrics.filter((metric) => metric.value !== null && metric.available);
  const readinessScore = scoredMetrics.length
    ? Math.round(scoredMetrics.reduce((sum, metric) => sum + (metric.value || 0), 0) / scoredMetrics.length)
    : null;
  const strengths = data.analytics?.topStrengths || [];
  const weaknesses = data.analytics?.topWeakTopics || [];
  const nextFocus = [...scoredMetrics].sort((a, b) => (a.value || 0) - (b.value || 0))[0];

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center text-sm text-[#A8B0BC]">Calculating readiness from your saved activity…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7 animate-fadeIn">
      <div className="flex flex-col gap-5 border-b border-[#273244] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-[#8DA7FF]"><Target size={14} /> Activity-based placement readiness</div>
          <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">Placement Readiness<span className="text-[#B7FF32]">.</span></h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A8B0BC]">This estimate uses your saved learning, DSA, mock-test, mission and project activity. Areas without recorded results are not counted as completed.</p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[#273244] bg-[#101722] p-5">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <path stroke="#273244" strokeWidth="3.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              {readinessScore !== null && <path stroke="#B7FF32" strokeDasharray={`${readinessScore}, 100`} strokeWidth="3.5" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />}
            </svg>
            <span className="absolute text-xl font-bold text-white">{readinessScore === null ? '—' : `${readinessScore}%`}</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white">Readiness estimate</div>
            <div className="mt-1 text-xs text-[#8D9AAF]">{scoredMetrics.length} of 7 areas currently contribute</div>
            <div className="mt-1 text-[10px] text-[#71819A]">Equal average of available measured areas</div>
          </div>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.name} className="rounded-2xl border border-[#273244] bg-[#101722] p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#080B10] text-[#8DA7FF]">{metric.icon}</div>
              {metric.value === null ? <span className="text-[10px] text-[#71819A]">Not measured</span> : <span className="font-mono text-lg font-bold text-white">{metric.value}%</span>}
            </div>
            <h3 className="mt-4 text-sm font-bold text-white">{metric.name}</h3>
            <p className="mt-1 min-h-9 text-xs leading-5 text-[#8D9AAF]">{metric.detail}</p>
            {metric.value !== null && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#263244]">
                <div className="h-full rounded-full bg-[#245BFF]" style={{ width: `${metric.value}%` }} />
              </div>
            )}
            {metric.action && (
              <button onClick={metric.action} className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8DA7FF] hover:text-white">
                Open module <ArrowRight size={13} />
              </button>
            )}
          </article>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-white"><Award size={17} className="text-[#B7FF32]" /> Observed strengths</div>
          {strengths.length ? (
            <ul className="mt-4 space-y-2">{strengths.map((item) => <li key={item} className="flex items-start gap-2 text-xs text-[#A8B0BC]"><CheckCircle2 size={14} className="mt-0.5 text-emerald-400" />{item}</li>)}</ul>
          ) : <p className="mt-3 text-xs leading-5 text-[#8D9AAF]">Strengths will appear after you complete quizzes or practice assessments.</p>}
        </div>
        <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-white"><AlertCircle size={17} className="text-amber-300" /> Topics to revisit</div>
          {weaknesses.length ? (
            <ul className="mt-4 space-y-2">{weaknesses.map((item) => <li key={item} className="flex items-start gap-2 text-xs text-[#A8B0BC]"><TrendingUp size={14} className="mt-0.5 text-amber-300" />{item}</li>)}</ul>
          ) : <p className="mt-3 text-xs leading-5 text-[#8D9AAF]">Weak topics will be identified from your submitted tests and assessments.</p>}
        </div>
      </section>

      <section className="rounded-2xl border border-[#245BFF]/25 bg-[#101722] p-6">
        <div className="text-sm font-bold text-white">Your next focus</div>
        {nextFocus ? (
          <p className="mt-2 text-xs leading-5 text-[#A8B0BC]">Your lowest measured area is <strong className="text-white">{nextFocus.name}</strong> at {nextFocus.value}%. Spend your next practice session here.</p>
        ) : (
          <p className="mt-2 text-xs leading-5 text-[#A8B0BC]">Start by completing one lesson, solving a DSA problem and submitting your first mock test. The readiness estimate will update as activity is saved.</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={onOpenCodingArena} className="rounded-xl bg-[#245BFF] px-4 py-2.5 text-xs font-semibold text-white">Practice DSA</button>
          <button onClick={onOpenInterview} className="rounded-xl border border-[#273244] px-4 py-2.5 text-xs font-semibold text-[#A8B0BC]">Practice Interview</button>
          <button onClick={onOpenResume} className="rounded-xl border border-[#273244] px-4 py-2.5 text-xs font-semibold text-[#A8B0BC]">Analyze Resume</button>
        </div>
      </section>
    </div>
  );
};
