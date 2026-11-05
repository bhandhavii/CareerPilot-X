import { Question, DailyMission, RoadmapMilestone, CodingChallenge, ProjectItem, InterviewQuestion } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // Frontend Questions
  {
    id: 'fe-1',
    track: 'frontend',
    topic: 'React Core',
    question: 'How does React’s reconciliation algorithm (Fiber) prioritize concurrent state updates?',
    options: [
      'By using Web Workers for all state modifications',
      'By assigning lanes with different priority levels to interruptible work units',
      'By executing all setState calls synchronously in the microtask queue',
      'By forcing a full DOM re-render every 16ms'
    ],
    correctAnswer: 1,
    explanation: 'React Fiber introduces the concept of lanes and scheduler priorities, allowing high-priority user interactions (typing, clicks) to interrupt lower-priority background transitions.',
    difficulty: 'medium'
  },
  {
    id: 'fe-2',
    track: 'frontend',
    topic: 'JavaScript Engine',
    question: 'What is the exact execution order of: synchronous code, Promises (microtasks), and setTimeout (macrotasks)?',
    options: [
      'setTimeout -> Promise -> Synchronous',
      'Synchronous -> Macrotasks -> Microtasks',
      'Synchronous -> Microtasks (Promises) -> Macrotasks (setTimeout)',
      'Promise -> Synchronous -> setTimeout'
    ],
    correctAnswer: 2,
    explanation: 'The event loop processes all synchronous execution frames on the call stack first, exhausts the microtask queue (Promise callbacks, queueMicrotask), and then dequeues the next macrotask.',
    difficulty: 'easy'
  },
  {
    id: 'fe-3',
    track: 'frontend',
    topic: 'CSS & Rendering',
    question: 'Which CSS property change triggers ONLY Compositing without triggering Layout (Reflow) or Paint?',
    options: [
      'width and height',
      'transform and opacity',
      'background-color and border-radius',
      'top and left positioning'
    ],
    correctAnswer: 1,
    explanation: 'Transform and opacity changes can be offloaded to the GPU compositor thread without forcing the browser engine to recalculate layout or repaint pixels on the CPU.',
    difficulty: 'medium'
  },
  {
    id: 'fe-4',
    track: 'frontend',
    topic: 'Performance',
    question: 'What is the primary purpose of the Cumulative Layout Shift (CLS) Core Web Vital metric?',
    options: [
      'To measure server response latency (TTFB)',
      'To quantify unexpected visual layout shifts during page load that degrade UX',
      'To measure time to first byte of the main JavaScript bundle',
      'To measure total memory consumed by Three.js canvases'
    ],
    correctAnswer: 1,
    explanation: 'CLS measures unexpected layout instability during page life. A CLS score below 0.1 is recommended for good user experience.',
    difficulty: 'easy'
  },
  {
    id: 'fe-5',
    track: 'frontend',
    topic: 'State Architecture',
    question: 'When optimizing a React application with extensive context, how do you prevent unnecessary re-renders of consuming components?',
    options: [
      'Never use Context API under any circumstance',
      'Split context into separate state and dispatch contexts, or use selective selector subscriptions',
      'Wrap every component in React.cloneElement',
      'Store state strictly in localStorage and read synchronously'
    ],
    correctAnswer: 1,
    explanation: 'Splitting state and dispatch into distinct contexts prevents consumers that only dispatch actions from re-rendering whenever state values update.',
    difficulty: 'hard'
  },

  // Backend Questions
  {
    id: 'be-1',
    track: 'backend',
    topic: 'Node.js Architecture',
    question: 'In Node.js libuv event loop, which thread pool handles DNS resolution and fs (filesystem) operations?',
    options: [
      'The V8 Garbage Collector thread',
      'The libuv default 4-worker thread pool (UV_THREADPOOL_SIZE)',
      'The main event loop thread directly without queuing',
      'A dedicated WebAssembly thread instance'
    ],
    correctAnswer: 1,
    explanation: 'libuv delegates synchronous/blocking system operations like filesystem I/O, DNS lookups, and crypto hashing to its internal worker thread pool.',
    difficulty: 'medium'
  },
  {
    id: 'be-2',
    track: 'backend',
    topic: 'Databases & Indexing',
    question: 'In a MongoDB collection of 10 million documents, why does an index on `{ status: 1, createdAt: -1 }` outperform separate single-field indexes for compound queries?',
    options: [
      'Because MongoDB cannot use indexes at all on dates',
      'Because the compound B-tree index orders entries by status first, then by createdAt, avoiding in-memory sorting',
      'Because compound indexes convert collections to relational SQL tables',
      'Because single indexes require two separate database server restarts'
    ],
    correctAnswer: 1,
    explanation: 'A compound index provides index prefix matching and satisfies both the filtering equality condition and the sort ordering within a single index scan.',
    difficulty: 'medium'
  },
  {
    id: 'be-3',
    track: 'backend',
    topic: 'Security & Auth',
    question: 'Why should JWT refresh tokens be stored in httpOnly, secure, sameSite cookies rather than localStorage?',
    options: [
      'Cookies are automatically encrypted with RSA-4096 by the browser',
      'httpOnly cookies cannot be read by malicious JavaScript, mitigating Cross-Site Scripting (XSS) token theft',
      'localStorage has a maximum size of 10 bytes',
      'Browsers reject cookies for all REST APIs'
    ],
    correctAnswer: 1,
    explanation: 'httpOnly cookies prevent JavaScript from accessing sensitive token strings via `document.cookie`, safeguarding against XSS credential harvesting.',
    difficulty: 'hard'
  },
  {
    id: 'be-4',
    track: 'backend',
    topic: 'API Design',
    question: 'Which HTTP status code should be returned when an authenticated client requests a resource they lack administrative permissions to view?',
    options: [
      '401 Unauthorized (unauthenticated)',
      '403 Forbidden (authenticated but unauthorized)',
      '404 Not Found',
      '502 Bad Gateway'
    ],
    correctAnswer: 1,
    explanation: '401 indicates authentication credentials are required or invalid. 403 Forbidden indicates the server understands the user’s identity but refuses authorization.',
    difficulty: 'easy'
  },
  {
    id: 'be-5',
    track: 'backend',
    topic: 'Distributed Systems',
    question: 'What is the primary role of an API Gateway in a microservices architecture?',
    options: [
      'To compile TypeScript directly into hardware microcode',
      'To provide centralized routing, rate-limiting, SSL termination, and cross-cutting authentication',
      'To replace all databases with in-memory JSON files',
      'To run client-side React hooks on the server'
    ],
    correctAnswer: 1,
    explanation: 'API Gateways serve as reverse proxies orchestrating client traffic, authentication, telemetry, and rate limits before routing to internal microservices.',
    difficulty: 'medium'
  },

  // Full-Stack Questions
  {
    id: 'fs-1',
    track: 'fullstack',
    topic: 'Full-Stack Architecture',
    question: 'What is the fundamental difference between Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR)?',
    options: [
      'SSR does not use HTML; ISR only uses raw binary data',
      'SSR renders HTML on every incoming HTTP request; ISR caches static HTML and revalidates in the background upon invalidation intervals',
      'ISR requires running Apache Hadoop on the frontend',
      'SSR only works on mobile devices'
    ],
    correctAnswer: 1,
    explanation: 'SSR computes HTML dynamically for every request, whereas ISR pre-generates pages statically and regenerates them in the background according to revalidation policies.',
    difficulty: 'medium'
  },
  {
    id: 'fs-2',
    track: 'fullstack',
    topic: 'Realtime Communication',
    question: 'When implementing bidirectional realtime communication, why might WebSockets be preferred over Server-Sent Events (SSE)?',
    options: [
      'WebSockets only send plain text, which is faster',
      'WebSockets support full-duplex communication (both client and server send arbitrary messages at any time over a single TCP socket)',
      'SSE requires installing native C++ compilers on mobile phones',
      'WebSockets cannot pass through any HTTP proxy'
    ],
    correctAnswer: 1,
    explanation: 'WebSockets provide full-duplex, low-overhead bidirectional streams, whereas SSE is strictly unidirectional (server pushing events down to client over HTTP).',
    difficulty: 'medium'
  },
  {
    id: 'fs-3',
    track: 'fullstack',
    topic: 'Database Transactions',
    question: 'What does the ACID property "Isolation" ensure in full-stack concurrent transaction execution?',
    options: [
      'That data is duplicated across 10 continents',
      'That concurrently executing transactions do not interfere with one another and produce results equivalent to serial execution',
      'That users can only login from one single browser tab at a time',
      'That all passwords are converted to MD5 hashes'
    ],
    correctAnswer: 1,
    explanation: 'Isolation prevents anomalies like dirty reads, non-repeatable reads, and phantom reads when multiple transactions write to shared tables concurrently.',
    difficulty: 'hard'
  },
  {
    id: 'fs-4',
    track: 'fullstack',
    topic: 'System Design & Caching',
    question: 'What is the "Cache Stampede" (thundering herd) problem and how do you prevent it?',
    options: [
      'When cache memory is deleted upon server restart; prevented by disabling RAM',
      'When high-traffic key expires causing simultaneous expensive database queries; prevented with mutual exclusion locks or probabilistic early recomputation',
      'When users download too many CSS files; prevented with inline styles',
      'When Redis crashes due to zero network traffic'
    ],
    correctAnswer: 1,
    explanation: 'A cache stampede occurs when a popular cache key expires under heavy concurrent load, flooding the database. Mutex locks or XFetch probabilistic early calculation prevent this.',
    difficulty: 'hard'
  },
  {
    id: 'fs-5',
    track: 'fullstack',
    topic: 'CI/CD & DevOps',
    question: 'What is the principal purpose of zero-downtime Blue/Green deployments?',
    options: [
      'To change the CSS theme from blue to green every Friday',
      'To maintain two identical environments, routing production traffic to the new version only after successful health checks',
      'To eliminate the need for unit tests entirely',
      'To run development servers directly on production databases'
    ],
    correctAnswer: 1,
    explanation: 'Blue/Green deployment runs two identical environments; router cutover switches live traffic to the green deployment instantly once verified, allowing instant rollback.',
    difficulty: 'medium'
  }
];

export const INITIAL_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'dm-1',
    title: 'Master Event Loop & Microtasks',
    description: 'Solve the interactive 5-question deep-dive on Promise queuing and libuv thread pool mechanics.',
    track: 'fullstack',
    xpReward: 150,
    estimatedMinutes: 10,
    completed: false,
    category: 'quiz'
  },
  {
    id: 'dm-2',
    title: 'Implement Debounce & Throttle Hook',
    description: 'Complete the coding challenge for a custom React performance optimization hook with unit test validation.',
    track: 'frontend',
    xpReward: 250,
    estimatedMinutes: 20,
    completed: false,
    category: 'code'
  },
  {
    id: 'dm-3',
    title: 'AI Behavioral & System Architecture Mock',
    description: 'Simulate a 5-minute technical system design session with your AI Interview Coach on caching architectures.',
    track: 'backend',
    xpReward: 300,
    estimatedMinutes: 15,
    completed: false,
    category: 'interview'
  }
];

export const INITIAL_ROADMAP: RoadmapMilestone[] = [
  {
    id: 'rm-1',
    title: 'JavaScript & Runtime Foundations',
    description: 'Deep dive into V8 engine, closures, event loop microtasks, memory management, and ESNext primitives.',
    track: 'fullstack',
    level: 1,
    status: 'completed',
    skills: ['V8 Internals', 'Event Loop', 'Memory Leaks', 'Async/Await', 'Prototypes'],
    estimatedWeeks: 2,
    whyRecommended: 'Essential baseline required for all high-scale web engineering.'
  },
  {
    id: 'rm-2',
    title: 'React Architecture & State Mastery',
    description: 'React Fiber internals, concurrent mode, custom hooks, performance profiling, and state machines.',
    track: 'frontend',
    level: 2,
    status: 'in_progress',
    skills: ['React 18/19', 'Fiber Architecture', 'Zustand/Redux', 'Memoization', 'SSR/RSC'],
    estimatedWeeks: 3,
    whyRecommended: 'Core requirement for modern frontend leadership and enterprise UI engineering.'
  },
  {
    id: 'rm-3',
    title: 'High-Throughput Node.js & REST/GraphQL APIs',
    description: 'Express/Fastify architecture, middleware pipelines, streaming, rate limiting, and OpenAPI contracts.',
    track: 'backend',
    level: 3,
    status: 'in_progress',
    skills: ['Express/Fastify', 'Streams & Buffers', 'GraphQL', 'Authentication (JWT/OAuth)', 'RESTful Standards'],
    estimatedWeeks: 3,
    whyRecommended: 'Enables you to architect enterprise APIs capable of handling millions of daily requests.'
  },
  {
    id: 'rm-4',
    title: 'Databases, Indexing & Caching Layers',
    description: 'MongoDB schema design, compound indexing, aggregation pipelines, Redis cache-aside, and ACID transactions.',
    track: 'backend',
    level: 4,
    status: 'locked',
    skills: ['MongoDB', 'PostgreSQL', 'Redis Caching', 'Query Optimization', 'Connection Pooling'],
    estimatedWeeks: 4,
    whyRecommended: 'Critical for passing Senior Backend and Full-Stack technical interview rounds.'
  },
  {
    id: 'rm-5',
    title: 'Full-Stack Capstone Production Engineering',
    description: 'Architecting end-to-end applications with CI/CD, Docker containerization, WebSockets, and monitoring.',
    track: 'fullstack',
    level: 5,
    status: 'locked',
    skills: ['Docker', 'CI/CD Pipelines', 'WebSockets', 'Web Security (OWASP)', 'Testing (Jest/Playwright)'],
    estimatedWeeks: 4,
    whyRecommended: 'Proves your capacity to build, ship, and maintain complete production systems independently.'
  },
  {
    id: 'rm-6',
    title: 'Coding Interviews & System Design Mastery',
    description: 'Algorithmic patterns, distributed systems trade-offs, behavioral STAR method, and AI mock drills.',
    track: 'fullstack',
    level: 6,
    status: 'locked',
    skills: ['System Design', 'Data Structures', 'STAR Technique', 'Live Whiteboarding', 'Salary Negotiation'],
    estimatedWeeks: 3,
    whyRecommended: 'Final bridge between technical competency and top-tier engineering offers.'
  }
];

export const INITIAL_CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'cc-1',
    title: 'Implement Deep Object Clone',
    difficulty: 'medium',
    track: 'fullstack',
    description: 'Write a JavaScript function `deepClone(obj)` that produces an exact independent copy of nested objects, arrays, and primitives without mutating references or failing on circular references.',
    starterCode: `function deepClone(obj, hash = new WeakMap()) {
  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle circular references
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // Your code here: handle Arrays and Objects
  const clone = Array.isArray(obj) ? [] : {};
  hash.set(obj, clone);

  for (const key of Object.keys(obj)) {
    clone[key] = deepClone(obj[key], hash);
  }

  return clone;
}`,
    testCases: [
      {
        input: 'deepClone({ a: 1, b: { c: 2 } })',
        expectedOutput: '{"a":1,"b":{"c":2}}',
        description: 'Should deeply clone nested objects without reference linkage'
      },
      {
        input: 'deepClone([1, [2, 3], { d: 4 }])',
        expectedOutput: '[1,[2,3],{"d":4}]',
        description: 'Should handle nested arrays and objects correctly'
      }
    ],
    explanation: 'A robust deep clone handles primitive passthrough, recursive descent on keys, WeakMap storage for cycle detection, and distinct array/object constructor branching.',
    hints: [
      'Use typeof to guard against primitives and null first.',
      'A WeakMap prevents infinite recursion on circular structures like obj.self = obj.',
      'Check Array.isArray(obj) to initialize the target container properly.'
    ]
  },
  {
    id: 'cc-2',
    title: 'LRU Cache (Least Recently Used)',
    difficulty: 'hard',
    track: 'backend',
    description: 'Design a data structure that implements a Least Recently Used (LRU) Cache supporting `get(key)` and `put(key, value)` operations in O(1) time complexity.',
    starterCode: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map(); // JavaScript Map preserves insertion order!
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    // Refresh position to most recently used
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first key in Map)
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}`,
    testCases: [
      {
        input: 'const lru = new LRUCache(2); lru.put(1, 1); lru.put(2, 2); lru.get(1); lru.put(3, 3); [lru.get(2), lru.get(3)]',
        expectedOutput: '[-1,3]',
        description: 'Key 2 should be evicted because Key 1 was refreshed by get(1)'
      }
    ],
    explanation: 'JavaScript Map keys retain insertion order. Deleting and re-inserting an entry moves it to the newest end. The oldest entry can be evicted in O(1) via map.keys().next().value.',
    hints: [
      'JavaScript Map acts as both a hash table and doubly-linked list.',
      'When accessing a key, delete it and set it again to push it to the end.',
      'When at capacity, delete the first key yielded by iterator.'
    ]
  }
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-1',
    title: 'DevPulse — Real-Time Developer Telemetry OS',
    tagline: 'High-performance observability dashboard with WebSockets & 3D WebGL visualizations.',
    track: 'fullstack',
    difficulty: 'advanced',
    estimatedHours: 40,
    skills: ['React', 'Three.js', 'Node.js', 'WebSockets', 'MongoDB', 'Docker'],
    description: 'Build a production telemetry dashboard that ingests server metrics via WebSockets and visualizes cluster health in real-time 3D nodes.',
    milestones: [
      { id: 'm1', title: 'Design MongoDB time-series schema & indexing', completed: true },
      { id: 'm2', title: 'Implement WebSocket heartbeat ingestion microservice', completed: true },
      { id: 'm3', title: 'Build React UI with Three.js cluster health visualizer', completed: false },
      { id: 'm4', title: 'Deploy with Docker Compose & Nginx reverse proxy', completed: false }
    ],
    status: 'in_progress'
  },
  {
    id: 'proj-2',
    title: 'CyberAuth — Distributed Identity & RBAC Service',
    tagline: 'Enterprise authentication engine with rotating JWTs, WebAuthn & Redis session store.',
    track: 'backend',
    difficulty: 'capstone',
    estimatedHours: 50,
    skills: ['TypeScript', 'Express', 'Redis', 'OAuth2', 'Cryptographic Security'],
    description: 'Architect a secure identity provider featuring Argon2 password hashing, rotating refresh token families with reuse detection, and multi-tenant RBAC permissions.',
    milestones: [
      { id: 'm1', title: 'Implement cryptographic key rotation and JWT signing', completed: true },
      { id: 'm2', title: 'Build Redis token blacklist & rate-limiting middleware', completed: false },
      { id: 'm3', title: 'Integrate WebAuthn Passkey biometric authentication', completed: false }
    ],
    status: 'not_started'
  }
];

export const INITIAL_INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'iq-1',
    role: 'Frontend / Full-Stack Engineer',
    track: 'frontend',
    topic: 'Web Performance & Core Web Vitals',
    question: 'How would you diagnose and resolve a severe Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) degradation in a production React application?',
    suggestedPoints: [
      'Profile with Chrome DevTools Performance panel and Lighthouse',
      'Optimize critical rendering path: preloading hero image with fetchpriority="high"',
      'Eliminate render-blocking CSS/JS bundles via code-splitting and dynamic imports',
      'Reserve explicit aspect-ratio or width/height on images and dynamic ad slots to prevent CLS',
      'Implement server-side rendering (SSR) or edge caching for instant initial HTML delivery'
    ]
  },
  {
    id: 'iq-2',
    role: 'Backend / Distributed Systems Engineer',
    track: 'backend',
    topic: 'Database Scalability & Concurrency',
    question: 'Explain how you would architect a flash-sale ticketing system where 100,000 concurrent users attempt to buy only 1,000 available seats within 10 seconds.',
    suggestedPoints: [
      'Do not hit relational database directly for inventory checks',
      'Use Redis with atomic Lua scripts or DECR operations to guarantee zero overselling',
      'Buffer checkout write requests into an asynchronous message queue (Kafka / RabbitMQ)',
      'Worker consumer pools process purchases idempotently into transactional database',
      'Rate limit per user IP/account using token bucket algorithm at the API Gateway layer'
    ]
  }
];
