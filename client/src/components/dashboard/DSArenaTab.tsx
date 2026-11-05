import React, { useState, useEffect, useMemo } from 'react';
import {
  Binary,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Circle,
  FileText,
  Filter,
  Sparkles,
  Award,
  ChevronDown,
  X,
  Save,
  Flame,
  Zap,
  TrendingUp,
  Plus,
  Code2,
  Terminal,
} from 'lucide-react';
import { DSAProblemItem, DSAStats, User } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';
import { DSAWorkspaceModal } from './DSAWorkspaceModal';

interface DSArenaTabProps {
  user: User;
  onUserUpdated?: (updated: User) => void;
}

export const DSArenaTab: React.FC<DSArenaTabProps> = ({ user, onUserUpdated }) => {
  const [collection, setCollection] = useState<'shradha' | 'blind75' | 'neetcode150' | 'top250' | 'custom' | 'all'>('shradha');
  const [category, setCategory] = useState<string>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [search, setSearch] = useState<string>('');

  const [problems, setProblems] = useState<DSAProblemItem[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [stats, setStats] = useState<DSAStats>({
    totalSolved: 0,
    totalProblems: 0,
    easySolved: 0,
    easyTotal: 0,
    mediumSolved: 0,
    mediumTotal: 0,
    hardSolved: 0,
    hardTotal: 0,
    unspecifiedSolved: 0,
    unspecifiedTotal: 0,
    completionPercentage: 0,
    topicStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [dailySolvedCount, setDailySolvedCount] = useState(0);
  const [showCreateProblem, setShowCreateProblem] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('Arrays');
  const [customDifficulty, setCustomDifficulty] = useState('Not specified');
  const [customLink, setCustomLink] = useState('');
  const [customError, setCustomError] = useState('');
  const [creatingProblem, setCreatingProblem] = useState(false);

  // Active in-app coding workspace modal
  const [activeWorkspaceProblem, setActiveWorkspaceProblem] = useState<DSAProblemItem | null>(null);

  // Active note editing modal
  const [editingProblem, setEditingProblem] = useState<DSAProblemItem | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Success toast/banner
  const [xpToast, setXpToast] = useState<{ show: boolean; xp: number; problemTitle: string }>({
    show: false,
    xp: 0,
    problemTitle: '',
  });

  const KNOWN_LEETCODE_MAP: Record<string, string> = {
    'maximum and minimum element in an array': 'https://leetcode.com/problemset/all/?search=Maximum+and+Minimum+Element',
    'reverse the array': 'https://leetcode.com/problems/reverse-string/',
    'maximum-subarray': 'https://leetcode.com/problems/maximum-subarray/',
    'maximum subarray': 'https://leetcode.com/problems/maximum-subarray/',
    'contains duplicate': 'https://leetcode.com/problems/contains-duplicate/',
    'chocolate distribution problem': 'https://leetcode.com/problemset/all/?search=chocolate+distribution',
    'search in rotated sorted array': 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
    'next permutation': 'https://leetcode.com/problems/next-permutation/',
    'best time to buy and sell stock': 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    'repeat and missing number array': 'https://leetcode.com/problems/find-missing-and-repeated-values/',
    'kth largest element in an array': 'https://leetcode.com/problems/kth-largest-element-in-an-array/',
    'trapping rain water': 'https://leetcode.com/problems/trapping-rain-water/',
    'product of array except self': 'https://leetcode.com/problems/product-of-array-except-self/',
    'maximum product subarray': 'https://leetcode.com/problems/maximum-product-subarray/',
    'find minimum in rotated sorted array': 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/',
    'find pair with sum in sorted & rotated array': 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
    '3sum': 'https://leetcode.com/problems/3sum/',
    'container with most water': 'https://leetcode.com/problems/container-with-most-water/',
    'given sum pair': 'https://leetcode.com/problems/two-sum/',
    'two sum': 'https://leetcode.com/problems/two-sum/',
    'valid anagram': 'https://leetcode.com/problems/valid-anagram/',
    'group anagrams': 'https://leetcode.com/problems/group-anagrams/',
    'top k frequent elements': 'https://leetcode.com/problems/top-k-frequent-elements/',
    'valid palindrome': 'https://leetcode.com/problems/valid-palindrome/',
    'longest substring without repeating characters': 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    'longest repeating character replacement': 'https://leetcode.com/problems/longest-repeating-character-replacement/',
    'minimum window substring': 'https://leetcode.com/problems/minimum-window-substring/',
    'valid parentheses': 'https://leetcode.com/problems/valid-parentheses/',
    'reverse linked list': 'https://leetcode.com/problems/reverse-linked-list/',
    'merge two sorted lists': 'https://leetcode.com/problems/merge-two-sorted-lists/',
    'linked list cycle': 'https://leetcode.com/problems/linked-list-cycle/',
    'reorder list': 'https://leetcode.com/problems/reorder-list/',
    'remove nth node from end of list': 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/',
    'invert binary tree': 'https://leetcode.com/problems/invert-binary-tree/',
    'maximum depth of binary tree': 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    'same tree': 'https://leetcode.com/problems/same-tree/',
    'subtree of another tree': 'https://leetcode.com/problems/subtree-of-another-tree/',
    'lowest common ancestor of a binary search tree': 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/',
    'binary tree level order traversal': 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    'climbing stairs': 'https://leetcode.com/problems/climbing-stairs/',
    'coin change': 'https://leetcode.com/problems/coin-change/',
    'longest increasing subsequence': 'https://leetcode.com/problems/longest-increasing-subsequence/',
    'word break': 'https://leetcode.com/problems/word-break/',
    'number of islands': 'https://leetcode.com/problems/number-of-islands/',
    'clone graph': 'https://leetcode.com/problems/clone-graph/',
    'pacific atlantic water flow': 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
    'course schedule': 'https://leetcode.com/problems/course-schedule/',
    'merge intervals': 'https://leetcode.com/problems/merge-intervals/',
    'insert interval': 'https://leetcode.com/problems/insert-interval/',
    'non-overlapping intervals': 'https://leetcode.com/problems/non-overlapping-intervals/',
  };

  const getDirectLeetCodeUrl = (prob: DSAProblemItem): string => {
    const raw = (prob.leetcodeUrl || '').trim();
    // 1. If explicit valid direct problem link
    if (raw && raw.includes('/problems/') && !raw.includes('problemset') && !raw.endsWith('/problems/')) {
      return raw;
    }

    const titleLower = (prob.title || '').toLowerCase().trim();
    const slugLower = (prob.slug || '').toLowerCase().trim();

    // 2. Check exact known map
    if (KNOWN_LEETCODE_MAP[titleLower]) return KNOWN_LEETCODE_MAP[titleLower];
    if (KNOWN_LEETCODE_MAP[slugLower]) return KNOWN_LEETCODE_MAP[slugLower];

    // 3. If raw URL has /problemset/?search=... fix formatting to valid problemset URL
    if (raw.includes('search=')) {
      const queryPart = raw.split('search=')[1] || '';
      return `https://leetcode.com/problemset/all/?search=${queryPart}`;
    }

    // 4. Clean slug fallback
    const cleanSlug = (prob.slug || prob.title || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // If it looks like a clean standard problem, try problem link, otherwise use guaranteed 200 OK LeetCode search
    if (cleanSlug && !cleanSlug.includes('and') && !cleanSlug.includes('problem') && cleanSlug.length < 35) {
      return `https://leetcode.com/problems/${cleanSlug}/`;
    }

    return `https://leetcode.com/problemset/all/?search=${encodeURIComponent(prob.title || cleanSlug)}`;
  };

  const loadProblems = async () => {
    try {
      setLoading(true);
      const res = await api.getDSAProblems({
        collection,
        category: category !== 'All' ? category : undefined,
        difficulty: difficultyFilter !== 'All' ? difficultyFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        search: search.trim() ? search : undefined,
      });
      setProblems(res.problems);
      setTopics(res.topics || []);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Failed to load DSA problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, [collection, category, difficultyFilter, statusFilter, search]);

  const loadDailyGoal = async () => {
    try {
      const result = await api.getDSAProblems({ collection: 'shradha' });
      const today = new Date().toDateString();
      setDailySolvedCount(result.problems.filter((problem) => problem.status === 'solved' && problem.solvedAt && new Date(problem.solvedAt).toDateString() === today).length);
    } catch (error) {
      console.error('Could not load today’s DSA goal:', error);
    }
  };

  useEffect(() => { void loadDailyGoal(); }, []);

  const handleCreateProblem = async (event: React.FormEvent) => {
    event.preventDefault();
    setCustomError('');
    setCreatingProblem(true);
    try {
      await api.createCustomDSAProblem({ title: customTitle, category: customCategory, difficulty: customDifficulty, leetcodeUrl: customLink });
      setCustomTitle('');
      setCustomLink('');
      setShowCreateProblem(false);
      setCollection('custom');
      setCategory('All');
      setStatusFilter('All');
      setSearch('');
      await loadProblems();
      cyberAudio.playSuccess();
    } catch (error) {
      setCustomError(error instanceof Error ? error.message : 'Could not create problem.');
    } finally {
      setCreatingProblem(false);
    }
  };

  const handleStatusChange = async (problem: DSAProblemItem, nextStatus: 'not_started' | 'in_progress' | 'solved') => {
    cyberAudio.playClick();
    try {
      const res = await api.updateDSAStatus(problem.id, nextStatus, problem.difficulty);
      
      // Update local problems state
      setProblems((prev) =>
        prev.map((p) => (p.id === problem.id ? { ...p, status: nextStatus, solvedAt: res.problem.solvedAt } : p))
      );

      // Refresh stats
      const refreshed = await api.getDSAProblems({ collection: 'shradha' });
      if (refreshed.stats) setStats(refreshed.stats);
      await loadDailyGoal();

      // Notify user update if XP gained
      if (res.xpGained > 0) {
        cyberAudio.playSuccess();
        setXpToast({ show: true, xp: res.xpGained, problemTitle: problem.title });
        setTimeout(() => setXpToast((t) => ({ ...t, show: false })), 4000);
      }

      if (onUserUpdated) {
        const u = api.getCurrentUser();
        if (u) {
          u.xp = res.newTotalXp;
          u.readinessScore = res.readinessScore;
          onUserUpdated(u);
        }
      }
    } catch (err) {
      console.error('Failed to update problem status:', err);
    }
  };

  const handleOpenNotes = (problem: DSAProblemItem) => {
    cyberAudio.playClick();
    setEditingProblem(problem);
    setNoteContent(problem.notes || '');
  };

  const handleSaveNotes = async () => {
    if (!editingProblem) return;
    try {
      setSavingNote(true);
      await api.saveDSANote(editingProblem.id, noteContent);
      setProblems((prev) =>
        prev.map((p) => (p.id === editingProblem.id ? { ...p, notes: noteContent } : p))
      );
      cyberAudio.playSuccess();
      setEditingProblem(null);
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* XP Toast Notification */}
      {xpToast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#101722] border border-[#B7FF32]/50 text-white px-5 py-3.5 rounded-2xl shadow-glow-green animate-bounce">
          <div className="w-8 h-8 rounded-xl bg-[#B7FF32]/20 text-[#B7FF32] flex items-center justify-center font-bold">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-[#B7FF32]">+{xpToast.xp} XP Earned!</div>
            <div className="text-[11px] text-[#A8B0BC]">Solved "{xpToast.problemTitle}"</div>
          </div>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="rounded-3xl border border-[#273244] bg-[#0E1624] p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#245BFF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#245BFF]/15 border border-[#245BFF]/30 text-[#8DA7FF] text-xs font-mono font-semibold mb-3">
              <Binary size={14} className="text-[#B7FF32]" />
              DSA ARENA & CODING PATTERNS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Master High-Frequency Algorithms
            </h1>
            <p className="text-sm text-[#727E8F] max-w-2xl mt-1.5 leading-relaxed">
              Practice the questions in your DSA list. Open each supported practice link on LeetCode and save your solved status here.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <div className="bg-[#152132] border border-[#273244] rounded-2xl p-4 min-w-[130px]">
              <div className="text-[11px] text-[#727E8F] uppercase font-mono">Total Solved</div>
              <div className="text-2xl font-black text-white mt-1">
                {stats.totalSolved} <span className="text-xs text-[#727E8F] font-normal">/ {stats.totalProblems}</span>
              </div>
              <div className="text-[11px] text-[#B7FF32] font-mono mt-0.5">{stats.completionPercentage}% Complete</div>
            </div>

            <div className="bg-[#152132] border border-[#273244] rounded-2xl p-4 min-w-[170px] space-y-2">
              <div className="text-[11px] text-[#727E8F] uppercase font-mono">Today’s practice</div>
              <div className="text-2xl font-black text-white">{dailySolvedCount}/5</div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#273244]"><div className="h-full rounded-full bg-[#B7FF32]" style={{ width: `${Math.min(100, dailySolvedCount * 20)}%` }} /></div>
              <div className="text-[10px] text-[#8DA7FF]">PDF does not specify difficulty for every question</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#273244] bg-[#101722] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-white">Your DSA question list</div>
            <p className="mt-1 text-xs text-[#A8B0BC]">All questions from the uploaded PDF are kept together and grouped by topic. Difficulty is shown only when the source specifies it.</p>
          </div>
          <div className="text-xs font-mono text-[#8DA7FF]">Daily goal: 5 questions</div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-lg bg-[#080B10] p-2 text-[#A8B0BC]">Easy: 5–10 min</div>
          <div className="rounded-lg bg-[#080B10] p-2 text-[#A8B0BC]">Medium: 15–20 min</div>
          <div className="rounded-lg bg-[#080B10] p-2 text-[#A8B0BC]">Hard: 40–60 min</div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-[#0E1624] p-4 rounded-2xl border border-[#273244]">
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#727E8F]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problem, #, or tag..."
            className="w-full bg-[#152132] border border-[#273244] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-[#727E8F] focus:outline-none focus:border-[#245BFF]"
          />
        </div>

        {/* Collection Selector */}
        <select
          value={collection}
          onChange={(e) => setCollection(e.target.value as any)}
          aria-label="Filter by problem collection"
          className="bg-[#152132] border border-[#273244] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#245BFF]"
        >
          <option value="shradha">Shradha Curated (Default)</option>
          <option value="blind75">Blind 75 Curated</option>
          <option value="neetcode150">NeetCode 150</option>
          <option value="top250">Top 250 Interview</option>
          <option value="all">All Available Problems</option>
          <option value="custom">My Custom Problems</option>
        </select>

        {/* Category Topic */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by topic"
          className="bg-[#152132] border border-[#273244] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#245BFF]"
        >
          <option value="All">All Topics ({topics.length})</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          aria-label="Filter by difficulty"
          className="bg-[#152132] border border-[#273244] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#245BFF]"
        >
          <option value="All">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Status */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="flex-1 bg-[#152132] border border-[#273244] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#245BFF]"
          >
            <option value="All">All Statuses</option>
            <option value="solved">Solved</option>
            <option value="in_progress">In Progress</option>
            <option value="not_started">Not Started</option>
          </select>

          <button
            onClick={() => setShowCreateProblem(true)}
            title="Create Custom Problem"
            className="px-3 py-2 rounded-xl bg-[#245BFF]/15 border border-[#245BFF]/30 hover:bg-[#245BFF]/25 text-[#8DA7FF] text-xs font-semibold flex items-center gap-1 transition shrink-0"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* PROBLEMS TABLE */}
      <div className="bg-[#0B111A] border border-[#273244] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#101722] border-b border-[#273244] text-[#727E8F] font-mono uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-16">#</th>
                <th className="py-3 px-4">Problem Name</th>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4 w-28">Difficulty</th>
                <th className="py-3 px-4 w-36">Status</th>
                <th className="py-3 px-4 text-right w-48">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2736]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#727E8F]">
                    <div className="inline-block animate-spin mr-2">⚙</div> Loading verified DSA problem bank...
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#727E8F]">
                    No problems found matching your current filters.
                  </td>
                </tr>
              ) : (
                problems.map((prob) => {
                  const isSolved = prob.status === 'solved';
                  const isInProgress = prob.status === 'in_progress';

                  return (
                    <tr
                      key={prob.id}
                      className={`hover:bg-[#121B29] transition ${
                        isSolved ? 'bg-emerald-950/10' : ''
                      }`}
                    >
                      {/* LeetCode Official Number */}
                      <td className="py-3.5 px-4 font-mono text-[#727E8F]">
                        {prob.number}
                      </td>

                      {/* Title & LeetCode Trigger */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <a
                            href={getDirectLeetCodeUrl(prob)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => cyberAudio.playClick()}
                            className="font-semibold text-white hover:text-[#245BFF] transition text-left inline-flex items-center gap-1.5 group"
                            title={`Solve ${prob.title} on LeetCode`}
                          >
                            <span>{prob.title}</span>
                            <ExternalLink size={11} className="text-[#727E8F] opacity-70 group-hover:opacity-100 group-hover:text-[#245BFF]" />
                          </a>
                        </div>
                      </td>

                      {/* Topic Category */}
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-[#A8B0BC] bg-[#16202E] px-2.5 py-1 rounded-lg border border-[#273244]/60">
                          {prob.category}
                        </span>
                      </td>

                      {/* Difficulty Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                            prob.difficulty === 'Easy'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : prob.difficulty === 'Medium'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : prob.difficulty === 'Hard'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4">
                        <select
                          value={prob.status}
                          onChange={(e) =>
                            handleStatusChange(
                              prob,
                              e.target.value as 'not_started' | 'in_progress' | 'solved'
                            )
                          }
                          aria-label={`Status for ${prob.title}`}
                          className={`text-[11px] rounded-lg px-2.5 py-1 font-semibold border focus:outline-none transition ${
                            isSolved
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                              : isInProgress
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                              : 'bg-[#152132] text-[#A8B0BC] border-[#273244]'
                          }`}
                        >
                          <option value="not_started">○ Not Started</option>
                          <option value="in_progress">◐ In Progress</option>
                          <option value="solved">● Solved</option>
                        </select>
                      </td>

                      {/* Actions: In-App Solve Workspace, Notes, External Link */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenNotes(prob)}
                            title={prob.notes ? 'View/edit notes' : 'Add personal notes'}
                            className={`p-1.5 rounded-lg border text-xs transition ${
                              prob.notes
                                ? 'bg-[#245BFF]/20 text-[#8DA7FF] border-[#245BFF]/40'
                                : 'bg-[#152132] text-[#727E8F] border-[#273244] hover:text-white'
                            }`}
                          >
                            <FileText size={14} />
                          </button>

                          {/* In-app code workspace button */}
                          <button
                            onClick={() => {
                              cyberAudio.playClick();
                              setActiveWorkspaceProblem(prob);
                            }}
                            title={`Open in-app coding editor for ${prob.title}`}
                            className="p-1.5 rounded-lg border border-[#273244] bg-[#152132] text-[#8DA7FF] hover:text-white hover:border-[#245BFF]/50 transition"
                          >
                            <Code2 size={14} />
                          </button>

                          {/* Primary Solve Now button - Opens direct verified LeetCode problem */}
                          <a
                            href={getDirectLeetCodeUrl(prob)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => cyberAudio.playClick()}
                            title={`Solve ${prob.title} directly on LeetCode`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#245BFF] hover:bg-[#386dff] text-white text-xs font-semibold shadow-sm transition"
                          >
                            <span>Solve Now</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateProblem} className="w-full max-w-lg space-y-4 rounded-2xl border border-[#273244] bg-[#0E1624] p-6 shadow-2xl">
            <div className="flex items-center justify-between"><div><div className="text-[10px] font-mono uppercase tracking-wider text-[#8DA7FF]">Personal practice list</div><h3 className="mt-1 text-lg font-bold text-white">Create a DSA problem</h3></div><button type="button" onClick={() => setShowCreateProblem(false)} className="rounded-lg p-2 text-[#8D9AAF] hover:bg-[#152132] hover:text-white"><X size={17} /></button></div>
            <label className="block space-y-1.5"><span className="text-xs text-[#A8B0BC]">Problem title</span><input required minLength={3} maxLength={140} value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} placeholder="e.g. Find the first repeating element" className="w-full rounded-xl border border-[#273244] bg-[#080B10] px-3 py-3 text-sm text-white outline-none focus:border-[#245BFF]" /></label>
            <div className="grid gap-3 sm:grid-cols-2"><label className="block space-y-1.5"><span className="text-xs text-[#A8B0BC]">Topic</span><select value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} className="w-full rounded-xl border border-[#273244] bg-[#080B10] px-3 py-3 text-xs text-white">{topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}</select></label><label className="block space-y-1.5"><span className="text-xs text-[#A8B0BC]">Difficulty</span><select value={customDifficulty} onChange={(event) => setCustomDifficulty(event.target.value)} className="w-full rounded-xl border border-[#273244] bg-[#080B10] px-3 py-3 text-xs text-white"><option>Not specified</option><option>Easy</option><option>Medium</option><option>Hard</option></select></label></div>
            <label className="block space-y-1.5"><span className="text-xs text-[#A8B0BC]">Practice URL (optional)</span><input type="url" value={customLink} onChange={(event) => setCustomLink(event.target.value)} placeholder="https://..." className="w-full rounded-xl border border-[#273244] bg-[#080B10] px-3 py-3 text-xs text-white outline-none focus:border-[#245BFF]" /></label>
            {customError && <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{customError}</p>}
            <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowCreateProblem(false)} className="rounded-xl border border-[#273244] px-4 py-2.5 text-xs text-[#A8B0BC]">Cancel</button><button type="submit" disabled={creatingProblem} className="rounded-xl bg-[#245BFF] px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{creatingProblem ? 'Saving…' : 'Save problem'}</button></div>
          </form>
        </div>
      )}

      {/* NOTES MODAL */}
      {editingProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0E1624] border border-[#273244] w-full max-w-lg rounded-3xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#273244]">
              <div>
                <div className="text-xs text-[#727E8F] font-mono">
                  PROBLEM #{editingProblem.number} · {editingProblem.category}
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{editingProblem.title} Notes</h3>
              </div>
              <button
                onClick={() => setEditingProblem(null)}
                aria-label="Close notes modal"
                className="text-[#727E8F] hover:text-white p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold text-[#A8B0BC]">
                Personal Strategy, Time/Space Complexity & Edge Cases:
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Example: Use Two Pointers from both ends. Time: O(N), Space: O(1). Beware of integer overflow and empty array boundary cases..."
                rows={7}
                className="w-full bg-[#152132] border border-[#273244] rounded-2xl p-3.5 text-xs text-white placeholder-[#536078] focus:outline-none focus:border-[#245BFF] resize-none font-mono"
              />
            </div>

            <div className="mt-5 flex items-center justify-between">
              {editingProblem.leetcodeUrl ? <a href={editingProblem.leetcodeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8DA7FF] hover:underline inline-flex items-center gap-1"><span>Open practice link</span><ExternalLink size={12} /></a> : <span className="text-[11px] text-[#71819A]">Custom problem</span>}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingProblem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#A8B0BC] hover:text-white hover:bg-[#152132] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNote}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#245BFF] hover:bg-[#3769ff] text-white flex items-center gap-1.5 shadow-glow-blue transition disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{savingNote ? 'Saving...' : 'Save Notes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IN-APP INTERACTIVE CODING WORKSPACE MODAL */}
      {activeWorkspaceProblem && (
        <DSAWorkspaceModal
          problem={activeWorkspaceProblem}
          user={user}
          onClose={() => setActiveWorkspaceProblem(null)}
          onSolved={(problemId, xpGained) => {
            setProblems((prev) =>
              prev.map((p) =>
                p.id === problemId ? { ...p, status: 'solved', solvedAt: new Date().toISOString() } : p
              )
            );
            if (xpGained > 0) {
              setXpToast({
                show: true,
                xp: xpGained,
                problemTitle: activeWorkspaceProblem.title,
              });
              setTimeout(() => setXpToast((t) => ({ ...t, show: false })), 4000);
              if (onUserUpdated) {
                const u = api.getCurrentUser();
                if (u) {
                  u.xp = (u.xp || 0) + xpGained;
                  onUserUpdated({ ...u, xp: u.xp });
                }
              }
            }
            loadProblems();
            loadDailyGoal();
          }}
        />
      )}
    </div>
  );
};
