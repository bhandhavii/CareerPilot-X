export type CareerTrack = 'frontend' | 'backend' | 'fullstack' | 'dsa';

export interface User {
  id: string;
  name: string;
  email: string;
  track: 'frontend' | 'backend' | 'fullstack';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  weeklyCommitmentHours: number;
  xp: number;
  streakDays: number;
  completedTasks: string[];
  readinessScore?: number | null;
  onboardingComplete?: boolean;
  careerGoal?: string;
  currentSkills?: string[];
  dailyStudyHours?: number;
  dreamCompany?: string;
  avatarUrl?: string;
  codechefReminderEnabled?: boolean;
  codechefReminderTime?: string;
  createdAt?: string;
}

export interface Question {
  id: string;
  track: CareerTrack;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AssessmentResult {
  track: CareerTrack;
  score: number;
  total: number;
  percentage: number;
  date: string;
  feedback: string;
  weakAreas: string[];
  strengths: string[];
}

export interface DailyMission {
  id: string;
  title: string;
  learningObjective?: string;
  description?: string;
  track?: CareerTrack;
  xpReward: number;
  estimatedMinutes?: number;
  estimatedDuration?: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'easy' | 'medium' | 'hard';
  completed: boolean;
  category: 'lesson' | 'quiz' | 'code' | 'reading' | 'interview';
  targetLessonId?: string;
  targetChallengeId?: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  track: CareerTrack;
  level: number;
  status: 'locked' | 'in_progress' | 'completed';
  skills: string[];
  estimatedWeeks: number;
  whyRecommended?: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'Beginner' | 'Intermediate' | 'Advanced';
  track: CareerTrack;
  description: string;
  starterCode: string;
  solutionCode?: string;
  testCases: {
    input: string;
    expectedOutput: string;
    description: string;
  }[];
  explanation: string;
  hints: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  track: CareerTrack;
  difficulty: 'intermediate' | 'advanced' | 'capstone';
  estimatedHours: number;
  skills: string[];
  description: string;
  milestones: { id: string; title: string; completed: boolean }[];
  repoUrl?: string;
  liveUrl?: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface InterviewQuestion {
  id: string;
  role: string;
  track: CareerTrack;
  topic: string;
  question: string;
  suggestedPoints: string[];
}

export interface ResumeAnalysisResult {
  score: number;
  detectedSkills: string[];
  missingKeywords: string[];
  strengths: string[];
  improvements: string[];
  roleMatchPercentage: number;
  summary: string;
  wordCount?: number;
  filename?: string;
  xyzBulletSuggestions?: string[];
  sectionAudit?: {
    contactInfo: boolean;
    summary: boolean;
    experience: boolean;
    skills: boolean;
    projects: boolean;
    education: boolean;
  };
}

export interface DSAProblemItem {
  id: string;
  number: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Not specified';
  category: string;
  leetcodeUrl: string;
  isBlind75: boolean;
  isNeetCode150: boolean;
  isTop250: boolean;
  acceptanceRate?: string;
  tags: string[];
  status: 'not_started' | 'in_progress' | 'solved';
  notes?: string;
  solvedAt?: string;
}

export interface DSAStats {
  totalSolved: number;
  totalProblems: number;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  unspecifiedSolved?: number;
  unspecifiedTotal?: number;
  completionPercentage: number;
  topicStats: Record<string, { total: number; solved: number }>;
}

// Educational platform types
export interface LessonQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonCodingChallenge {
  title: string;
  description: string;
  starterCode: string;
  expectedOutput: string;
  testInput: string;
  hints: string[];
  solutionCode: string;
}

export interface LessonDetail {
  id: string;
  trackId: CareerTrack;
  moduleId: string;
  moduleName: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  introduction: string;
  objectives: string[];
  explanation: string;
  stepByStepBreakdown: { step: number; title: string; detail: string }[];
  syntaxCode: string;
  codeExplanation: { lineOrSection: string; explanation: string }[];
  expectedOutput: string;
  realWorldApplications: string[];
  commonMistakes: string[];
  bestPractices: string[];
  practicalExercise: string;
  quiz: LessonQuizQuestion[];
  challenge: LessonCodingChallenge;
  nextLessonId?: string;
  prevLessonId?: string;
}

export interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  lessonIds: string[];
}

export interface TrackInfo {
  id: CareerTrack;
  title: string;
  description: string;
  icon: string;
  estimatedHours: number;
  modules: ModuleInfo[];
}

export interface LearningProgress {
  completedLessons: string[];
  lastOpenedLessonId?: string;
  lastOpenedTrack?: string;
  quizScores: Record<string, number>;
  totalStudyMinutes: number;
  updatedAt?: string;
}

export interface AnalyticsData {
  xp: number;
  streakDays: number;
  readinessScore: number | null;
  completedLessonsCount: number;
  codingSolved: number;
  completedProjectsCount: number;
  quizAccuracy: number;
  totalAssessments: number;
  weeklyStudyMinutes: number;
  topWeakTopics: string[];
  topStrengths: string[];
  lastUpdated?: string;
}
