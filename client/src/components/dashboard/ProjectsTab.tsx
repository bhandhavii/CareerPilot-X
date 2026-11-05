import React, { useState } from 'react';
import {
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  Github,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ProjectItem } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface ProjectsTabProps {
  projects: ProjectItem[];
  onProjectsUpdated?: (projects: ProjectItem[]) => void;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  projects: initialProjects,
  onProjectsUpdated,
}) => {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects);
  const [expandedId, setExpandedId] = useState<string>(projects[0]?.id || '');
  const [repoUrls, setRepoUrls] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  const handleToggleMilestone = async (projectId: string, milestoneId: string) => {
    cyberAudio.playClick();
    const updated = await api.toggleProjectMilestone(projectId, milestoneId);
    setProjects(updated);
    if (onProjectsUpdated) onProjectsUpdated(updated);
  };

  const handleSaveRepo = async (projectId: string) => {
    cyberAudio.playSuccess();
    setSubmitting(projectId);
    // Simulating project save
    setTimeout(() => {
      setSubmitting(null);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-[.18em] text-[#8DA7FF] mb-2 font-semibold flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#B7FF32]" /> Portfolio Work
        </div>
        <h1 className="text-3xl md:text-4xl font-serif-title text-white">
          Practical Project Workshop<span className="text-[#B7FF32]">.</span>
        </h1>
        <p className="text-sm text-[#A8B0BC] mt-1.5 max-w-2xl leading-relaxed">
          Build resume-worthy engineering applications from scratch with step-by-step architecture milestones and evaluation rubrics.
        </p>
      </div>

      {/* Projects List */}
      <div className="space-y-5">
        {projects.map((proj) => {
          const isExpanded = expandedId === proj.id;
          const completedMilestones = proj.milestones.filter((m) => m.completed).length;
          const totalMilestones = proj.milestones.length;
          const pct = Math.round((completedMilestones / Math.max(1, totalMilestones)) * 100);

          return (
            <div
              key={proj.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded ? 'border-[#245BFF] bg-[#101722] shadow-glow-blue' : 'border-[#273244] bg-[#101722]/80 hover:border-[#536078]'
              }`}
            >
              {/* Project Card Header */}
              <div
                onClick={() => {
                  cyberAudio.playClick();
                  setExpandedId(isExpanded ? '' : proj.id);
                }}
                className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#245BFF]/15 text-[#8DA7FF] border border-[#245BFF]/30">
                      {proj.track}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/15 text-amber-300">
                      {proj.difficulty}
                    </span>
                    <span className="text-xs text-[#727E8F] flex items-center gap-1 font-mono">
                      <Clock size={12} /> ~{proj.estimatedHours}h
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug truncate">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-[#A8B0BC] line-clamp-1">
                    {proj.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-[#B7FF32]">{pct}% Done</div>
                    <div className="text-[10px] text-[#727E8F]">{completedMilestones}/{totalMilestones} Milestones</div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} className="text-[#8DA7FF]" /> : <ChevronDown size={18} className="text-[#727E8F]" />}
                </div>
              </div>

              {/* Expanded Project Details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-[#273244] space-y-6 animate-fadeIn">
                  <p className="text-xs text-[#A8B0BC] leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Skills Tag Pills */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-mono uppercase font-bold text-[#727E8F]">
                      Required Competencies
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.skills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-[#080B10] border border-[#273244] text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-3">
                    <div className="text-xs font-mono uppercase font-bold text-white flex items-center justify-between">
                      <span>Step-by-Step Architecture Milestones</span>
                      <span className="text-[#8DA7FF] text-[11px]">Click to toggle completion</span>
                    </div>

                    <div className="space-y-2">
                      {proj.milestones.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => handleToggleMilestone(proj.id, m.id)}
                          className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                            m.completed
                              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                              : 'bg-[#080B10] border-[#273244] text-[#A8B0BC] hover:border-[#536078]'
                          }`}
                        >
                          <CheckCircle2 size={16} className={m.completed ? 'text-emerald-400' : 'text-[#536078]'} />
                          <span className={`text-xs ${m.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                            {m.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Repository Submission */}
                  <div className="p-4 rounded-xl bg-[#080B10] border border-[#273244] space-y-3">
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <Github size={15} /> Project Verification & Repository
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={repoUrls[proj.id] || ''}
                        onChange={(e) => setRepoUrls({ ...repoUrls, [proj.id]: e.target.value })}
                        placeholder="https://github.com/your-username/project-repo"
                        className="flex-1 px-3 py-2 rounded-xl bg-[#101722] border border-[#273244] text-xs text-white placeholder:text-[#536078] outline-none focus:border-[#245BFF]"
                      />
                      <button
                        onClick={() => handleSaveRepo(proj.id)}
                        disabled={submitting === proj.id}
                        className="cyber-button-primary px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-glow-blue whitespace-nowrap"
                      >
                        {submitting === proj.id ? 'Saving...' : 'Submit Repository'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
