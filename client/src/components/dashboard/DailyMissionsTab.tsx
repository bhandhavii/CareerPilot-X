import React, { useEffect, useState } from 'react';
import {
  Zap,
  CheckCircle2,
  Trophy,
  Flame,
  Code2,
  BrainCircuit,
  BriefcaseBusiness,
  BookOpen,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  Plus,
  X,
} from 'lucide-react';
import { User, DailyMission } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

interface DailyMissionsTabProps {
  user: User;
  onOpenLearning?: (lessonId?: string) => void;
  onOpenCodingArena?: () => void;
  onOpenInterview?: () => void;
  onOpenProjects?: () => void;
  onUserUpdated?: (user: User) => void;
}

interface ComprehensiveMission {
  id: string;
  category: 'dsa' | 'leetcode' | 'learning' | 'project' | 'interview';
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  xpReward: number;
  completed: boolean;
  estimatedMinutes: number;
  leetcodeNumber?: number;
  leetcodeUrl?: string;
  tags: string[];
  started?: boolean;
}

const INITIAL_DAILY_TASKS: ComprehensiveMission[] = [
  // 1. DSA Tasks
  {
    id: 'dm-dsa-1',
    category: 'dsa',
    title: 'Two Pointers & Sliding Window Pattern',
    description: 'Solve the contiguous subarray sum pattern and calculate maximum sum of distinct elements with O(n) time complexity.',
    difficulty: 'Medium',
    xpReward: 120,
    completed: false,
    estimatedMinutes: 25,
    tags: ['Arrays', 'Two Pointers', 'Sliding Window'],
  },
  // 2. LeetCode Questions
  {
    id: 'dm-lc-1',
    category: 'leetcode',
    title: 'LeetCode 121: Best Time to Buy and Sell Stock',
    description: 'Find the maximum profit achievable by buying on one day and selling on a future day in an array of prices.',
    difficulty: 'Easy',
    xpReward: 80,
    completed: false,
    estimatedMinutes: 15,
    leetcodeNumber: 121,
    leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    tags: ['Arrays', 'Dynamic Programming', 'Greedy'],
  },
  {
    id: 'dm-lc-2',
    category: 'leetcode',
    title: 'LeetCode 200: Number of Islands',
    description: 'Given an m x n 2D binary grid representing a map of 1s (land) and 0s (water), return the total number of connected islands using BFS/DFS.',
    difficulty: 'Medium',
    xpReward: 150,
    completed: false,
    estimatedMinutes: 30,
    leetcodeNumber: 200,
    leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/',
    tags: ['DFS', 'BFS', 'Matrix', 'Graphs'],
  },
  {
    id: 'dm-lc-3',
    category: 'leetcode',
    title: 'LeetCode 3: Longest Substring Without Repeating Characters',
    description: 'Given a string s, find the length of the longest substring without duplicate characters using a hash map sliding window.',
    difficulty: 'Medium',
    xpReward: 130,
    completed: false,
    estimatedMinutes: 20,
    leetcodeNumber: 3,
    leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    tags: ['Hash Table', 'String', 'Sliding Window'],
  },
  // 3. Learning Tasks
  {
    id: 'dm-learn-1',
    category: 'learning',
    title: 'Master React Custom Hooks & State Immutability',
    description: 'Review the React hooks architecture module and build a custom useDebounce and useLocalStorage hook.',
    difficulty: 'Medium',
    xpReward: 100,
    completed: false,
    estimatedMinutes: 20,
    tags: ['React', 'Hooks', 'State'],
  },
  // 4. Project Tasks
  {
    id: 'dm-proj-1',
    category: 'project',
    title: 'Implement Database Connection Pooling & Healthchecks',
    description: 'Configure MongoDB/PostgreSQL connection timeouts, retry backoff logic, and an endpoint /api/health monitoring cluster status.',
    difficulty: 'Hard',
    xpReward: 160,
    completed: false,
    estimatedMinutes: 35,
    tags: ['Databases', 'Backend', 'DevOps'],
  },
  // 5. Mock Interview Tasks
  {
    id: 'dm-int-1',
    category: 'interview',
    title: 'Conduct 1 Technical Architecture Simulation',
    description: 'Answer 1 full technical interview scenario in the Interview Center covering distributed caching or React concurrency.',
    difficulty: 'Medium',
    xpReward: 150,
    completed: false,
    estimatedMinutes: 20,
    tags: ['Interview', 'System Design', 'Communication'],
  },
];

export const DailyMissionsTab: React.FC<DailyMissionsTabProps> = ({
  user,
  onOpenLearning,
  onOpenCodingArena,
  onOpenInterview,
  onOpenProjects,
  onUserUpdated,
}) => {
  const [filter, setFilter] = useState<'all' | 'dsa' | 'leetcode' | 'learning' | 'project' | 'interview'>('all');
  const [missions, setMissions] = useState<ComprehensiveMission[]>(() => {
    const saved = localStorage.getItem('cpx_full_daily_missions');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_DAILY_TASKS;
  });
  const [showCustomMission, setShowCustomMission] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customCategory, setCustomCategory] = useState<ComprehensiveMission['category']>('learning');
  const [customSaving, setCustomSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const loadMissions = async () => {
      try {
        const saved = await api.getFullDailyMissions();
        if (!active) return;
        if (saved.length) {
          setMissions(saved);
          localStorage.setItem('cpx_full_daily_missions', JSON.stringify(saved));
        } else {
          await api.saveFullDailyMissions(missions);
        }
      } catch {
        // Local copy remains available when the backend is offline.
      }
    };
    void loadMissions();
    return () => { active = false; };
  }, []);

  const completedCount = missions.filter((m) => m.completed).length;
  const totalXP = missions.filter((m) => m.completed).reduce((acc, m) => acc + m.xpReward, 0);

  const persistMissions = (updated: ComprehensiveMission[]) => {
    setMissions(updated);
    localStorage.setItem('cpx_full_daily_missions', JSON.stringify(updated));
    void api.saveFullDailyMissions(updated).catch((error) => console.error('Could not save missions:', error));
  };

  const startMission = (id: string) => {
    const updated = missions.map((mission) => mission.id === id && !mission.completed
      ? { ...mission, started: true }
      : mission);
    persistMissions(updated);
  };

  const toggleMission = (id: string) => {
    cyberAudio.playClick();
    const target = missions.find((mission) => mission.id === id);
    if (!target || target.completed) return;
    const updated = missions.map((mission) => mission.id === id
      ? { ...mission, completed: true, started: false }
      : mission);
    cyberAudio.playSuccess();
    api.updateProfileStats({ xp: (user.xp || 0) + target.xpReward });
    const refreshed = api.getCurrentUser();
    if (refreshed && onUserUpdated) onUserUpdated(refreshed);
    persistMissions(updated);
  };

  const addCustomMission = async (event: React.FormEvent) => {
    event.preventDefault();
    if (customTitle.trim().length < 3) return;
    const customMission: ComprehensiveMission = {
      id: `custom-${Date.now()}`,
      category: customCategory,
      title: customTitle.trim(),
      description: customDescription.trim() || 'Complete this personal placement preparation task.',
      difficulty: 'Medium',
      xpReward: 100,
      completed: false,
      started: false,
      estimatedMinutes: 25,
      tags: ['Custom'],
    };
    const updated = [...missions, customMission];
    setCustomSaving(true);
    try {
      await api.saveFullDailyMissions(updated);
      setMissions(updated);
      localStorage.setItem('cpx_full_daily_missions', JSON.stringify(updated));
      setCustomTitle('');
      setCustomDescription('');
      setShowCustomMission(false);
    } catch (error: any) {
      console.error('Could not save custom mission:', error);
    } finally {
      setCustomSaving(false);
    }
  };

  const filteredMissions = missions.filter((m) => {
    if (filter === 'all') return true;
    return m.category === filter;
  });

  // 7-day consistency calendar dates
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Module Title & Daily Momentum Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#273244]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B7FF32] animate-pulse" />
            <span className="text-xs uppercase tracking-[.2em] text-[#8DA7FF] font-semibold">
              DAILY SPRINT ENGINE
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif-title text-white mt-1">
            Daily Missions & Sprints<span className="text-[#B7FF32]">.</span>
          </h1>
          <p className="text-xs md:text-sm text-[#A8B0BC] mt-1">
            Curated daily algorithmic challenges, LeetCode problems, system design, and mock interview reps.
          </p>
        </div>

        {/* Streak & XP Metric Pills */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl border border-orange-500/30 bg-[#16120e] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <Flame size={22} />
            </div>
            <div>
              <div className="text-base font-bold font-mono text-white">
                {user.streakDays || 1} Days
              </div>
              <div className="text-[10px] text-[#A8B0BC] uppercase font-mono">Active Streak</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-[#245BFF]/30 bg-[#0e1420] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#245BFF]/20 text-[#8DA7FF] flex items-center justify-center">
              <Trophy size={22} className="text-[#B7FF32]" />
            </div>
            <div>
              <div className="text-base font-bold font-mono text-white">
                +{totalXP} XP
              </div>
              <div className="text-[10px] text-[#A8B0BC] uppercase font-mono">Earned Today</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Consistency Tracker & Today's Progress Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Weekly Consistency Heatmap (5 Cols) */}
        <div className="md:col-span-5 rounded-2xl border border-[#273244] bg-[#101722] p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-white">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#245BFF]" /> 7-Day Sprint Consistency
            </span>
            <span className="text-[10px] font-mono text-[#B7FF32]">Daily Habit</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {daysOfWeek.map((day, idx) => {
              const isToday = idx === 6; // Sunday/Today
              return (
                <div key={day} className="text-center space-y-1.5">
                  <span className="text-[10px] font-mono text-[#727E8F]">{day}</span>
                  <div className={`h-10 rounded-xl flex items-center justify-center border transition ${
                    isToday
                      ? completedCount > 0 ? 'bg-[#B7FF32] border-[#B7FF32] text-black font-bold' : 'border-[#245BFF] bg-[#245BFF]/20 text-[#8DA7FF]'
                      : idx >= 4 ? 'bg-[#245BFF]/15 border-[#245BFF]/30 text-[#8DA7FF]' : 'bg-[#080B10] border-[#273244] text-[#536078]'
                  }`}>
                    {isToday ? (completedCount > 0 ? '✓' : '•') : '✓'}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-[#727E8F]">
            Target: {user.dailyStudyHours || 2} hours of deliberate coding practice daily.
          </p>
        </div>

        {/* Progress Breakdown Gauge (7 Cols) */}
        <div className="md:col-span-7 rounded-2xl border border-[#273244] bg-[#101722] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-mono text-[#727E8F]">Today's Sprint Completion</span>
              <div className="text-xl font-bold text-white mt-0.5">
                {completedCount} of {missions.length} Missions Completed
              </div>
            </div>
            <div className="text-2xl font-mono font-bold text-[#B7FF32]">
              {Math.round((completedCount / missions.length) * 100)}%
            </div>
          </div>

          <div className="my-3">
            <div className="h-3 w-full bg-[#080B10] rounded-full overflow-hidden border border-[#1e2838]">
              <div
                className="h-full bg-gradient-to-r from-[#245BFF] via-[#00D4FF] to-[#B7FF32] rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / missions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#A8B0BC]">
            <span>{missions.length - completedCount} tasks remaining to close today's sprint</span>
            <span className="text-[#8DA7FF] font-mono">Calibrated for {user.careerGoal || 'Software Engineer'}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Sprints', count: missions.length },
          { id: 'leetcode', label: 'LeetCode Questions', count: missions.filter(m => m.category === 'leetcode').length },
          { id: 'dsa', label: 'DSA Tasks', count: missions.filter(m => m.category === 'dsa').length },
          { id: 'interview', label: 'Mock Interview Reps', count: missions.filter(m => m.category === 'interview').length },
          { id: 'project', label: 'Project Architecture', count: missions.filter(m => m.category === 'project').length },
          { id: 'learning', label: 'Concept Drills', count: missions.filter(m => m.category === 'learning').length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              filter === tab.id
                ? 'bg-[#245BFF] text-white shadow-md'
                : 'bg-[#101722] border border-[#273244] text-[#A8B0BC] hover:text-white hover:border-[#3e4f6a]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              filter === tab.id ? 'bg-white/20 text-white' : 'bg-[#080B10] text-[#727E8F]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-[#273244] bg-[#101722] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Make today’s plan yours</h2>
            <p className="mt-1 text-xs text-[#8D9AAF]">Start a mission, complete it when finished, or add your own task.</p>
          </div>
          <button type="button" onClick={() => setShowCustomMission((open) => !open)} className="inline-flex items-center gap-2 rounded-xl border border-[#245BFF]/40 bg-[#245BFF]/15 px-4 py-2.5 text-xs font-semibold text-[#AFC1FF]">
            {showCustomMission ? <X size={14} /> : <Plus size={14} />} {showCustomMission ? 'Close' : 'Add Custom Mission'}
          </button>
        </div>
        {showCustomMission && (
          <form onSubmit={addCustomMission} className="mt-4 grid gap-3 md:grid-cols-2">
            <input required minLength={3} value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} placeholder="Mission title" className="rounded-xl border border-[#273244] bg-[#080B10] px-4 py-3 text-xs text-white outline-none focus:border-[#245BFF]" />
            <select value={customCategory} onChange={(event) => setCustomCategory(event.target.value as ComprehensiveMission['category'])} className="rounded-xl border border-[#273244] bg-[#080B10] px-4 py-3 text-xs text-white outline-none">
              <option value="learning">Learning</option><option value="dsa">DSA</option><option value="leetcode">LeetCode</option><option value="project">Project</option><option value="interview">Interview</option>
            </select>
            <textarea value={customDescription} onChange={(event) => setCustomDescription(event.target.value)} placeholder="What do you want to complete? (optional)" rows={2} className="md:col-span-2 rounded-xl border border-[#273244] bg-[#080B10] px-4 py-3 text-xs text-white outline-none focus:border-[#245BFF]" />
            <button disabled={customSaving} type="submit" className="md:col-span-2 justify-self-start rounded-xl bg-[#245BFF] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{customSaving ? 'Saving…' : 'Save Custom Mission'}</button>
          </form>
        )}
      </section>

      {/* Task List */}
      <div className="space-y-3.5">
        {filteredMissions.map((mission) => {
          return (
            <div
              key={mission.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                mission.completed
                  ? 'bg-[#080B10]/70 border-[#273244] opacity-80'
                  : 'bg-[#101722] border-[#273244] hover:border-[#3f506c]'
              }`}
            >
              {/* Task Left: Checkbox & Info */}
              <div className="flex items-start gap-4 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleMission(mission.id)}
                  title={mission.completed ? 'Completed' : 'Click to mark complete'}
                  className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                    mission.completed
                      ? 'bg-[#B7FF32] border-[#B7FF32] text-black font-bold'
                      : 'border-[#3a4a62] text-transparent hover:border-[#8DA7FF]'
                  }`}
                >
                  <Check size={14} />
                </button>

                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-sm font-bold ${mission.completed ? 'line-through text-[#727E8F]' : 'text-white'}`}>
                      {mission.title}
                    </span>

                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      mission.difficulty === 'Easy'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : mission.difficulty === 'Medium'
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-rose-500/15 text-rose-300'
                    }`}>
                      {mission.difficulty}
                    </span>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#162133] text-[#8DA7FF]">
                      +{mission.xpReward} XP
                    </span>

                    <span className="text-[10px] font-mono text-[#727E8F]">
                      ⏱️ {mission.estimatedMinutes} min
                    </span>
                  </div>

                  <p className="text-xs text-[#A8B0BC] leading-relaxed">
                    {mission.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mission.tags.map((t) => (
                      <span key={t} className="text-[10px] font-mono text-[#727E8F] bg-[#080B10] px-2 py-0.5 rounded border border-[#1e2838]">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Task Right: Direct Action Button */}
              <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
                {mission.leetcodeUrl && (
                  <a
                    href={mission.leetcodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#080B10] border border-[#273244] text-[#8DA7FF] hover:border-[#245BFF] hover:text-white transition flex items-center gap-1.5"
                  >
                    <span>LeetCode</span>
                    <ExternalLink size={13} />
                  </a>
                )}

                {mission.category === 'dsa' && onOpenCodingArena && (
                  <button
                    type="button"
                    onClick={onOpenCodingArena}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#245BFF]/15 text-[#8DA7FF] hover:bg-[#245BFF] hover:text-white transition flex items-center gap-1.5"
                  >
                    <Code2 size={13} />
                    <span>Open Editor</span>
                  </button>
                )}

                {mission.category === 'interview' && onOpenInterview && (
                  <button
                    type="button"
                    onClick={onOpenInterview}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#245BFF]/15 text-[#8DA7FF] hover:bg-[#245BFF] hover:text-white transition flex items-center gap-1.5"
                  >
                    <BrainCircuit size={13} />
                    <span>Interview Studio</span>
                  </button>
                )}

                {mission.category === 'project' && onOpenProjects && (
                  <button
                    type="button"
                    onClick={onOpenProjects}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#245BFF]/15 text-[#8DA7FF] hover:bg-[#245BFF] hover:text-white transition flex items-center gap-1.5"
                  >
                    <BriefcaseBusiness size={13} />
                    <span>Project Plan</span>
                  </button>
                )}

                {!mission.completed && !mission.started && (
                  <button
                    type="button"
                    onClick={() => startMission(mission.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#245BFF]/40 bg-[#245BFF]/10 text-[#AFC1FF] hover:bg-[#245BFF]/20 transition"
                  >
                    Start Mission
                  </button>
                )}
                {mission.started && !mission.completed && (
                  <span className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-amber-500/30 bg-amber-500/10 text-amber-200">In Progress</span>
                )}
                <button
                  type="button"
                  onClick={() => toggleMission(mission.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    mission.completed
                      ? 'border-[#273244] text-[#727E8F] bg-transparent'
                      : 'border-[#273244] bg-[#0c121d] text-[#A8B0BC] hover:border-[#B7FF32] hover:text-[#B7FF32]'
                  }`}
                >
                  {mission.completed ? 'Completed' : 'Mark Done'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
