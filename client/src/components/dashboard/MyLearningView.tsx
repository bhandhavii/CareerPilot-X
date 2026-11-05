import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  Code2,
  Search,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Play,
  RotateCcw,
  Target,
  ArrowRight,
  Layers,
  Server,
  Layout,
  Cpu,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import { CareerTrack, LessonDetail, TrackInfo, LearningProgress } from '../../types';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

type CourseReference = { title: string; category: string; level: string; description: string; url: string };

const COURSE_REFERENCES: CourseReference[] = [
  { title: 'C Programming', category: 'Programming', level: 'Beginner → Advanced', description: 'Syntax, functions, pointers, arrays, structures and memory.', url: 'https://www.w3schools.com/c/' },
  { title: 'C++', category: 'Programming', level: 'Beginner → Advanced', description: 'OOP, STL, templates, memory and modern C++ basics.', url: 'https://www.w3schools.com/cpp/' },
  { title: 'Java', category: 'Programming', level: 'Beginner → Advanced', description: 'Core Java, OOP, collections, exceptions and JVM concepts.', url: 'https://www.w3schools.com/java/' },
  { title: 'Python', category: 'Programming', level: 'Beginner → Advanced', description: 'Python fundamentals, functions, collections, files and OOP.', url: 'https://www.w3schools.com/python/' },
  { title: 'HTML', category: 'Frontend', level: 'Beginner', description: 'Semantic markup, forms, accessibility and document structure.', url: 'https://www.w3schools.com/html/' },
  { title: 'CSS', category: 'Frontend', level: 'Beginner → Advanced', description: 'Selectors, box model, Flexbox, Grid and responsive design.', url: 'https://www.w3schools.com/css/' },
  { title: 'JavaScript', category: 'Frontend', level: 'Beginner → Advanced', description: 'ES6+, DOM, async programming and browser APIs.', url: 'https://www.w3schools.com/js/' },
  { title: 'React.js', category: 'Frontend', level: 'Intermediate', description: 'Components, props, state, hooks and application structure.', url: 'https://www.w3schools.com/REACT/' },
  { title: 'Node.js', category: 'Backend', level: 'Intermediate', description: 'Runtime, modules, events, asynchronous code and APIs.', url: 'https://www.w3schools.com/nodejs/' },
  { title: 'Express.js', category: 'Backend', level: 'Intermediate', description: 'Routing, middleware, REST APIs and error handling.', url: 'https://expressjs.com/en/starter/installing.html' },
  { title: 'FastAPI', category: 'Backend', level: 'Intermediate', description: 'Python API development, validation, dependencies and docs.', url: 'https://fastapi.tiangolo.com/tutorial/' },
  { title: 'SQL', category: 'Databases', level: 'Beginner → Advanced', description: 'Queries, joins, grouping, subqueries and data manipulation.', url: 'https://www.w3schools.com/sql/' },
  { title: 'MySQL', category: 'Databases', level: 'Beginner → Intermediate', description: 'Relational schemas, constraints, indexes and transactions.', url: 'https://www.w3schools.com/mysql/' },
  { title: 'MongoDB', category: 'Databases', level: 'Beginner → Intermediate', description: 'Documents, collections, queries, aggregation and indexes.', url: 'https://www.w3schools.com/mongodb/' },
  { title: 'DBMS', category: 'Core CS', level: 'Placement Focus', description: 'Keys, normalization, transactions, indexing and SQL concepts.', url: 'https://www.geeksforgeeks.org/dbms/' },
  { title: 'Operating Systems', category: 'Core CS', level: 'Placement Focus', description: 'Processes, threads, scheduling, memory and deadlocks.', url: 'https://www.geeksforgeeks.org/operating-systems/' },
  { title: 'Computer Networks', category: 'Core CS', level: 'Placement Focus', description: 'OSI/TCP-IP, routing, TCP, DNS, HTTP and network security.', url: 'https://www.geeksforgeeks.org/computer-network-tutorials/' },
  { title: 'OOP', category: 'Core CS', level: 'Placement Focus', description: 'Encapsulation, inheritance, polymorphism and abstraction.', url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/' },
  { title: 'Software Engineering', category: 'Core CS', level: 'Placement Focus', description: 'SDLC, requirements, testing, design and maintenance.', url: 'https://www.geeksforgeeks.org/software-engineering/' },
  { title: 'Machine Learning', category: 'AI/ML', level: 'Intermediate', description: 'Supervised learning, evaluation, feature engineering and models.', url: 'https://www.w3schools.com/python/python_ml_getting_started.asp' },
  { title: 'Deep Learning', category: 'AI/ML', level: 'Advanced', description: 'Neural networks, training, optimization and deep architectures.', url: 'https://www.tensorflow.org/learn' },
  { title: 'Generative AI', category: 'AI/ML', level: 'Intermediate → Advanced', description: 'LLMs, prompting, embeddings, RAG and evaluation.', url: 'https://www.deeplearning.ai/short-courses/' },
  { title: 'Artificial Intelligence', category: 'AI/ML', level: 'Beginner → Advanced', description: 'Search, reasoning, knowledge representation and AI systems.', url: 'https://www.ibm.com/think/topics/artificial-intelligence' },
];



// In-app starter lessons for every course in the course library. These notes are
// intentionally self-contained; the external reference remains optional.
const COURSE_LESSONS: Record<string, { title: string; explanation: string; exercise: string }[]> = {
  'C Programming': [
    { title: 'Program structure, variables and data types', explanation: 'A C program starts execution in main(). Declarations reserve typed storage: int for whole numbers, float/double for decimals, char for a character. Use printf() to display values and scanf() to read input, passing addresses with & for ordinary variables.', exercise: 'Write a program that reads two integers and prints their sum, difference and product.' },
    { title: 'Conditions, loops, arrays and functions', explanation: 'if/else selects a branch, while and for repeat work, and arrays store same-typed elements in contiguous memory. Functions split a program into reusable units. C passes arguments by value; pointers let a function work with the caller’s data through its address.', exercise: 'Write a function that receives an integer array and returns its largest element.' },
  ],
  'C++': [
    { title: 'Classes, objects and constructors', explanation: 'A class defines data and behavior; an object is an instance. Access modifiers control visibility. Constructors initialize objects, and encapsulation keeps state behind public methods. Prefer clear ownership and avoid unnecessary raw memory management.', exercise: 'Create a Student class with name, roll number, a constructor and a display() method.' },
    { title: 'STL containers and algorithms', explanation: 'The Standard Template Library provides vector, string, map, set, stack and queue. Iterators connect containers to algorithms such as sort(), find() and reverse(). Choose a container based on access pattern and complexity.', exercise: 'Read n integers into a vector, sort them, remove duplicates and print the result.' },
  ],
  'Java': [
    { title: 'JVM, classes and object-oriented basics', explanation: 'Java source is compiled to bytecode, which the JVM executes. A class defines fields and methods; objects hold state. Encapsulation, inheritance, polymorphism and abstraction help organize larger programs. The garbage collector manages unreachable objects.', exercise: 'Create a BankAccount class with private balance, deposit() and withdraw() methods.' },
    { title: 'Collections and exception handling', explanation: 'ArrayList stores ordered elements, HashSet stores unique values, and HashMap stores key-value pairs. Use generics for type safety. Handle expected failures with try/catch and release resources with try-with-resources.', exercise: 'Count word frequencies in a sentence using HashMap<String, Integer>.' },
  ],
  'Python': [
    { title: 'Variables, collections and control flow', explanation: 'Python variables refer to objects and do not require explicit type declarations. Lists are mutable sequences, tuples are immutable, sets hold unique values and dictionaries map keys to values. if/elif/else and for/while control execution.', exercise: 'Given a list of numbers, create a new list containing only even numbers and print their sum.' },
    { title: 'Functions, modules and object-oriented Python', explanation: 'Use def to define functions and return values explicitly. Parameters can have defaults; *args and **kwargs support flexible calls. Modules organize reusable code. Classes combine state and methods, while exceptions make error handling explicit.', exercise: 'Write a function that checks whether a string is a palindrome, ignoring spaces and letter case.' },
  ],
  'HTML': [
    { title: 'Document structure and semantic elements', explanation: 'An HTML document uses doctype, html, head and body. Semantic elements such as header, nav, main, section, article and footer describe purpose, improving accessibility and maintainability. Headings should form a logical hierarchy.', exercise: 'Build a simple portfolio page using header, nav, main, section and footer.' },
    { title: 'Links, images and accessible forms', explanation: 'Use anchors for navigation and meaningful alt text for informative images. Forms combine labels, inputs and buttons. Associate each label with its input, choose suitable input types, and use required and other constraints for browser validation.', exercise: 'Create a registration form with name, email, password and a submit button; connect every label correctly.' },
  ],
  'CSS': [
    { title: 'Selectors, cascade and box model', explanation: 'CSS selectors target elements. When declarations conflict, cascade rules consider origin, importance, specificity and source order. Every element is laid out as content, padding, border and margin; box-sizing: border-box makes sizing easier to reason about.', exercise: 'Style a profile card with consistent spacing, border, rounded corners and a readable type scale.' },
    { title: 'Flexbox, Grid and responsive layouts', explanation: 'Flexbox arranges items along one main axis; Grid manages rows and columns together. Media queries adapt layout to viewport size. Prefer flexible units, minmax(), repeat() and responsive images over fixed widths.', exercise: 'Create a three-card grid that becomes two columns on tablets and one column on narrow screens.' },
  ],
  'JavaScript': [
    { title: 'Values, functions and the DOM', explanation: 'Use const by default and let when reassignment is needed. JavaScript has primitive values and reference types. Functions can be passed as values; array methods such as map, filter and reduce express common transformations. The DOM API lets scripts respond to user actions.', exercise: 'Create a button that adds a new list item each time it is clicked.' },
    { title: 'Promises, async/await and browser APIs', explanation: 'A Promise represents a future result. async functions return promises, and await makes asynchronous code easier to read. Use try/catch for failures and check response.ok when using fetch(). Avoid blocking the main thread with long synchronous work.', exercise: 'Fetch JSON from a public test API and render a loading, success and error state.' },
  ],
  'React.js': [
    { title: 'Components, props and state', explanation: 'React UIs are composed from components. Props pass data from parent to child; state stores values that change over time. State updates should be immutable, and lists should use stable keys so React can reconcile changes correctly.', exercise: 'Build a reusable Counter component and render two independent counters.' },
    { title: 'Hooks, effects and component design', explanation: 'useState stores local state, useEffect synchronizes with external systems, and useMemo/useCallback can optimize measured bottlenecks. Keep effects focused, clean up subscriptions, and avoid deriving simple values through extra state.', exercise: 'Build a search-filtered list using controlled input state and a derived filtered array.' },
  ],
  'Node.js': [
    { title: 'Node runtime and event loop', explanation: 'Node.js runs JavaScript outside the browser using V8 and an event-driven runtime. The event loop coordinates callbacks and asynchronous I/O. Non-blocking operations help a server handle many connections, but CPU-heavy synchronous work can stall all requests.', exercise: 'Write a small Node script that reads a file asynchronously and handles read errors.' },
    { title: 'Modules, npm and streams', explanation: 'Modules separate code into reusable files. npm manages dependencies and scripts through package.json. Streams process data in chunks, which is useful for large files and network transfers without loading everything into memory.', exercise: 'Create a small module that exports a function and import it from another file.' },
  ],
  'Express.js': [
    { title: 'Routes and middleware', explanation: 'Express maps HTTP methods and paths to handlers. Middleware can inspect requests, authenticate users, parse data and pass control with next(). Order matters: error handlers and route-specific middleware should be placed deliberately.', exercise: 'Create GET /api/health and GET /api/users/:id routes with basic validation.' },
    { title: 'REST APIs, validation and errors', explanation: 'REST endpoints represent resources and use HTTP methods consistently. Validate request bodies before database writes, return meaningful status codes, and centralize error handling. Never trust client-provided IDs or permissions.', exercise: 'Implement a POST /api/tasks endpoint that validates a title and returns 201 or 400.' },
  ],
  'FastAPI': [
    { title: 'Path operations and Pydantic models', explanation: 'FastAPI uses Python type hints to validate inputs and generate OpenAPI documentation. Path and query parameters describe request data; Pydantic models validate JSON bodies and shape responses.', exercise: 'Create a POST /students endpoint that accepts a validated Student model.' },
    { title: 'Dependencies and async endpoints', explanation: 'Dependency injection shares authentication, database sessions and common logic. Use async endpoints when calling asynchronous libraries; do not call blocking work directly in an async handler. Built-in docs are available through OpenAPI UI.', exercise: 'Add a dependency that checks an API key before returning a protected resource.' },
  ],
  'SQL': [
    { title: 'SELECT, filtering and grouping', explanation: 'SELECT chooses columns, WHERE filters rows, ORDER BY sorts results and GROUP BY aggregates rows. HAVING filters groups after aggregation. Learn COUNT, SUM, AVG, MIN and MAX, and use aliases to make results readable.', exercise: 'Given an employees table, find the average salary for each department.' },
    { title: 'Joins, subqueries and data changes', explanation: 'INNER JOIN returns matching rows; LEFT JOIN preserves every row from the left table. Subqueries express dependent queries. INSERT, UPDATE and DELETE modify data; always test a WHERE clause before running destructive changes.', exercise: 'Join customers and orders to show each customer with their order count, including customers with zero orders.' },
  ],
  'MySQL': [
    { title: 'Tables, keys and constraints', explanation: 'MySQL stores relational data in tables. Choose suitable column types and define primary keys. Foreign keys enforce relationships; UNIQUE, NOT NULL and CHECK constraints protect data integrity at the database layer.', exercise: 'Design customers and orders tables with a primary key and a foreign key relationship.' },
    { title: 'Indexes and transactions', explanation: 'Indexes can speed up reads but add storage and write overhead. Transactions group changes; COMMIT makes them permanent and ROLLBACK undoes them. ACID properties describe reliable transaction behavior.', exercise: 'Create an index for a frequently filtered column and demonstrate a transaction with rollback.' },
  ],
  'MongoDB': [
    { title: 'Documents, collections and CRUD', explanation: 'MongoDB stores BSON documents in collections. Model data around access patterns, choose stable _id values, and use insertOne, find, updateOne and deleteOne carefully. Embed data that is read together; reference data when relationships grow independently.', exercise: 'Create a products collection, insert two documents and query products by category.' },
    { title: 'Aggregation and indexes', explanation: 'Aggregation pipelines transform documents through stages such as $match, $group, $project and $sort. Indexes support common filters and sorts; use explain() to inspect query plans and avoid indexing every field blindly.', exercise: 'Group orders by customer and calculate each customer’s total order value.' },
  ],
  'DBMS': [
    { title: 'Keys, relationships and normalization', explanation: 'A primary key identifies a row; foreign keys connect tables. Candidate and alternate keys describe other unique identifiers. Normalization reduces update anomalies: 1NF uses atomic values, 2NF removes partial dependencies and 3NF removes transitive dependencies.', exercise: 'Normalize a table that stores student details and multiple course names in one row.' },
    { title: 'Transactions, ACID and indexing', explanation: 'ACID means Atomicity, Consistency, Isolation and Durability. Concurrency control prevents conflicting transactions from corrupting data. Indexes improve lookup speed but need maintenance and may slow writes.', exercise: 'Explain how a bank transfer should use a transaction to debit one account and credit another.' },
  ],
  'Operating Systems': [
    { title: 'Processes, threads and CPU scheduling', explanation: 'A process is a program in execution; threads share process resources while keeping their own stack and execution state. Scheduling algorithms such as FCFS, SJF and Round Robin balance waiting time, response time and fairness.', exercise: 'For three processes with given arrival and burst times, calculate waiting time using FCFS.' },
    { title: 'Memory management and deadlocks', explanation: 'Virtual memory maps process addresses to physical memory; paging divides memory into fixed-size pages. A deadlock requires mutual exclusion, hold-and-wait, no preemption and circular wait. Prevention breaks at least one condition.', exercise: 'Draw a resource-allocation graph and identify whether it contains a deadlock cycle.' },
  ],
  'Computer Networks': [
    { title: 'Network layers and addressing', explanation: 'The OSI model separates communication into seven layers; TCP/IP groups the practical internet stack. IP addresses identify network interfaces, while MAC addresses are used on local links. Routers forward packets between networks.', exercise: 'Trace what happens when a laptop sends a packet to a server on another network.' },
    { title: 'TCP, DNS, HTTP and TLS', explanation: 'TCP establishes a reliable connection with SYN, SYN-ACK and ACK. DNS resolves names to records. HTTP defines request/response semantics; HTTPS protects it with TLS, which authenticates the server and negotiates encryption keys.', exercise: 'Explain the sequence from entering a website URL to receiving its first HTTPS response.' },
  ],
  'OOP': [
    { title: 'The four pillars of OOP', explanation: 'Encapsulation protects state, abstraction exposes essential behavior, inheritance reuses and specializes behavior, and polymorphism lets different implementations share one interface. Use composition when a “has-a” relationship is clearer than inheritance.', exercise: 'Model a payment system with a common PaymentMethod interface and two implementations.' },
    { title: 'Interfaces, composition and SOLID thinking', explanation: 'Interfaces describe contracts without tying callers to one implementation. Composition assembles behavior from smaller objects. SOLID principles encourage focused classes, substitutable implementations and dependency on abstractions.', exercise: 'Refactor a class that handles validation, persistence and email into smaller collaborators.' },
  ],
  'Software Engineering': [
    { title: 'SDLC and requirements', explanation: 'The software development life cycle includes planning, requirements, design, implementation, testing, deployment and maintenance. Functional requirements describe behavior; non-functional requirements cover qualities such as performance, reliability and security.', exercise: 'Write three functional and three non-functional requirements for a student learning app.' },
    { title: 'Design, testing and maintenance', explanation: 'Architecture separates responsibilities and defines component boundaries. Unit tests check small units, integration tests verify collaboration and end-to-end tests exercise user flows. Maintenance includes fixing defects, adapting systems and improving structure.', exercise: 'Write test cases for a login form covering valid input, invalid password and empty fields.' },
  ],
  'Machine Learning': [
    { title: 'Supervised and unsupervised learning', explanation: 'Supervised learning uses labeled examples for classification or regression. Unsupervised learning finds structure without labels, such as clusters. Split data into train/validation/test sets and prevent data leakage before fitting preprocessing steps.', exercise: 'Choose a suitable ML task and target variable for predicting house prices.' },
    { title: 'Model evaluation and overfitting', explanation: 'Accuracy alone can mislead on imbalanced data. Use precision, recall, F1 and confusion matrices for classification; MAE, MSE and R-squared for regression. Overfitting occurs when a model learns noise; regularization and validation help control it.', exercise: 'For a fraud detector, explain why recall and precision both matter.' },
  ],
  'Deep Learning': [
    { title: 'Neural networks and backpropagation', explanation: 'A neural network combines layers of weighted transformations and activation functions. Training computes a loss, backpropagates gradients and updates weights with an optimizer such as SGD or Adam. Learning rate and batch size strongly affect training.', exercise: 'Draw a simple input-hidden-output network and describe how one training step changes its weights.' },
    { title: 'CNNs, sequence models and transformers', explanation: 'CNNs learn spatial patterns with convolution filters. Recurrent models process sequences step by step. Transformers use attention to relate tokens across a sequence and are widely used in language, vision and multimodal models.', exercise: 'Compare when a CNN and a transformer would be suitable for an image task.' },
  ],
  'Generative AI': [
    { title: 'LLMs, tokens and prompt design', explanation: 'Large language models predict token sequences from context. A prompt should state the task, relevant context, constraints and desired output format. Validate factual claims and treat model output as a draft rather than guaranteed truth.', exercise: 'Rewrite a vague prompt into one with role, context, constraints and a clear output schema.' },
    { title: 'Embeddings, retrieval and RAG', explanation: 'Embeddings represent text as vectors so semantically related items can be retrieved. Retrieval-augmented generation fetches relevant source passages and supplies them to a model. Good RAG systems chunk documents, cite sources and evaluate retrieval quality.', exercise: 'Sketch a RAG flow for answering questions from a college handbook PDF.' },
  ],
  'Artificial Intelligence': [
    { title: 'Search, state spaces and heuristics', explanation: 'Search problems define states, actions, a transition model and a goal test. BFS explores by depth, DFS follows a path deeply, and uniform-cost search considers path cost. A* combines path cost with a heuristic estimate of remaining cost.', exercise: 'Represent a maze as a graph and explain how BFS finds a shortest path in an unweighted maze.' },
    { title: 'Knowledge representation and reasoning', explanation: 'AI systems can represent facts with logic, rules, graphs or probabilistic models. Inference derives conclusions from stored knowledge. Real systems must handle uncertainty, conflicting information and the limits of their knowledge.', exercise: 'Write three IF-THEN rules for a simple troubleshooting expert system.' },
  ],
};

interface MyLearningViewProps {
  initialTrack?: CareerTrack;
  initialLessonId?: string;
  onLessonCompleted?: (lessonId: string) => void;
}

export const MyLearningView: React.FC<MyLearningViewProps> = ({
  initialTrack = 'frontend',
  initialLessonId,
  onLessonCompleted,
}) => {
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<CareerTrack>(initialTrack);
  const [progress, setProgress] = useState<LearningProgress>({
    completedLessons: [],
    quizScores: {},
    totalStudyMinutes: 0,
  });
  const [activeLesson, setActiveLesson] = useState<LessonDetail | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseCategory, setCourseCategory] = useState('All');
  const [courseSearch, setCourseSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseReference | null>(null);
  const [selectedCourseLesson, setSelectedCourseLesson] = useState(0);
  const [courseSaving, setCourseSaving] = useState(false);

  // Lesson reader interactive state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [challengeCode, setChallengeCode] = useState('');
  const [codeRunResult, setCodeRunResult] = useState<{ passed: boolean; message: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [allTracks, userProgress] = await Promise.all([
        api.getTracks(),
        api.getLearningProgress(),
      ]);
      setTracks(allTracks);
      setProgress(userProgress);

      if (initialLessonId) {
        const lesson = await api.getLesson(initialLessonId);
        if (lesson) openLesson(lesson);
      } else if (userProgress.lastOpenedLessonId) {
        const lesson = await api.getLesson(userProgress.lastOpenedLessonId);
        if (lesson) setSelectedTrackId(lesson.trackId);
      }
      setLoading(false);
    };
    loadData();
  }, [initialLessonId]);

  const openLesson = async (lesson: LessonDetail) => {
    cyberAudio.playClick();
    setActiveLesson(lesson);
    setChallengeCode(lesson.challenge.starterCode);
    setSelectedQuizAnswers({});
    setQuizSubmitted(false);
    setCodeRunResult(null);
    setIsCompleted(progress.completedLessons.includes(lesson.id));

    // Save as last opened
    api.saveLearningProgress({ lessonId: lesson.id, trackId: lesson.trackId });
  };

  const handleQuizSelect = (questionId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    cyberAudio.playClick();
    setSelectedQuizAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleQuizSubmit = () => {
    if (!activeLesson) return;
    cyberAudio.playSuccess();
    setQuizSubmitted(true);

    let correct = 0;
    activeLesson.quiz.forEach((q) => {
      if (selectedQuizAnswers[q.id] === q.correctAnswer) correct++;
    });
    const percentage = Math.round((correct / Math.max(1, activeLesson.quiz.length)) * 100);

    api.saveLearningProgress({
      lessonId: activeLesson.id,
      trackId: activeLesson.trackId,
      quizScore: percentage,
    });
  };

  const handleRunChallengeCode = () => {
    if (!activeLesson) return;
    cyberAudio.playClick();
    try {
      const runner = new Function(`
        "use strict";
        ${challengeCode};
        return (${activeLesson.challenge.testInput});
      `);
      const output = runner();
      const serialized = typeof output === 'object' ? JSON.stringify(output) : String(output);
      const passed = serialized.trim() === activeLesson.challenge.expectedOutput.trim();

      setCodeRunResult({
        passed,
        message: passed
          ? `✓ All test assertions passed! Output matched: ${serialized}`
          : `✗ Test failed. Expected: ${activeLesson.challenge.expectedOutput}, Received: ${serialized}`,
      });

      if (passed) cyberAudio.playSuccess();
    } catch (err: any) {
      setCodeRunResult({
        passed: false,
        message: `Execution Error: ${err.message}`,
      });
    }
  };

  const handleMarkLessonComplete = async () => {
    if (!activeLesson) return;
    cyberAudio.playSuccess();
    setIsCompleted(true);
    const updated = await api.saveLearningProgress({
      lessonId: activeLesson.id,
      trackId: activeLesson.trackId,
      markCompleted: true,
    });
    setProgress(updated);
    if (onLessonCompleted) onLessonCompleted(activeLesson.id);
  };

  const handleNavigateSibling = async (lessonId?: string) => {
    if (!lessonId) return;
    const sibling = await api.getLesson(lessonId);
    if (sibling) openLesson(sibling);
  };

  const currentTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];

  const getTrackIcon = (id: string) => {
    switch (id) {
      case 'frontend': return <Layout size={18} />;
      case 'backend': return <Server size={18} />;
      case 'fullstack': return <Layers size={18} />;
      case 'dsa': return <Cpu size={18} />;
      default: return <BookOpen size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-[#A8B0BC]">
        <div className="flex items-center gap-3">
          <Sparkles className="animate-spin text-[#245BFF]" size={20} />
          <span className="text-sm">Loading learning curriculum...</span>
        </div>
      </div>
    );
  }

  // --- FULL-SCREEN LESSON READER ---
  if (activeLesson) {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#273244]">
          <button
            onClick={() => setActiveLesson(null)}
            className="flex items-center gap-2 text-xs font-semibold text-[#8DA7FF] hover:text-white transition"
          >
            <ChevronLeft size={16} /> Back to {currentTrack?.title || 'Tracks'}
          </button>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#245BFF]/15 border border-[#245BFF]/35 text-[#8DA7FF] uppercase">
              {activeLesson.moduleName}
            </span>
            <span className="text-xs text-[#727E8F] flex items-center gap-1 font-mono">
              <Clock size={13} /> {activeLesson.estimatedMinutes} min
            </span>
          </div>
        </div>

        {/* Lesson Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              activeLesson.difficulty === 'Beginner' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
              activeLesson.difficulty === 'Intermediate' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
              'bg-purple-500/15 text-purple-400 border border-purple-500/30'
            }`}>
              {activeLesson.difficulty}
            </span>
            {isCompleted && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B7FF32]/15 text-[#B7FF32] border border-[#B7FF32]/30 flex items-center gap-1">
                <CheckCircle2 size={11} /> Mastered (+100 XP)
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-serif-title text-white tracking-tight">
            {activeLesson.title}
          </h1>
          <p className="text-sm md:text-base text-[#A8B0BC] leading-relaxed max-w-3xl">
            {activeLesson.introduction}
          </p>
        </div>

        {/* 1. Learning Objectives */}
        <section className="rounded-2xl border border-[#273244] bg-[#101722] p-6 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#B7FF32]">
            <Target size={15} /> Learning Objectives
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {activeLesson.objectives.map((obj, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#E1E7EF] bg-[#080B10] border border-[#273244] p-3 rounded-xl">
                <CheckCircle2 size={14} className="text-[#8DA7FF] shrink-0 mt-0.5" />
                <span>{obj}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 2. Detailed Explanation */}
        <section className="rounded-2xl border border-[#273244] bg-[#101722] p-6 md:p-8 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-[#8DA7FF]" /> Deep Dive & Theoretical Foundations
          </h2>
          <div className="text-sm text-[#A8B0BC] leading-relaxed space-y-3">
            <p>{activeLesson.explanation}</p>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="pt-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#727E8F]">
              Step-by-Step Mechanics
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {activeLesson.stepByStepBreakdown.map((item) => (
                <div key={item.step} className="p-4 rounded-xl bg-[#080B10] border border-[#273244] space-y-1">
                  <div className="text-xs font-bold text-[#8DA7FF] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#245BFF]/20 flex items-center justify-center text-[10px]">
                      {item.step}
                    </span>
                    {item.title}
                  </div>
                  <p className="text-xs text-[#A8B0BC] leading-relaxed pl-7">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Syntax & Code Examples with Line Explanations */}
        <section className="rounded-2xl border border-[#273244] bg-[#101722] overflow-hidden">
          <div className="p-4 px-6 border-b border-[#273244] flex items-center justify-between bg-[#0B111A]">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300">
              <Code2 size={16} /> Syntax & Architecture Implementation
            </div>
            <span className="text-[11px] font-mono text-[#727E8F]">production-pattern.js</span>
          </div>

          <div className="p-6 space-y-4">
            <div className="rounded-xl bg-[#080B10] border border-[#273244] p-4 overflow-x-auto">
              <pre className="text-xs font-mono text-cyan-200 leading-relaxed">
                <code>{activeLesson.syntaxCode}</code>
              </pre>
            </div>

            {/* Code Breakdown */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-white uppercase tracking-wider">
                Critical Code Annotations
              </div>
              <div className="space-y-2">
                {activeLesson.codeExplanation.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl bg-[#080B10] border border-[#273244] text-xs">
                    <code className="font-mono text-amber-300 bg-black/40 px-2 py-0.5 rounded shrink-0">
                      {item.lineOrSection}
                    </code>
                    <span className="text-[#A8B0BC]">{item.explanation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Output */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-[#273244] text-xs font-mono">
              <span className="text-[#B7FF32] font-bold">Expected Output: </span>
              <span className="text-slate-300">{activeLesson.expectedOutput}</span>
            </div>
          </div>
        </section>

        {/* 4. Real-World Applications & Best Practices Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#273244] bg-[#101722] p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Sparkles size={15} /> Real-World Impact
            </div>
            <ul className="space-y-2 text-xs text-[#A8B0BC]">
              {activeLesson.realWorldApplications.map((app, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{app}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <AlertTriangle size={15} /> Traps & Common Mistakes
            </div>
            <ul className="space-y-2 text-xs text-[#A8B0BC]">
              {activeLesson.commonMistakes.map((mis, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">✗</span>
                  <span>{mis}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Lightbulb size={15} /> Clean Code Best Practices
            </div>
            <ul className="space-y-2 text-xs text-[#A8B0BC]">
              {activeLesson.bestPractices.map((bp, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 5. Knowledge-Check Quiz */}
        {activeLesson.quiz && activeLesson.quiz.length > 0 && (
          <section className="rounded-2xl border border-[#273244] bg-[#101722] p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-[#273244] pb-4">
              <div>
                <h3 className="font-bold text-white text-lg">Concept Mastery Quiz</h3>
                <p className="text-xs text-[#727E8F] mt-0.5">Verify your retention before moving to practical code.</p>
              </div>
              <span className="text-xs font-mono text-[#8DA7FF] bg-[#245BFF]/15 px-3 py-1 rounded-full">
                {activeLesson.quiz.length} Questions
              </span>
            </div>

            <div className="space-y-6">
              {activeLesson.quiz.map((q, idx) => {
                const userAns = selectedQuizAnswers[q.id];
                const isCorrect = userAns === q.correctAnswer;
                return (
                  <div key={q.id} className="space-y-3">
                    <div className="text-sm font-semibold text-white">
                      {idx + 1}. {q.question}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userAns === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleQuizSelect(q.id, optIdx)}
                            className={`p-3 rounded-xl border text-left text-xs transition flex items-start gap-2.5 ${
                              quizSubmitted
                                ? optIdx === q.correctAnswer
                                  ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200'
                                  : isSelected
                                  ? 'bg-rose-950/50 border-rose-500 text-rose-200'
                                  : 'bg-[#080B10] border-[#273244] text-[#727E8F]'
                                : isSelected
                                ? 'bg-[#245BFF]/25 border-[#245BFF] text-white shadow-glow-blue'
                                : 'bg-[#080B10] border-[#273244] text-[#A8B0BC] hover:border-[#536078]'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-full bg-black/40 border border-current flex items-center justify-center shrink-0 font-mono text-[10px]">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className={`p-3 rounded-xl text-xs ${isCorrect ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'}`}>
                        <span className="font-bold">{isCorrect ? 'Correct! ' : 'Incorrect. '}</span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted ? (
              <button
                disabled={Object.keys(selectedQuizAnswers).length < activeLesson.quiz.length}
                onClick={handleQuizSubmit}
                className="cyber-button-primary px-6 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-40"
              >
                <span>Submit Quiz & View Explanations</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 size={16} /> Quiz responses evaluated and saved.
              </div>
            )}
          </section>
        )}

        {/* 6. In-Lesson Interactive Coding Playground */}
        <section className="rounded-2xl border border-violet-500/35 bg-[#101722] overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#273244]">
            <div>
              <div className="text-xs uppercase font-mono tracking-wider text-violet-400 font-bold flex items-center gap-1.5">
                <Code2 size={15} /> Hands-On Code Challenge
              </div>
              <h3 className="text-lg font-bold text-white mt-1">{activeLesson.challenge.title}</h3>
            </div>
            <button
              onClick={() => setChallengeCode(activeLesson.challenge.starterCode)}
              className="text-xs text-[#727E8F] hover:text-white flex items-center gap-1"
            >
              <RotateCcw size={12} /> Reset Starter Code
            </button>
          </div>

          <p className="text-xs text-[#A8B0BC] leading-relaxed">
            {activeLesson.challenge.description}
          </p>

          <div className="rounded-xl bg-[#090d1e] border border-violet-500/25 overflow-hidden">
            <textarea
              value={challengeCode}
              onChange={(e) => setChallengeCode(e.target.value)}
              spellCheck={false}
              rows={8}
              className="w-full p-4 bg-transparent font-mono text-xs text-cyan-200 outline-none resize-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#727E8F] font-mono">
              Expected output for assertion test: <code className="text-[#B7FF32]">{activeLesson.challenge.expectedOutput}</code>
            </div>
            <button
              onClick={handleRunChallengeCode}
              className="cyber-button-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            >
              <Play size={14} className="fill-white" /> Run In-Lesson Sandbox
            </button>
          </div>

          {codeRunResult && (
            <div className={`p-4 rounded-xl text-xs font-mono border ${
              codeRunResult.passed ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-rose-950/40 border-rose-500 text-rose-200'
            }`}>
              {codeRunResult.message}
            </div>
          )}
        </section>

        {/* 7. Bottom Action Bar: Complete & Sibling Navigation */}
        <div className="p-6 rounded-2xl border border-[#273244] bg-[#101722] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleMarkLessonComplete}
              disabled={isCompleted}
              className={`px-6 py-3 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                  : 'cyber-button-primary text-white shadow-glow-blue'
              }`}
            >
              <CheckCircle2 size={16} />
              {isCompleted ? 'Lesson Completed (+100 XP)' : 'Mark Lesson as Completed (+100 XP)'}
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              disabled={!activeLesson.prevLessonId}
              onClick={() => handleNavigateSibling(activeLesson.prevLessonId)}
              className="px-4 py-2.5 rounded-xl border border-[#273244] bg-[#080B10] text-xs font-semibold text-[#A8B0BC] hover:text-white disabled:opacity-30 disabled:hover:text-[#A8B0BC] flex items-center gap-1.5"
            >
              <ChevronLeft size={15} /> Previous Lesson
            </button>
            <button
              disabled={!activeLesson.nextLessonId}
              onClick={() => handleNavigateSibling(activeLesson.nextLessonId)}
              className="px-4 py-2.5 rounded-xl border border-[#273244] bg-[#080B10] text-xs font-semibold text-[#8DA7FF] hover:text-white disabled:opacity-30 disabled:hover:text-[#8DA7FF] flex items-center gap-1.5"
            >
              Next Lesson <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- TRACKS & CURRICULUM EXPLORER ---
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title & Track Selector */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[.18em] text-[#8DA7FF] mb-2 font-semibold">
            Structured Engineering Curriculum
          </div>
          <h1 className="text-3xl md:text-4xl font-serif-title text-white">
            My Learning Tracks<span className="text-[#B7FF32]">.</span>
          </h1>
          <p className="text-sm text-[#A8B0BC] mt-1.5 max-w-2xl leading-relaxed">
            Every topic includes in-depth tutorials, architectural syntax breakdowns, interactive quizzes, and coding sandboxes.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search size={15} className="absolute left-3.5 top-3 text-[#536078]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lessons or topics..."
            className="w-full rounded-xl bg-[#101722] border border-[#273244] pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#536078] outline-none focus:border-[#245BFF]"
          />
        </div>
      </div>

      {/* Additional course library for the technologies in the placement roadmap */}
      <section className="space-y-4 rounded-2xl border border-[#273244] bg-[#101722] p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-[#8DA7FF]"><GraduationCap size={15} /> Course Library</div>
            <h2 className="mt-1 text-xl font-bold text-white">Explore the skills you need</h2>
            <p className="mt-1 text-xs text-[#8D9AAF]">Learn inside CareerPilot X with topic notes, practical exercises and saved lesson progress. External references are optional.</p>
          </div>
          <input value={courseSearch} onChange={(event) => setCourseSearch(event.target.value)} placeholder="Search courses…" className="w-full rounded-xl border border-[#273244] bg-[#080B10] px-4 py-2.5 text-xs text-white outline-none focus:border-[#245BFF] md:w-56" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', 'Programming', 'Frontend', 'Backend', 'Databases', 'Core CS', 'AI/ML'].map((category) => (
            <button key={category} onClick={() => setCourseCategory(category)} className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${courseCategory === category ? 'bg-[#245BFF] text-white' : 'border border-[#273244] bg-[#0B1422] text-[#A8B0BC] hover:border-[#536078]'}`}>{category}</button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {COURSE_REFERENCES.filter((course) =>
            (courseCategory === 'All' || course.category === courseCategory) &&
            (!courseSearch.trim() || `${course.title} ${course.description} ${course.category}`.toLowerCase().includes(courseSearch.toLowerCase()))
          ).map((course) => (
            <article key={course.title} className="rounded-xl border border-[#273244] bg-[#0B1422] p-4 transition hover:border-[#536078]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8DA7FF]">{course.category}</span>
                  <h3 className="mt-1 text-sm font-bold text-white">{course.title}</h3>
                </div>
                <span className="rounded-md bg-[#162133] px-2 py-1 text-[9px] text-[#A8B0BC]">{course.level}</span>
              </div>
              <p className="mt-2 min-h-10 text-xs leading-5 text-[#8D9AAF]">{course.description}</p>
              <button type="button" onClick={() => { setSelectedCourse(course); setSelectedCourseLesson(0); }} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8DA7FF] hover:text-white">
                Start in-app lessons <ChevronRight size={13} />
              </button>
              <a href={course.url} target="_blank" rel="noreferrer" className="ml-4 inline-flex items-center gap-1.5 text-[11px] text-[#71819A] hover:text-white">
                Reference <ExternalLink size={11} />
              </a>
            </article>
          ))}
        </div>
      </section>

      {selectedCourse && (
        <section className="rounded-2xl border border-[#245BFF]/40 bg-[#101722] p-5 md:p-7 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <button type="button" onClick={() => setSelectedCourse(null)} className="mb-3 inline-flex items-center gap-1 text-xs text-[#8DA7FF] hover:text-white"><ChevronLeft size={14} /> Back to course library</button>
              <div className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#8DA7FF]">{selectedCourse.category} · {selectedCourse.level}</div>
              <h2 className="mt-1 text-2xl font-bold text-white">{selectedCourse.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#A8B0BC]">{selectedCourse.description}</p>
            </div>
            <div className="rounded-xl border border-[#273244] bg-[#0B1422] px-4 py-3 text-right">
              <div className="text-[10px] uppercase tracking-wider text-[#71819A]">Course progress</div>
              <div className="mt-1 text-xl font-bold text-white">{(COURSE_LESSONS[selectedCourse.title] || []).filter((_, index) => progress.completedLessons.includes(`catalog-${selectedCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`)).length}/{(COURSE_LESSONS[selectedCourse.title] || []).length}</div>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <div className="space-y-2">
              {(COURSE_LESSONS[selectedCourse.title] || []).map((lesson, index) => {
                const id = `catalog-${selectedCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`;
                const done = progress.completedLessons.includes(id);
                return <button key={id} type="button" onClick={() => setSelectedCourseLesson(index)} className={`w-full rounded-xl border p-3 text-left transition ${selectedCourseLesson === index ? 'border-[#245BFF] bg-[#245BFF]/15' : 'border-[#273244] bg-[#0B1422] hover:border-[#536078]'}`}>
                  <span className="flex items-center justify-between gap-2"><span className="text-[10px] uppercase tracking-wider text-[#71819A]">Lesson {index + 1}</span>{done && <CheckCircle2 size={14} className="text-emerald-400" />}</span>
                  <span className="mt-1 block text-xs font-semibold text-white">{lesson.title}</span>
                </button>;
              })}
            </div>
            <div className="rounded-xl border border-[#273244] bg-[#0B1422] p-5 md:p-6">
              {(() => {
                const lesson = (COURSE_LESSONS[selectedCourse.title] || [])[selectedCourseLesson];
                if (!lesson) return <p className="text-sm text-[#A8B0BC]">Lesson content is not available.</p>;
                const lessonId = `catalog-${selectedCourse.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${selectedCourseLesson + 1}`;
                const completed = progress.completedLessons.includes(lessonId);
                return <>
                  <div className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#8DA7FF]">Lesson {selectedCourseLesson + 1}</div>
                  <h3 className="mt-2 text-xl font-bold text-white">{lesson.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-[#C3CCDA]">{lesson.explanation}</p>
                  <div className="mt-5 rounded-xl border border-[#273244] bg-[#101722] p-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#B7FF32]"><Target size={14} /> Try it yourself</div>
                    <p className="mt-2 text-sm leading-6 text-[#A8B0BC]">{lesson.exercise}</p>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <button type="button" disabled={selectedCourseLesson === 0} onClick={() => setSelectedCourseLesson((value) => Math.max(0, value - 1))} className="rounded-lg border border-[#273244] px-3 py-2 text-xs text-[#A8B0BC] disabled:opacity-40">Previous lesson</button>
                    <div className="flex flex-wrap gap-2">
                      <a href={selectedCourse.url} target="_blank" rel="noreferrer" className="rounded-lg border border-[#273244] px-3 py-2 text-xs text-[#A8B0BC] hover:text-white">More reference <ExternalLink size={11} className="ml-1 inline" /></a>
                      <button type="button" disabled={completed || courseSaving} onClick={async () => {
                        try {
                          setCourseSaving(true);
                          const updated = await api.saveLearningProgress({ lessonId, trackId: 'fullstack', markCompleted: true, studyMinutes: 15 });
                          const refreshed = await api.getLearningProgress();
                          setProgress(refreshed.completedLessons.length >= updated.completedLessons.length ? refreshed : updated);
                        } catch (error) { console.error('Could not save course progress:', error); }
                        finally { setCourseSaving(false); }
                      }} className="rounded-lg bg-[#245BFF] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{completed ? 'Completed' : courseSaving ? 'Saving…' : 'Mark lesson complete'}</button>
                    </div>
                    <button type="button" disabled={selectedCourseLesson >= (COURSE_LESSONS[selectedCourse.title] || []).length - 1} onClick={() => setSelectedCourseLesson((value) => Math.min((COURSE_LESSONS[selectedCourse.title] || []).length - 1, value + 1))} className="rounded-lg border border-[#273244] px-3 py-2 text-xs text-[#A8B0BC] disabled:opacity-40">Next lesson</button>
                  </div>
                </>;
              })()}
            </div>
          </div>
        </section>
      )}

      {/* Track Selection Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tracks.map((track) => {
          const isSelected = track.id === selectedTrackId;
          const completedInTrack = track.modules.flatMap(m => m.lessonIds).filter(id => progress.completedLessons.includes(id)).length;
          const totalInTrack = track.modules.flatMap(m => m.lessonIds).length;
          const pct = Math.round((completedInTrack / Math.max(1, totalInTrack)) * 100);

          return (
            <button
              key={track.id}
              onClick={() => {
                cyberAudio.playClick();
                setSelectedTrackId(track.id);
              }}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between h-32 ${
                isSelected
                  ? 'bg-gradient-to-br from-[#101b34] to-[#101722] border-[#245BFF] shadow-glow-blue'
                  : 'bg-[#101722] border-[#273244] hover:border-[#536078]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`p-2 rounded-xl ${isSelected ? 'bg-[#245BFF] text-white' : 'bg-[#151E2B] text-[#8DA7FF]'}`}>
                  {getTrackIcon(track.id)}
                </span>
                <span className="text-[11px] font-mono text-[#727E8F]">{track.estimatedHours}h</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{track.title}</div>
                <div className="text-[11px] text-[#A8B0BC] mt-1 flex items-center justify-between">
                  <span>{completedInTrack}/{totalInTrack} lessons</span>
                  <span className="font-mono text-[#B7FF32]">{pct}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modules & Lessons List for Selected Track */}
      {currentTrack && (
        <div className="space-y-6">
          {currentTrack.modules.map((mod) => {
            const filteredLessonIds = mod.lessonIds.filter((lid) => {
              if (!searchQuery.trim()) return true;
              return lid.toLowerCase().includes(searchQuery.toLowerCase()) || mod.name.toLowerCase().includes(searchQuery.toLowerCase());
            });

            if (filteredLessonIds.length === 0) return null;

            return (
              <div key={mod.id} className="rounded-2xl border border-[#273244] bg-[#101722] overflow-hidden">
                <div className="p-5 border-b border-[#273244] bg-[radial-gradient(circle_at_95%_0%,rgba(36,91,255,.12),transparent_35%)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{mod.name}</h3>
                      <p className="text-xs text-[#A8B0BC] mt-0.5">{mod.description}</p>
                    </div>
                    <span className="text-xs font-mono text-[#8DA7FF] bg-[#245BFF]/10 px-3 py-1 rounded-full self-start sm:self-auto border border-[#245BFF]/30">
                      {mod.lessonIds.length} Core Lessons
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-[#1D2533]">
                  {filteredLessonIds.map((lessonId) => {
                    const isDone = progress.completedLessons.includes(lessonId);
                    return (
                      <div
                        key={lessonId}
                        onClick={async () => {
                          const l = await api.getLesson(lessonId);
                          if (l) openLesson(l);
                        }}
                        className="p-4 md:px-6 flex items-center justify-between hover:bg-[#151E2B] transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                            isDone ? 'bg-[#B7FF32]/20 border-[#B7FF32] text-[#B7FF32]' : 'bg-[#080B10] border-[#273244] text-[#727E8F]'
                          }`}>
                            <CheckCircle2 size={16} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white group-hover:text-[#8DA7FF] transition truncate">
                              {lessonId.replace(/^fe-|^be-|^fs-|^dsa-/, '').split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                            </div>
                            <div className="text-[11px] text-[#727E8F] flex items-center gap-2 mt-0.5">
                              <span>Interactive Tutorial</span>
                              <span>•</span>
                              <span>Hands-on Code</span>
                              <span>•</span>
                              <span>Quiz</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isDone ? (
                            <span className="text-[10px] font-mono text-[#B7FF32] uppercase tracking-wider hidden sm:inline">
                              Completed
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-[#8DA7FF] uppercase tracking-wider hidden sm:inline">
                              Start Lesson
                            </span>
                          )}
                          <ChevronRight size={16} className="text-[#536078] group-hover:text-white transition" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
