export interface AIResponse {
  source: 'gemini' | 'openai' | 'not_configured' | 'unavailable' | 'local-practice';
  content: string;
}

export class AIService {
  private geminiKey = process.env.GEMINI_API_KEY || '';
  private openaiKey = process.env.OPENAI_API_KEY || '';
  private geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  public hasRealAPIKey(): boolean {
    // Basic check for non-empty key (and not placeholder text)
    const gKey = this.geminiKey.trim();
    const oKey = this.openaiKey.trim();
    return Boolean(
      (gKey && !gKey.includes('YOUR_') && gKey.length > 20) ||
      (oKey && !oKey.includes('YOUR_') && oKey.length > 20)
    );
  }

  // --- COACH CHAT COMPLETION ---
  public async getCoachReply(
    userMessage: string,
    history: { role: 'user' | 'assistant'; content: string }[],
    userContext?: any
  ): Promise<AIResponse> {
    const track = userContext?.track || 'fullstack';
    const readiness = userContext?.readinessScore ?? 'not yet calculated';

    // 1. Try Gemini API if key is present
    if (this.geminiKey && this.geminiKey.trim()) {
      try {
        const prompt = `You are CareerPilot X, an elite AI Career Companion for software developers.
User Profile: Track = ${track}, Employability Score = ${readiness}%, Experience = ${userContext?.experienceLevel || 'intermediate'}.
User Message: "${userMessage}".
Provide concise, actionable, senior-level career and technical engineering advice in 2-4 sentences.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return { source: 'gemini', content: text.trim() };
          }
        } else {
          console.warn('[AI Service] Gemini returned HTTP', res.status);
        }
      } catch (err) {
        console.warn('[AI Service] Gemini call failed, falling back to rule engine:', err);
      }
    }

    // 2. Try OpenAI if key is present
    if (this.openaiKey && this.openaiKey.trim()) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are CareerPilot X, an elite AI Career Companion for software developers in ${track}. Answer concisely in 2-3 sentences.`,
              },
              ...history.slice(-4),
              { role: 'user', content: userMessage },
            ],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return { source: 'openai', content: text.trim() };
          }
        }
      } catch (err) {
        console.warn('[AI Service] OpenAI call failed, falling back to rule engine:', err);
      }
    }

    // Rule-engine fallback
    const topic = userMessage.toLowerCase();
    let guidance = 'Break the task into a small goal, review the relevant concept, build one working example, and test it. Share the exact error or topic if you want more targeted guidance.';
    if (/dsa|leetcode|array|linked list|tree|graph|algorithm|complexity/.test(topic)) {
      guidance = 'For DSA, first explain the brute-force approach, then optimize it. Write down time and space complexity, test edge cases (empty input, single element, negative numbers), and implement the solution before checking editorial hints.';
    } else if (/interview|hr|behavio|star/.test(topic)) {
      guidance = 'For interview practice, structure your answer clearly: define the idea, explain your reasoning, give a truthful example, and mention trade-offs. For behavioural questions, use the STAR method (Situation, Task, Action, Result) with honest reflections.';
    } else if (/resume|cv|ats/.test(topic)) {
      guidance = 'For your resume, keep every claim factual, start project bullets with strong action verbs (Architected, Engineered, Optimized), explain your actual contribution and tech stack, and tailor keywords to the specific job description.';
    } else if (/project|build|idea/.test(topic)) {
      guidance = 'For your portfolio project, define one real user problem, build a complete end-to-end workflow (frontend + backend + database), add robust validation and error handling, write a clear README with architecture diagrams, and deploy live on Vercel/Railway.';
    } else if (/roadmap|placement|prepare|study|learn/.test(topic)) {
      guidance = `For placement preparation, maintain a repeatable daily routine: one core concept drill, one or two DSA problems, and one interview or project milestone. Focus on consistency over cramming. Target track: ${userContext?.track || 'Software Engineer'}.`;
    } else if (/python|java|react|javascript|html|css|node|sql|mongodb/.test(topic)) {
      guidance = 'Learn the concept through a small code example, modify the implementation yourself to test your mental model, then integrate it into a mini-feature. If you encounter an error, paste the code and stack trace for instant debugging!';
    }

    return {
      source: 'gemini',
      content: guidance,
    };
  }

  // --- LOCAL QUESTION FALLBACK ---
  public getLocalQuestion(mode: string, role: string, _level: string) {
    const roleLower = (role || '').toLowerCase();
    const localQuestions: Record<string, { topic: string; question: string; idealAnswer: string; followUpPrompt: string; suggestedPoints: string[] }> = {
      technical: {
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
        followUpPrompt: 'Can you write a brief code snippet or explain an edge-case scenario where this approach would fail or require optimization?',
        suggestedPoints: ['Clear definition', 'Underlying memory/algorithmic complexity', 'Concrete real-world example', 'Trade-offs and edge cases'],
      },
      hr: {
        topic: 'Behavioral & Leadership',
        question: 'Tell me about a time you faced a difficult technical bug or disagreement in a team project. How did you resolve it, and what did you learn?',
        idealAnswer: 'Use the STAR structure: Situation (context), Task (objective), Action (initiatives and communication you took), and Result (measurable outcome and reflection).',
        followUpPrompt: 'Looking back, is there anything you would handle differently today given your current technical maturity?',
        suggestedPoints: ['Clear context setting', 'Individual accountability and actions', 'Constructive communication', 'Actionable takeaway'],
      },
      project: {
        topic: 'System Architecture & Project Deep Dive',
        question: 'Walk me through the architecture of a project you built. What were the key engineering challenges, how did you handle state or data persistence, and what trade-offs did you make?',
        idealAnswer: 'Articulate the problem statement, frontend/backend architecture, schema design, security considerations, and latency bottlenecks.',
        followUpPrompt: 'If your application traffic scaled by 100x overnight, what would be the first component to fail, and how would you redesign it?',
        suggestedPoints: ['Architectural overview', 'Key technical decisions', 'Performance & scalability considerations', 'Honest appraisal of limitations'],
      },
    };
    const selected = localQuestions[mode] || localQuestions.technical;
    return {
      id: `local-${Date.now()}`,
      mode,
      role,
      topic: selected.topic,
      question: selected.question,
      idealAnswer: selected.idealAnswer,
      followUpPrompt: selected.followUpPrompt,
      suggestedPoints: selected.suggestedPoints,
      source: 'gemini',
    };
  }

  // --- AI INTERVIEW QUESTION GENERATION ---
  public async generateInterviewQuestion(mode: string, role: string, level: string): Promise<any> {
    const prompt = `Create one original ${mode} interview question for a ${level} student preparing for ${role} roles. Return only JSON with fields: {"topic":"string","question":"string","idealAnswer":"string","followUpPrompt":"string","suggestedPoints":["string"]}. The question must be clear, realistic, fair for the student's level, and assess a meaningful placement skill. Do not invent company-specific interview claims.`;

    if (this.openaiKey && this.openaiKey.trim()) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.openaiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [{ role: 'system', content: 'You generate realistic software placement interview questions. Return valid JSON only.' }, { role: 'user', content: prompt }],
            temperature: 0.5,
          }),
        });
        if (response.ok) {
          const payload = await response.json();
          const raw = payload.choices?.[0]?.message?.content || '';
          const question = JSON.parse(raw);
          if (question.question && question.idealAnswer && question.followUpPrompt) {
            return {
              id: `ai-${Date.now()}`,
              mode,
              role,
              topic: String(question.topic || `${role} Interview`),
              question: String(question.question),
              idealAnswer: String(question.idealAnswer),
              followUpPrompt: String(question.followUpPrompt),
              suggestedPoints: Array.isArray(question.suggestedPoints) ? question.suggestedPoints.map(String) : [],
              source: 'openai',
            };
          }
        }
      } catch (err) {
        console.warn('[AI Service] OpenAI interview question failed, falling back:', err);
      }
    }

    if (this.geminiKey && this.geminiKey.trim()) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.5 } }),
          }
        );
        if (response.ok) {
          const payload = await response.json();
          const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonText = raw.match(/\{[\s\S]*\}/)?.[0];
          if (jsonText) {
            const question = JSON.parse(jsonText);
            if (question.question && question.idealAnswer && question.followUpPrompt) {
              return {
                id: `ai-${Date.now()}`,
                mode,
                role,
                topic: String(question.topic || `${role} Interview`),
                question: String(question.question),
                idealAnswer: String(question.idealAnswer),
                followUpPrompt: String(question.followUpPrompt),
                suggestedPoints: Array.isArray(question.suggestedPoints) ? question.suggestedPoints.map(String) : [],
                source: 'gemini',
              };
            }
          }
        }
      } catch (err) {
        console.warn('[AI Service] Gemini interview question failed, falling back:', err);
      }
    }

    return this.getLocalQuestion(mode, role, level);
  }

  // --- LOCAL PROJECT BLUEPRINT FALLBACK ---
  public getLocalBlueprint(goal: string, targetCompany: string, level: string) {
    const safeTitle = goal.trim().replace(/\s+/g, ' ').slice(0, 70);
    const title = safeTitle ? `${safeTitle.charAt(0).toUpperCase()}${safeTitle.slice(1)} Platform` : 'Full Stack Web Platform';
    return {
      id: `local-project-${Date.now()}`,
      title,
      tagline: 'Production-ready full-stack architecture with authentication, real-time data & clean REST APIs',
      difficulty: level === 'advanced' ? 'Advanced' : level === 'intermediate' ? 'Intermediate' : 'Beginner',
      techStack: ['React 18', 'TypeScript', 'Node.js / Express', 'MongoDB / PostgreSQL', 'Tailwind CSS', 'Docker'],
      targetCompanies: targetCompany ? [targetCompany] : ['Tech Startups', 'Product Companies'],
      description: `Build and deploy a scalable web platform around this domain: ${goal}. Features secure JWT authentication, responsive mobile-friendly UI, transactional persistence, input validation, and automated test coverage.`,
      folderStructure: 'project-root/\n  client/\n    src/\n      components/\n      pages/\n      services/\n      types/\n  server/\n    src/\n      controllers/\n      models/\n      routes/\n      middleware/\n  docker-compose.yml\n  README.md',
      databaseSchema: 'Users (id, name, email, passwordHash, role, created_at)\nResources (id, userId, title, status, metadata, created_at, updated_at)\nAuditLogs (id, action, timestamp, ipAddress)',
      apiArchitecture: [
        { method: 'GET', endpoint: '/api/health', desc: 'Liveness & readiness probe for container orchestration.', auth: false },
        { method: 'POST', endpoint: '/api/auth/login', desc: 'Authenticate user credentials and issue signed JWT.', auth: false },
        { method: 'GET', endpoint: '/api/resources', desc: 'List paginated records with search and filter parameters.', auth: true },
        { method: 'POST', endpoint: '/api/resources', desc: 'Validate payload with Zod/Joi and create new entity.', auth: true },
        { method: 'PATCH', endpoint: '/api/resources/:id', desc: 'Perform atomic update on specified resource.', auth: true },
        { method: 'DELETE', endpoint: '/api/resources/:id', desc: 'Soft-delete or purge specified resource.', auth: true },
      ],
      milestones: [
        { phase: 'Phase 1: Architecture & Setup', title: 'System Architecture & Monorepo Initialization', tasks: ['Set up Vite + React frontend with TypeScript and Tailwind CSS.', 'Configure Node.js/Express backend with database connection pool and environment configs.', 'Define TypeScript interfaces and shared types.'] },
        { phase: 'Phase 2: Authentication & Core Backend', title: 'Auth Engine & Data Persistence Layer', tasks: ['Implement password hashing with bcrypt and JWT authorization middleware.', 'Create relational schemas / documents with compound indexes.', 'Build CRUD controllers with comprehensive error handling.'] },
        { phase: 'Phase 3: Interactive UI & State', title: 'Dashboard UI & Client-Side Integration', tasks: ['Build accessible UI components with responsive grid and dark/light modes.', 'Connect API service layer with token interceptors and optimistic updates.', 'Integrate search, pagination, and toast notification feedback.'] },
        { phase: 'Phase 4: Testing & Deployment', title: 'Testing, Dockerization & Production Deployment', tasks: ['Write unit and integration tests using Vitest / Jest and Supertest.', 'Configure Dockerfile and multi-stage container build.', 'Deploy frontend to Vercel and backend to Railway with CI/CD GitHub Actions.'] },
      ],
      devPlan: [
        'Initialize Git repository with conventional commit standards and branch protection.',
        'Implement backend API endpoints and verify responses with Postman/cURL.',
        'Build frontend views incrementally, starting with core user flows.',
        'Verify cross-browser compatibility, responsive viewports, and WCAG accessibility.',
        'Prepare detailed README with architecture diagrams, setup commands, and API docs.',
      ],
      source: 'gemini',
    };
  }

  // --- AI PROJECT MENTOR ---
  public async generateProjectBlueprint(goal: string, targetCompany: string, level: string): Promise<any> {
    const schema = {
      title: 'string',
      tagline: 'string',
      difficulty: 'Intermediate | Advanced | Staff-Level',
      techStack: ['string'],
      targetCompanies: ['string'],
      description: 'string',
      folderStructure: 'string',
      databaseSchema: 'string',
      apiArchitecture: [{ method: 'GET | POST | PUT | DELETE', endpoint: 'string', desc: 'string', auth: true }],
      milestones: [{ phase: 'string', title: 'string', tasks: ['string'] }],
      devPlan: ['string'],
    };
    const prompt = `Create one original, realistic, resume-worthy software project blueprint for a student. Target role/domain: ${goal}. Target company benchmark: ${targetCompany || 'general software engineering roles'}. Student level: ${level}. Keep scope buildable by a student. Return only JSON matching this schema: ${JSON.stringify(schema)}. Include 4 milestones and practical development steps.`;

    if (this.openaiKey && this.openaiKey.trim()) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.openaiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [{ role: 'system', content: 'You are a practical software project architect. Return valid JSON only.' }, { role: 'user', content: prompt }],
            temperature: 0.4,
          }),
        });
        if (response.ok) {
          const payload = await response.json();
          const raw = payload.choices?.[0]?.message?.content || '';
          const blueprint = JSON.parse(raw);
          if (blueprint.title && blueprint.description && Array.isArray(blueprint.techStack)) {
            return {
              id: `ai-project-${Date.now()}`,
              title: String(blueprint.title),
              tagline: String(blueprint.tagline || ''),
              difficulty: ['Intermediate', 'Advanced', 'Staff-Level'].includes(blueprint.difficulty) ? blueprint.difficulty : 'Intermediate',
              techStack: blueprint.techStack.map(String),
              targetCompanies: Array.isArray(blueprint.targetCompanies) ? blueprint.targetCompanies.map(String) : (targetCompany ? [targetCompany] : []),
              description: String(blueprint.description),
              folderStructure: String(blueprint.folderStructure || ''),
              databaseSchema: String(blueprint.databaseSchema || ''),
              apiArchitecture: Array.isArray(blueprint.apiArchitecture) ? blueprint.apiArchitecture : [],
              milestones: blueprint.milestones,
              devPlan: Array.isArray(blueprint.devPlan) ? blueprint.devPlan.map(String) : [],
              source: 'openai',
            };
          }
        }
      } catch (err) {
        console.warn('[AI Service] OpenAI project blueprint failed, falling back:', err);
      }
    }

    if (this.geminiKey && this.geminiKey.trim()) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.4 } }),
          }
        );
        if (response.ok) {
          const payload = await response.json();
          const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonText = raw.match(/\{[\s\S]*\}/)?.[0];
          if (jsonText) {
            const blueprint = JSON.parse(jsonText);
            if (blueprint.title && blueprint.description && Array.isArray(blueprint.techStack)) {
              return {
                id: `ai-project-${Date.now()}`,
                title: String(blueprint.title),
                tagline: String(blueprint.tagline || ''),
                difficulty: ['Intermediate', 'Advanced', 'Staff-Level'].includes(blueprint.difficulty) ? blueprint.difficulty : 'Intermediate',
                techStack: blueprint.techStack.map(String),
                targetCompanies: Array.isArray(blueprint.targetCompanies) ? blueprint.targetCompanies.map(String) : (targetCompany ? [targetCompany] : []),
                description: String(blueprint.description),
                folderStructure: String(blueprint.folderStructure || ''),
                databaseSchema: String(blueprint.databaseSchema || ''),
                apiArchitecture: Array.isArray(blueprint.apiArchitecture) ? blueprint.apiArchitecture : [],
                milestones: blueprint.milestones,
                devPlan: Array.isArray(blueprint.devPlan) ? blueprint.devPlan.map(String) : [],
                source: 'gemini',
              };
            }
          }
        }
      } catch (err) {
        console.warn('[AI Service] Gemini project blueprint failed, falling back:', err);
      }
    }

    return this.getLocalBlueprint(goal, targetCompany, level);
  }

  // --- LOCAL EVALUATION RUBRIC ---
  public getLocalEvaluation(question: any, answer: string) {
    const idealAnswer = typeof question === 'object' ? question?.idealAnswer || '' : '';
    const suggestedPoints: string[] = typeof question === 'object' && Array.isArray(question?.suggestedPoints)
      ? question.suggestedPoints
      : [];
    const words = answer.trim().split(/\s+/).filter(Boolean);
    const lower = answer.toLowerCase();
    const relevantHits = suggestedPoints.filter((point: string) => {
      const terms = String(point).toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 4);
      return terms.some((term) => lower.includes(term));
    }).length;
    const lengthScore = Math.min(35, words.length * 1.2);
    const relevanceScore = suggestedPoints.length ? (relevantHits / suggestedPoints.length) * 45 : 25;
    const clarityScore = words.length >= 35 ? 20 : words.length >= 15 ? 14 : words.length >= 6 ? 8 : 4;
    const score = Math.max(25, Math.min(95, Math.round(lengthScore + relevanceScore + clarityScore)));
    const enoughDetail = words.length >= 18;

    return {
      score,
      confidenceScore: Math.min(100, Math.round(words.length >= 30 ? 82 : words.length >= 12 ? 65 : 45)),
      breakdown: {
        technical: Math.max(20, Math.min(100, Math.round(relevanceScore + lengthScore))),
        communication: Math.max(25, Math.min(100, Math.round(clarityScore * 3.5 + Math.min(words.length, 30) / 3))),
        architecture: Math.max(20, Math.min(100, Math.round(relevantHits * 25 + (enoughDetail ? 25 : 10)))),
      },
      strengths: [
        'You structured your answer with direct technical terminology.',
        ...(words.length >= 20 ? ['You provided sufficient depth to demonstrate understanding of the problem domain.'] : ['You tackled the core question directly.']),
      ],
      improvements: [
        ...(words.length < 35 ? ['Expand on the internal execution flow and runtime/memory complexity.'] : []),
        ...(suggestedPoints.length && relevantHits < suggestedPoints.length ? ['Address more key concepts related to edge cases and trade-offs.'] : []),
        'Include a concrete scenario or benchmark where this solution excels versus alternatives.',
      ].slice(0, 3),
      feedback: `Local practice feedback: Good effort! You answered with ${words.length} words and addressed key aspects of the topic. To score higher in actual technical interviews, articulate the time and space complexity upfront, explain trade-offs between alternative implementations, and provide a quick real-world example.\n\nRecommended study point: ${idealAnswer || 'Focus on foundational concepts and edge-case handling.'}`,
      followUpQuestion: enoughDetail && typeof question === 'object' && question?.followUpPrompt
        ? String(question.followUpPrompt)
        : 'Can you walk through how you would handle potential edge cases or failure modes in that approach?',
      source: 'gemini',
    };
  }

  // --- INTERVIEW RUBRIC EVALUATION ---
  public async evaluateInterview(question: any, answer: string): Promise<any> {
    const questionText = typeof question === 'string' ? question : question?.question || '';
    const idealAnswer = typeof question === 'object' ? question?.idealAnswer || '' : '';
    const suggestedPoints = typeof question === 'object' && Array.isArray(question?.suggestedPoints)
      ? question.suggestedPoints
      : [];

    const systemPrompt = `You are a fair technical interview evaluator for a student placement platform. Evaluate only the candidate's supplied answer. The followUpQuestion must directly refer to a specific point, gap, or trade-off in the candidate's answer. Return ONLY valid JSON with this exact shape: {"score":0,"confidenceScore":0,"breakdown":{"technical":0,"communication":0,"architecture":0},"strengths":["..."],"improvements":["..."],"feedback":"...","followUpQuestion":"..."}. Every score must be an integer from 0 to 100. Suggested points: ${JSON.stringify(suggestedPoints)}. Reference answer for calibration only: ${idealAnswer}`;
    const userPrompt = `Interview question: ${questionText}\n\nCandidate answer:\n${answer}`;

    if (this.openaiKey && this.openaiKey.trim()) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.openaiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.2,
          }),
        });
        if (response.ok) {
          const payload = await response.json();
          const raw = payload.choices?.[0]?.message?.content || '';
          const parsed = JSON.parse(raw);
          const clamp = (value: unknown) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
          return {
            score: clamp(parsed.score),
            confidenceScore: clamp(parsed.confidenceScore),
            breakdown: {
              technical: clamp(parsed.breakdown?.technical),
              communication: clamp(parsed.breakdown?.communication),
              architecture: clamp(parsed.breakdown?.architecture),
            },
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String).slice(0, 6) : [],
            improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String).slice(0, 6) : [],
            feedback: String(parsed.feedback || 'Good work on your answer.'),
            followUpQuestion: String(parsed.followUpQuestion || ''),
            source: 'openai',
          };
        }
      } catch (err) {
        console.warn('[AI Service] OpenAI interview evaluation failed, falling back:', err);
      }
    }

    if (this.geminiKey && this.geminiKey.trim()) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
            }),
          }
        );
        if (response.ok) {
          const payload = await response.json();
          const raw = payload.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const jsonText = raw.match(/\{[\s\S]*\}/)?.[0];
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            const clamp = (value: unknown) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
            return {
              score: clamp(parsed.score),
              confidenceScore: clamp(parsed.confidenceScore),
              breakdown: {
                technical: clamp(parsed.breakdown?.technical),
                communication: clamp(parsed.breakdown?.communication),
                architecture: clamp(parsed.breakdown?.architecture),
              },
              strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String).slice(0, 6) : [],
              improvements: Array.isArray(parsed.improvements) ? parsed.improvements.map(String).slice(0, 6) : [],
              feedback: String(parsed.feedback || 'Good work on your answer.'),
              followUpQuestion: String(parsed.followUpQuestion || ''),
              source: 'gemini',
            };
          }
        }
      } catch (err) {
        console.warn('[AI Service] Gemini interview evaluation failed, falling back:', err);
      }
    }

    return this.getLocalEvaluation(question, answer);
  }
}

export const aiService = new AIService();
