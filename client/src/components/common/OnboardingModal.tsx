import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Check, Sparkles, Compass, Cpu, Building2, Clock, CheckCircle2 } from 'lucide-react';
import { User } from '../../types';
import { api } from '../../services/api';

interface Props {
  user: User;
  onComplete: (user: User) => void;
}

const CAREER_GOALS = [
  {
    id: 'Frontend Developer',
    title: 'Frontend Developer',
    desc: 'HTML, CSS, Modern JavaScript, React & Interactive Web Apps',
    badge: 'High Demand',
    icon: '🎨',
  },
  {
    id: 'Backend Developer',
    title: 'Backend Developer',
    desc: 'Node.js, Express, Databases, APIs & High-Performance Architecture',
    badge: 'Core Infra',
    icon: '⚙️',
  },
  {
    id: 'Full Stack Developer',
    title: 'Full Stack Developer',
    desc: 'End-to-end applications from responsive UI to scalable backend & DBs',
    badge: 'Comprehensive',
    icon: '⚡',
  },
  {
    id: 'Java Developer',
    title: 'Java Developer',
    desc: 'Core Java, Spring Boot, OOP Design & Enterprise Systems',
    badge: 'Enterprise',
    icon: '☕',
  },
  {
    id: 'Data Analyst',
    title: 'Data Analyst',
    desc: 'SQL, Python, Data Wrangling, BI Dashboards & Statistical Modeling',
    badge: 'Analytics',
    icon: '📊',
  },
  {
    id: 'AI Engineer',
    title: 'AI Engineer',
    desc: 'Machine Learning, Deep Learning, LLM APIs & Vector Databases',
    badge: 'Future Tech',
    icon: '🤖',
  },
];

const SKILL_CATALOG = [
  'HTML5',
  'CSS3',
  'JavaScript (ES6+)',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Express.js',
  'MongoDB',
  'SQL / PostgreSQL',
  'Python',
  'Java',
  'C / C++',
  'Git / GitHub',
  'Data Structures & Algorithms',
  'Docker',
];

const DREAM_COMPANIES = [
  { name: 'Google', icon: '🌐' },
  { name: 'Amazon', icon: '📦' },
  { name: 'Microsoft', icon: '💻' },
  { name: 'TCS', icon: '🏢' },
  { name: 'Infosys', icon: '🏛️' },
];

const STUDY_HOURS_OPTIONS = [
  { hours: 0, label: 'Not sure yet', desc: 'You can decide your study time later' },
  { hours: 1, label: '1 Hour', desc: 'A small daily learning session' },
  { hours: 2, label: '2 Hours', desc: 'Recommended for steady progress & weekend projects' },
  { hours: 3, label: '3 Hours', desc: 'Accelerated track for placement preparation in 90 days' },
  { hours: 4, label: '4+ Hours', desc: 'Intensive immersion: DSA, full-stack projects & mock interviews' },
];

export const OnboardingModal: React.FC<Props> = ({ user, onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [careerGoal, setCareerGoal] = useState<string>(user.careerGoal || '');
  const [currentSkills, setCurrentSkills] = useState<string[]>(user.currentSkills || []);
  const [dreamCompany, setDreamCompany] = useState<string>(user.dreamCompany || '');
  const [customCompany, setCustomCompany] = useState<string>('');
  const [dailyStudyHours, setDailyStudyHours] = useState<number>(user.dailyStudyHours || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSkill = (skill: string) => {
    setCurrentSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !careerGoal) { setError('Please choose a career goal to continue.'); return; }
    if (step < 4) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const finalCompany = customCompany.trim() || dreamCompany;

    try {
      const updated = await api.saveOnboarding({
        careerGoal,
        experienceLevel: 'beginner',
        currentSkills,
        dailyStudyHours,
        dreamCompany: finalCompany,
      });
      onComplete(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#080B10]/95 backdrop-blur-xl p-4 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-[28px] border border-[#273244] bg-[#101722] shadow-2xl overflow-hidden my-6">
        {/* Header Bar with Step Progression */}
        <div className="p-6 md:p-8 border-b border-[#273244] bg-[radial-gradient(ellipse_at_top_right,rgba(36,91,255,0.15),transparent_60%)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#B7FF32] text-xs font-semibold tracking-[.18em] uppercase">
              <Sparkles size={15} /> AI Career Setup
            </div>
            <div className="text-xs font-mono text-[#A8B0BC]">
              Step <span className="text-[#245BFF] font-bold">{step}</span> of 4
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-[#245BFF]' : 'bg-[#1e2838]'
                }`}
              />
            ))}
          </div>

          <h2 className="mt-5 text-2xl md:text-3xl font-serif-title text-white">
            {step === 1 && 'What is your primary Career Goal?'}
            {step === 2 && 'What skills have you practiced so far?'}
            {step === 3 && 'What is your Dream Company?'}
            {step === 4 && 'How much time can you dedicate daily?'}
          </h2>
          <p className="mt-1.5 text-xs md:text-sm text-[#A8B0BC]">
            {step === 1 && 'CareerPilot X shapes your learning roadmap, missions, and interview rubrics to this goal.'}
            {step === 2 && 'Select all technologies you are familiar with. We will calibrate lesson start points.'}
            {step === 3 && 'We tailor mock interviews, question banks, and behavioral guidelines to their hiring patterns.'}
            {step === 4 && 'We construct achievable daily missions and milestone schedules tailored to your bandwidth.'}
          </p>
        </div>

        {/* Step Content */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
              {error}
            </div>
          )}

          {/* STEP 1: CAREER GOAL */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CAREER_GOALS.map((g) => {
                const isSelected = careerGoal === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setCareerGoal(g.id)}
                    className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#245BFF] bg-[#162133] shadow-lg shadow-[#245BFF]/10 ring-1 ring-[#245BFF]'
                        : 'border-[#273244] bg-[#0c121d] hover:border-[#3b4a62]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{g.icon}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-[#245BFF]/30 text-[#8DA7FF]'
                              : 'bg-[#1c2638] text-[#727E8F]'
                          }`}
                        >
                          {g.badge}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-white">{g.title}</h4>
                      <p className="text-xs text-[#8d9ab0] mt-1 leading-relaxed">{g.desc}</p>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5 text-xs">
                      {isSelected ? (
                        <span className="text-[#B7FF32] font-semibold flex items-center gap-1">
                          <CheckCircle2 size={14} /> Selected Goal
                        </span>
                      ) : (
                        <span className="text-[#536078]">Click to choose</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2: CURRENT SKILLS */}
          {step === 2 && (
            <div>
              <p className="text-xs text-[#A8B0BC] mb-4">
                Click any skills you have touched before. If you are starting completely fresh, you can click Next to continue.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {SKILL_CATALOG.map((skill) => {
                  const isChecked = currentSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${
                        isChecked
                          ? 'border-[#245BFF] bg-[#245BFF]/15 text-[#8DA7FF] shadow-sm'
                          : 'border-[#273244] bg-[#0c121d] text-[#A8B0BC] hover:border-[#3e4f6a] hover:text-white'
                      }`}
                    >
                      {isChecked ? (
                        <Check size={13} className="text-[#B7FF32]" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3b4a62]" />
                      )}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-xl border border-[#273244] bg-[#0c121d] flex items-center justify-between text-xs text-[#A8B0BC]">
                <span>Total skills selected: <strong className="text-white">{currentSkills.length}</strong></span>
                {currentSkills.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCurrentSkills([])}
                    className="text-[#727E8F] hover:text-white underline text-[11px]"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: DREAM COMPANY */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DREAM_COMPANIES.map((company) => {
                  const isSelected = dreamCompany === company.name && !customCompany;
                  return (
                    <button
                      key={company.name}
                      type="button"
                      onClick={() => {
                        setDreamCompany(company.name);
                        setCustomCompany('');
                      }}
                      className={`p-4 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'border-[#245BFF] bg-[#162133] ring-1 ring-[#245BFF]'
                          : 'border-[#273244] bg-[#0c121d] hover:border-[#3b4a62]'
                      }`}
                    >
                      <div className="text-3xl mb-2">{company.icon}</div>
                      <div className="text-sm font-semibold text-white">{company.name}</div>
                      <div className="text-[10px] text-[#727E8F] mt-1">Tier-1 Benchmark</div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block">
                  <span className="text-xs text-[#A8B0BC]">Or specify another company (optional)</span>
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => {
                      setCustomCompany(e.target.value);
                      if (e.target.value.trim()) {
                        setDreamCompany(e.target.value.trim());
                      }
                    }}
                    placeholder="e.g. Netflix, Uber, Adobe, Oracle..."
                    className="mt-1.5 w-full rounded-xl bg-[#080B10] border border-[#273244] p-3 text-sm text-white outline-none focus:border-[#245BFF]"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: DAILY STUDY HOURS */}
          {step === 4 && (
            <div className="space-y-3">
              {STUDY_HOURS_OPTIONS.map((opt) => {
                const isSelected = dailyStudyHours === opt.hours;
                return (
                  <button
                    key={opt.hours}
                    type="button"
                    onClick={() => setDailyStudyHours(opt.hours)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#245BFF] bg-[#162133] ring-1 ring-[#245BFF]'
                        : 'border-[#273244] bg-[#0c121d] hover:border-[#3b4a62]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base ${
                        isSelected ? 'bg-[#245BFF] text-white' : 'bg-[#1a2436] text-[#A8B0BC]'
                      }`}>
                        {opt.hours === 0 ? '—' : `${opt.hours}h`}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{opt.label} per day</div>
                        <div className="text-xs text-[#8d9ab0] mt-0.5">{opt.desc}</div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-[#B7FF32] flex items-center justify-center text-black font-bold">
                          ✓
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-[#273244]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-8 border-t border-[#273244] bg-[#0c121d] flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex items-center gap-2 text-xs font-semibold text-[#A8B0BC] hover:text-white px-4 py-2.5 rounded-xl border border-[#273244] bg-[#101722] transition-colors"
              >
                <ArrowLeft size={15} /> Back
              </button>
            ) : (
              <span className="text-xs text-[#536078]">Step 1 of 4</span>
            )}
          </div>

          <div>
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="cyber-button-primary rounded-xl px-6 py-3 text-xs font-semibold flex items-center gap-2"
              >
                Next <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading}
                className="cyber-button-primary rounded-xl px-7 py-3 text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#245BFF]/20"
              >
                {loading ? 'Activating Command Center…' : 'Launch My Dashboard'}
                <Sparkles size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
