import React, { useState } from 'react';
import {
  ArrowRight, BookOpen, Target, Code2, FileText, BrainCircuit,
  ClipboardCheck, BriefcaseBusiness, Bot, Route, CheckCircle2,
  ChevronDown, Sparkles, Flame,
} from 'lucide-react';
import { CareerTrack } from '../../types';
import { cyberAudio } from '../../utils/audio';

interface LandingSectionsProps {
  onOpenAssessment: () => void;
  onOpenCodingArena: () => void;
  onOpenInterview: () => void;
  onOpenResume: () => void;
  onOpenAICoach: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onSelectTrack: (track: CareerTrack) => void;
  onOpenModule: (module: 'missions' | 'mock_test' | 'project_mentor' | 'readiness') => void;
}

export const LandingSections: React.FC<LandingSectionsProps> = ({
  onOpenAssessment,
  onOpenCodingArena,
  onOpenInterview,
  onOpenResume,
  onOpenAICoach,
  onOpenAuth,
  onOpenModule,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const modules = [
    { title: 'My Learning', desc: 'Learn programming, web development, databases and core CS topics step by step.', icon: <BookOpen />, action: onOpenAssessment, label: 'Explore learning' },
    { title: 'Daily Missions', desc: 'Get a small set of daily tasks. Complete them and build a steady study habit.', icon: <Flame />, action: () => onOpenModule('missions'), label: 'Build your routine' },
    { title: 'DSA Arena', desc: 'Practice the questions in your DSA list, open them on LeetCode and track what you solve.', icon: <Code2 />, action: onOpenCodingArena, label: 'Explore DSA' },
    { title: 'Resume Analyzer', desc: 'Upload your resume, choose a role and get clear suggestions to improve it.', icon: <FileText />, action: onOpenResume, label: 'Check your resume' },
    { title: 'Interview Center', desc: 'Choose an interview topic, answer questions and receive feedback on your answers.', icon: <BrainCircuit />, action: onOpenInterview, label: 'Try an interview' },
    { title: 'Daily Mock Test', desc: 'Test your knowledge with short practice tests and review explanations.', icon: <ClipboardCheck />, action: () => onOpenModule('mock_test'), label: 'Start practice' },
    { title: 'Project Mentor', desc: 'Turn a project idea into a clear plan with features, tools and build steps.', icon: <BriefcaseBusiness />, action: () => onOpenModule('project_mentor'), label: 'Plan a project' },
    { title: 'Placement Readiness', desc: 'See your strengths and the areas you should work on next, based on your activity.', icon: <Target />, action: () => onOpenModule('readiness'), label: 'Track readiness' },
    { title: 'AI Assistant', desc: 'Ask questions about coding, DSA, learning, projects, resumes and placements.', icon: <Bot />, action: onOpenAICoach, label: 'Talk to AI Assistant' },
  ];

  const roadmap = [
    ['1', 'Choose your goal', 'Select the role you want to prepare for and tell us what you already know.'],
    ['2', 'Learn the basics', 'Follow lessons in programming, web development, databases and core subjects.'],
    ['3', 'Practice every day', 'Solve DSA questions, complete daily missions and take mock tests.'],
    ['4', 'Prepare for interviews', 'Practice technical, HR and project questions and review your feedback.'],
    ['5', 'Get placement-ready', 'Improve your resume, build projects and work on your weaker areas.'],
  ];

  const faqs = [
    { q: 'What is CareerPilot X?', a: 'CareerPilot X brings learning, coding practice, mock tests, resume improvement, project guidance and interview preparation together in one place.' },
    { q: 'Can I learn from the beginning?', a: 'Yes. Choose your career goal and current skill level. Start with beginner lessons and move forward as you complete topics.' },
    { q: 'How does the DSA Arena work?', a: 'It shows your DSA question list, lets you open supported LeetCode practice pages and save your solved status.' },
    { q: 'Does the AI interview support voice?', a: 'Voice input and spoken AI replies depend on browser speech support and a working AI API key. Text answers are also available.' },
    { q: 'Do I need an AI API key?', a: 'Account creation and normal learning do not need an AI key. AI-powered features need a provider key configured on the backend.' },
  ];

  return (
    <div className="landing-refined relative z-10 border-t border-slate-800 bg-[#030712] text-white">
      <section id="universe" className="mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-24">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-200"><Sparkles size={14} /> One place for your placement preparation</span>
          <h2 className="text-3xl font-bold leading-tight sm:text-5xl">Learn. Practice. <span className="text-cyan-300">Get ready for placements.</span></h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">CareerPilot X helps you plan what to learn, practise useful skills and prepare for interviews — one step at a time.</p>
          <button onClick={() => { cyberAudio.playClick(); onOpenAuth('register'); }} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-500">Create your free account <ArrowRight size={16} /></button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <article key={module.title} className="group flex min-h-[205px] flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:-translate-y-1 hover:border-blue-500/50 hover:bg-slate-900">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-300">{module.icon}</div>
              <h3 className="text-base font-bold">{module.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">{module.desc}</p>
              <button onClick={() => { cyberAudio.playClick(); module.action(); }} className="mt-4 inline-flex items-center gap-2 self-start text-xs font-semibold text-blue-300 transition group-hover:text-white">{module.label} <ArrowRight size={14} /></button>
            </article>
          ))}
        </div>
      </section>

      <section id="roadmap" className="border-y border-slate-800 bg-slate-950/70 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-300"><Route size={15} /> Your preparation path</span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">A clear path from learning to placements</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">Start with your current level. Complete each step and keep moving forward.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {roadmap.map(([number, title, description], index) => (
              <div key={number} className="rounded-2xl border border-slate-800 bg-[#0b1220] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-sm font-bold text-blue-200">{number}</div>
                <h3 className="mt-4 text-sm font-bold">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
                {index < roadmap.length - 1 && <div className="mt-4 hidden text-xs text-slate-600 md:block">Next step →</div>}
              </div>
            ))}
          </div>
          <div className="mt-9 text-center"><button onClick={() => { cyberAudio.playSuccess(); onOpenAuth('register'); }} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold hover:bg-blue-500">Create my learning plan <ArrowRight size={16} /></button></div>
        </div>
      </section>

      <section id="interview-preview" className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-20 md:grid-cols-2 md:px-12">
        <div className="rounded-3xl border border-blue-500/25 bg-gradient-to-br from-blue-950/60 to-slate-900 p-7">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200"><BrainCircuit /></div><div><p className="text-sm font-bold">Interview practice</p><p className="text-xs text-slate-400">Your answer → relevant feedback</p></div></div>
          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/80 p-4"><p className="text-xs text-blue-300">AI Interviewer</p><p className="mt-2 text-sm leading-6">“Can you explain how you would approach this problem?”</p></div>
          <div className="ml-8 mt-3 rounded-2xl border border-blue-500/30 bg-blue-950/50 p-4"><p className="text-xs text-cyan-300">Your answer</p><p className="mt-2 text-sm leading-6 text-slate-200">Explain your idea, steps and why you chose that approach.</p></div>
          <div className="mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4"><p className="text-xs font-semibold text-emerald-300">Feedback</p><p className="mt-2 text-xs leading-5 text-slate-300">Understand what you explained well and what you can improve.</p></div>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Practice with feedback</span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Prepare for the interview you choose</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">Choose Python, Java, frontend, backend, full stack, DSA, HR or your project. Answer by typing or speaking. The AI interviewer uses your answer to decide what to ask next.</p>
          <ul className="mt-5 space-y-3 text-sm text-slate-300"><li className="flex gap-2"><CheckCircle2 size={17} className="shrink-0 text-emerald-300" /> Relevant follow-up questions</li><li className="flex gap-2"><CheckCircle2 size={17} className="shrink-0 text-emerald-300" /> Voice input and spoken replies when supported</li><li className="flex gap-2"><CheckCircle2 size={17} className="shrink-0 text-emerald-300" /> Final score, feedback and a better sample answer</li></ul>
          <button onClick={() => { cyberAudio.playClick(); onOpenInterview(); }} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500">Explore Interview Center <ArrowRight size={15} /></button>
        </div>
      </section>

      <section id="resume-preview" className="border-y border-slate-800 bg-slate-950/60 px-6 py-20 md:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2">
          <div><span className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Resume improvement</span><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Make your resume clearer and stronger</h2><p className="mt-4 text-sm leading-7 text-slate-300">Upload your resume and select the role you want. Review the skills found, missing keywords and practical suggestions based on your actual resume content.</p><button onClick={() => { cyberAudio.playClick(); onOpenResume(); }} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500">Open Resume Analyzer <ArrowRight size={15} /></button></div>
          <div className="rounded-3xl border border-slate-800 bg-[#0b1220] p-6"><div className="flex items-center gap-3 border-b border-slate-800 pb-4"><FileText className="text-cyan-300" /><div><p className="text-sm font-bold">Resume review</p><p className="text-xs text-slate-500">Based on the file you upload</p></div></div><div className="mt-5 space-y-3">{['Skills and keywords', 'Education and projects', 'Role match', 'Formatting and clarity', 'Suggestions to improve'].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-900 px-3 py-3 text-sm text-slate-300"><CheckCircle2 size={16} className="text-emerald-300" />{item}</div>)}</div></div>
        </div>
      </section>

      <section id="missions-preview" className="mx-auto max-w-7xl px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl text-center"><span className="text-xs font-semibold uppercase tracking-widest text-orange-300">Small steps, every day</span><h2 className="mt-3 text-3xl font-bold sm:text-4xl">Build a daily learning habit</h2><p className="mt-4 text-sm leading-7 text-slate-300">Daily Missions gives you manageable tasks such as learning one topic, solving a DSA question, revising a concept or working on your project. Your streak and progress update when you complete tasks.</p><button onClick={() => { cyberAudio.playClick(); onOpenAuth('register'); }} className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold hover:border-blue-500">Start my daily practice <ArrowRight size={15} /></button></div>
      </section>

      <section id="faq" className="border-t border-slate-800 bg-slate-950/70 px-6 py-20 md:px-12">
        <div className="mx-auto max-w-3xl"><div className="mb-8 text-center"><span className="text-xs font-semibold uppercase tracking-widest text-blue-300">Need to know</span><h2 className="mt-3 text-3xl font-bold">Frequently asked questions</h2></div><div className="space-y-3">{faqs.map((faq, index) => <div key={faq.q} className="rounded-2xl border border-slate-800 bg-slate-900/70"><button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-4 p-4 text-left text-sm font-semibold"><span>{faq.q}</span><ChevronDown size={17} className={`shrink-0 text-slate-400 transition ${openFaq === index ? 'rotate-180' : ''}`} /></button>{openFaq === index && <p className="px-4 pb-4 text-sm leading-6 text-slate-400">{faq.a}</p>}</div>)}</div></div>
      </section>

      <section className="px-6 py-20 text-center"><div className="mx-auto max-w-3xl"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300"><Target /></div><h2 className="mt-5 text-3xl font-bold sm:text-4xl">Ready to start preparing?</h2><p className="mt-4 text-sm leading-7 text-slate-400">Create your account, choose your goal and take the first step with CareerPilot X.</p><button onClick={() => { cyberAudio.playSuccess(); onOpenAuth('register'); }} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold hover:bg-blue-500">Get started <ArrowRight size={16} /></button></div></section>

      <footer className="border-t border-slate-800 px-6 py-8"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row"><div className="font-bold text-slate-300">CareerPilot X <span className="text-blue-400">·</span> Your placement preparation companion</div><div>© {new Date().getFullYear()} CareerPilot X</div><div className="flex gap-4"><button onClick={() => onOpenAuth('login')} className="hover:text-white">Sign in</button><button onClick={() => onOpenAuth('register')} className="hover:text-white">Create account</button></div></div></footer>
    </div>
  );
};
