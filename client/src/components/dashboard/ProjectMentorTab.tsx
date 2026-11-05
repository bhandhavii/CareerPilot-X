import React, { useState } from 'react';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Code2, Copy, FolderTree, Loader2, Sparkles } from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';

interface ProjectMentorTabProps { user: User; }
interface ProjectBlueprint {
  id?: string;
  title: string;
  tagline?: string;
  difficulty?: string;
  techStack: string[];
  description: string;
  folderStructure?: string;
  databaseSchema?: string;
  apiArchitecture?: { method: string; endpoint: string; desc: string; auth?: boolean }[];
  milestones: { phase?: string; title: string; tasks: string[] }[];
  devPlan?: string[];
  source?: 'local-template' | 'gemini' | 'openai';
}

const STARTER_IDEAS = ['Personal finance tracker', 'AI study planner', 'Local event finder', 'Smart job application tracker'];

export const ProjectMentorTab: React.FC<ProjectMentorTabProps> = ({ user }) => {
  const [idea, setIdea] = useState('');
  const [level, setLevel] = useState<string>(user.experienceLevel || 'beginner');
  const [project, setProject] = useState<ProjectBlueprint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!idea.trim()) { setError('First, enter a project idea or the area you want to build in.'); return; }
    setLoading(true); setError(''); setProject(null);
    try {
      const result = await api.generateProjectBlueprint(idea.trim(), '', level);
      setProject(result as ProjectBlueprint);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Project plan could not be generated. Please try again.');
    } finally { setLoading(false); }
  };

  const copyPlan = async () => {
    if (!project) return;
    const content = `${project.title}\n${project.description}\n\nTech stack: ${project.techStack.join(', ')}\n\nBuild steps:\n${project.milestones.map((m, i) => `${i + 1}. ${m.title}\n${m.tasks.map((t) => `   - ${t}`).join('\n')}`).join('\n')}\n\nFolder structure:\n${project.folderStructure || 'Not provided'}`;
    try { await navigator.clipboard.writeText(content); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
    catch { setError('Could not copy. Please select and copy the project plan manually.'); }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fadeIn">
      <div className="border-b border-[#273244] pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#8DA7FF]"><BriefcaseBusiness size={15} /> Project Mentor</div>
        <h1 className="mt-2 text-3xl font-bold text-white">Plan a project you can build.</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A8B0BC]">Tell the mentor what you want to create. It will turn your idea into a simple project plan with features, tools and build steps.</p>
      </div>

      <form onSubmit={generate} className="space-y-4 rounded-2xl border border-[#273244] bg-[#101722] p-5 md:p-6">
        <label className="block text-sm font-semibold text-white" htmlFor="project-idea">What project do you want to build?</label>
        <textarea id="project-idea" value={idea} onChange={(e) => setIdea(e.target.value)} rows={3} placeholder="Example: I want to build an app that helps students find internships..." className="w-full resize-y rounded-xl border border-[#273244] bg-[#080B10] p-4 text-sm text-white outline-none placeholder:text-[#66758A] focus:border-[#245BFF]" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="block text-xs text-[#A8B0BC]">Your current level<select value={level} onChange={(e) => setLevel(e.target.value)} className="mt-1.5 block min-w-48 rounded-xl border border-[#273244] bg-[#080B10] px-3 py-2.5 text-sm text-white outline-none focus:border-[#245BFF]"><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label>
          <button type="submit" disabled={loading || !idea.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#245BFF] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50">{loading ? <><Loader2 size={16} className="animate-spin" /> Creating plan...</> : <><Sparkles size={16} /> Create my project plan</>}</button>
        </div>
        <div><p className="mb-2 text-[11px] text-[#71819A]">Need an idea? Try one:</p><div className="flex flex-wrap gap-2">{STARTER_IDEAS.map((item) => <button key={item} type="button" onClick={() => setIdea(item)} className="rounded-full border border-[#273244] bg-[#0B1422] px-3 py-1.5 text-xs text-[#A8B0BC] hover:border-[#245BFF] hover:text-white">{item}</button>)}</div></div>
        {error && <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-200">{error}</div>}
      </form>

      {project && (
        <section className="space-y-5 rounded-2xl border border-[#273244] bg-[#101722] p-5 md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-300">Your project plan</span><h2 className="mt-2 text-2xl font-bold text-white">{project.title}</h2>{project.tagline && <p className="mt-1 text-sm text-[#8DA7FF]">{project.tagline}</p>}</div><button onClick={copyPlan} type="button" className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-[#273244] px-3 py-2 text-xs font-semibold text-[#A8B0BC] hover:text-white"><Copy size={14} /> {copied ? 'Copied' : 'Copy plan'}</button></div>
          <p className="text-sm leading-7 text-[#C5CDDA]">{project.description}</p>
          <div><h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><Code2 size={16} className="text-[#8DA7FF]" /> Tools you can use</h3><div className="flex flex-wrap gap-2">{project.techStack.map((item) => <span key={item} className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-200">{item}</span>)}</div></div>
          <div><h3 className="mb-3 text-sm font-semibold text-white">Build it step by step</h3><div className="space-y-3">{project.milestones.map((milestone, index) => <div key={`${milestone.title}-${index}`} className="rounded-xl border border-[#273244] bg-[#0B1422] p-4"><div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#245BFF]/20 text-xs font-bold text-[#8DA7FF]">{index + 1}</span><div className="min-w-0"><p className="text-sm font-semibold text-white">{milestone.title}</p>{milestone.phase && <p className="mt-0.5 text-[11px] text-[#8DA7FF]">{milestone.phase}</p>}<ul className="mt-2 space-y-1.5">{milestone.tasks.map((task, taskIndex) => <li key={taskIndex} className="flex gap-2 text-xs leading-5 text-[#A8B0BC]"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-300" />{task}</li>)}</ul></div></div></div>)}</div></div>
          {project.folderStructure && <details className="rounded-xl border border-[#273244] bg-[#0B1422] p-4"><summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-white"><FolderTree size={16} className="text-[#8DA7FF]" /> Suggested folder structure</summary><pre className="mt-4 overflow-x-auto whitespace-pre text-xs leading-5 text-[#C5CDDA]">{project.folderStructure}</pre></details>}
          {project.databaseSchema && <details className="rounded-xl border border-[#273244] bg-[#0B1422] p-4"><summary className="cursor-pointer text-sm font-semibold text-white">Database design (optional detail)</summary><pre className="mt-4 overflow-x-auto whitespace-pre text-xs leading-5 text-[#C5CDDA]">{project.databaseSchema}</pre></details>}
          {project.apiArchitecture?.length ? <details className="rounded-xl border border-[#273244] bg-[#0B1422] p-4"><summary className="cursor-pointer text-sm font-semibold text-white">API plan (optional detail)</summary><div className="mt-3 space-y-2">{project.apiArchitecture.map((apiItem, index) => <div key={index} className="rounded-lg bg-[#101722] p-3"><p className="font-mono text-xs text-cyan-300">{apiItem.method} {apiItem.endpoint}</p><p className="mt-1 text-xs text-[#A8B0BC]">{apiItem.desc}</p></div>)}</div></details> : null}
          <p className="text-[11px] leading-5 text-[#71819A]">Use this as a starting plan. Build and test each part yourself; the generated plan does not mean the project has already been implemented.</p>
        </section>
      )}
    </div>
  );
};
