import React, { useState } from 'react';
import {
  Map,
  CheckCircle2,
  Lock,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { RoadmapMilestone, User } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface RoadmapTabProps {
  user: User;
  roadmap: RoadmapMilestone[];
  onOpenLearning: (lessonId?: string) => void;
  onToggleStatus?: (milestoneId: string) => void;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({
  user,
  roadmap,
  onOpenLearning,
  onToggleStatus,
}) => {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(roadmap);

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const progressPercent = Math.round((completedCount / Math.max(1, milestones.length)) * 100);

  const handleToggle = async (id: string) => {
    cyberAudio.playClick();
    const updated = await api.toggleMilestoneStatus(id);
    setMilestones(updated);
    if (onToggleStatus) onToggleStatus(id);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[.18em] text-[#8DA7FF] mb-2 font-semibold flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#B7FF32]" /> Adaptive Career Path
          </div>
          <h1 className="text-3xl md:text-4xl font-serif-title text-white">
            AI Learning Roadmap<span className="text-[#B7FF32]">.</span>
          </h1>
          <p className="text-sm text-[#A8B0BC] mt-1.5 max-w-2xl leading-relaxed">
            A sequenced engineering progression adapted to your track ({user.track}), target role ({user.careerGoal || 'Software Developer'}), and skill baseline.
          </p>
        </div>

        {/* Overall Completion Bar */}
        <div className="p-4 rounded-2xl border border-[#273244] bg-[#101722] min-w-[200px]">
          <div className="flex items-center justify-between text-xs text-[#A8B0BC] mb-2">
            <span>Roadmap Completion</span>
            <span className="font-mono font-bold text-[#B7FF32]">{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-[#080B10] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#245BFF] to-[#B7FF32] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-[#727E8F] mt-2 font-mono">
            {completedCount} of {milestones.length} Stages Mastered
          </div>
        </div>
      </div>

      {/* Visual Roadmap Sequence */}
      <div className="space-y-4">
        {milestones.map((m, idx) => {
          const isDone = m.status === 'completed';
          const isInProgress = m.status === 'in_progress';
          const isLocked = m.status === 'locked';

          return (
            <div
              key={m.id}
              className={`p-6 rounded-2xl border transition-all relative overflow-hidden ${
                isDone
                  ? 'bg-[#101722]/80 border-[#273244]'
                  : isInProgress
                  ? 'bg-[radial-gradient(ellipse_at_top_right,rgba(36,91,255,0.15),transparent_60%),#101722] border-[#245BFF] shadow-glow-blue'
                  : 'bg-[#0B1017] border-[#1D2533] opacity-65'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Status Indicator Icon */}
                  <div
                    onClick={() => !isLocked && handleToggle(m.id)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border cursor-pointer transition ${
                      isDone
                        ? 'bg-[#B7FF32]/20 border-[#B7FF32] text-[#B7FF32]'
                        : isInProgress
                        ? 'bg-[#245BFF]/20 border-[#245BFF] text-[#8DA7FF]'
                        : 'bg-[#151E2B] border-[#273244] text-[#536078]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 size={20} />
                    ) : isLocked ? (
                      <Lock size={18} />
                    ) : (
                      <span className="font-mono text-sm font-bold">0{idx + 1}</span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-[#727E8F]">
                        Stage 0{m.level || idx + 1}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isDone
                          ? 'bg-[#B7FF32]/15 text-[#B7FF32]'
                          : isInProgress
                          ? 'bg-[#245BFF]/15 text-[#8DA7FF]'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {m.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-[#727E8F] flex items-center gap-1">
                        <Clock size={12} /> {m.estimatedWeeks} Weeks
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white leading-tight">
                      {m.title}
                    </h3>

                    <p className="text-xs text-[#A8B0BC] leading-relaxed max-w-2xl">
                      {m.description}
                    </p>

                    {/* Skills Covered Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {m.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-mono bg-[#080B10] border border-[#273244] text-slate-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {m.whyRecommended && (
                      <div className="text-[11px] text-[#8DA7FF] pt-2 flex items-center gap-1.5 font-medium">
                        <ShieldCheck size={14} className="text-[#B7FF32]" />
                        <span>{m.whyRecommended}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0">
                  <button
                    onClick={() => onOpenLearning()}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      isInProgress
                        ? 'cyber-button-primary text-white shadow-glow-blue'
                        : isDone
                        ? 'bg-[#151E2B] text-slate-300 hover:text-white border border-[#273244]'
                        : 'bg-[#151E2B] text-slate-500 cursor-not-allowed border border-[#273244]'
                    }`}
                  >
                    <BookOpen size={13} />
                    <span>{isDone ? 'Review Lessons' : isInProgress ? 'Resume Stage' : 'Locked'}</span>
                  </button>

                  <button
                    onClick={() => handleToggle(m.id)}
                    className="text-[11px] text-[#727E8F] hover:text-[#8DA7FF] transition underline"
                  >
                    {isDone ? 'Mark In Progress' : 'Mark Completed'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
