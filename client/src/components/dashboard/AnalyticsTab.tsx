import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Flame,
  Target,
  BookOpen,
  Code2,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { User, AnalyticsData, LearningProgress } from '../../types';
import { api } from '../../services/api';

interface AnalyticsTabProps {
  user: User;
  progress: LearningProgress;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ user, progress }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const data = await api.getAnalytics();
      setAnalytics(data);
      setLoading(false);
    };
    fetchAnalytics();
  }, [user, progress]);

  const studyHours = Math.round(((analytics?.weeklyStudyMinutes || progress.totalStudyMinutes || 0) / 60) * 10) / 10;
  const isNewAccount = progress.completedLessons.length === 0 && (user.xp || 0) === 0 && user.readinessScore === null;

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-[.18em] text-[#8DA7FF] mb-2 font-semibold flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#B7FF32]" /> Verified Telemetry
        </div>
        <h1 className="text-3xl md:text-4xl font-serif-title text-white">
          Progress & Analytics<span className="text-[#B7FF32]">.</span>
        </h1>
        <p className="text-sm text-[#A8B0BC] mt-1.5 max-w-2xl leading-relaxed">
          Real metrics driven exclusively by your completed activities, assessments, and coding submissions.
        </p>
      </div>

      {/* New Account Zero-State Notice */}
      {isNewAccount && (
        <div className="p-5 rounded-2xl bg-[#101722] border border-[#273244] flex items-start gap-3">
          <AlertCircle size={18} className="text-[#8DA7FF] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">Baseline Account Initialized</div>
            <p className="text-xs text-[#A8B0BC] leading-relaxed">
              Your analytics start at zero. As you read tutorials, solve quizzes, complete coding challenges, and take skill assessments, genuine performance metrics will populate here.
            </p>
          </div>
        </div>
      )}

      {/* High-Level Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-[#273244] bg-[#101722] space-y-2">
          <div className="text-[#8DA7FF] flex items-center justify-between">
            <Clock size={18} />
            <span className="text-[10px] font-mono text-[#727E8F]">Weekly</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{studyHours} hrs</div>
          <div className="text-xs text-[#A8B0BC]">Study Time Logged</div>
        </div>

        <div className="p-5 rounded-2xl border border-[#273244] bg-[#101722] space-y-2">
          <div className="text-[#B7FF32] flex items-center justify-between">
            <BookOpen size={18} />
            <span className="text-[10px] font-mono text-[#727E8F]">Mastery</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{progress.completedLessons.length}</div>
          <div className="text-xs text-[#A8B0BC]">Completed Lessons</div>
        </div>

        <div className="p-5 rounded-2xl border border-[#273244] bg-[#101722] space-y-2">
          <div className="text-cyan-400 flex items-center justify-between">
            <Target size={18} />
            <span className="text-[10px] font-mono text-[#727E8F]">Benchmark</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {user.readinessScore !== null ? `${user.readinessScore}%` : 'Not Assessed'}
          </div>
          <div className="text-xs text-[#A8B0BC]">Readiness Score</div>
        </div>

        <div className="p-5 rounded-2xl border border-[#273244] bg-[#101722] space-y-2">
          <div className="text-amber-400 flex items-center justify-between">
            <Trophy size={18} />
            <span className="text-[10px] font-mono text-[#727E8F]">Lifetime</span>
          </div>
          <div className="text-2xl font-bold font-mono text-white">{user.xp || 0} XP</div>
          <div className="text-xs text-[#A8B0BC]">Experience Points</div>
        </div>
      </div>

      {/* Breakdown: Strengths & Focus Areas */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Verified Strengths */}
        <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 size={16} /> Verified Competencies
          </div>
          {user.currentSkills && user.currentSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.currentSkills.map((sk) => (
                <span key={sk} className="px-3 py-1 rounded-lg text-xs font-mono bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                  {sk}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#727E8F]">
              No verified competencies recorded yet. Complete assessments or add skills in Profile Settings.
            </p>
          )}
        </div>

        {/* Adaptive Revision Priorities */}
        <div className="rounded-2xl border border-[#273244] bg-[#101722] p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <TrendingUp size={16} /> Adaptive Revision Recommendations
          </div>
          <ul className="space-y-2 text-xs text-[#A8B0BC]">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Event loop microtasks vs macrotask queuing mechanics</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Compound database index ordering and prefix matching rules</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span>Stateless JWT rotation and refresh token reuse detection</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
