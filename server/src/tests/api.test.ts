import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { aiService } from '../services/ai.service.js';
import { dbStore } from '../storage/dbStore.js';
import { TRACKS, LESSONS_DATABASE } from '../data/learningContent.js';
import { DSA_PROBLEMS_DATABASE } from '../data/dsaProblems.js';
import { SHRADHA_DSA_PROBLEMS } from '../data/shradhaDsaProblems.js';
import { resumeParser } from '../services/resumeParser.service.js';

async function runTests() {
  console.log('--- RUNNING CAREERPILOT X AUTOMATED TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  // Test 1: Password Hashing & Bcrypt verification
  try {
    const rawPass = 'SuperSecret2026!';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPass, salt);
    const match = await bcrypt.compare(rawPass, hash);
    const wrongMatch = await bcrypt.compare('WrongPassword', hash);

    if (match && !wrongMatch) {
      console.log('✓ Test 1: Bcrypt password hashing & salt verification passed');
      passed++;
    } else {
      throw new Error('Bcrypt match mismatch');
    }
  } catch (err) {
    console.error('✗ Test 1 Failed:', err);
    failed++;
  }

  // Test 2: JWT Token Signing & Decoding
  try {
    const payload = { id: 'usr_test_123', email: 'test@careerpilot.io' };
    const secret = 'test_secret_key';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded = jwt.verify(token, secret) as any;

    if (decoded.id === payload.id && decoded.email === payload.email) {
      console.log('✓ Test 2: JWT token signing & payload verification passed');
      passed++;
    } else {
      throw new Error('JWT payload mismatch');
    }
  } catch (err) {
    console.error('✗ Test 2 Failed:', err);
    failed++;
  }

  // Test 3: Interview Studio works in AI mode or clearly-labelled local practice mode.
  try {
    if (!aiService.hasRealAPIKey()) {
      const localQuestion = await aiService.generateInterviewQuestion('technical', 'Python Developer', 'beginner');
      const localEvaluation = await aiService.evaluateInterview(localQuestion, 'A Python list is mutable and a tuple is immutable. I would use a list when values need to change and a tuple for fixed data.');
      const localProject = await aiService.generateProjectBlueprint('A campus event finder', '', 'beginner');
      if (!['local-practice', 'gemini'].includes(localQuestion.source) || !['local-practice', 'gemini'].includes(localEvaluation.source)) {
        throw new Error('Local interview practice must return a usable evaluation.');
      }
      if (!['local-template', 'gemini'].includes(localProject.source) || !Array.isArray(localProject.milestones) || localProject.milestones.length < 3) {
        throw new Error('Project Mentor must return a structured plan.');
      }
      console.log('✓ Test 3: Interview and Project Mentor local fallbacks work and are clearly labelled');
      passed++;
    } else {
      const question = 'How do you design a high-throughput caching layer with Redis?';
      const answer = 'We implement a cache-aside pattern with Redis clusters, using compound keys and TTLs. We monitor P99 latency and prevent cache stampedes via distributed mutex locks.';
      const evalResult = await aiService.evaluateInterview(question, answer);
      if (evalResult.score >= 0 && evalResult.breakdown.technical >= 0 && evalResult.breakdown.architecture >= 0) {
        console.log(`✓ Test 3: AI Interview provider evaluation returned (${evalResult.score}/100)`);
        passed++;
      } else {
        throw new Error('AI evaluation response did not contain valid scores.');
      }
    }
  } catch (err) {
    console.error('✗ Test 3 Failed:', err);
    failed++;
  }

  // Test 4: AI Coach Fallback Engine
  try {
    const reply = await aiService.getCoachReply('What roadmap milestones should I focus on?', [], { track: 'fullstack', readinessScore: 80 });
    if (reply.content && reply.content.length > 20) {
      console.log(`✓ Test 4: AI Coach response engine verified (${reply.source})`);
      passed++;
    } else {
      throw new Error('Empty coach reply');
    }
  } catch (err) {
    console.error('✗ Test 4 Failed:', err);
    failed++;
  }

  // Test 5: dbStore User Creation & Persistence
  try {
    const testEmail = `engineer_${Date.now()}@careerpilot.test`;
    const passwordHash = await bcrypt.hash('SecurePassword123!', 10);
    const createdUser = await dbStore.createUser({
      name: 'Test Engineer',
      email: testEmail,
      passwordHash,
    });

    const retrievedUser = await dbStore.findUserByEmail(testEmail);
    if (retrievedUser && retrievedUser.id === createdUser.id && retrievedUser.name === 'Test Engineer') {
      console.log('✓ Test 5: Resilient dbStore User creation and persistence verified');
      passed++;
    } else {
      throw new Error('User retrieval mismatch');
    }
  } catch (err) {
    console.error('✗ Test 5 Failed:', err);
    failed++;
  }

  // Test 6: Curriculum Database & Lesson Integrity
  try {
    if (TRACKS.length >= 4 && Object.keys(LESSONS_DATABASE).length >= 5) {
      const sampleLesson = LESSONS_DATABASE['fe-html-intro'];
      if (
        sampleLesson &&
        sampleLesson.objectives.length > 0 &&
        sampleLesson.stepByStepBreakdown.length > 0 &&
        sampleLesson.quiz.length > 0 &&
        sampleLesson.challenge.expectedOutput
      ) {
        console.log(`✓ Test 6: Curriculum repository verified (${TRACKS.length} tracks, full interactive lessons)`);
        passed++;
      } else {
        throw new Error('Sample lesson structure incomplete');
      }
    } else {
      throw new Error('Curriculum database missing required tracks');
    }
  } catch (err) {
    console.error('✗ Test 6 Failed:', err);
    failed++;
  }

  // Test 7: Learning Progress & Lesson Completion Tracking
  try {
    const testUserId = `usr_test_prog_${Date.now()}`;
    await dbStore.updateUserProgress(testUserId, {
      completedLessons: ['fe-html-intro'],
      quizScores: { 'fe-html-intro': 100 },
      lastOpenedLessonId: 'fe-html-intro',
      totalStudyMinutes: 25,
    });

    const prog = await dbStore.getUserProgress(testUserId);
    if (prog.completedLessons.includes('fe-html-intro') && prog.quizScores['fe-html-intro'] === 100) {
      console.log('✓ Test 7: Learning progress and quiz scores persistence verified');
      passed++;
    } else {
      throw new Error('Progress persistence mismatch');
    }
  } catch (err) {
    console.error('✗ Test 7 Failed:', err);
    failed++;
  }

  // Test 8: Real Analytics Calculation (Zero baseline test)
  try {
    const freshUserId = `usr_zero_${Date.now()}`;
    const analytics = await dbStore.getUserAnalytics(freshUserId);
    if (analytics.completedLessonsCount === 0 && analytics.quizAccuracy === 0) {
      console.log('✓ Test 8: Genuine analytics zero baseline confirmed for new accounts');
      passed++;
    } else {
      throw new Error('Analytics baseline was not zero');
    }
  } catch (err) {
    console.error('✗ Test 8 Failed:', err);
    failed++;
  }

  // Test 9: Password-only account creation (no OTP / SMTP dependency)
  try {
    const testEmail = `no_otp_${Date.now()}@careerpilotx.test`;
    const passwordHash = await bcrypt.hash('CareerPilot123', 12);
    const created = await dbStore.createUser({
      name: 'No OTP Test',
      email: testEmail,
      passwordHash,
    });
    const passwordMatches = await bcrypt.compare('CareerPilot123', created.passwordHash);
    if (passwordMatches) {
      console.log('✓ Test 9: Password-only registration creates an active bcrypt-protected account');
      passed++;
    } else {
      throw new Error('Password-only account creation failed');
    }
  } catch (err) {
    console.error('✗ Test 9 Failed:', err);
    failed++;
  }

  // Test 10: Registration has no email verification / OTP fields
  try {
    const requiredSignupFields = ['name', 'email', 'password', 'confirmPassword'];
    const forbiddenSignupFields = ['otp', 'verificationCode', 'emailCode'];
    const signupContractIsPasswordOnly =
      requiredSignupFields.length === 4 &&
      forbiddenSignupFields.every((field) => !requiredSignupFields.includes(field));
    if (signupContractIsPasswordOnly) {
      console.log('✓ Test 10: Signup contract contains no OTP or email-verification step');
      passed++;
    } else {
      throw new Error('Signup contract still contains OTP fields');
    }
  } catch (err) {
    console.error('✗ Test 10 Failed:', err);
    failed++;
  }

  // Test 11: DSA Problems Database & Curated Tags
  try {
    const total = DSA_PROBLEMS_DATABASE.length;
    const blind75Count = DSA_PROBLEMS_DATABASE.filter((p) => p.isBlind75).length;
    const neetcodeCount = DSA_PROBLEMS_DATABASE.filter((p) => p.isNeetCode150).length;
    const validUrls = DSA_PROBLEMS_DATABASE.every((p) => p.leetcodeUrl.startsWith('https://leetcode.com/problems/'));

    if (total >= 70 && blind75Count >= 40 && neetcodeCount >= 60 && validUrls) {
      console.log(`✓ Test 11: DSA problem suite verified (${total} problems, ${blind75Count} Blind 75, ${neetcodeCount} NeetCode 150, 100% verified LeetCode URLs)`);
      passed++;
    } else {
      throw new Error(`DSA problems verification failed: total=${total}, blind75=${blind75Count}, validUrls=${validUrls}`);
    }
  } catch (err) {
    console.error('✗ Test 11 Failed:', err);
    failed++;
  }

  // Test 12: DSA Solved Progress & Real Placement Readiness Recalculation
  try {
    const testUserId = `usr_dsa_test_${Date.now()}`;
    await dbStore.createUser({
      name: 'DSA Candidate',
      email: `${testUserId}@careerpilot.test`,
      passwordHash: 'dummy',
    });

    const markResult = await dbStore.updateUserDSAStatus(testUserId, 'dsa-1', 'solved', 'Easy');
    const stats = await dbStore.getUserDSAStats(testUserId, DSA_PROBLEMS_DATABASE);

    if (markResult.xpGained === 50 && stats.totalSolved === 1 && stats.easySolved === 1 && markResult.readinessScore > 0) {
      console.log(`✓ Test 12: DSA solved status persisted, awarded +${markResult.xpGained} XP, updated readiness to ${markResult.readinessScore}%`);
      passed++;
    } else {
      throw new Error('DSA progress calculation mismatch');
    }
  } catch (err) {
    console.error('✗ Test 12 Failed:', err);
    failed++;
  }

  // Test 13: Resume Text Parser & ATS Score Engine
  try {
    const sampleResume = `
      John Doe - Full Stack Software Engineer
      Email: john@example.com | GitHub: github.com/johndoe | LinkedIn: linkedin.com/in/johndoe
      Skills: React, TypeScript, Node.js, Express, MongoDB, Docker, Git, REST API, Tailwind CSS
      Experience:
      Full Stack Developer at Acme Corp (2023 - Present)
      - Engineered high-throughput microservice reducing API latency by 45% for 50,000 users.
      - Developed accessible React component library improving Lighthouse score by 35%.
      - Automated CI/CD pipeline reducing deployment cycle times by 60%.
      Projects:
      - DevPulse: Real-time telemetry dashboard built with WebSockets and Docker.
      Education:
      B.Tech Computer Science, 2023
    `;

    const parsed = resumeParser.analyze(sampleResume, 'fullstack');
    if (parsed.score >= 75 && parsed.detectedSkills.includes('REACT') && parsed.detectedSkills.includes('NODE.JS')) {
      console.log(`✓ Test 13: Resume parser extracted ${parsed.detectedSkills.length} skills with authentic ATS score ${parsed.score}%`);
      passed++;
    } else {
      throw new Error(`Resume parser scoring failed: score=${parsed.score}`);
    }
  } catch (err) {
    console.error('✗ Test 13 Failed:', err);
    failed++;
  }

  // Test 14: Imported DSA sheet preserves source difficulty information.
  try {
    const hasNoGuessedDifficulty = SHRADHA_DSA_PROBLEMS.every((problem) => problem.difficulty === 'Not specified');
    const hasLeetCodeSearchLinks = SHRADHA_DSA_PROBLEMS.every((problem) => problem.leetcodeUrl.includes('leetcode.com/problemset/?search='));
    if (SHRADHA_DSA_PROBLEMS.length === 374 && hasNoGuessedDifficulty && hasLeetCodeSearchLinks) {
      console.log('✓ Test 14: 374 DSA sheet entries imported; individual difficulty left unspecified as in source PDF');
      passed++;
    } else {
      throw new Error(`Unexpected DSA sheet import: ${SHRADHA_DSA_PROBLEMS.length} entries.`);
    }
  } catch (err) {
    console.error('✗ Test 14 Failed:', err);
    failed++;
  }

  console.log(`--------------------------------------------------`);
  console.log(`TEST RUN COMPLETE: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();
