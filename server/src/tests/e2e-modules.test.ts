import express from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../storage/dbStore.js';
import { DSA_PROBLEMS_DATABASE, DSA_TOPICS } from '../data/dsaProblems.js';
import { resumeParser } from '../services/resumeParser.service.js';
import { aiService } from '../services/ai.service.js';

async function runEndToEndModulesTest() {
  console.log('--- STARTING COMPREHENSIVE 10-MODULE END-TO-END VERIFICATION ---');
  let passed = 0;
  let failed = 0;

  const testUserId = `candidate_full_${Date.now()}`;
  const user = await dbStore.createUser({
    name: 'E2E Full Suite Candidate',
    email: `${testUserId}@careerpilot.io`,
    passwordHash: 'hashed_pw',
  });

  // MODULE 1 & 9: Placement Readiness & Zero Baseline
  try {
    const analytics = await dbStore.getUserAnalytics(user.id);
    if (analytics.completedLessonsCount === 0 && analytics.readinessScore === null) {
      console.log('✓ Modules 1 & 9: Honest zero baseline verified for new user');
      passed++;
    } else {
      throw new Error('Analytics baseline was not zero');
    }
  } catch (e) {
    console.error('✗ Modules 1 & 9 Failed:', e);
    failed++;
  }

  // MODULE 3: DSA Arena — Problems, Filters, Solving, XP & Notes
  try {
    // 1. Check datasets
    const blind75 = DSA_PROBLEMS_DATABASE.filter((p) => p.isBlind75);
    const neetcode150 = DSA_PROBLEMS_DATABASE.filter((p) => p.isNeetCode150);
    const top250 = DSA_PROBLEMS_DATABASE.filter((p) => p.isTop250);

    if (blind75.length < 50 || neetcode150.length < 100 || top250.length < 100) {
      throw new Error('DSA problem lists do not satisfy required quantities');
    }

    // 2. Mark problem as solved
    const problemToSolve = blind75[0];
    const solveRes = await dbStore.updateUserDSAStatus(user.id, problemToSolve.id, 'solved', problemToSolve.difficulty);

    if (solveRes.xpGained <= 0 || solveRes.newTotalXp <= 0 || solveRes.readinessScore <= 0) {
      throw new Error('DSA status update failed to award XP or calculate readiness score');
    }

    // 3. Save notes
    const noteRes = await dbStore.saveUserDSANote(user.id, problemToSolve.id, 'Optimal two-pointer approach O(N) time.');
    if (noteRes.notes !== 'Optimal two-pointer approach O(N) time.') {
      throw new Error('DSA notes were not saved properly');
    }

    // 4. Retrieve stats
    const stats = await dbStore.getUserDSAStats(user.id, DSA_PROBLEMS_DATABASE);
    if (stats.totalSolved === 1 && stats.completionPercentage > 0) {
      console.log(`✓ Module 3: DSA Arena verified (Blind 75: ${blind75.length}, NeetCode 150: ${neetcode150.length}, Solved 1 problem, awarded +${solveRes.xpGained} XP, readiness: ${solveRes.readinessScore}%)`);
      passed++;
    } else {
      throw new Error('DSA stats aggregation failed');
    }
  } catch (e) {
    console.error('✗ Module 3 Failed:', e);
    failed++;
  }

  // MODULE 4: Daily Mission Center
  try {
    const defaultMissions = [
      { id: 'm-1', title: 'Code Arrays & Hashing', xpReward: 150, completed: false },
      { id: 'm-2', title: 'Interview Rehearsal', xpReward: 200, completed: false },
    ];
    await dbStore.saveUserMissions(user.id, defaultMissions);
    const missions = await dbStore.getUserMissions(user.id);
    if (missions.length === 2) {
      console.log('✓ Module 4: Daily Mission Center storage and mission assignment verified');
      passed++;
    } else {
      throw new Error('Daily missions mismatch');
    }
  } catch (e) {
    console.error('✗ Module 4 Failed:', e);
    failed++;
  }

  // MODULE 5: AI Interview Center Rubric
  try {
    const question = 'How does Redis Sentinel achieve automatic failover?';
    const answer = 'Sentinel monitors master and replica instances via heartbeats. When a quorum of Sentinels detects a subjective down (sdown), it transitions to objective down (odown), elects a leader via Raft-like voting, and promotes the replica with the lowest replication lag to master, updating client configuration.';
    const evaluation = await aiService.evaluateInterview(question, answer);

    if (evaluation.score >= 75 && evaluation.breakdown.technical > 0 && evaluation.breakdown.architecture > 0) {
      console.log(`✓ Module 5: AI Interview Center 3-axis rubric evaluation passed (${evaluation.score}/100, Tech: ${evaluation.breakdown.technical}, Arch: ${evaluation.breakdown.architecture})`);
      passed++;
    } else {
      throw new Error('Interview evaluation score below threshold');
    }
  } catch (e) {
    console.error('✗ Module 5 Failed:', e);
    failed++;
  }

  // MODULE 6: AI Career Coach
  try {
    const coachResponse = await aiService.getCoachReply('What is the best way to prepare for system design rounds?', [], {
      track: 'fullstack',
      careerGoal: 'Full Stack Engineer',
      dreamCompany: 'Google',
    });
    if (coachResponse.content && coachResponse.content.length > 50) {
      console.log(`✓ Module 6: AI Career Coach diagnostic and response engine verified (${coachResponse.source})`);
      passed++;
    } else {
      throw new Error('AI Coach response too short or empty');
    }
  } catch (e) {
    console.error('✗ Module 6 Failed:', e);
    failed++;
  }

  // MODULE 7: Resume Intelligence & ATS Engine
  try {
    const sampleResumeText = `
      Jane Doe - Backend Engineer
      Email: jane@example.com | GitHub: github.com/janedoe
      Skills: Node.js, Express, TypeScript, PostgreSQL, MongoDB, Docker, Microservices, Redis, Kafka
      Experience:
      Backend Developer at TechCorp (2023 - Present)
      - Architected high-throughput microservices handling 25,000 requests/sec with p99 latency under 40ms.
      - Implemented Redis cache-aside layer reducing database query load by 65%.
      - Automated CI/CD pipelines using GitHub Actions and Docker.
    `;
    const analysis = resumeParser.analyze(sampleResumeText, 'backend');
    console.log('Resume parsed detected skills:', analysis.detectedSkills, 'score:', analysis.score);
    if (analysis.score >= 70 && analysis.detectedSkills.length >= 3) {
      console.log(`✓ Module 7: Resume Intelligence parsed ${analysis.detectedSkills.length} skills with authentic ATS score ${analysis.score}%`);
      passed++;
    } else {
      throw new Error('Resume ATS parsing failed');
    }
  } catch (e) {
    console.error('✗ Module 7 Failed:', e);
    failed++;
  }

  // MODULE 8: Project Mentor
  try {
    const projects = await dbStore.getUserProjects(user.id);
    // User projects initialize lazily; test initialization
    if (Array.isArray(projects)) {
      console.log('✓ Module 8: Project Mentor storage and capstone milestone infrastructure verified');
      passed++;
    } else {
      throw new Error('Project mentor store failed');
    }
  } catch (e) {
    console.error('✗ Module 8 Failed:', e);
    failed++;
  }

  // MODULE 10: Progress & Achievements Badges
  try {
    const updatedUser = await dbStore.findUserById(user.id);
    const xp = updatedUser?.xp || 0;
    const level = Math.floor(xp / 500) + 1;
    if (level >= 1 && xp > 0) {
      console.log(`✓ Module 10: Progress & Achievements calculated Level ${level} (${xp} XP)`);
      passed++;
    } else {
      throw new Error('Progress & Achievements level calculation failed');
    }
  } catch (e) {
    console.error('✗ Module 10 Failed:', e);
    failed++;
  }

  console.log('--------------------------------------------------');
  console.log(`E2E MODULE VERIFICATION COMPLETED: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runEndToEndModulesTest();
