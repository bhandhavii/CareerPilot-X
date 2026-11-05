import React from 'react';
import { Sparkles, ArrowRight, BookOpen, BrainCircuit, Code2, FileCheck2, BriefcaseBusiness, Target, CheckCircle2, Route, Bot, ClipboardCheck } from 'lucide-react';
import { CareerTrack } from '../../types';
import { cyberAudio } from '../../utils/audio';

interface StageOverlaysProps {
  currentStage: number;
  scrollProgress: number;
  onSelectTrack: (track: CareerTrack) => void;
  selectedTrack: CareerTrack;
  onOpenAssessment: () => void;
  onOpenCodingArena: () => void;
  onOpenInterview: () => void;
  onOpenResume: () => void;
  onOpenAICoach: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigateToStage: (stageIndex: number) => void;
  onOpenModule: (module: 'missions' | 'mock_test' | 'project_mentor' | 'readiness') => void;
}

export const StageOverlays: React.FC<StageOverlaysProps> = ({
  onSelectTrack, selectedTrack, onOpenAssessment, onOpenCodingArena,
  onOpenInterview, onOpenResume, onOpenAICoach, onOpenAuth, onNavigateToStage, onOpenModule,
}) => {
  const card = 'max-w-lg pointer-events-auto rounded-3xl border border-blue-500/30 bg-[#07101f]/90 p-7 shadow-2xl backdrop-blur-xl';
  const eyebrow = 'mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-3 py-1 text-[11px] font-semibold text-blue-200';
  const button = 'inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-blue-950/40 transition hover:bg-blue-500';
  const altButton = 'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-5 py-3 text-xs font-semibold text-slate-200 transition hover:border-blue-400 hover:text-white';

  return (
    <div className="landing-heading-scope relative z-10 w-full pointer-events-none">
      <section id="hero" className="mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-12 pt-24 md:px-16">
        <div className="pointer-events-auto w-full max-w-xl lg:w-1/2">
          <div className={eyebrow}><Sparkles size={14} className="text-cyan-300" /> Your placement preparation companion</div>
          <h1 className="mb-5 text-4xl font-bold leading-[1.14] tracking-tight text-white sm:text-5xl lg:text-[3.65rem]">Learn Skills. <span className="hero-practice-gradient font-serif-title italic">Practice Daily.</span> Prepare for Placements.</h1>
          <p className="mb-7 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">Learn what you need, practise coding and interview questions, improve your resume and get ready for your next opportunity — all in one place.</p>
          <div className="mb-8 flex flex-wrap items-center gap-3"><button onClick={() => { cyberAudio.playSuccess(); onOpenAuth('register'); }} className={button}>Get started <ArrowRight size={15} /></button><button onClick={() => { cyberAudio.playClick(); onOpenAuth('login'); }} className={altButton}>Sign in</button><button onClick={() => { cyberAudio.playClick(); onNavigateToStage(1); }} className="px-1 py-2 text-xs text-slate-400 underline underline-offset-4 hover:text-cyan-200">Explore the 3D tour</button></div>
          <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-5 text-[11px] text-slate-300">{['My Learning', 'DSA Arena', 'Resume Analyzer', 'Interview Center'].map((label) => <span key={label} className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5">{label}</span>)}</div>
        </div>
      </section>

      <section className="mx-auto flex min-h-screen max-w-7xl items-center justify-end px-6 py-20 md:px-16">
        <div className={card}>
          <div className={eyebrow}><Bot size={14} /> AI Assistant</div>
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">Get help when you need it.</h2>
          <p className="mb-5 text-sm leading-6 text-slate-300">Ask questions about programming, DSA, coding errors, resumes, projects or interviews. Get explanations that help you understand the next step.</p>
          <ul className="mb-6 space-y-2 text-xs text-slate-300"><li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-cyan-300" /> Explain code and concepts</li><li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-cyan-300" /> Help fix errors</li><li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-cyan-300" /> Guide your placement preparation</li></ul>
          <button onClick={() => { cyberAudio.playClick(); onOpenAICoach(); }} className={button}>Talk to AI Assistant <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20 md:px-16">
        <div className={card}>
          <div className={eyebrow}><BookOpen size={14} /> My Learning</div>
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">Learn step by step.</h2>
          <p className="mb-5 text-sm leading-6 text-slate-300">Choose a subject and start from the basics. Learn programming, frontend, backend, databases, core computer science and AI/ML topics.</p>
          <div className="mb-6 grid grid-cols-2 gap-2 text-xs">{['C, C++, Java, Python', 'HTML, CSS, JavaScript, React', 'Node.js, Express, FastAPI', 'SQL, MongoDB, DBMS, OS, CN', 'Machine Learning', 'Generative AI'].map((item) => <div key={item} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-slate-300">{item}</div>)}</div>
          <button onClick={() => { cyberAudio.playClick(); onOpenAssessment(); }} className={button}>Start learning <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="mx-auto flex min-h-screen max-w-7xl items-center justify-end px-6 py-20 md:px-16">
        <div className={card}>
          <div className={eyebrow}><Route size={14} /> Your learning roadmap</div>
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">Know what to learn next.</h2>
          <p className="mb-5 text-sm leading-6 text-slate-300">Choose your career goal and current skills. Follow a clear path from foundations to projects and interview preparation.</p>
          <div className="space-y-2">{[['1', 'Learn the foundations'], ['2', 'Build technical skills'], ['3', 'Practise DSA and core subjects'], ['4', 'Build projects'], ['5', 'Prepare for interviews']].map(([number, label]) => <div key={number} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-cyan-200">{number}</span><span className="text-xs font-semibold text-slate-200">{label}</span></div>)}</div>
          <div className="mt-5 flex flex-wrap gap-2">{(['frontend', 'backend', 'fullstack'] as CareerTrack[]).map((track) => <button key={track} onClick={() => onSelectTrack(track)} className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize ${selectedTrack === track ? 'border-blue-400 bg-blue-500/20 text-white' : 'border-slate-700 text-slate-400 hover:text-white'}`}>{track}</button>)}</div>
          <button onClick={() => { cyberAudio.playClick(); onOpenAuth('register'); }} className={`${button} mt-5`}>Create my roadmap <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20 md:px-16">
        <div className={card}>
          <div className={eyebrow}><Code2 size={14} /> DSA Arena</div>
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">Practise coding questions.</h2>
          <p className="mb-5 text-sm leading-6 text-slate-300">Work through your DSA question list topic by topic. Open questions on LeetCode, mark them as solved and track your practice.</p>
          <div className="mb-6 grid grid-cols-2 gap-2 text-xs">{['Arrays and Strings', 'Searching and Sorting', 'Linked Lists', 'Trees and Graphs', 'Stacks and Queues', 'Dynamic Programming'].map((topic) => <div key={topic} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-slate-300">{topic}</div>)}</div>
          <button onClick={() => { cyberAudio.playClick(); onOpenCodingArena(); }} className={button}>Explore DSA Arena <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="mx-auto flex min-h-screen max-w-7xl items-center justify-end px-6 py-20 md:px-16">
        <div className={card}>
          <div className={eyebrow}><BriefcaseBusiness size={14} /> Project Mentor and Daily Missions</div>
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">Turn practice into real work.</h2>
          <p className="mb-5 text-sm leading-6 text-slate-300">Get a project plan from your idea, with features, technology choices and clear build steps. Daily Missions helps you keep making progress in small sessions.</p>
          <div className="mb-6 grid gap-2 sm:grid-cols-2"><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><BriefcaseBusiness className="mb-2 text-cyan-300" size={18} /><p className="text-sm font-semibold">Project Mentor</p><p className="mt-1 text-xs leading-5 text-slate-400">Idea, tools, milestones and folder structure.</p></div><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><ClipboardCheck className="mb-2 text-cyan-300" size={18} /><p className="text-sm font-semibold">Daily Missions</p><p className="mt-1 text-xs leading-5 text-slate-400">Small tasks, completion and streak tracking.</p></div></div>
          <div className="flex flex-wrap gap-2"><button onClick={() => { cyberAudio.playClick(); onOpenModule('project_mentor'); }} className={button}>Open Project Mentor <ArrowRight size={15} /></button><button onClick={() => { cyberAudio.playClick(); onOpenModule('missions'); }} className={altButton}>Daily Missions</button></div>
        </div>
      </section>

      <section className="mx-auto flex min-h-screen max-w-7xl items-center px-6 py-20 md:px-16">
        <div className={card}>
          <div className={eyebrow}><BrainCircuit size={14} /> Interview Center</div>
          <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">Practise the interview you choose.</h2>
          <p className="mb-5 text-sm leading-6 text-slate-300">Choose Python, Java, frontend, backend, full stack, DSA, HR or project discussion. Answer by typing or speaking. The AI asks a follow-up based on what you said and gives feedback at the end.</p>
          <div className="mb-6 space-y-2 text-xs text-slate-300"><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">Your answer → related follow-up question</div><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">Your results → score, strengths and improvements</div></div>
          <button onClick={() => { cyberAudio.playClick(); onOpenInterview(); }} className={button}>Try Interview Center <ArrowRight size={15} /></button>
        </div>
      </section>

      <section className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-20 text-center md:px-16">
        <div className={`${card} max-w-2xl`}>
          <div className={`${eyebrow} mx-auto`}><Target size={14} /> Get ready for placements</div>
          <h2 className="mb-3 text-3xl font-bold text-white sm:text-4xl">Bring your preparation together.</h2>
          <p className="mx-auto mb-6 max-w-xl text-sm leading-7 text-slate-300">Improve your resume, take mock tests, review your placement readiness and keep working on the skills you need next.</p>
          <div className="mb-6 grid grid-cols-1 gap-2 text-left sm:grid-cols-3"><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><FileCheck2 size={18} className="mb-2 text-cyan-300" /><p className="text-xs font-semibold">Resume Analyzer</p></div><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><ClipboardCheck size={18} className="mb-2 text-cyan-300" /><p className="text-xs font-semibold">Daily Mock Test</p></div><div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3"><Target size={18} className="mb-2 text-cyan-300" /><p className="text-xs font-semibold">Placement Readiness</p></div></div>
          <div className="flex flex-wrap justify-center gap-3"><button onClick={() => { cyberAudio.playClick(); onOpenResume(); }} className={altButton}>Open Resume Analyzer</button><button onClick={() => { cyberAudio.playSuccess(); onOpenAuth('register'); }} className={button}>Create account <ArrowRight size={15} /></button></div>
        </div>
      </section>
    </div>
  );
};
