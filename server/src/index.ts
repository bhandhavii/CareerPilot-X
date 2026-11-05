import './config/env.js';
import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { dbStore, StoredUser } from './storage/dbStore.js';
import { authenticateToken, AuthRequest } from './middleware/auth.middleware.js';
import { aiService } from './services/ai.service.js';
import { emailService } from './services/email.service.js';
import { TRACKS, LESSONS_DATABASE } from './data/learningContent.js';
import multer from 'multer';
import { DSA_PROBLEMS_DATABASE, DSA_TOPICS, DSAProblem } from './data/dsaProblems.js';
import { SHRADHA_DSA_PROBLEMS } from './data/shradhaDsaProblems.js';

const ALL_DSA_PROBLEMS = [...DSA_PROBLEMS_DATABASE, ...SHRADHA_DSA_PROBLEMS];
const dbUrlMap = new Map<string, string>();
for (const p of DSA_PROBLEMS_DATABASE) {
  if (p.slug) dbUrlMap.set(p.slug.toLowerCase().trim(), p.leetcodeUrl);
  if (p.title) dbUrlMap.set(p.title.toLowerCase().trim(), p.leetcodeUrl);
}

function resolveDirectLeetcodeUrl(p: { leetcodeUrl?: string; slug?: string; title?: string }): string {
  const current = (p.leetcodeUrl || '').trim();
  if (current.includes('/problems/') && !current.includes('problemset') && !current.endsWith('/problems/')) {
    return current;
  }
  const cleanSlug = p.slug?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '';
  const cleanTitle = p.title?.toLowerCase().trim() || '';

  if (cleanSlug && dbUrlMap.has(cleanSlug)) {
    return dbUrlMap.get(cleanSlug)!;
  }
  if (cleanTitle && dbUrlMap.has(cleanTitle)) {
    return dbUrlMap.get(cleanTitle)!;
  }

  // If URL has search query, standardize to valid LeetCode problemset URL
  if (current.includes('search=')) {
    const q = current.split('search=')[1] || '';
    return `https://leetcode.com/problemset/all/?search=${q}`;
  }

  // If clean standard slug
  if (cleanSlug && !cleanSlug.includes('and') && !cleanSlug.includes('problem') && cleanSlug.length < 35) {
    return `https://leetcode.com/problems/${cleanSlug}/`;
  }

  return `https://leetcode.com/problemset/all/?search=${encodeURIComponent(p.title || cleanSlug)}`;
}
import { resumeParser } from './services/resumeParser.service.js';
import { codeExecutionService } from './services/codeExecution.service.js';
import { getProblemDetails } from './data/dsaProblemDetails.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'careerpilot_x_secure_jwt_secret_key_2026';

const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());

function toPublicUser(user: StoredUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || '',
    authProvider: user.authProvider || 'local',
    googleId: user.googleId,
    track: user.track || 'fullstack',
    experienceLevel: user.experienceLevel || 'beginner',
    weeklyCommitmentHours: user.weeklyCommitmentHours || 0,
    xp: user.xp || 0,
    streakDays: user.streakDays || 0,
    completedTasks: user.completedTasks || [],
    readinessScore: user.readinessScore ?? null,
    onboardingComplete: Boolean(user.onboardingComplete),
    careerGoal: user.careerGoal || '',
    currentSkills: user.currentSkills || [],
    dailyStudyHours: user.dailyStudyHours || 0,
    dreamCompany: user.dreamCompany || '',
    codechefReminderEnabled: Boolean(user.codechefReminderEnabled),
    codechefReminderTime: user.codechefReminderTime || '18:00',
    createdAt: user.createdAt,
  };
}

// --- 1. HEALTH CHECK ---
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'CareerPilot X Backend API',
    timestamp: new Date().toISOString(),
    aiConfigured: aiService.hasRealAPIKey(),
    databaseMode: mongoose.connection.readyState === 1 ? 'mongodb' : 'resilient-store',
  });
});

// --- 2. AUTHENTICATION ---
// Signup is intentionally password-based: no email OTP, verification email, or SMTP dependency.
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name?.trim() || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name (at least 2 characters).' });
    }

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (typeof confirmPassword !== 'string' || password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
    }

    const existing = await dbStore.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await dbStore.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      token,
      user: toPublicUser(user),
      message: 'Account created successfully.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes('duplicate')) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }
    return res.status(500).json({ error: msg });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    const password = req.body.password;
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await dbStore.findUserByEmail(normalizedEmail);
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ error: 'Incorrect email or password.' });
    }


    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: toPublicUser(user) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

app.post('/api/auth/google', async (req: Request, res: Response) => {
  try {
    const { email, name, googleId, avatarUrl } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ error: 'Email and Google ID are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let user = await dbStore.findUserByGoogleId(googleId);

    if (!user) {
      user = await dbStore.findUserByEmail(normalizedEmail);
      if (user) {
        user = await dbStore.updateUser(user.id, {
          googleId,
          authProvider: 'google',
          avatarUrl: user.avatarUrl || avatarUrl || '',
        });
      } else {
        user = await dbStore.createUser({
          name: name ? String(name).trim() : normalizedEmail.split('@')[0],
          email: normalizedEmail,
          passwordHash: '',
          avatarUrl: avatarUrl || '',
          authProvider: 'google',
          googleId,
        });
      }
    }

    if (!user) {
      return res.status(500).json({ error: 'Failed to process Google authentication.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      token,
      user: toPublicUser(user),
      message: 'Signed in with Google successfully.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// Current user profile
app.get('/api/profile/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await dbStore.findUserById(req.userId || '');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: toPublicUser(user) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// CodeChef Starters reminder preferences are user-specific and saved with the account.
app.get('/api/profile/reminder', authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = await dbStore.findUserById(req.userId || '');
  if (!user) return res.status(404).json({ error: 'User not found.' });
  return res.json({
    enabled: Boolean(user.codechefReminderEnabled),
    time: user.codechefReminderTime || '18:00',
    email: user.email,
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_FROM),
  });
});

app.put('/api/profile/reminder', authenticateToken, async (req: AuthRequest, res: Response) => {
  const enabled = Boolean(req.body.enabled);
  const time = String(req.body.time || '18:00');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    return res.status(400).json({ error: 'Reminder time must use HH:MM format.' });
  }
  const updated = await dbStore.updateUser(req.userId || '', {
    codechefReminderEnabled: enabled,
    codechefReminderTime: time,
  });
  if (!updated) return res.status(404).json({ error: 'User not found.' });
  return res.json({
    enabled: Boolean(updated.codechefReminderEnabled),
    time: updated.codechefReminderTime || '18:00',
    email: updated.email,
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.MAIL_FROM),
  });
});

// Onboarding submission
app.post('/api/profile/onboarding', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { careerGoal, experienceLevel, currentSkills = [], dailyStudyHours, dreamCompany = '' } = req.body;
    const validGoals = ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Full-Stack Developer', 'Data Analyst', 'Java Developer', 'AI Engineer', 'Other'];
    if (!validGoals.includes(careerGoal) || !['beginner', 'intermediate', 'advanced'].includes(experienceLevel)) {
      return res.status(400).json({ error: 'Please select a valid career goal and experience level.' });
    }

    const goalLower = careerGoal.toLowerCase();
    const track = goalLower.includes('front') ? 'frontend' : goalLower.includes('back') ? 'backend' : 'fullstack';
    const hours = Math.max(1, Number(dailyStudyHours) || 2);

    const updated = await dbStore.updateUser(req.userId || '', {
      careerGoal,
      experienceLevel,
      currentSkills: Array.isArray(currentSkills) ? currentSkills.map(String).slice(0, 30) : [],
      dailyStudyHours: hours,
      weeklyCommitmentHours: hours * 7,
      dreamCompany: String(dreamCompany).trim(),
      track,
      onboardingComplete: true,
    });

    if (!updated) return res.status(404).json({ error: 'Account not found.' });
    return res.json({ user: toPublicUser(updated) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// Update profile details
app.patch('/api/profile/update', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, track, experienceLevel, dailyStudyHours, careerGoal, dreamCompany, currentSkills, avatarUrl } = req.body;
    const updates: Partial<StoredUser> = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof avatarUrl === 'string') updates.avatarUrl = avatarUrl;
    if (['frontend', 'backend', 'fullstack'].includes(track)) updates.track = track;
    if (['beginner', 'intermediate', 'advanced'].includes(experienceLevel)) updates.experienceLevel = experienceLevel;
    if (Number.isFinite(dailyStudyHours) && dailyStudyHours > 0) {
      updates.dailyStudyHours = Number(dailyStudyHours);
      updates.weeklyCommitmentHours = Number(dailyStudyHours) * 7;
    }
    if (typeof careerGoal === 'string') updates.careerGoal = careerGoal;
    if (typeof dreamCompany === 'string') updates.dreamCompany = dreamCompany;
    if (Array.isArray(currentSkills)) updates.currentSkills = currentSkills;

    const updated = await dbStore.updateUser(req.userId || '', updates);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: toPublicUser(updated) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// Change Password
app.post('/api/profile/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: 'Current password and a new password of at least 8 characters are required.' });
    }
    const user = await dbStore.findUserById(req.userId || '');
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.passwordHash) {
      return res.status(400).json({ error: 'Password change is not available for accounts authenticated via Google.' });
    }

    const matches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: 'Current password does not match.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await dbStore.updateUser(user.id, { passwordHash });
    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// Update stats (XP, streak, score)
app.patch('/api/profile/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const updates: Partial<StoredUser> = {};
    if (Number.isFinite(req.body.xp)) updates.xp = Math.max(0, Math.floor(req.body.xp));
    if (req.body.readinessScore === null || (Number.isFinite(req.body.readinessScore) && req.body.readinessScore >= 0 && req.body.readinessScore <= 100)) {
      updates.readinessScore = req.body.readinessScore;
    }
    if (Number.isFinite(req.body.streakDays)) updates.streakDays = Math.max(0, Math.floor(req.body.streakDays));
    if (Array.isArray(req.body.completedTasks)) updates.completedTasks = req.body.completedTasks.map(String).slice(0, 500);

    const user = await dbStore.updateUser(req.userId || '', updates);
    if (!user) return res.status(404).json({ error: 'Account not found.' });
    return res.json({ user: toPublicUser(user) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// --- 3. LEARNING TRACKS & REAL CURRICULUM ---
app.get('/api/learning/tracks', (_req: Request, res: Response) => {
  res.json({ tracks: TRACKS });
});

app.get('/api/learning/lesson/:lessonId', (req: Request, res: Response) => {
  const lesson = LESSONS_DATABASE[req.params.lessonId];
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  return res.json({ lesson });
});

app.get('/api/learning/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const progress = await dbStore.getUserProgress(req.userId || '');
    return res.json({ progress });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

app.post('/api/learning/progress', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId, trackId, quizScore, markCompleted, studyMinutes = 0 } = req.body;
    const progress = await dbStore.getUserProgress(req.userId || '');

    const completedLessons = [...(progress.completedLessons || [])];
    if (markCompleted && lessonId && !completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
      // Award 100 XP for lesson completion
      const user = await dbStore.findUserById(req.userId || '');
      if (user) {
        await dbStore.updateUser(user.id, {
          xp: (user.xp || 0) + 100,
          streakDays: Math.max(1, user.streakDays || 1),
        });
      }
    }

    const quizScores = { ...(progress.quizScores || {}) };
    if (lessonId && Number.isFinite(quizScore)) {
      quizScores[lessonId] = Number(quizScore);
    }

    const updated = await dbStore.updateUserProgress(req.userId || '', {
      completedLessons,
      lastOpenedLessonId: lessonId || progress.lastOpenedLessonId,
      lastOpenedTrack: trackId || progress.lastOpenedTrack,
      quizScores,
      totalStudyMinutes: (progress.totalStudyMinutes || 0) + Math.max(0, Number(studyMinutes) || 0),
    });

    return res.json({ progress: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// --- 4. ADAPTIVE DAILY MISSIONS ---
app.get('/api/missions/daily', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const user = await dbStore.findUserById(userId);
    const existing = await dbStore.getUserMissions(userId);

    if (existing && existing.length > 0) {
      return res.json({ missions: existing });
    }

    // Adaptively generate daily missions based on track and goals
    const track = user?.track || 'fullstack';
    const generated = [
      {
        id: `dm_${Date.now()}_1`,
        title: track === 'frontend' ? 'Deep Dive: Semantic HTML & Accessibility Landmarks' : track === 'backend' ? 'Deep Dive: Node.js Architecture & libuv Event Loop' : 'Deep Dive: Modern Full-Stack System Architecture',
        learningObjective: 'Master core primitives and verify syntax patterns with hands-on examples.',
        estimatedDuration: 20,
        difficulty: 'Intermediate',
        category: 'lesson',
        targetLessonId: track === 'frontend' ? 'fe-html-doc-structure' : track === 'backend' ? 'be-node-intro' : 'fe-js-promises-async',
        xpReward: 150,
        completed: false,
      },
      {
        id: `dm_${Date.now()}_2`,
        title: track === 'frontend' ? 'CSS Flexbox 1D Layout Practice' : track === 'backend' ? 'REST API Security: Implement JWT Verification' : 'Solve Two Sum in Linear O(N) Time',
        learningObjective: 'Apply algorithmic problem-solving in the interactive coding playground.',
        estimatedDuration: 25,
        difficulty: track === 'frontend' ? 'Intermediate' : 'Advanced',
        category: 'code',
        targetChallengeId: 'cc-1',
        xpReward: 200,
        completed: false,
      },
      {
        id: `dm_${Date.now()}_3`,
        title: 'Technical Mock: Explain System Tradeoffs to AI Coach',
        learningObjective: 'Articulate latency optimization and architectural tradeoffs in simulated interview mode.',
        estimatedDuration: 15,
        difficulty: 'Intermediate',
        category: 'interview',
        xpReward: 250,
        completed: false,
      },
    ];

    await dbStore.saveUserMissions(userId, generated);
    return res.json({ missions: generated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

app.get('/api/missions/full', authenticateToken, async (req: AuthRequest, res: Response) => {
  const missions = await dbStore.getUserFullMissions(req.userId || '');
  return res.json({ missions });
});

app.put('/api/missions/full', authenticateToken, async (req: AuthRequest, res: Response) => {
  if (!Array.isArray(req.body.missions)) {
    return res.status(400).json({ error: 'missions must be an array.' });
  }
  const missions = await dbStore.saveUserFullMissions(req.userId || '', req.body.missions);
  return res.json({ missions });
});

app.post('/api/missions/complete/:missionId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const missions = await dbStore.getUserMissions(userId);
    let rewardXp = 0;

    const updated = missions.map((m: any) => {
      if (m.id === req.params.missionId) {
        rewardXp = m.xpReward || 150;
        return { ...m, completed: true };
      }
      return m;
    });

    await dbStore.saveUserMissions(userId, updated);
    if (rewardXp > 0) {
      const user = await dbStore.findUserById(userId);
      if (user) {
        await dbStore.updateUser(userId, { xp: (user.xp || 0) + rewardXp });
      }
    }

    return res.json({ missions: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// --- 5. ROADMAP ---
app.get('/api/roadmap', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const user = await dbStore.findUserById(userId);
    const progress = await dbStore.getUserProgress(userId);
    const existing = await dbStore.getUserRoadmap(userId);

    if (existing && existing.length > 0) {
      return res.json({ roadmap: existing });
    }

    // Default roadmap stages adapted for track
    const track = user?.track || 'fullstack';
    const defaultMilestones = [
      {
        id: 'rm-stage-1',
        title: 'Stage 1: Core Foundations & Runtimes',
        description: 'Semantic markup, styling paradigms, modern ESNext, V8 memory, and async control flows.',
        track,
        level: 1,
        status: progress.completedLessons.length > 0 ? 'completed' : 'in_progress',
        skills: ['HTML5', 'CSS Box Model', 'JavaScript ES6+', 'Event Loop'],
        estimatedWeeks: 2,
        whyRecommended: 'Essential baseline required for all high-scale web engineering.',
      },
      {
        id: 'rm-stage-2',
        title: 'Stage 2: Component Architecture & State Management',
        description: 'React Fiber reconciliation, concurrent mode, custom hooks, and state orchestration.',
        track,
        level: 2,
        status: progress.completedLessons.length >= 3 ? 'in_progress' : 'locked',
        skills: ['React 18', 'Virtual DOM', 'Custom Hooks', 'Context API'],
        estimatedWeeks: 3,
        whyRecommended: 'Core requirement for modern frontend and full-stack software development.',
      },
      {
        id: 'rm-stage-3',
        title: 'Stage 3: APIs, Microservices & Data Modeling',
        description: 'Express middlewares, RESTful architecture, MongoDB schemas, indexing, and JWT authentication.',
        track,
        level: 3,
        status: 'locked',
        skills: ['Node.js', 'Express', 'MongoDB / Mongoose', 'JWT Security'],
        estimatedWeeks: 4,
        whyRecommended: 'Enables you to build high-throughput APIs capable of serving enterprise workloads.',
      },
      {
        id: 'rm-stage-4',
        title: 'Stage 4: Production Capstone & Cloud Deployment',
        description: 'Real-time WebSockets, Docker containerization, CI/CD pipelines, and performance profiling.',
        track,
        level: 4,
        status: 'locked',
        skills: ['Docker', 'WebSockets', 'CI/CD Pipelines', 'Performance Optimization'],
        estimatedWeeks: 4,
        whyRecommended: 'Proves your capacity to build, ship, and maintain complete production systems independently.',
      },
      {
        id: 'rm-stage-5',
        title: 'Stage 5: High-Stakes Technical Interview Mastery',
        description: 'System design trade-offs, algorithms (O(N) patterns), and behavioral STAR method rehearsals.',
        track,
        level: 5,
        status: 'locked',
        skills: ['Data Structures', 'System Design', 'STAR Method', 'Live Whiteboarding'],
        estimatedWeeks: 3,
        whyRecommended: 'Final bridge between technical competency and top-tier engineering offers.',
      },
    ];

    await dbStore.saveUserRoadmap(userId, defaultMilestones);
    return res.json({ roadmap: defaultMilestones });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

app.post('/api/roadmap/toggle/:milestoneId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const roadmap = await dbStore.getUserRoadmap(userId);
    const updated = roadmap.map((m: any) => {
      if (m.id === req.params.milestoneId) {
        const next = m.status === 'completed' ? 'in_progress' : 'completed';
        return { ...m, status: next };
      }
      return m;
    });
    await dbStore.saveUserRoadmap(userId, updated);
    return res.json({ roadmap: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// --- 6. PRACTICE ARENA ---
app.post('/api/practice/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { category, topic, score, total, weakAreas = [], strengths = [] } = req.body;
    const percentage = Math.round((Number(score) / Math.max(1, Number(total))) * 100);

    const attempt = await dbStore.savePracticeAttempt({
      userId: req.userId || '',
      category: category || 'assessment',
      topic: topic || 'General Engineering',
      score: Number(score),
      total: Number(total),
      percentage,
      weakAreas: Array.isArray(weakAreas) ? weakAreas : [],
      strengths: Array.isArray(strengths) ? strengths : [],
      date: new Date().toISOString(),
    });

    // Award XP for correct answers. A single test must not overwrite the
    // multi-signal placement readiness estimate with its raw percentage.
    const user = await dbStore.findUserById(req.userId || '');
    if (user) {
      const xpGain = Number(score) * 40;
      await dbStore.updateUser(user.id, { xp: (user.xp || 0) + xpGain });
    }

    return res.json({ attempt });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

app.get('/api/practice/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const history = await dbStore.getUserPracticeHistory(req.userId || '');
    return res.json({ history });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// --- 7. CODING CHALLENGES ---
app.post('/api/coding/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { challengeId, passed, code } = req.body;
    const submission = await dbStore.saveCodingSubmission({
      userId: req.userId || '',
      challengeId: String(challengeId),
      passed: Boolean(passed),
      code: String(code || ''),
      date: new Date().toISOString(),
    });

    if (passed) {
      const user = await dbStore.findUserById(req.userId || '');
      if (user) {
        await dbStore.updateUser(user.id, { xp: (user.xp || 0) + 200 });
      }
    }

    return res.json({ submission });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// --- 8. PROJECT-BASED LEARNING ---
app.get('/api/projects', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const existing = await dbStore.getUserProjects(userId);
    if (existing && existing.length > 0) {
      return res.json({ projects: existing });
    }

    const defaultProjects = [
      {
        id: 'proj-1',
        title: 'DevPulse — Real-Time Observability OS',
        tagline: 'High-performance metrics dashboard with WebSockets & 3D cluster visualizations.',
        track: 'fullstack',
        difficulty: 'advanced',
        estimatedHours: 40,
        skills: ['React', 'Three.js', 'Node.js', 'WebSockets', 'MongoDB', 'Docker'],
        description: 'Build a production telemetry dashboard that ingests server metrics via WebSockets and visualizes cluster health in real-time 3D nodes.',
        milestones: [
          { id: 'm1', title: 'Design MongoDB time-series schema & compound indexes', completed: false },
          { id: 'm2', title: 'Implement WebSocket heartbeat ingestion microservice', completed: false },
          { id: 'm3', title: 'Build React UI with cluster health visualizer', completed: false },
          { id: 'm4', title: 'Deploy with Docker Compose & Nginx reverse proxy', completed: false },
        ],
        repoUrl: '',
        status: 'not_started',
      },
      {
        id: 'proj-2',
        title: 'CyberAuth — Distributed Identity & RBAC Service',
        tagline: 'Enterprise authentication engine with rotating JWTs, rate limiting & Redis store.',
        track: 'backend',
        difficulty: 'capstone',
        estimatedHours: 50,
        skills: ['TypeScript', 'Express', 'Redis', 'JWT', 'Cryptographic Security'],
        description: 'Architect a secure identity provider featuring Argon2 password hashing, rotating refresh token families, and multi-tenant RBAC permissions.',
        milestones: [
          { id: 'm1', title: 'Implement cryptographic key rotation and JWT signing', completed: false },
          { id: 'm2', title: 'Build Redis token blacklist & rate-limiting middleware', completed: false },
          { id: 'm3', title: 'Write integration test suite with Supertest', completed: false },
        ],
        repoUrl: '',
        status: 'not_started',
      },
      {
        id: 'proj-3',
        title: 'ShopSphere — Modern E-Commerce UI',
        tagline: 'Fluid responsive storefront with cart state, filtering, and instant search.',
        track: 'frontend',
        difficulty: 'intermediate',
        estimatedHours: 30,
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'State Management'],
        description: 'Design and build an accessible e-commerce storefront with client-side price filtering, category navigation, persistent local storage cart, and responsive checkout.',
        milestones: [
          { id: 'm1', title: 'Build accessible product catalog grid with filters', completed: false },
          { id: 'm2', title: 'Implement persistent cart state with custom React hook', completed: false },
          { id: 'm3', title: 'Add checkout form with field validation and error states', completed: false },
        ],
        repoUrl: '',
        status: 'not_started',
      },
    ];

    await dbStore.saveUserProjects(userId, defaultProjects);
    return res.json({ projects: defaultProjects });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

app.post('/api/projects/:projectId/milestone/:milestoneId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const projects = await dbStore.getUserProjects(userId);
    const updated = projects.map((p: any) => {
      if (p.id === req.params.projectId) {
        const milestones = p.milestones.map((m: any) =>
          m.id === req.params.milestoneId ? { ...m, completed: !m.completed } : m
        );
        const allDone = milestones.every((m: any) => m.completed);
        const anyDone = milestones.some((m: any) => m.completed);
        const status = allDone ? 'completed' : anyDone ? 'in_progress' : 'not_started';
        return { ...p, milestones, status };
      }
      return p;
    });

    await dbStore.saveUserProjects(userId, updated);
    return res.json({ projects: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// Generate a project blueprint with AI (or local fallback)
const handleProjectBlueprintGenerate = async (req: AuthRequest, res: Response) => {
  try {
    const goal = String(req.body.goal || req.body.role || req.body.domain || '').trim();
    const targetCompany = String(req.body.targetCompany || '').trim();
    const level = String(req.body.level || 'beginner');
    if (!goal) return res.status(400).json({ error: 'Please provide a target role or project domain.' });
    const blueprint = await aiService.generateProjectBlueprint(goal, targetCompany, level);
    return res.json({ blueprint });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
};
app.post('/api/projects/mentor/generate', authenticateToken, handleProjectBlueprintGenerate);
app.post('/api/project-mentor/generate', authenticateToken, handleProjectBlueprintGenerate);

// --- 9. INTERVIEWS & AI COACH ---
app.post('/api/ai/coach', async (req: Request, res: Response) => {
  try {
    const { message, history = [], userContext } = req.body;
    const aiResponse = await aiService.getCoachReply(message, history, userContext);
    res.json({ reply: aiResponse.content, source: aiResponse.source });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

app.post('/api/interview/question', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const mode = String(req.body.mode || 'technical');
    const role = String(req.body.role || 'Software Developer');
    const level = String(req.body.level || 'beginner');
    const question = await aiService.generateInterviewQuestion(mode, role, level);
    return res.json({ question });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(503).json({ error: msg });
  }
});

app.post('/api/interview/evaluate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer?.trim()) return res.status(400).json({ error: 'Question and answer are required.' });
    const result = await aiService.evaluateInterview(question, answer);
    await dbStore.saveInterviewAttempt({
      userId: req.userId || '',
      module: typeof question === 'object' ? String(question.mode || question.topic || 'technical') : 'technical',
      question: typeof question === 'object' ? String(question.question || '') : String(question),
      score: result.score,
      feedback: result.feedback,
      breakdown: { ...result.breakdown, confidence: result.confidenceScore },
      date: new Date().toISOString(),
    });
    return res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(503).json({ error: msg });
  }
});

app.get('/api/interview/history', authenticateToken, async (req: AuthRequest, res: Response) => {
  const history = await dbStore.getUserInterviewAttempts(req.userId || '');
  return res.json({ history });
});

app.post('/api/resume/analyze', async (req: Request, res: Response) => {
  try {
    const { resumeText, targetTrack = 'fullstack' } = req.body;
    if (!resumeText || typeof resumeText !== 'string' || !resumeText.trim()) {
      return res.status(400).json({ error: 'Please provide resume text to analyze.' });
    }
    const analysis = resumeParser.analyze(resumeText, targetTrack);
    return res.json(analysis);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// Upload and parse resume file (PDF, DOCX, TXT)
app.post('/api/resume/upload', upload.single('resume'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select a resume file (PDF, DOCX, or TXT) to upload.' });
    }
    const targetTrack = (req.body.targetTrack as string) || 'fullstack';
    const extractedText = resumeParser.extractText(req.file.buffer, req.file.mimetype, req.file.originalname);
    const analysis = resumeParser.analyze(extractedText, targetTrack);
    return res.json({
      success: true,
      filename: req.file.originalname,
      size: req.file.size,
      textLength: extractedText.length,
      extractedTextSnippet: extractedText.slice(0, 300),
      extractedText,
      ...analysis,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: `Failed to process resume file: ${msg}` });
  }
});

// --- 10. REAL USER PROGRESS & ANALYTICS ---
app.get('/api/analytics', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const analytics = await dbStore.getUserAnalytics(req.userId || '');
    return res.json({ analytics });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// --- 11. DSA ARENA ENDPOINTS ---
app.get('/api/dsa/custom', authenticateToken, async (req: AuthRequest, res: Response) => {
  const problems = await dbStore.getUserCustomDSAProblems(req.userId || '');
  return res.json({ problems });
});

app.post('/api/dsa/custom', authenticateToken, async (req: AuthRequest, res: Response) => {
  const title = String(req.body.title || '').trim();
  const category = String(req.body.category || 'Arrays').trim();
  const difficulty = String(req.body.difficulty || 'Not specified');
  const leetcodeUrl = String(req.body.leetcodeUrl || '').trim();
  if (title.length < 3 || title.length > 140) return res.status(400).json({ error: 'Problem title must be between 3 and 140 characters.' });
  if (!['Easy', 'Medium', 'Hard', 'Not specified'].includes(difficulty)) return res.status(400).json({ error: 'Choose a valid difficulty.' });
  if (leetcodeUrl && !/^https:\/\//i.test(leetcodeUrl)) return res.status(400).json({ error: 'Practice link must start with https://.' });
  const userId = req.userId || '';
  const existing = await dbStore.getUserCustomDSAProblems(userId);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const problem = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    number: existing.length + 1,
    title,
    slug,
    difficulty,
    category,
    leetcodeUrl,
    isBlind75: false,
    isNeetCode150: false,
    isTop250: false,
    tags: ['My Custom Problem'],
  };
  await dbStore.saveUserCustomDSAProblems(userId, [...existing, problem]);
  return res.status(201).json({ problem: { ...problem, status: 'not_started', notes: '' } });
});
app.get('/api/dsa/problems', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const userProgress = await dbStore.getUserDSAProgress(userId);

    const { collection, category, difficulty, status, search } = req.query;

    const customProblems = await dbStore.getUserCustomDSAProblems(userId);
    let filtered: DSAProblem[] = collection === 'shradha' ? [...SHRADHA_DSA_PROBLEMS] : collection === 'custom' ? [...customProblems] : [...DSA_PROBLEMS_DATABASE];

    // Filter by curated collection
    if (collection === 'blind75') {
      filtered = filtered.filter((p) => p.isBlind75);
    } else if (collection === 'neetcode150') {
      filtered = filtered.filter((p) => p.isNeetCode150);
    } else if (collection === 'top250') {
      filtered = filtered.filter((p) => p.isTop250);
    } else if (collection === 'all') {
      filtered = [...ALL_DSA_PROBLEMS, ...customProblems];
    }

    // Filter by category
    if (typeof category === 'string' && category !== 'All' && category.trim()) {
      filtered = filtered.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by difficulty
    if (typeof difficulty === 'string' && difficulty !== 'All' && difficulty.trim()) {
      filtered = filtered.filter((p) => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    }

    // Search query
    if (typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.number.toString().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Map each problem with user status and direct LeetCode problem URL
    const mapped = filtered.map((p) => {
      const record = userProgress[p.id];
      return {
        ...p,
        leetcodeUrl: resolveDirectLeetcodeUrl(p),
        status: record?.status || 'not_started',
        notes: record?.notes || '',
        solvedAt: record?.solvedAt,
      };
    });

    // Filter by solved status if requested
    let finalResult = mapped;
    if (typeof status === 'string' && status !== 'All' && status.trim()) {
      finalResult = mapped.filter((p) => p.status === status);
    }

    const stats = await dbStore.getUserDSAStats(userId, collection === 'shradha' ? [...SHRADHA_DSA_PROBLEMS] : [...ALL_DSA_PROBLEMS, ...customProblems]);

    return res.json({
      problems: finalResult,
      totalCount: finalResult.length,
      topics: collection === 'shradha' ? Array.from(new Set(SHRADHA_DSA_PROBLEMS.map((problem) => problem.category))) : DSA_TOPICS,
      stats,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

app.post('/api/dsa/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const { problemId, status, difficulty = 'Medium' } = req.body;

    if (!problemId || !status) {
      return res.status(400).json({ error: 'problemId and status are required.' });
    }

    if (!['not_started', 'in_progress', 'solved'].includes(status)) {
      return res.status(400).json({ error: 'Status must be one of: not_started, in_progress, solved' });
    }

    const result = await dbStore.updateUserDSAStatus(userId, String(problemId), status, difficulty);
    return res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

app.post('/api/dsa/notes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const { problemId, notes } = req.body;

    if (!problemId) {
      return res.status(400).json({ error: 'problemId is required.' });
    }

    const updated = await dbStore.saveUserDSANote(userId, String(problemId), String(notes || ''));
    return res.json({ problem: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

app.get('/api/dsa/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const stats = await dbStore.getUserDSAStats(userId, [...SHRADHA_DSA_PROBLEMS]);
    return res.json({ stats });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// Single problem full workspace details
app.get('/api/dsa/problem/:problemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { problemId } = req.params;
    const userId = req.userId || '';
    const customProblems = await dbStore.getUserCustomDSAProblems(userId);
    const found = [...ALL_DSA_PROBLEMS, ...customProblems].find((p) => p.id === problemId);
    if (!found) {
      return res.status(404).json({ error: 'Problem not found.' });
    }
    const details = getProblemDetails(found);
    const userProgress = await dbStore.getUserDSAProgress(userId);
    const userStatus = userProgress[problemId]?.status || 'not_started';
    const userNotes = userProgress[problemId]?.notes || '';
    return res.json({ problem: { ...details, status: userStatus, notes: userNotes } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// Run code against sample test cases
app.post('/api/dsa/run', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { problemId, code, language = 'javascript' } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Source code is required.' });
    }
    const userId = req.userId || '';
    const customProblems = await dbStore.getUserCustomDSAProblems(userId);
    const found = [...ALL_DSA_PROBLEMS, ...customProblems].find((p) => p.id === problemId);
    if (!found) {
      return res.status(404).json({ error: 'Problem not found.' });
    }
    const details = getProblemDetails(found);
    const result = await codeExecutionService.execute(
      code,
      language,
      details.sampleTestCases,
      details.functionName
    );
    return res.json({ result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// Submit solution against all hidden test cases
app.post('/api/dsa/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { problemId, code, language = 'javascript' } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Source code is required.' });
    }
    const userId = req.userId || '';
    const customProblems = await dbStore.getUserCustomDSAProblems(userId);
    const found = [...ALL_DSA_PROBLEMS, ...customProblems].find((p) => p.id === problemId);
    if (!found) {
      return res.status(404).json({ error: 'Problem not found.' });
    }
    const details = getProblemDetails(found);
    const testCasesToRun = [...details.sampleTestCases, ...details.hiddenTestCases];
    const result = await codeExecutionService.execute(
      code,
      language,
      testCasesToRun,
      details.functionName
    );

    // Save coding submission record
    await dbStore.saveCodingSubmission({
      userId,
      challengeId: problemId,
      passed: result.status === 'Accepted',
      code,
      date: new Date().toISOString(),
    });

    let xpGained = 0;
    if (result.status === 'Accepted') {
      // Check if already solved previously to avoid duplicate XP
      const currentProgress = await dbStore.getUserDSAProgress(userId);
      const wasAlreadySolved = currentProgress[problemId]?.status === 'solved';

      const updateRes = await dbStore.updateUserDSAStatus(
        userId,
        problemId,
        'solved',
        details.difficulty
      );
      if (!wasAlreadySolved) {
        xpGained = updateRes.xpGained || 100;
      }
    }

    return res.json({ result, xpGained });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// Submissions history for problem
app.get('/api/dsa/submissions/:problemId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const { problemId } = req.params;
    const history = await dbStore.getUserCodingSubmissions(userId);
    const problemSubmissions = history.filter((s) => s.challengeId === problemId);
    return res.json({ submissions: problemSubmissions });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: msg });
  }
});

// START SERVER
const checkCodeChefReminders = async () => {
  if (!emailService.isConfigured()) return;
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const value = (key: string) => parts.find((part) => part.type === key)?.value || '';
  if (value('weekday') !== 'Wed') return;

  const dateKey = `${value('year')}-${value('month')}-${value('day')}`;
  const currentTime = `${value('hour')}:${value('minute')}`;
  const users = await dbStore.getUsersWithCodeChefReminder();

  for (const user of users) {
    if ((user.codechefReminderTime || '18:00') !== currentTime) continue;
    if (user.lastCodechefReminderSentAt?.startsWith(dateKey)) continue;
    try {
      const sent = await emailService.sendCodeChefReminder(user.email, user.name);
      if (sent) {
        await dbStore.updateUser(user.id, { lastCodechefReminderSentAt: new Date().toISOString() });
        console.log(`[Reminder] CodeChef Starters reminder sent to ${user.email}.`);
      }
    } catch (error) {
      console.error(`[Reminder] Could not send CodeChef reminder to ${user.email}:`, error);
    }
  }
};

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Server] CareerPilot X API running at http://localhost:${PORT}`);
    console.log('[Reminder] Wednesday CodeChef Starters scheduler active (Asia/Kolkata).');
  });
  void checkCodeChefReminders();
  setInterval(() => void checkCodeChefReminders(), 60_000);
};

start();
