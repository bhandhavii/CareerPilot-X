import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as UserModel, IUser } from '../models/User.js';
import { UserWorkspace } from '../models/UserWorkspace.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  track: 'frontend' | 'backend' | 'fullstack';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  weeklyCommitmentHours: number;
  xp: number;
  streakDays: number;
  completedTasks: string[];
  readinessScore?: number | null;
  onboardingComplete: boolean;
  careerGoal?: string;
  currentSkills: string[];
  dailyStudyHours?: number;
  dreamCompany?: string;
  codechefReminderEnabled?: boolean;
  codechefReminderTime?: string;
  lastCodechefReminderSentAt?: string;
  createdAt: string;
}

export interface UserProgressRecord {
  userId: string;
  completedLessons: string[];
  lastOpenedLessonId?: string;
  lastOpenedTrack?: string;
  quizScores: Record<string, number>;
  totalStudyMinutes: number;
  updatedAt: string;
}

export interface DailyMissionRecord {
  userId: string;
  date: string;
  missions: any[];
}

export interface PracticeAttemptRecord {
  id: string;
  userId: string;
  category: 'mcq' | 'output' | 'debugging' | 'assessment';
  topic: string;
  score: number;
  total: number;
  percentage: number;
  weakAreas: string[];
  strengths: string[];
  date: string;
}

export interface CodingSubmissionRecord {
  id: string;
  userId: string;
  challengeId: string;
  passed: boolean;
  code: string;
  date: string;
}

export interface ProjectRecord {
  userId: string;
  projects: any[];
}

export interface InterviewAttemptRecord {
  id: string;
  userId: string;
  module: string;
  question: string;
  score: number;
  feedback: string;
  breakdown: { technical: number; communication: number; architecture: number; confidence?: number };
  date: string;
}

export interface DSAProblemProgress {
  problemId: string;
  status: 'not_started' | 'in_progress' | 'solved';
  notes?: string;
  solvedAt?: string;
  updatedAt: string;
}

export interface UserDSAState {
  userId: string;
  problems: Record<string, DSAProblemProgress>;
}

interface LocalStoreSchema {
  users: StoredUser[];
  progress: Record<string, UserProgressRecord>;
  missions: Record<string, DailyMissionRecord>;
  fullMissions: Record<string, DailyMissionRecord>;
  roadmaps: Record<string, any[]>;
  practiceAttempts: PracticeAttemptRecord[];
  codingSubmissions: CodingSubmissionRecord[];
  projects: Record<string, any[]>;
  interviewAttempts: InterviewAttemptRecord[];
  dsa?: Record<string, UserDSAState>;
  customDsaProblems?: Record<string, any[]>;
}

class ResilientStore {
  private memoryStore: LocalStoreSchema = {
    users: [],
    progress: {},
    missions: {},
    fullMissions: {},
    roadmaps: {},
    practiceAttempts: [],
    codingSubmissions: [],
    projects: {},
    interviewAttempts: [],
    dsa: {},
    customDsaProblems: {},
  };

  constructor() {
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        this.memoryStore = { ...this.memoryStore, ...JSON.parse(raw) };
      } else {
        this.saveToFile();
      }
    } catch (err) {
      console.warn('[Storage] Could not read local store file, initializing clean store:', err);
    }
  }

  private saveToFile() {
    try {
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.memoryStore, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Storage] Error saving to persistent store:', err);
    }
  }

  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  private async getMongoWorkspace(userId: string): Promise<any | null> {
    if (!this.isMongoConnected()) return null;
    try {
      let workspace = await UserWorkspace.findOne({ userId });
      if (!workspace) workspace = await UserWorkspace.create({ userId });
      return workspace;
    } catch (error) {
      console.warn('[Storage] Mongo workspace read failed:', error);
      return null;
    }
  }

  private async setMongoWorkspaceField(userId: string, field: string, value: any): Promise<boolean> {
    if (!this.isMongoConnected()) return false;
    try {
      await UserWorkspace.findOneAndUpdate(
        { userId },
        { $set: { [field]: value } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return true;
    } catch (error) {
      console.warn(`[Storage] Mongo workspace update failed for ${field}:`, error);
      return false;
    }
  }

  // --- USER AUTH & PROFILE ---
  public async findUserByEmail(email: string): Promise<StoredUser | null> {
    const normalized = email.trim().toLowerCase();
    if (this.isMongoConnected()) {
      try {
        const doc = await UserModel.findOne({ email: normalized });
        if (doc) return this.docToStoredUser(doc);
      } catch (e) {
        console.warn('[Storage] Mongo query failed, falling back to local store:', e);
      }
    }
    const found = this.memoryStore.users.find((u) => u.email.toLowerCase() === normalized);
    return found || null;
  }

  public async findUserById(id: string): Promise<StoredUser | null> {
    if (this.isMongoConnected() && mongoose.isValidObjectId(id)) {
      try {
        const doc = await UserModel.findById(id);
        if (doc) return this.docToStoredUser(doc);
      } catch (e) {
        console.warn('[Storage] Mongo query failed, falling back to local store:', e);
      }
    }
    const found = this.memoryStore.users.find((u) => u.id === id);
    return found || null;
  }

  public async createUser(userData: {
    name: string;
    email: string;
    passwordHash: string;
    avatarUrl?: string;
    authProvider?: 'local' | 'google';
    googleId?: string;
      }): Promise<StoredUser> {
    const normalized = userData.email.trim().toLowerCase();

    if (this.isMongoConnected()) {
      try {
        const created = await UserModel.create({
          name: userData.name.trim(),
          email: normalized,
          passwordHash: userData.passwordHash,
          avatarUrl: userData.avatarUrl || '',
          authProvider: userData.authProvider || 'local',
          googleId: userData.googleId,
          track: 'fullstack',
          experienceLevel: 'beginner',
          weeklyCommitmentHours: 0,
          xp: 0,
          streakDays: 0,
          completedTasks: [],
          readinessScore: null,
          onboardingComplete: false,
          currentSkills: [],
          codechefReminderEnabled: false,
          codechefReminderTime: '18:00',
        });
        const mapped = this.docToStoredUser(created);
        // Sync locally as well
        this.memoryStore.users = this.memoryStore.users.filter((u) => u.email !== normalized);
        this.memoryStore.users.push(mapped);
        this.saveToFile();
        return mapped;
      } catch (e) {
        console.warn('[Storage] Mongo creation failed, persisting to local store:', e);
      }
    }

    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: userData.name.trim(),
      email: normalized,
      passwordHash: userData.passwordHash,
      avatarUrl: userData.avatarUrl || '',
      authProvider: userData.authProvider || 'local',
      googleId: userData.googleId,
      track: 'fullstack',
      experienceLevel: 'beginner',
      weeklyCommitmentHours: 0,
      xp: 0,
      streakDays: 0,
      completedTasks: [],
      readinessScore: null,
      onboardingComplete: false,
      careerGoal: undefined,
      currentSkills: [],
      dailyStudyHours: undefined,
      dreamCompany: undefined,
      codechefReminderEnabled: false,
      codechefReminderTime: '18:00',
      createdAt: new Date().toISOString(),
    };

    this.memoryStore.users.push(newUser);
    this.saveToFile();
    return newUser;
  }

  public async updateUser(id: string, updates: Partial<StoredUser>): Promise<StoredUser | null> {
    if (this.isMongoConnected() && mongoose.isValidObjectId(id)) {
      try {
        const updatedDoc = await UserModel.findByIdAndUpdate(id, { $set: updates }, { new: true });
        if (updatedDoc) {
          const mapped = this.docToStoredUser(updatedDoc);
          const idx = this.memoryStore.users.findIndex((u) => u.id === id);
          if (idx !== -1) this.memoryStore.users[idx] = mapped;
          this.saveToFile();
          return mapped;
        }
      } catch (e) {
        console.warn('[Storage] Mongo update failed, using local store:', e);
      }
    }

    const idx = this.memoryStore.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    this.memoryStore.users[idx] = {
      ...this.memoryStore.users[idx],
      ...updates,
    };
    this.saveToFile();
    return this.memoryStore.users[idx];
  }

  public async getUsersWithCodeChefReminder(): Promise<StoredUser[]> {
    if (this.isMongoConnected()) {
      try {
        const docs = await UserModel.find({ codechefReminderEnabled: true });
        return docs.map((doc) => this.docToStoredUser(doc));
      } catch (error) {
        console.warn('[Reminder] Could not query MongoDB reminder preferences:', error);
      }
    }
    return this.memoryStore.users.filter((user) => user.codechefReminderEnabled);
  }

  // --- LEARNING PROGRESS ---
  public async getUserProgress(userId: string): Promise<UserProgressRecord> {
    const defaultProgress: UserProgressRecord = {
      userId,
      completedLessons: [],
      lastOpenedLessonId: undefined,
      lastOpenedTrack: undefined,
      quizScores: {},
      totalStudyMinutes: 0,
      updatedAt: new Date().toISOString(),
    };
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(userId);
      if (workspace?.progress?.userId) return workspace.progress as UserProgressRecord;
      await this.setMongoWorkspaceField(userId, 'progress', defaultProgress);
      return defaultProgress;
    }
    if (!this.memoryStore.progress[userId]) {
      this.memoryStore.progress[userId] = defaultProgress;
      this.saveToFile();
    }
    return this.memoryStore.progress[userId];
  }

  public async updateUserProgress(
    userId: string,
    updates: Partial<UserProgressRecord>
  ): Promise<UserProgressRecord> {
    const existing = await this.getUserProgress(userId);
    const updated: UserProgressRecord = {
      ...existing,
      ...updates,
      completedLessons: Array.from(new Set([...(existing.completedLessons || []), ...(updates.completedLessons || [])])),
      quizScores: { ...(existing.quizScores || {}), ...(updates.quizScores || {}) },
      updatedAt: new Date().toISOString(),
    };
    if (this.isMongoConnected()) {
      await this.setMongoWorkspaceField(userId, 'progress', updated);
      return updated;
    }
    this.memoryStore.progress[userId] = updated;
    this.saveToFile();
    return updated;
  }

  // --- DAILY MISSIONS ---
  public async getUserMissions(userId: string): Promise<any[]> {
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(userId);
      return workspace?.missions?.missions || [];
    }
    return this.memoryStore.missions[userId]?.missions || [];
  }

  public async saveUserMissions(userId: string, missions: any[]): Promise<any[]> {
    const record = { userId, date: new Date().toISOString().slice(0, 10), missions };
    if (this.isMongoConnected()) {
      await this.setMongoWorkspaceField(userId, 'missions', record);
      return missions;
    }
    this.memoryStore.missions[userId] = record;
    this.saveToFile();
    return missions;
  }

  public async getUserFullMissions(userId: string): Promise<any[]> {
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(userId);
      return workspace?.fullMissions?.missions || [];
    }
    return this.memoryStore.fullMissions[userId]?.missions || [];
  }

  public async saveUserFullMissions(userId: string, missions: any[]): Promise<any[]> {
    const record = { userId, date: new Date().toISOString().slice(0, 10), missions };
    if (this.isMongoConnected()) {
      await this.setMongoWorkspaceField(userId, 'fullMissions', record);
      return missions;
    }
    this.memoryStore.fullMissions[userId] = record;
    this.saveToFile();
    return missions;
  }

  // --- ROADMAP ---
  public async getUserRoadmap(userId: string): Promise<any[]> {
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(userId);
      return workspace?.roadmaps || [];
    }
    return this.memoryStore.roadmaps[userId] || [];
  }

  public async saveUserRoadmap(userId: string, milestones: any[]): Promise<any[]> {
    if (this.isMongoConnected()) {
      await this.setMongoWorkspaceField(userId, 'roadmaps', milestones);
      return milestones;
    }
    this.memoryStore.roadmaps[userId] = milestones;
    this.saveToFile();
    return milestones;
  }

  // --- PRACTICE ATTEMPTS ---
  public async savePracticeAttempt(attempt: Omit<PracticeAttemptRecord, 'id'>): Promise<PracticeAttemptRecord> {
    const record: PracticeAttemptRecord = {
      ...attempt,
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(attempt.userId);
      const history = [...(workspace?.practiceAttempts || []), record];
      await this.setMongoWorkspaceField(attempt.userId, 'practiceAttempts', history);
      return record;
    }
    this.memoryStore.practiceAttempts.push(record);
    this.saveToFile();
    return record;
  }

  public async getUserPracticeHistory(userId: string): Promise<PracticeAttemptRecord[]> {
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(userId);
      return workspace?.practiceAttempts || [];
    }
    return this.memoryStore.practiceAttempts.filter((a) => a.userId === userId);
  }

  // --- CODING CHALLENGES ---
  public async saveCodingSubmission(submission: Omit<CodingSubmissionRecord, 'id'>): Promise<CodingSubmissionRecord> {
    const record: CodingSubmissionRecord = {
      ...submission,
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(submission.userId);
      const history = [...(workspace?.codingSubmissions || []), record];
      await this.setMongoWorkspaceField(submission.userId, 'codingSubmissions', history);
      return record;
    }
    this.memoryStore.codingSubmissions.push(record);
    this.saveToFile();
    return record;
  }

  public async getUserCodingSubmissions(userId: string): Promise<CodingSubmissionRecord[]> {
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(userId);
      return workspace?.codingSubmissions || [];
    }
    return this.memoryStore.codingSubmissions.filter((s) => s.userId === userId);
  }

  // --- PROJECTS ---
  public async getUserProjects(userId: string): Promise<any[]> {
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(userId);
      return workspace?.projects || [];
    }
    return this.memoryStore.projects[userId] || [];
  }

  public async saveUserProjects(userId: string, projects: any[]): Promise<any[]> {
    if (this.isMongoConnected()) {
      await this.setMongoWorkspaceField(userId, 'projects', projects);
      return projects;
    }
    this.memoryStore.projects[userId] = projects;
    this.saveToFile();
    return projects;
  }

  // --- INTERVIEW ATTEMPTS ---
  public async saveInterviewAttempt(attempt: Omit<InterviewAttemptRecord, 'id'>): Promise<InterviewAttemptRecord> {
    const record: InterviewAttemptRecord = {
      ...attempt,
      id: `int_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    };
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(attempt.userId);
      const history = [...(workspace?.interviewAttempts || []), record];
      await this.setMongoWorkspaceField(attempt.userId, 'interviewAttempts', history);
      return record;
    }
    this.memoryStore.interviewAttempts.push(record);
    this.saveToFile();
    return record;
  }

  public async getUserInterviewAttempts(userId: string): Promise<InterviewAttemptRecord[]> {
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(userId);
      return workspace?.interviewAttempts || [];
    }
    return this.memoryStore.interviewAttempts.filter((i) => i.userId === userId);
  }

  // --- AGGREGATED ANALYTICS ---
  public async getUserAnalytics(userId: string) {
    const progress = await this.getUserProgress(userId);
    const practice = await this.getUserPracticeHistory(userId);
    const coding = await this.getUserCodingSubmissions(userId);
    const projects = await this.getUserProjects(userId);
    const user = await this.findUserById(userId);

    const completedLessonsCount = progress.completedLessons.length;
    const codingSolved = new Set(coding.filter((c) => c.passed).map((c) => c.challengeId)).size;
    const completedProjectsCount = projects.filter((p) => p.status === 'completed').length;

    // Quiz Accuracy calculation
    const totalQuizScores = Object.values(progress.quizScores);
    const quizAccuracy = totalQuizScores.length > 0
      ? Math.round(totalQuizScores.reduce((a, b) => a + b, 0) / totalQuizScores.length)
      : 0;

    // Weak and Strong topics extraction
    const weakMap: Record<string, number> = {};
    const strengthMap: Record<string, number> = {};
    practice.forEach((p) => {
      p.weakAreas.forEach((w) => { weakMap[w] = (weakMap[w] || 0) + 1; });
      p.strengths.forEach((s) => { strengthMap[s] = (strengthMap[s] || 0) + 1; });
    });

    return {
      xp: user?.xp || 0,
      streakDays: user?.streakDays || 0,
      readinessScore: user?.readinessScore ?? null,
      completedLessonsCount,
      codingSolved,
      completedProjectsCount,
      quizAccuracy,
      totalAssessments: practice.length,
      weeklyStudyMinutes: progress.totalStudyMinutes || (user?.dailyStudyHours ? user.dailyStudyHours * 60 : 0),
      topWeakTopics: Object.keys(weakMap).sort((a, b) => weakMap[b] - weakMap[a]).slice(0, 5),
      topStrengths: Object.keys(strengthMap).sort((a, b) => strengthMap[b] - strengthMap[a]).slice(0, 5),
      lastUpdated: progress.updatedAt,
    };
  }

  // --- DSA ARENA PROGRESS & METRICS ---
  public async getUserCustomDSAProblems(userId: string): Promise<any[]> {
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(userId);
      return Array.isArray(workspace?.customDsaProblems) ? workspace.customDsaProblems : [];
    }
    return this.memoryStore.customDsaProblems?.[userId] || [];
  }

  public async saveUserCustomDSAProblems(userId: string, problems: any[]): Promise<any[]> {
    if (this.isMongoConnected()) {
      await this.setMongoWorkspaceField(userId, 'customDsaProblems', problems);
      return problems;
    }
    if (!this.memoryStore.customDsaProblems) this.memoryStore.customDsaProblems = {};
    this.memoryStore.customDsaProblems[userId] = problems;
    this.saveToFile();
    return problems;
  }

  public async getUserDSAProgress(userId: string): Promise<Record<string, DSAProblemProgress>> {
    if (this.isMongoConnected()) {
      const workspace = await this.getMongoWorkspace(userId);
      return workspace?.dsa?.problems || {};
    }
    if (!this.memoryStore.dsa) this.memoryStore.dsa = {};
    return this.memoryStore.dsa[userId]?.problems || {};
  }

  public async updateUserDSAStatus(
    userId: string,
    problemId: string,
    status: 'not_started' | 'in_progress' | 'solved',
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Not specified' = 'Medium'
  ): Promise<{ problem: DSAProblemProgress; xpGained: number; newTotalXp: number; readinessScore: number }> {
    const currentProblems = await this.getUserDSAProgress(userId);
    const currentRecord = currentProblems[problemId];
    const wasAlreadySolved = currentRecord?.status === 'solved';

    const updated: DSAProblemProgress = {
      problemId,
      status,
      notes: currentRecord?.notes || '',
      solvedAt: status === 'solved' ? currentRecord?.solvedAt || new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    currentProblems[problemId] = updated;
    if (this.isMongoConnected()) {
      await this.setMongoWorkspaceField(userId, 'dsa', { userId, problems: currentProblems });
    } else {
      if (!this.memoryStore.dsa) this.memoryStore.dsa = {};
      this.memoryStore.dsa[userId] = { userId, problems: currentProblems };
    }

    let xpGained = 0;
    const user = await this.findUserById(userId);
    let currentXp = user?.xp || 0;

    if (status === 'solved' && !wasAlreadySolved) {
      // Award XP based on difficulty
      xpGained = difficulty === 'Hard' ? 150 : difficulty === 'Easy' ? 50 : 100;
      currentXp += xpGained;
    }

    // Recalculate Placement Readiness based on authentic progress
    // Weightings: DSA (35%), Lessons (25%), Quiz Accuracy (20%), Projects (20%)
    const allProblems = Object.values(currentProblems);
    const solvedCount = allProblems.filter((p) => p.status === 'solved').length;
    const dsaComponent = Math.min(35, Math.round((solvedCount / 50) * 35));

    const progress = await this.getUserProgress(userId);
    const lessonComponent = Math.min(25, Math.round((progress.completedLessons.length / 15) * 25));

    const quizScores = Object.values(progress.quizScores || {});
    const quizAvg = quizScores.length > 0 ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0;
    const quizComponent = Math.min(20, Math.round((quizAvg / 100) * 20));

    const projects = await this.getUserProjects(userId);
    const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
    const projectComponent = Math.min(20, Math.round((completedProjects / 3) * 20));

    const calculatedReadiness = Math.min(100, dsaComponent + lessonComponent + quizComponent + projectComponent);

    if (user) {
      await this.updateUser(userId, {
        xp: currentXp,
        streakDays: Math.max(1, user.streakDays || 1),
        readinessScore: calculatedReadiness,
      });
    }

    this.saveToFile();

    return {
      problem: updated,
      xpGained,
      newTotalXp: currentXp,
      readinessScore: calculatedReadiness,
    };
  }

  public async saveUserDSANote(
    userId: string,
    problemId: string,
    notes: string
  ): Promise<DSAProblemProgress> {
    const problems = await this.getUserDSAProgress(userId);
    const currentRecord = problems[problemId] || {
      problemId,
      status: 'not_started' as const,
      updatedAt: new Date().toISOString(),
    };
    currentRecord.notes = notes;
    currentRecord.updatedAt = new Date().toISOString();
    problems[problemId] = currentRecord;
    if (this.isMongoConnected()) {
      await this.setMongoWorkspaceField(userId, 'dsa', { userId, problems });
    } else {
      if (!this.memoryStore.dsa) this.memoryStore.dsa = {};
      this.memoryStore.dsa[userId] = { userId, problems };
      this.saveToFile();
    }
    return currentRecord;
  }

  public async getUserDSAStats(userId: string, allProblems: { id: string; difficulty: string; category: string }[]) {
    const userProgress = await this.getUserDSAProgress(userId);
    
    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    let easyTotal = 0;
    let mediumTotal = 0;
    let hardTotal = 0;
    let unspecifiedSolved = 0;
    let unspecifiedTotal = 0;

    const topicStats: Record<string, { total: number; solved: number }> = {};

    for (const prob of allProblems) {
      if (prob.difficulty === 'Easy') easyTotal++;
      else if (prob.difficulty === 'Medium') mediumTotal++;
      else if (prob.difficulty === 'Hard') hardTotal++;
      else unspecifiedTotal++;

      if (!topicStats[prob.category]) {
        topicStats[prob.category] = { total: 0, solved: 0 };
      }
      topicStats[prob.category].total++;

      const record = userProgress[prob.id];
      if (record && record.status === 'solved') {
        totalSolved++;
        if (prob.difficulty === 'Easy') easySolved++;
        else if (prob.difficulty === 'Medium') mediumSolved++;
        else if (prob.difficulty === 'Hard') hardSolved++;
        else unspecifiedSolved++;
        topicStats[prob.category].solved++;
      }
    }

    const totalProblems = allProblems.length;
    const completionPercentage = totalProblems > 0 ? Math.round((totalSolved / totalProblems) * 100) : 0;

    return {
      totalSolved,
      totalProblems,
      easySolved,
      easyTotal,
      mediumSolved,
      mediumTotal,
      hardSolved,
      hardTotal,
      unspecifiedSolved,
      unspecifiedTotal,
      completionPercentage,
      topicStats,
    };
  }

  private docToStoredUser(doc: IUser): StoredUser {
    return {
      id: String(doc._id),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      avatarUrl: doc.avatarUrl || '',
      authProvider: doc.authProvider || 'local',
      googleId: doc.googleId,
      track: doc.track || 'fullstack',
      experienceLevel: doc.experienceLevel || 'beginner',
      weeklyCommitmentHours: doc.weeklyCommitmentHours || 0,
      xp: doc.xp || 0,
      streakDays: doc.streakDays || 0,
      completedTasks: doc.completedTasks || [],
      readinessScore: doc.readinessScore ?? null,
      onboardingComplete: Boolean(doc.onboardingComplete),
      careerGoal: doc.careerGoal,
      currentSkills: doc.currentSkills || [],
      dailyStudyHours: doc.dailyStudyHours,
      dreamCompany: doc.dreamCompany,
      codechefReminderEnabled: Boolean(doc.codechefReminderEnabled),
      codechefReminderTime: doc.codechefReminderTime || '18:00',
      lastCodechefReminderSentAt: doc.lastCodechefReminderSentAt ? doc.lastCodechefReminderSentAt.toISOString() : undefined,
      createdAt: (doc as any).createdAt ? (doc as any).createdAt.toISOString() : new Date().toISOString(),
    };
  }
}

export const dbStore = new ResilientStore();
