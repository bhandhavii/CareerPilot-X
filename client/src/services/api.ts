import {
  User,
  CareerTrack,
  Question,
  AssessmentResult,
  DailyMission,
  RoadmapMilestone,
  CodingChallenge,
  ProjectItem,
  InterviewQuestion,
  ResumeAnalysisResult,
  TrackInfo,
  LessonDetail,
  LearningProgress,
  AnalyticsData,
  DSAProblemItem,
  DSAStats,
} from '../types';
import {
  INITIAL_QUESTIONS,
  INITIAL_CODING_CHALLENGES,
  INITIAL_INTERVIEW_QUESTIONS,
  INITIAL_DAILY_MISSIONS,
  INITIAL_ROADMAP,
  INITIAL_PROJECTS,
} from './data';
import { TRACKS_DATA, LESSONS_MAP } from './learningData';

const STORAGE_KEYS = {
  USER: 'cpx_user',
  TOKEN: 'cpx_token',
  MISSIONS: 'cpx_missions',
  ROADMAP: 'cpx_roadmap',
  PROJECTS: 'cpx_projects',
  PROGRESS: 'cpx_progress',
  VERSION: 'cpx_workspace_version',
};

async function readApiResponse<T>(res: Response, action: string): Promise<T> {
  const raw = await res.text();
  if (!raw.trim()) {
    throw new Error(`${action} failed: the API returned an empty response (HTTP ${res.status}). Ensure the CareerPilot X backend is running on port 5000.`);
  }

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    const looksLikeHtml = /<\s*!doctype html|<\s*html/i.test(raw);
    throw new Error(
      looksLikeHtml
        ? `${action} failed: the request reached a web page instead of the API. Run the frontend through Vite and ensure the backend is running on port 5000.`
        : `${action} failed: the server returned an invalid response (HTTP ${res.status}).`
    );
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `${action} failed (HTTP ${res.status}).`);
  }
  return data as T;
}

class ApiService {
  private getAuthHeader() {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // --- AUTHENTICATION ---
  public async login(email: string, password: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await readApiResponse<{ token: string; user: User }>(res, 'Sign in');
    this.clearLegacyProgress();
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    return data.user;
  }

  public async register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<User> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
    const data = await readApiResponse<{ token: string; user: User }>(res, 'Create account');
    this.clearLegacyProgress();
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    return data.user;
  }

  public async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/profile/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return await readApiResponse<{ success: boolean; message: string }>(res, 'Change password');
  }

  public async getReminderPreference(): Promise<{ enabled: boolean; time: string; email: string; smtpConfigured: boolean }> {
    const res = await fetch('/api/profile/reminder', {
      headers: { ...this.getAuthHeader() },
    });
    return readApiResponse(res, 'Load CodeChef reminder settings');
  }

  public async saveReminderPreference(enabled: boolean, time: string): Promise<{ enabled: boolean; time: string; email: string; smtpConfigured: boolean }> {
    const res = await fetch('/api/profile/reminder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify({ enabled, time }),
    });
    return readApiResponse(res, 'Save CodeChef reminder settings');
  }

  public async saveOnboarding(payload: {
    careerGoal: string;
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    currentSkills: string[];
    dailyStudyHours: number;
    dreamCompany?: string;
  }): Promise<User> {
    const res = await fetch('/api/profile/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify(payload),
    });
    const data = await readApiResponse<{ user: User }>(res, 'Save onboarding');
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    return data.user;
  }

  public getCurrentUser(): User | null {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!stored || !token || token === 'local_jwt_token_demo') {
      this.clearLocalWorkspace();
      return null;
    }
    try {
      const user = JSON.parse(stored) as User;
      if (!user.id || user.id === 'usr_demo_001' || user.id === 'usr_demo') {
        this.logout();
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }

  public logout(): void {
    this.clearLocalWorkspace();
  }

  public async updateProfile(updates: Partial<User>): Promise<User> {
    const current = this.getCurrentUser();
    if (!current) throw new Error('No authenticated user');
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));

    try {
      const res = await fetch('/api/profile/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch {
      // Local fallback
    }

    return updated;
  }

  public updateProfileStats(updates: { xp?: number; readinessScore?: number | null; streakDays?: number; completedTasks?: string[] }) {
    const current = this.getCurrentUser();
    if (!current) return;
    const updated = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));

    fetch('/api/profile/stats', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify(updates),
    }).catch(() => undefined);
  }

  private clearLegacyProgress(): void {
    if (localStorage.getItem(STORAGE_KEYS.VERSION) !== '3') {
      localStorage.removeItem(STORAGE_KEYS.MISSIONS);
      localStorage.removeItem(STORAGE_KEYS.ROADMAP);
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    }
    localStorage.setItem(STORAGE_KEYS.VERSION, '3');
  }

  private clearLocalWorkspace(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.MISSIONS);
    localStorage.removeItem(STORAGE_KEYS.ROADMAP);
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.VERSION);
  }

  // --- LEARNING TRACKS & LESSONS ---
  public async getTracks(): Promise<TrackInfo[]> {
    try {
      const res = await fetch('/api/learning/tracks');
      if (res.ok) {
        const data = await res.json();
        if (data.tracks?.length) return data.tracks;
      }
    } catch {
      // Fallback
    }
    return TRACKS_DATA;
  }

  public async getLesson(lessonId: string): Promise<LessonDetail | null> {
    try {
      const res = await fetch(`/api/learning/lesson/${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.lesson) return data.lesson;
      }
    } catch {
      // Fallback
    }
    return LESSONS_MAP[lessonId] || null;
  }

  public async getLearningProgress(): Promise<LearningProgress> {
    try {
      const res = await fetch('/api/learning/progress', {
        headers: { ...this.getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.progress) {
          localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data.progress));
          return data.progress;
        }
      }
    } catch {
      // Fallback
    }

    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {}
    }

    return {
      completedLessons: [],
      quizScores: {},
      totalStudyMinutes: 0,
    };
  }

  public async saveLearningProgress(payload: {
    lessonId?: string;
    trackId?: string;
    quizScore?: number;
    markCompleted?: boolean;
    studyMinutes?: number;
  }): Promise<LearningProgress> {
    let progress: LearningProgress = await this.getLearningProgress();

    if (payload.markCompleted && payload.lessonId && !progress.completedLessons.includes(payload.lessonId)) {
      // The backend awards XP once when it records a newly completed lesson.
      // Do not increment it here as well, otherwise the client and server double-count XP.
      progress.completedLessons.push(payload.lessonId);
    }

    if (payload.lessonId && payload.quizScore !== undefined) {
      progress.quizScores[payload.lessonId] = payload.quizScore;
    }

    if (payload.lessonId) progress.lastOpenedLessonId = payload.lessonId;
    if (payload.trackId) progress.lastOpenedTrack = payload.trackId;
    progress.totalStudyMinutes = (progress.totalStudyMinutes || 0) + Math.max(0, Number(payload.studyMinutes) || 0);

    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));

    try {
      fetch('/api/learning/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify(payload),
      }).catch(() => undefined);
    } catch {}

    return progress;
  }

  // --- DAILY MISSIONS ---
  public async getDailyMissions(): Promise<DailyMission[]> {
    try {
      const res = await fetch('/api/missions/daily', {
        headers: { ...this.getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.missions?.length) {
          localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(data.missions));
          return data.missions;
        }
      }
    } catch {}

    const stored = localStorage.getItem(STORAGE_KEYS.MISSIONS);
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return INITIAL_DAILY_MISSIONS;
  }

  public async getFullDailyMissions(): Promise<any[]> {
    const res = await fetch('/api/missions/full', {
      headers: { ...this.getAuthHeader() },
    });
    const data = await readApiResponse<{ missions: any[] }>(res, 'Load daily missions');
    return data.missions || [];
  }

  public async saveFullDailyMissions(missions: any[]): Promise<any[]> {
    const res = await fetch('/api/missions/full', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify({ missions }),
    });
    const data = await readApiResponse<{ missions: any[] }>(res, 'Save daily missions');
    return data.missions || [];
  }

  public async completeMission(missionId: string): Promise<DailyMission[]> {
    let missions = await this.getDailyMissions();
    let awardedXp = 0;

    missions = missions.map((m) => {
      if (m.id === missionId) {
        awardedXp = m.xpReward || 150;
        return { ...m, completed: true };
      }
      return m;
    });

    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));

    if (awardedXp > 0) {
      const user = this.getCurrentUser();
      if (user) {
        this.updateProfileStats({ xp: (user.xp || 0) + awardedXp });
      }
    }

    try {
      fetch(`/api/missions/complete/${missionId}`, {
        method: 'POST',
        headers: { ...this.getAuthHeader() },
      }).catch(() => undefined);
    } catch {}

    return missions;
  }

  // --- ROADMAP ---
  public async getRoadmap(): Promise<RoadmapMilestone[]> {
    try {
      const res = await fetch('/api/roadmap', {
        headers: { ...this.getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.roadmap?.length) {
          localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(data.roadmap));
          return data.roadmap;
        }
      }
    } catch {}

    const stored = localStorage.getItem(STORAGE_KEYS.ROADMAP);
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return INITIAL_ROADMAP;
  }

  public async toggleMilestoneStatus(milestoneId: string): Promise<RoadmapMilestone[]> {
    const roadmap = (await this.getRoadmap()).map((m) => {
      if (m.id === milestoneId) {
        const nextStatus: 'completed' | 'in_progress' = m.status === 'completed' ? 'in_progress' : 'completed';
        return { ...m, status: nextStatus };
      }
      return m;
    });

    localStorage.setItem(STORAGE_KEYS.ROADMAP, JSON.stringify(roadmap));

    try {
      fetch(`/api/roadmap/toggle/${milestoneId}`, {
        method: 'POST',
        headers: { ...this.getAuthHeader() },
      }).catch(() => undefined);
    } catch {}

    return roadmap;
  }

  // --- CODING ARENA ---
  public getCodingChallenges(): CodingChallenge[] {
    return INITIAL_CODING_CHALLENGES;
  }

  public runCodeSandbox(code: string, challenge: CodingChallenge): {
    passed: boolean;
    logs: string[];
    results: { testIndex: number; passed: boolean; output: string; expected: string }[];
  } {
    const logs: string[] = [];
    const results: { testIndex: number; passed: boolean; output: string; expected: string }[] = [];

    try {
      challenge.testCases.forEach((tc, idx) => {
        try {
          // Client-side isolated runner
          const runHarness = new Function(
            `"use strict";
            ${code}
            ; return (${tc.input});`
          );
          const rawOutput = runHarness();
          const serializedOutput = typeof rawOutput === 'object' ? JSON.stringify(rawOutput) : String(rawOutput);
          const passed = serializedOutput === tc.expectedOutput;
          results.push({
            testIndex: idx + 1,
            passed,
            output: serializedOutput,
            expected: tc.expectedOutput,
          });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          results.push({
            testIndex: idx + 1,
            passed: false,
            output: `Error: ${errMsg}`,
            expected: tc.expectedOutput,
          });
        }
      });
    } catch (syntaxErr: unknown) {
      const msg = syntaxErr instanceof Error ? syntaxErr.message : String(syntaxErr);
      logs.push(`Syntax/Execution Error: ${msg}`);
    }

    const allPassed = results.length > 0 && results.every((r) => r.passed);
    if (allPassed) {
      logs.push('All unit assertions passed! +200 XP awarded.');
      const user = this.getCurrentUser();
      if (user) {
        this.updateProfileStats({ xp: (user.xp || 0) + 200 });
      }

      fetch('/api/coding/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ challengeId: challenge.id, passed: true, code }),
      }).catch(() => undefined);
    } else {
      logs.push('Some test assertions failed. Check output vs expected value.');
    }

    return { passed: allPassed, logs, results };
  }

  // --- PROJECTS WORKSHOP ---
  public async getProjects(): Promise<ProjectItem[]> {
    try {
      const res = await fetch('/api/projects', {
        headers: { ...this.getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.projects?.length) {
          localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data.projects));
          return data.projects;
        }
      }
    } catch {}

    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (stored) {
      try { return JSON.parse(stored); } catch {}
    }
    return INITIAL_PROJECTS;
  }

  public async toggleProjectMilestone(projectId: string, milestoneId: string): Promise<ProjectItem[]> {
    const projects = (await this.getProjects()).map((p) => {
      if (p.id === projectId) {
        const updatedMilestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const allDone = updatedMilestones.every((m) => m.completed);
        const anyDone = updatedMilestones.some((m) => m.completed);
        const status: 'completed' | 'in_progress' | 'not_started' = allDone ? 'completed' : anyDone ? 'in_progress' : 'not_started';
        return { ...p, milestones: updatedMilestones, status };
      }
      return p;
    });

    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

    try {
      fetch(`/api/projects/${projectId}/milestone/${milestoneId}`, {
        method: 'POST',
        headers: { ...this.getAuthHeader() },
      }).catch(() => undefined);
    } catch {}

    return projects;
  }

  // --- PRACTICE & ASSESSMENTS ---
  public getQuestions(track: CareerTrack): Question[] {
    const trackQuestions = INITIAL_QUESTIONS.filter((q) => q.track === track || q.track === 'fullstack');
    return [...trackQuestions].sort(() => 0.5 - Math.random()).slice(0, 5);
  }

  public async submitAssessment(track: CareerTrack, answers: Record<string, number>, questions: Question[]): Promise<AssessmentResult> {
    let score = 0;
    const weakAreas: string[] = [];
    const strengths: string[] = [];

    questions.forEach((q) => {
      const selected = answers[q.id];
      if (selected === q.correctAnswer) {
        score++;
        strengths.push(q.topic);
      } else {
        weakAreas.push(q.topic);
      }
    });

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    const feedback =
      percentage >= 80
        ? `Exceptional proficiency in ${track.toUpperCase()}! You demonstrated strong mastery of ${strengths.slice(0, 2).join(', ')}.`
        : percentage >= 60
        ? `Solid foundation in ${track.toUpperCase()}. Focus on revising ${weakAreas.slice(0, 2).join(', ')} to boost interview readiness.`
        : `Identified critical skill gaps in ${weakAreas.slice(0, 3).join(', ')}. CareerPilot X has adapted your daily missions accordingly.`;

    const result: AssessmentResult = {
      track,
      score,
      total,
      percentage,
      date: new Date().toLocaleDateString(),
      feedback,
      weakAreas,
      strengths,
    };

    const user = this.getCurrentUser();
    if (user) {
      const xpGained = score * 50;
      this.updateProfileStats({ xp: (user.xp || 0) + xpGained });
    }

    try {
      fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({
          category: 'assessment',
          topic: `${track.toUpperCase()} Assessment`,
          score,
          total,
          weakAreas,
          strengths,
        }),
      }).catch(() => undefined);
    } catch {}

    return result;
  }

  public async getPracticeHistory(): Promise<any[]> {
    const res = await fetch('/api/practice/history', {
      headers: { ...this.getAuthHeader() },
    });
    const data = await readApiResponse<{ history: any[] }>(res, 'Fetch practice history');
    return data.history || [];
  }

  public async submitMockTest(payload: {
    subject: string;
    score: number;
    total: number;
    weakAreas: string[];
    strengths: string[];
  }): Promise<any> {
    const res = await fetch('/api/practice/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify({
        category: 'mock_test',
        topic: payload.subject,
        score: payload.score,
        total: payload.total,
        weakAreas: payload.weakAreas,
        strengths: payload.strengths,
      }),
    });
    return readApiResponse<{ attempt: any }>(res, 'Save mock test result');
  }

  public async generateProjectBlueprint(goal: string, targetCompany: string, level: string): Promise<any> {
    try {
      const res = await fetch('/api/projects/mentor/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ goal, targetCompany, level }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.blueprint) return data.blueprint;
      }
    } catch (e) {
      console.warn('API blueprint generation failed, using local fallback:', e);
    }

    const safeTitle = goal.trim().replace(/\s+/g, ' ').slice(0, 70);
    const title = safeTitle ? `${safeTitle.charAt(0).toUpperCase()}${safeTitle.slice(1)} Platform` : 'Full Stack Web Platform';
    return {
      id: `local-project-${Date.now()}`,
      title,
      tagline: 'Production-ready full-stack architecture with authentication, real-time data & clean REST APIs',
      difficulty: level === 'advanced' ? 'Advanced' : level === 'intermediate' ? 'Intermediate' : 'Beginner',
      techStack: ['React 18', 'TypeScript', 'Node.js / Express', 'MongoDB', 'Tailwind CSS'],
      targetCompanies: targetCompany ? [targetCompany] : ['Tech Startups', 'Product Companies'],
      description: `Build and deploy a scalable web platform around this domain: ${goal}. Features secure JWT authentication, responsive mobile-friendly UI, transactional persistence, input validation, and automated test coverage.`,
      folderStructure: 'project-root/\n  client/\n    src/\n      components/\n      pages/\n      services/\n  server/\n    src/\n      controllers/\n      models/\n      routes/\n  README.md',
      databaseSchema: 'Users (id, name, email, passwordHash, role, created_at)\nResources (id, userId, title, status, metadata, created_at, updated_at)',
      apiArchitecture: [
        { method: 'GET', endpoint: '/api/health', desc: 'Liveness & readiness probe.', auth: false },
        { method: 'GET', endpoint: '/api/resources', desc: 'List paginated records with search and filter parameters.', auth: true },
        { method: 'POST', endpoint: '/api/resources', desc: 'Validate payload and create new entity.', auth: true },
      ],
      milestones: [
        { phase: 'Phase 1: Setup', title: 'System Architecture & Project Setup', tasks: ['Set up Vite + React frontend with TypeScript and Tailwind CSS.', 'Configure Express backend and database connection.'] },
        { phase: 'Phase 2: Backend', title: 'Auth Engine & Data Persistence', tasks: ['Implement user authentication and JWT middleware.', 'Build CRUD controllers with error handling.'] },
        { phase: 'Phase 3: Frontend', title: 'Interactive UI & State Integration', tasks: ['Build responsive pages and forms.', 'Connect frontend to backend APIs with loading and error states.'] },
        { phase: 'Phase 4: Deployment', title: 'Testing & Production Deployment', tasks: ['Write tests and verify edge cases.', 'Deploy frontend on Vercel and backend on Railway.'] },
      ],
      devPlan: [
        'Initialize Git repository with conventional commits.',
        'Implement backend API endpoints and verify responses.',
        'Build frontend views incrementally with responsive layouts.',
        'Deploy and document the project in README.',
      ],
      source: 'gemini',
    };
  }

  // --- AI INTERVIEW STUDIO ---
  public getInterviewQuestions(): InterviewQuestion[] {
    return INITIAL_INTERVIEW_QUESTIONS;
  }

  public async generateInterviewQuestion(mode: string, role: string, level: string): Promise<any> {
    try {
      const res = await fetch('/api/interview/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ mode, role, level }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.question) return data.question;
      }
    } catch (e) {
      console.warn('API interview question failed, using local fallback:', e);
    }

    const roleLower = (role || '').toLowerCase();
    return {
      id: `local-${Date.now()}`,
      mode,
      role,
      topic: `${role} Fundamentals`,
      question: roleLower.includes('python')
        ? 'What is the difference between a list and a tuple in Python, and when would you use each? Explain memory and mutability trade-offs.'
        : roleLower.includes('java')
        ? 'Explain the four core principles of OOP (Encapsulation, Abstraction, Inheritance, Polymorphism) and provide a concise Java code example of runtime polymorphism.'
        : roleLower.includes('frontend')
        ? 'What happens under the hood when a user types a URL into a browser and presses Enter? Trace DNS resolution, TCP handshake, HTTP request/response, and critical rendering path.'
        : roleLower.includes('backend')
        ? 'What is a RESTful API? How do idempotency and HTTP status codes differ between GET, POST, PUT, PATCH, and DELETE?'
        : roleLower.includes('data structures') || roleLower.includes('dsa')
        ? 'How would you detect a cycle in a singly linked list with O(1) space? Explain Floyd’s Tortoise and Hare algorithm and why the pointers are guaranteed to meet.'
        : 'How would you systematically decompose and solve an unfamiliar technical coding problem during a high-stakes technical interview?',
      idealAnswer: 'Structure the response with a direct definition, technical mechanisms (memory layout, complexity), practical examples, and operational trade-offs.',
      followUpPrompt: 'Can you explain an edge-case scenario where this approach would fail or require optimization?',
      suggestedPoints: ['Clear definition', 'Underlying memory/algorithmic complexity', 'Concrete real-world example', 'Trade-offs and edge cases'],
      source: 'gemini',
    };
  }

  public async evaluateInterviewAnswer(
    question: any,
    answerText: string
  ): Promise<{
    score: number;
    confidenceScore: number;
    breakdown: { technical: number; communication: number; architecture: number };
    strengths: string[];
    improvements: string[];
    feedback: string;
    followUpQuestion: string;
  }> {
    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ question, answer: answerText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.score !== undefined) return data;
      }
    } catch (e) {
      console.warn('API evaluate answer failed, using local evaluator:', e);
    }

    const words = answerText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const score = Math.max(30, Math.min(95, Math.round(wordCount * 1.5 + 40)));
    return {
      score,
      confidenceScore: Math.min(90, Math.round(wordCount >= 25 ? 80 : 60)),
      breakdown: {
        technical: Math.min(95, Math.round(score * 0.95)),
        communication: Math.min(95, Math.round(wordCount >= 20 ? 85 : 65)),
        architecture: Math.min(95, Math.round(score * 0.9)),
      },
      strengths: [
        'You communicated your core thought process clearly.',
        wordCount >= 15 ? 'Good depth and technical vocabulary used.' : 'You answered the question directly.',
      ],
      improvements: [
        wordCount < 30 ? 'Provide more comprehensive depth and discuss runtime or memory complexity.' : 'Discuss real-world tradeoffs and alternatives.',
        'Include a practical example from a project you have built.',
      ],
      feedback: `Good effort! You answered with ${wordCount} words. In live technical interviews, start with a direct definition, state the algorithm/mechanism, discuss time and space complexity, and provide a concrete example.`,
      followUpQuestion: typeof question === 'object' && question?.followUpPrompt
        ? question.followUpPrompt
        : 'How would this solution scale if input volume increased by 100x?',
    };
  }

  public async getInterviewHistory(): Promise<any[]> {
    const res = await fetch('/api/interview/history', {
      headers: { ...this.getAuthHeader() },
    });
    const data = await readApiResponse<{ history: any[] }>(res, 'Load interview history');
    return data.history || [];
  }

  // --- AI RESUME ANALYZER ---
  public async analyzeResumeText(resumeText: string, targetTrack: string): Promise<ResumeAnalysisResult> {
    const res = await fetch('/api/resume/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify({ resumeText, targetTrack }),
    });
    return readApiResponse<ResumeAnalysisResult>(res, 'Analyze resume');
  }

  public async sendCoachMessage(
    userMessage: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    userContext?: User | null
  ): Promise<string> {
    try {
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
        body: JSON.stringify({ message: userMessage, history, userContext }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.reply) return data.reply;
      }
    } catch (e) {
      console.warn('AI coach fetch failed, falling back to local coach intelligence:', e);
    }

    const topic = userMessage.toLowerCase();
    if (/dsa|leetcode|array|tree|graph|dynamic programming|complexity/.test(topic)) {
      return 'For DSA problems, first articulate the brute-force solution with its O(N) complexity. Then identify repeated work or lookups that can be reduced to O(1) using Hash Maps, Two Pointers, or Sliding Window. Always test with edge cases (empty input, single element, negative values).';
    }
    if (/interview|hr|behavioral|star/.test(topic)) {
      return 'For interviews, structure behavioral answers using the STAR method: Situation, Task, Action, and Result. For technical rounds, speak your thoughts aloud, validate your assumptions, and outline trade-offs before writing code.';
    }
    if (/project|build|fullstack|react|node/.test(topic)) {
      return 'When building a standout portfolio project, prioritize quality over quantity. Build an end-to-end full-stack platform with secure authentication, responsive UX, input validation, automated testing, and a comprehensive README with architecture diagrams.';
    }
    if (/resume|ats/.test(topic)) {
      return 'For your resume, use action verbs (Architected, Engineered, Optimized) and quantify your impact. Tailor your skills section to match job descriptions, and highlight projects that demonstrate production-level problem-solving.';
    }
    return `Great question! Focus on breaking down the topic into fundamentals, writing small code experiments to verify your mental model, and applying the concept to your target track (${userContext?.track || 'Software Engineering'}). Feel free to ask about specific errors or code snippets!`;
  }

  // --- ANALYTICS ---
  public async getAnalytics(): Promise<AnalyticsData> {
    try {
      const res = await fetch('/api/analytics', {
        headers: { ...this.getAuthHeader() },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.analytics) return data.analytics;
      }
    } catch {}

    const user = this.getCurrentUser();
    const progress = await this.getLearningProgress();
    const projects = await this.getProjects();

    return {
      xp: user?.xp || 0,
      streakDays: user?.streakDays || 0,
      readinessScore: user?.readinessScore ?? null,
      completedLessonsCount: progress.completedLessons.length,
      codingSolved: 0,
      completedProjectsCount: projects.filter((p) => p.status === 'completed').length,
      quizAccuracy: 0,
      totalAssessments: user?.readinessScore ? 1 : 0,
      weeklyStudyMinutes: progress.totalStudyMinutes || (user?.dailyStudyHours ? user.dailyStudyHours * 60 : 0),
      topWeakTopics: [],
      topStrengths: user?.currentSkills?.slice(0, 4) || [],
    };
  }

  // --- RESUME INTELLIGENCE ---
  public async uploadResume(file: File, targetTrack: string = 'fullstack'): Promise<ResumeAnalysisResult> {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetTrack', targetTrack);

    const res = await fetch('/api/resume/upload', {
      method: 'POST',
      headers: {
        ...this.getAuthHeader(),
      },
      body: formData,
    });
    return readApiResponse<ResumeAnalysisResult>(res, 'Upload resume');
  }

  // --- DSA ARENA ---
  public async getDSAProblems(params?: {
    collection?: string;
    category?: string;
    difficulty?: string;
    status?: string;
    search?: string;
  }): Promise<{ problems: DSAProblemItem[]; totalCount: number; topics: string[]; stats: DSAStats }> {
    const query = new URLSearchParams();
    if (params?.collection) query.set('collection', params.collection);
    if (params?.category) query.set('category', params.category);
    if (params?.difficulty) query.set('difficulty', params.difficulty);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/dsa/problems?${query.toString()}`, {
      headers: { ...this.getAuthHeader() },
    });
    return readApiResponse<{ problems: DSAProblemItem[]; totalCount: number; topics: string[]; stats: DSAStats }>(res, 'Fetch DSA problems');
  }

  public async createCustomDSAProblem(payload: { title: string; category: string; difficulty: string; leetcodeUrl?: string }): Promise<DSAProblemItem> {
    const res = await fetch('/api/dsa/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify(payload),
    });
    const data = await readApiResponse<{ problem: DSAProblemItem }>(res, 'Create custom DSA problem');
    return data.problem;
  }

  public async updateDSAStatus(
    problemId: string,
    status: 'not_started' | 'in_progress' | 'solved',
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Not specified' = 'Medium'
  ): Promise<{ problem: any; xpGained: number; newTotalXp: number; readinessScore: number }> {
    const res = await fetch('/api/dsa/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ problemId, status, difficulty }),
    });
    const result = await readApiResponse<{ problem: any; xpGained: number; newTotalXp: number; readinessScore: number }>(res, 'Update DSA status');
    // Sync current user state locally
    const user = this.getCurrentUser();
    if (user) {
      user.xp = result.newTotalXp;
      user.readinessScore = result.readinessScore;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
    return result;
  }

  public async saveDSANote(problemId: string, notes: string): Promise<any> {
    const res = await fetch('/api/dsa/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ problemId, notes }),
    });
    return readApiResponse<any>(res, 'Save DSA note');
  }

  public async getDSAStats(): Promise<DSAStats> {
    const res = await fetch('/api/dsa/stats', {
      headers: { ...this.getAuthHeader() },
    });
    const data = await readApiResponse<{ stats: DSAStats }>(res, 'Fetch DSA stats');
    return data.stats;
  }

  public async getDSAProblemDetail(problemId: string): Promise<any> {
    const res = await fetch(`/api/dsa/problem/${encodeURIComponent(problemId)}`, {
      headers: { ...this.getAuthHeader() },
    });
    const data = await readApiResponse<{ problem: any }>(res, 'Fetch DSA problem details');
    return data.problem;
  }

  public async runDSACode(problemId: string, code: string, language: string = 'javascript'): Promise<any> {
    const res = await fetch('/api/dsa/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify({ problemId, code, language }),
    });
    const data = await readApiResponse<{ result: any }>(res, 'Run code');
    return data.result;
  }

  public async submitDSACode(problemId: string, code: string, language: string = 'javascript'): Promise<any> {
    const res = await fetch('/api/dsa/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.getAuthHeader() },
      body: JSON.stringify({ problemId, code, language }),
    });
    const data = await readApiResponse<{ result: any; xpGained: number }>(res, 'Submit solution');
    if (data.xpGained > 0) {
      const user = this.getCurrentUser();
      if (user) {
        user.xp = (user.xp || 0) + data.xpGained;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }
    }
    return data;
  }

  public async getDSASubmissions(problemId: string): Promise<any[]> {
    const res = await fetch(`/api/dsa/submissions/${encodeURIComponent(problemId)}`, {
      headers: { ...this.getAuthHeader() },
    });
    const data = await readApiResponse<{ submissions: any[] }>(res, 'Fetch submissions');
    return data.submissions || [];
  }
}

export const api = new ApiService();
