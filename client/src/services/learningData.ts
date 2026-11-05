import { TrackInfo, LessonDetail } from '../types';

export const TRACKS_DATA: TrackInfo[] = [
  {
    id: 'frontend',
    title: 'Frontend Development',
    description: 'Master modern semantic HTML5, responsive CSS3, modern ESNext JavaScript, TypeScript, and production React 18+ architecture.',
    icon: 'Layout',
    estimatedHours: 90,
    modules: [
      {
        id: 'html',
        name: 'HTML & Semantic Structure',
        description: 'Document structure, accessibility, semantic markup, and forms.',
        lessonIds: [
          'fe-html-intro',
          'fe-html-doc-structure',
          'fe-html-elements-attrs',
          'fe-html-headings-paragraphs',
          'fe-html-links-images',
          'fe-html-lists-tables',
          'fe-html-forms-validation',
          'fe-html-semantics',
          'fe-html-accessibility',
          'fe-html-seo',
        ],
      },
      {
        id: 'css',
        name: 'CSS & Modern Styling',
        description: 'Box model, Flexbox, CSS Grid, animations, and responsive architecture.',
        lessonIds: [
          'fe-css-intro',
          'fe-css-selectors-specificity',
          'fe-css-box-model',
          'fe-css-colors-typography',
          'fe-css-display-positioning',
          'fe-css-flexbox',
          'fe-css-grid',
          'fe-css-responsive-media',
          'fe-css-transitions-animations',
          'fe-css-architecture',
        ],
      },
      {
        id: 'javascript',
        name: 'JavaScript & Web Runtimes',
        description: 'Variables, closures, async/await, DOM, and event loop.',
        lessonIds: [
          'fe-js-variables-types',
          'fe-js-operators-conditions',
          'fe-js-loops',
          'fe-js-functions-scope',
          'fe-js-arrays-objects',
          'fe-js-array-methods',
          'fe-js-dom-manipulation',
          'fe-js-events',
          'fe-js-closures-hoisting',
          'fe-js-this-prototypes',
          'fe-js-promises-async',
          'fe-js-fetch-storage',
        ],
      },
      {
        id: 'typescript',
        name: 'TypeScript for Scalable UI',
        description: 'Static typing, interfaces, generics, and React integration.',
        lessonIds: [
          'fe-ts-basics',
          'fe-ts-interfaces-types',
          'fe-ts-generics',
          'fe-ts-react-integration',
        ],
      },
      {
        id: 'react',
        name: 'React 18 Architecture',
        description: 'Components, hooks, state, routing, and performance optimization.',
        lessonIds: [
          'fe-react-intro-jsx',
          'fe-react-components-props',
          'fe-react-state-events',
          'fe-react-hooks-useeffect',
          'fe-react-useref-context',
          'fe-react-custom-hooks',
          'fe-react-router-apis',
          'fe-react-performance',
        ],
      },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Development',
    description: 'Build enterprise-grade REST APIs, asynchronous microservices, MongoDB and SQL database layers, and secure JWT authentication.',
    icon: 'Server',
    estimatedHours: 110,
    modules: [
      {
        id: 'nodejs',
        name: 'Node.js & Event Loop',
        description: 'V8 runtime, libuv event loop, modules, filesystem, and streams.',
        lessonIds: [
          'be-node-intro',
          'be-node-event-loop',
          'be-node-modules-npm',
          'be-node-fs-streams',
          'be-node-async-errors',
        ],
      },
      {
        id: 'express',
        name: 'Express.js & REST APIs',
        description: 'Routing, middleware pipelines, validation, error handling, and security.',
        lessonIds: [
          'be-express-server-routing',
          'be-express-middleware',
          'be-express-rest-crud',
          'be-express-validation-errors',
        ],
      },
      {
        id: 'databases',
        name: 'Databases: SQL & MongoDB',
        description: 'Data modeling, Mongoose ODM, indexing, aggregation, and transactions.',
        lessonIds: [
          'be-db-sql-fundamentals',
          'be-db-mongodb-mongoose',
          'be-db-schema-relationships',
          'be-db-indexing-performance',
        ],
      },
      {
        id: 'advanced-backend',
        name: 'Backend Security & DevOps',
        description: 'JWT authentication, password hashing, rate limiting, and deployment.',
        lessonIds: [
          'be-sec-jwt-auth',
          'be-sec-passwords-hashing',
          'be-sec-api-hardening',
          'be-ops-deployment-docker',
        ],
      },
    ],
  },
  {
    id: 'fullstack',
    title: 'Full-Stack Development',
    description: 'Bridge frontend and backend: end-to-end architecture, secure API integrations, state sync, full-stack deployment, and monitoring.',
    icon: 'Layers',
    estimatedHours: 120,
    modules: [
      {
        id: 'fs-architecture',
        name: 'Full-Stack Architecture & Integration',
        description: 'Client-server communications, token lifecycles, and state synchronization.',
        lessonIds: [
          'fs-arch-overview',
          'fs-connecting-react-express',
          'fs-auth-flow-jwt-cookies',
          'fs-crud-fullstack',
          'fs-validation-end-to-end',
          'fs-websockets-realtime',
          'fs-production-deployment',
        ],
      },
    ],
  },
  {
    id: 'dsa',
    title: 'DSA & Technical Problem Solving',
    description: 'Ace technical whiteboard interviews: Big-O analysis, linked lists, binary trees, dynamic programming, and system design patterns.',
    icon: 'Cpu',
    estimatedHours: 85,
    modules: [
      {
        id: 'dsa-foundations',
        name: 'Complexity & Linear Data Structures',
        description: 'Big-O notation, arrays, two pointers, sliding window, stacks, and queues.',
        lessonIds: [
          'dsa-big-o-analysis',
          'dsa-arrays-two-pointers',
          'dsa-sliding-window',
          'dsa-stacks-queues',
          'dsa-linked-lists',
        ],
      },
      {
        id: 'dsa-trees-graphs',
        name: 'Non-Linear Structures & Algorithms',
        description: 'Binary trees, BST traversal, heaps, graphs (BFS/DFS), and dynamic programming.',
        lessonIds: [
          'dsa-binary-trees-dfs-bfs',
          'dsa-bst-operations',
          'dsa-heaps-priority-queues',
          'dsa-graphs-traversal',
          'dsa-dynamic-programming',
        ],
      },
    ],
  },
];

export const LESSONS_MAP: Record<string, LessonDetail> = {
  'fe-html-intro': {
    id: 'fe-html-intro',
    trackId: 'frontend',
    moduleId: 'html',
    moduleName: 'HTML & Semantic Structure',
    title: 'Introduction to HTML & The Web',
    order: 1,
    estimatedMinutes: 15,
    difficulty: 'Beginner',
    introduction: 'HyperText Markup Language (HTML) is the ubiquitous skeletal foundation of every web application on the Internet. It instructs web browsers on how to parse, structure, and display content to users.',
    objectives: [
      'Understand how browsers interpret HTML files into the Document Object Model (DOM).',
      'Learn the difference between tags, elements, and attributes.',
      'Construct a syntactically correct HTML5 starter document from scratch.',
    ],
    explanation: 'HTML is not a programming language; it is a markup language consisting of a hierarchy of elements. When a browser fetches an HTML document from a web server via HTTP/HTTPS, the browser rendering engine parses the raw character stream into tokens, builds nodes, and constructs the DOM tree. Each element tells the browser what kind of content it represents—headings, paragraphs, media, buttons, or structured interactive inputs.',
    stepByStepBreakdown: [
      { step: 1, title: 'Document Type Declaration', detail: '<!DOCTYPE html> tells the browser rendering engine to parse the file using modern HTML5 standard.' },
      { step: 2, title: 'Root HTML Element', detail: 'The <html lang="en"> wraps all content and defines the primary human language for screen readers.' },
      { step: 3, title: 'Metadata Container', detail: 'The <head> contains character encoding (UTF-8), viewport scaling settings, and title.' },
      { step: 4, title: 'Renderable Body', detail: 'The <body> contains visual elements rendered on the viewport for human users.' },
    ],
    syntaxCode: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CareerPilot X — Engineering Foundations</title>
  </head>
  <body>
    <header>
      <h1>Welcome to Modern Web Engineering</h1>
      <p>Building high-performance software begins with structured HTML.</p>
    </header>
  </body>
</html>`,
    codeExplanation: [
      { lineOrSection: '<!DOCTYPE html>', explanation: 'Forces modern standards mode in browsers.' },
      { lineOrSection: '<meta name="viewport"...>', explanation: 'Ensures the page scales proportionally on mobile devices and prevents desktop zoom-out.' },
      { lineOrSection: '<header>', explanation: 'A semantic container indicating introductory content.' },
    ],
    expectedOutput: 'A clean document containing a top-level heading "Welcome to Modern Web Engineering" and a descriptive subtext paragraph.',
    realWorldApplications: [
      'Web accessibility (a11y) for screen readers like NVDA and VoiceOver.',
      'Search Engine Optimization (SEO) bots parsing headings to rank your software products.',
      'Progressive Web Apps (PWAs) caching shell markup for offline execution.',
    ],
    commonMistakes: [
      'Omitting <!DOCTYPE html>, causing unpredictable CSS rendering bugs.',
      'Using multiple <h1> tags on a single page, which degrades SEO ranking structure.',
      'Forgetting the viewport meta tag, resulting in tiny unreadable text on mobile screens.',
    ],
    bestPractices: [
      'Always specify the lang attribute on <html>.',
      'Use lowercase tag and attribute names for consistency.',
      'Ensure every opened tag is properly closed or self-closing.',
    ],
    practicalExercise: 'Create an HTML document for a developer portfolio with a header, navigation bar with three links, and an article section describing your first software project.',
    quiz: [
      {
        id: 'q1',
        question: 'What is the primary function of <!DOCTYPE html>?',
        options: [
          'It connects the document to an external JavaScript engine.',
          'It instructs the browser to render the page using standard HTML5 mode.',
          'It encrypts the HTML source code over HTTPS.',
          'It creates an automated backup of the page.',
        ],
        correctAnswer: 1,
        explanation: '<!DOCTYPE html> is the HTML5 doctype declaration. Without it, browsers enter quirks mode where CSS box model and layout rules behave unpredictably.',
      },
      {
        id: 'q2',
        question: 'Which tag should contain metadata like character encoding and viewport settings?',
        options: ['<body>', '<main>', '<head>', '<footer>'],
        correctAnswer: 2,
        explanation: 'The <head> tag is reserved for metadata, scripts, stylesheets, and titles that configure the browser and search engines without rendering directly in the viewport.',
      },
    ],
    challenge: {
      title: 'HTML Structure Verifier',
      description: 'Write a function `validateDocStructure(htmlString)` that checks if an HTML string contains <!DOCTYPE html>, <html>, <head>, and <body> tags in correct order.',
      starterCode: `function validateDocStructure(html) {
  const lower = html.toLowerCase();
  return lower.includes('<!doctype html>') &&
         lower.includes('<html') && lower.includes('</html>') &&
         lower.includes('<head') && lower.includes('</head>') &&
         lower.includes('<body') && lower.includes('</body>');
}`,
      expectedOutput: 'true',
      testInput: 'validateDocStructure("<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1></body></html>")',
      hints: ['Use string includes to detect required structural tags.'],
      solutionCode: `function validateDocStructure(html) {
  const lower = html.toLowerCase();
  return lower.includes('<!doctype html>') &&
         lower.includes('<html') && lower.includes('</html>') &&
         lower.includes('<head') && lower.includes('</head>') &&
         lower.includes('<body') && lower.includes('</body>');
}`,
    },
    nextLessonId: 'fe-html-doc-structure',
  },

  'fe-html-doc-structure': {
    id: 'fe-html-doc-structure',
    trackId: 'frontend',
    moduleId: 'html',
    moduleName: 'HTML & Semantic Structure',
    title: 'Document Structure & Semantic Tags',
    order: 2,
    estimatedMinutes: 20,
    difficulty: 'Beginner',
    introduction: 'Semantic HTML introduces meaningful tags like <header>, <nav>, <main>, <article>, <section>, and <footer>. These convey architectural meaning to browsers, assistive technologies, and search engines.',
    objectives: [
      'Distinguish between non-semantic container tags (div, span) and semantic structural tags.',
      'Organize a modern landing page layout using standard HTML5 landmarks.',
      'Improve accessibility scores by providing proper landmarks for assistive technologies.',
    ],
    explanation: 'Before HTML5, web layouts were built using deeply nested generic <div> tags with arbitrary class names like <div class="nav-bar">. Modern browsers recognize standardized landmark elements. Screen readers enable visually impaired users to jump directly to <main> or skip repetitive navigational headers. Furthermore, search engine crawlers rely on semantic markers to index the most relevant content.',
    stepByStepBreakdown: [
      { step: 1, title: '<header>', detail: 'Represents introductory content, typically containing logos, branding, and navigation.' },
      { step: 2, title: '<nav>', detail: 'Encapsulates major navigation links (menus, table of contents).' },
      { step: 3, title: '<main>', detail: 'Contains the dominant, unique content of the document. A page must have only one <main> element without hidden attributes.' },
      { step: 4, title: '<section> vs <article>', detail: '<article> represents an independent, self-contained piece of content. <section> groups related thematic content.' },
      { step: 5, title: '<footer>', detail: 'Contains metadata, copyright, legal links, or author information.' },
    ],
    syntaxCode: `<header>
  <div class="brand">DevPulse</div>
  <nav aria-label="Main Navigation">
    <ul>
      <li><a href="#features">Features</a></li>
      <li><a href="#pricing">Pricing</a></li>
    </ul>
  </nav>
</header>

<main id="primary-content">
  <section id="hero">
    <h1>Supercharge Your Engineering Career</h1>
    <p>Real projects, interactive playgrounds, and AI mentors.</p>
  </section>

  <article class="case-study">
    <h2>How Jane Landed a Senior Role in 90 Days</h2>
    <p>Using adaptive roadmaps and deliberate practice...</p>
  </article>
</main>

<footer>
  <p>&copy; 2026 CareerPilot X. All rights reserved.</p>
</footer>`,
    codeExplanation: [
      { lineOrSection: '<nav aria-label="Main Navigation">', explanation: 'Provides an explicit accessible label for screen readers navigating multiple nav blocks.' },
      { lineOrSection: '<main id="primary-content">', explanation: 'Marks the unique content of the page, allowing skip-to-content links to bypass header.' },
    ],
    expectedOutput: 'A clean, semantic layout with distinct navigational, content, and footer regions.',
    realWorldApplications: [
      'Passing accessibility audits (WCAG 2.1 AA compliance required in enterprise web apps).',
      'High Google Lighthouse SEO & Accessibility scores (100/100).',
    ],
    commonMistakes: [
      'Using multiple <main> elements on a single page.',
      'Wrapping every single paragraph or text block in <section> without an accompanying heading.',
    ],
    bestPractices: [
      'Every <section> should ideally have an associated heading (<h2>-<h6>).',
      'Provide a "Skip to Main Content" link at the very top of your document for keyboard accessibility.',
    ],
    practicalExercise: 'Refactor an old layout built with <div class="header"> and <div class="footer"> into modern HTML5 semantic elements.',
    quiz: [
      {
        id: 'q1',
        question: 'How many <main> elements should be visible on a single HTML document?',
        options: ['Unlimited', 'Exactly one', 'Up to three', 'None; <main> is deprecated'],
        correctAnswer: 1,
        explanation: 'HTML specifications dictate that a document must have no more than one visible <main> element, representing the primary content unique to that page.',
      },
    ],
    challenge: {
      title: 'Count Semantic Landmarks',
      description: 'Create a function `countLandmarks(html)` that counts occurrences of semantic landmark tags.',
      starterCode: `function countLandmarks(html) {
  const tags = ['header', 'nav', 'main', 'section', 'article', 'footer'];
  let total = 0;
  tags.forEach(t => {
    const matches = html.match(new RegExp('<' + t + '(\\\\s|>|$)', 'gi'));
    if (matches) total += matches.length;
  });
  return total;
}`,
      expectedOutput: '4',
      testInput: 'countLandmarks("<header><nav></nav></header><main><section></section></main>")',
      hints: ['Use regex matching to detect opening tags.'],
      solutionCode: `function countLandmarks(html) {
  const tags = ['header', 'nav', 'main', 'section', 'article', 'footer'];
  let total = 0;
  tags.forEach(t => {
    const matches = html.match(new RegExp('<' + t + '(\\\\s|>|$)', 'gi'));
    if (matches) total += matches.length;
  });
  return total;
}`,
    },
    prevLessonId: 'fe-html-intro',
    nextLessonId: 'fe-css-box-model',
  },

  'fe-css-box-model': {
    id: 'fe-css-box-model',
    trackId: 'frontend',
    moduleId: 'css',
    moduleName: 'CSS & Modern Styling',
    title: 'The CSS Box Model & Sizing Strategies',
    order: 3,
    estimatedMinutes: 25,
    difficulty: 'Beginner',
    introduction: 'Every single element in CSS is rendered as a rectangular box. Mastering how margins, borders, padding, and content width interact is the most critical fundamental skill in frontend UI design.',
    objectives: [
      'Understand the four concentric layers: Content, Padding, Border, Margin.',
      'Explain the crucial difference between content-box and border-box sizing.',
      'Implement box-sizing: border-box reset across modern web projects.',
    ],
    explanation: 'Under default browser setting `box-sizing: content-box`, when you declare `width: 300px; padding: 20px; border: 5px solid black;`, the actual rendered width of the element on screen is 300 + 20*2 + 5*2 = 350px. By resetting `box-sizing: border-box`, width declarations include padding and border, ensuring predictable column layouts and responsive grids.',
    stepByStepBreakdown: [
      { step: 1, title: 'Content Area', detail: 'Where text, images, or child DOM elements actually reside.' },
      { step: 2, title: 'Padding', detail: 'The transparent breathing room clearing space around content, inside the border.' },
      { step: 3, title: 'Border', detail: 'The stroke wrapping the padding and content.' },
      { step: 4, title: 'Margin', detail: 'Transparent space clearing the area outside the border, separating sibling elements.' },
    ],
    syntaxCode: `/* Modern Global CSS Box-Sizing Reset */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.card {
  width: 320px;
  padding: 24px;
  border: 1px solid #273244;
  background-color: #101722;
  margin: 16px auto;
  border-radius: 12px;
}`,
    codeExplanation: [
      { lineOrSection: '*, *::before, *::after', explanation: 'Universal selector including pseudo-elements to guarantee uniform box-sizing behavior.' },
      { lineOrSection: 'box-sizing: border-box', explanation: 'Guarantees the element’s final rendered width stays exactly 320px regardless of padding.' },
    ],
    expectedOutput: 'A 320px wide card with 24px internal padding that does not overflow its parent container.',
    realWorldApplications: [
      'Building grid systems and responsive components that never break out of column constraints.',
      'Creating interactive cards, modals, and buttons with consistent dimensions.',
    ],
    commonMistakes: [
      'Applying margin collapsing without understanding why vertical margins between blocks merge into the single largest value.',
      'Forgetting that horizontal margins on inline elements work, but vertical margins on pure inline elements (e.g. <span>) are ignored.',
    ],
    bestPractices: [
      'Always include the universal border-box reset at the very beginning of your global CSS.',
      'Prefer padding for internal breathing room and flexbox/grid gap over aggressive margin chains.',
    ],
    practicalExercise: 'Calculate the total rendered width of an element with width: 400px, padding: 30px, border: 2px solid, and margin: 20px under both content-box and border-box modes.',
    quiz: [
      {
        id: 'q1',
        question: 'Under `box-sizing: border-box`, if an element has width: 200px, padding: 20px, and border: 2px, what is its rendered outer width?',
        options: ['244px', '200px', '222px', '160px'],
        correctAnswer: 1,
        explanation: 'With border-box, the declared width (200px) is the total outer width. The padding and border are subtracted internally, leaving 156px for content.',
      },
    ],
    challenge: {
      title: 'Calculate Rendered Dimensions',
      description: 'Write a function `calculateBoxWidth(contentWidth, padding, border, isBorderBox)` returning the total rendered outer width.',
      starterCode: `function calculateBoxWidth(contentWidth, padding, border, isBorderBox) {
  return isBorderBox ? contentWidth : contentWidth + (padding * 2) + (border * 2);
}`,
      expectedOutput: '264',
      testInput: 'calculateBoxWidth(200, 30, 2, false)',
      hints: ['Under content-box, add padding*2 and border*2 to the width.'],
      solutionCode: `function calculateBoxWidth(contentWidth, padding, border, isBorderBox) {
  return isBorderBox ? contentWidth : contentWidth + (padding * 2) + (border * 2);
}`,
    },
    prevLessonId: 'fe-html-doc-structure',
    nextLessonId: 'fe-css-flexbox',
  },

  'fe-css-flexbox': {
    id: 'fe-css-flexbox',
    trackId: 'frontend',
    moduleId: 'css',
    moduleName: 'CSS & Modern Styling',
    title: 'CSS Flexbox: 1D Layout Mastery',
    order: 4,
    estimatedMinutes: 30,
    difficulty: 'Intermediate',
    introduction: 'CSS Flexible Box Layout (Flexbox) provides a powerful, predictable way to distribute space and align items along a single axis (either row or column), even when item sizes are dynamic.',
    objectives: [
      'Master the distinction between Main Axis and Cross Axis.',
      'Control item alignment with justify-content, align-items, and gap.',
      'Understand flex-grow, flex-shrink, and flex-basis sizing algorithm.',
    ],
    explanation: 'Before Flexbox, centering an element vertically required CSS table hacks or absolute positioning with transforms. Flexbox changes this by transforming any container into a flex context (`display: flex`). The container establishes a main axis (governed by `flex-direction`, default `row`) and a perpendicular cross axis (`column`). You can effortlessly distribute spacing and handle responsive card rows.',
    stepByStepBreakdown: [
      { step: 1, title: 'display: flex', detail: 'Initializes the flex formatting context on parent; direct children immediately become flex items.' },
      { step: 2, title: 'justify-content', detail: 'Controls alignment along the MAIN axis (flex-start, center, flex-end, space-between, space-around, space-evenly).' },
      { step: 3, title: 'align-items', detail: 'Controls alignment along the CROSS axis (stretch, center, flex-start, flex-end, baseline).' },
      { step: 4, title: 'gap', detail: 'Modern native property providing clean gutters between items without tricky margin child selectors.' },
    ],
    syntaxCode: `.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #0B111A;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 20px;
  list-style: none;
}

.action-btn {
  flex-shrink: 0;
}`,
    codeExplanation: [
      { lineOrSection: 'justify-content: space-between', explanation: 'Pushes brand logo to the far left and nav items to the far right.' },
      { lineOrSection: 'align-items: center', explanation: 'Vertically centers all navigation elements along the cross axis.' },
      { lineOrSection: 'flex-shrink: 0', explanation: 'Prevents critical action buttons from being squished when screen space shrinks.' },
    ],
    expectedOutput: 'A clean responsive navigation bar with logo on left, centered links, and action button on right.',
    realWorldApplications: [
      'Navigation bars, toolbars, and search input with submit button combos.',
      'Dynamic button bars that adapt to varied translations and label lengths.',
    ],
    commonMistakes: [
      'Trying to use Flexbox for full 2D complex grids (where both rows and columns must align simultaneously; use CSS Grid instead!).',
      'Forgetting that `justify-content` controls vertical alignment when `flex-direction: column` is set.',
    ],
    bestPractices: [
      'Use `gap` instead of `margin-right` on flex children.',
      'Use `margin-left: auto` inside a flex container to push an individual item all the way to the right.',
    ],
    practicalExercise: 'Build a mobile-responsive navbar with logo on the left and 3 navigation links on the right using Flexbox.',
    quiz: [
      {
        id: 'q1',
        question: 'When `flex-direction: column` is set, which property aligns items horizontally?',
        options: ['justify-content', 'align-items', 'text-align', 'align-content'],
        correctAnswer: 1,
        explanation: 'In column direction, the main axis runs vertically, so the cross axis runs horizontally. `align-items` governs cross-axis alignment, thus controlling horizontal alignment.',
      },
    ],
    challenge: {
      title: 'Flex Sizing Calculator',
      description: 'Given container width 500px and 2 items with basis 150px and grow 1, 2, calculate final width of the second item.',
      starterCode: `function getFlexItemWidth(containerWidth, items) {
  const totalBasis = items.reduce((a, b) => a + b.basis, 0);
  const rem = containerWidth - totalBasis;
  const totalGrow = items.reduce((a, b) => a + b.grow, 0);
  return items.map(i => i.basis + (rem * (i.grow / totalGrow)));
}`,
      expectedOutput: '[216.66666666666669,283.3333333333333]',
      testInput: 'JSON.stringify(getFlexItemWidth(500, [{ basis: 150, grow: 1 }, { basis: 150, grow: 2 }]))',
      hints: ['Calculate remaining space = container - totalBasis, then distribute remaining * (grow / totalGrow).'],
      solutionCode: `function getFlexItemWidth(containerWidth, items) {
  const totalBasis = items.reduce((a, b) => a + b.basis, 0);
  const rem = containerWidth - totalBasis;
  const totalGrow = items.reduce((a, b) => a + b.grow, 0);
  return items.map(i => i.basis + (rem * (i.grow / totalGrow)));
}`,
    },
    prevLessonId: 'fe-css-box-model',
    nextLessonId: 'fe-js-variables-types',
  },

  'fe-js-variables-types': {
    id: 'fe-js-variables-types',
    trackId: 'frontend',
    moduleId: 'javascript',
    moduleName: 'JavaScript & Web Runtimes',
    title: 'JavaScript Primitives, References & Scope',
    order: 5,
    estimatedMinutes: 25,
    difficulty: 'Beginner',
    introduction: 'JavaScript is a dynamically typed, prototype-based language. Understanding the fundamental difference between primitive values (stored by value) and reference objects (stored by reference pointer) is the root of writing bug-free code.',
    objectives: [
      'Differentiate between const, let, and var, including temporal dead zone (TDZ).',
      'Understand the 7 primitive types in JS: string, number, bigint, boolean, symbol, undefined, null.',
      'Grasp reference mutation vs value equality.',
    ],
    explanation: 'In JavaScript, primitives are immutable and compared by value. When you assign `let a = 10; let b = a;`, `b` gets a discrete copy. In contrast, Objects, Arrays, and Functions are reference types stored on the heap. When you assign `const user2 = user1;`, both variables hold memory pointers referencing the exact same object in memory! Mutating `user2.name` also mutates `user1.name`.',
    stepByStepBreakdown: [
      { step: 1, title: 'const vs let', detail: 'Use const by default. Use let only when a variable will be reassigned. Avoid legacy var (which hoists without TDZ and leaks out of block scopes).' },
      { step: 2, title: 'Type System', detail: 'typeof null returns "object" (a historical 1995 JS bug). Array is an object. Functions are first-class callable objects.' },
      { step: 3, title: 'Strict Equality', detail: 'Always use === instead of loose == to prevent silent type coercion bugs.' },
    ],
    syntaxCode: `// Primitives (Copied by value)
let score = 100;
let backupScore = score;
backupScore = 200;
console.log(score); // 100 (Unchanged!)

// Reference Types (Copied by reference pointer)
const developer = { name: 'Alex', track: 'Full-Stack' };
const teammate = developer;
teammate.track = 'Frontend';

console.log(developer.track); // 'Frontend' (Mutated!)

// Immutable clone using spread operator
const safeClone = { ...developer, track: 'Backend' };
console.log(developer.track); // Still 'Frontend'`,
    codeExplanation: [
      { lineOrSection: 'let backupScore = score', explanation: 'Creates an independent memory allocation containing the number 100.' },
      { lineOrSection: 'const teammate = developer', explanation: 'Copies the memory address reference, not the underlying object.' },
      { lineOrSection: '{ ...developer }', explanation: 'Creates a shallow copy, allocating a fresh object in heap memory.' },
    ],
    expectedOutput: 'score remains 100; developer.track is mutated to "Frontend"; safeClone remains isolated.',
    realWorldApplications: [
      'React state management: React requires immutable state updates to detect re-renders (prev !== next). Direct mutations break React reconciliation!',
      'Safe API payload formatting.',
    ],
    commonMistakes: [
      'Mutating Redux/Zustand or React state directly with `state.items.push(newItem)` instead of `[...state.items, newItem]`.',
      'Thinking `const obj = {}` prevents property modifications. `const` only prevents variable re-assignment; object properties remain mutable.',
    ],
    bestPractices: [
      'Default to `const` everywhere. Only switch to `let` when reassignment is mandatory.',
      'Use Object.freeze() or TypeScript `readonly` for true runtime/compile-time immutability.',
    ],
    practicalExercise: 'Write a small script demonstrating that mutating an array passed into a function affects the original array outside the function.',
    quiz: [
      {
        id: 'q1',
        question: 'What is the output of `typeof null` in standard JavaScript?',
        options: ['"null"', '"undefined"', '"object"', '"boolean"'],
        correctAnswer: 2,
        explanation: 'Due to a legacy quirk in the first implementation of JavaScript where type tags were stored in the lower bits of pointers, typeof null returns "object".',
      },
    ],
    challenge: {
      title: 'Primitive or Reference Checker',
      description: 'Write `isReferenceType(value)` returning true if value is a reference type (Object, Array, Function) and false if primitive.',
      starterCode: `function isReferenceType(val) {
  return val !== null && (typeof val === 'object' || typeof val === 'function');
}`,
      expectedOutput: 'true',
      testInput: 'isReferenceType({ id: 1 })',
      hints: ['Remember that typeof null is "object", but null is a primitive!'],
      solutionCode: `function isReferenceType(val) {
  return val !== null && (typeof val === 'object' || typeof val === 'function');
}`,
    },
    prevLessonId: 'fe-css-flexbox',
    nextLessonId: 'fe-js-promises-async',
  },

  'fe-js-promises-async': {
    id: 'fe-js-promises-async',
    trackId: 'frontend',
    moduleId: 'javascript',
    moduleName: 'JavaScript & Web Runtimes',
    title: 'Promises, Async/Await & Event Loop',
    order: 6,
    estimatedMinutes: 30,
    difficulty: 'Intermediate',
    introduction: 'JavaScript is single-threaded. Understanding asynchronous execution—the call stack, Web APIs, microtask queue (Promises), and macrotask queue (setTimeout)—is essential for high-performance software engineering.',
    objectives: [
      'Understand the 3 states of a Promise: pending, fulfilled, rejected.',
      'Master async/await syntax and structured try/catch error handling.',
      'Explain microtask execution order vs macrotasks in the V8 event loop.',
    ],
    explanation: 'The event loop continuously monitors the Call Stack. When asynchronous I/O (like `fetch` or `fs.readFile`) occurs, the operation is delegated to browser Web APIs or Node libuv. When finished, Promise callbacks are pushed to the high-priority Microtask Queue, while timer callbacks are pushed to the Macrotask Queue. The Call Stack exhausts ALL microtasks before yielding to render or processing the next macrotask.',
    stepByStepBreakdown: [
      { step: 1, title: 'Synchronous Stack Execution', detail: 'JavaScript executes synchronous statements immediately line-by-line.' },
      { step: 2, title: 'Async Handshake', detail: 'Calling an async function immediately returns a Promise in pending state.' },
      { step: 3, title: 'await Pause', detail: 'The await expression pauses execution of that specific async function, allowing the main thread to handle other UI events.' },
      { step: 4, title: 'Microtask Resolution', detail: 'When the awaited Promise resolves, its continuation is queued in the microtask queue.' },
    ],
    syntaxCode: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user:', error.message);
    throw error;
  }
}

// Parallel execution with Promise.all
async function loadDashboard() {
  const [profile, stats] = await Promise.all([
    fetchUserData('123'),
    fetch('/api/analytics').then(r => r.json())
  ]);
  return { profile, stats };
}`,
    codeExplanation: [
      { lineOrSection: 'if (!response.ok)', explanation: 'Fetch only rejects on network failure, NOT on 404/500 errors! Always check response.ok.' },
      { lineOrSection: 'Promise.all([...])', explanation: 'Dispatches multiple requests concurrently in parallel instead of sequential waterfall.' },
    ],
    expectedOutput: 'Concurrent fetching of user profile and analytics without blocking the UI thread.',
    realWorldApplications: [
      'Fetching data from backend REST and GraphQL endpoints.',
      'Reading and writing files without locking the Node.js server thread.',
    ],
    commonMistakes: [
      'Writing sequential awaits when they are independent and could run concurrently via `Promise.all()`.',
      'Forgetting that `fetch()` does not throw an error on HTTP 404 or 500 status codes.',
    ],
    bestPractices: [
      'Always wrap async code in try/catch or chain .catch() to avoid unhandled promise rejection warnings.',
      'Use `Promise.allSettled()` if you want all requests to complete even if some fail.',
    ],
    practicalExercise: 'Simulate a 2-second API delay using `new Promise(resolve => setTimeout(resolve, 2000))` and log the elapsed time.',
    quiz: [
      {
        id: 'q1',
        question: 'Which queue has higher priority in the JavaScript event loop?',
        options: ['Macrotask queue (setTimeout)', 'Microtask queue (Promises)', 'Both have equal priority', 'Web Worker queue'],
        correctAnswer: 1,
        explanation: 'Microtasks (Promises, queueMicrotask) have strict priority. The event loop exhausts the entire microtask queue before picking the next macrotask.',
      },
    ],
    challenge: {
      title: 'Async Retry Utility',
      description: 'Write `retryAsync(fn, retries)` that attempts calling an async function `fn` up to `retries` times before throwing the final error.',
      starterCode: `async function retryAsync(fn, retries = 3) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}`,
      expectedOutput: '"success"',
      testInput: 'retryAsync(async () => "success", 2)',
      hints: ['Loop up to `retries`. If `await fn()` succeeds, return immediately. If loop finishes, throw lastError.'],
      solutionCode: `async function retryAsync(fn, retries = 3) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}`,
    },
    prevLessonId: 'fe-js-variables-types',
    nextLessonId: 'fe-react-intro-jsx',
  },

  'fe-react-intro-jsx': {
    id: 'fe-react-intro-jsx',
    trackId: 'frontend',
    moduleId: 'react',
    moduleName: 'React 18 Architecture',
    title: 'React Components, Props & State',
    order: 7,
    estimatedMinutes: 30,
    difficulty: 'Intermediate',
    introduction: 'React is a declarative, component-based UI library. It allows software engineers to build encapsulated components that manage their own state and compose them into complex user interfaces.',
    objectives: [
      'Understand JSX compilation to React.createElement.',
      'Master unidirectional data flow via Props.',
      'Manage local component state with useState and immutability.',
    ],
    explanation: 'JSX is syntax sugar that compiles to `React.createElement` or modern JSX runtime calls (`_jsx`). React components are pure JavaScript functions that accept `props` and return UI descriptions. When state changes via `useState`, React schedules a re-render. Through its virtual DOM and Fiber reconciliation engine, React computes the minimal DOM diff and updates the real browser DOM with optimal performance.',
    stepByStepBreakdown: [
      { step: 1, title: 'Functional Component', detail: 'A function that receives a props object and returns a JSX tree.' },
      { step: 2, title: 'useState Hook', detail: 'Returns a tuple [stateValue, setterFunction]. Calling setter tells React state changed.' },
      { step: 3, title: 'Reconciliation', detail: 'React re-runs the component function and diffs previous virtual DOM with new virtual DOM.' },
      { step: 4, title: 'DOM Mutation', detail: 'React batches changes and updates only the altered DOM nodes.' },
    ],
    syntaxCode: `import React, { useState } from 'react';

interface MetricCardProps {
  label: string;
  initialValue: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, initialValue }) => {
  const [value, setValue] = useState(initialValue);

  const increment = () => {
    // Functional updater ensures correct state on rapid clicks
    setValue(prev => prev + 1);
  };

  return (
    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
      <div className="text-xs text-slate-400 uppercase">{label}</div>
      <div className="text-2xl font-bold text-cyan-400 mt-1">{value}</div>
      <button
        onClick={increment}
        className="mt-3 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 rounded text-xs font-semibold"
      >
        Increment
      </button>
    </div>
  );
};`,
    codeExplanation: [
      { lineOrSection: 'setValue(prev => prev + 1)', explanation: 'Using functional state update prevents race conditions when updates are batched.' },
      { lineOrSection: 'interface MetricCardProps', explanation: 'TypeScript interface enforcing type safety for passed props.' },
    ],
    expectedOutput: 'An interactive metric counter card incrementing its displayed number on button click.',
    realWorldApplications: [
      'Interactive dashboards, real-time counters, user profile editors, and form controls.',
    ],
    commonMistakes: [
      'Directly modifying state: `value = value + 1;` which never triggers a re-render.',
      'Calling hooks conditionally inside if statements or loops (violates Rules of Hooks).',
    ],
    bestPractices: [
      'Keep state as local as possible. Only lift state up when siblings genuinely need shared access.',
      'Always use functional state updates `setCount(prev => prev + 1)` when next state depends on current state.',
    ],
    practicalExercise: 'Build a Toggle button component in React that alternates between "Active" (green) and "Inactive" (red).',
    quiz: [
      {
        id: 'q1',
        question: 'Why should you use the functional updater form `setCount(prev => prev + 1)`?',
        options: [
          'It is required by TypeScript to compile.',
          'It ensures updates are based on the latest state when React batches multiple updates.',
          'It forces synchronous DOM rendering.',
          'It prevents components from ever re-rendering.',
        ],
        correctAnswer: 1,
        explanation: 'Because React state updates are batched asynchronously, the functional form guarantees you receive the most recent committed state value rather than a stale closure.',
      },
    ],
    challenge: {
      title: 'Simulate React State Batching',
      description: 'Write `simulateStateBatch(initial, actions)` applying an array of functional updater functions to an initial state.',
      starterCode: `function simulateStateBatch(initial, actions) {
  return actions.reduce((acc, fn) => typeof fn === 'function' ? fn(acc) : fn, initial);
}`,
      expectedOutput: '3',
      testInput: 'simulateStateBatch(0, [prev => prev + 1, prev => prev + 1, prev => prev + 1])',
      hints: ['Reduce through actions, passing the return of previous updater into the next.'],
      solutionCode: `function simulateStateBatch(initial, actions) {
  return actions.reduce((acc, fn) => typeof fn === 'function' ? fn(acc) : fn, initial);
}`,
    },
    prevLessonId: 'fe-js-promises-async',
    nextLessonId: 'be-node-intro',
  },

  'be-node-intro': {
    id: 'be-node-intro',
    trackId: 'backend',
    moduleId: 'nodejs',
    moduleName: 'Node.js & Event Loop',
    title: 'Node.js Architecture & libuv',
    order: 8,
    estimatedMinutes: 25,
    difficulty: 'Intermediate',
    introduction: 'Node.js is an open-source, cross-platform JavaScript runtime built on Chrome’s V8 JavaScript engine. It employs an event-driven, non-blocking I/O model designed for building scalable network applications.',
    objectives: [
      'Understand how Node.js executes JavaScript outside the browser.',
      'Explain the role of V8 vs libuv thread pool.',
      'Learn how to write non-blocking asynchronous file operations with fs/promises.',
    ],
    explanation: 'Unlike traditional web servers that spawn a new OS thread for every incoming connection, Node.js uses a single main thread to handle thousands of concurrent client connections. Computationally expensive or blocking tasks are delegated to an internal C++ thread pool provided by the `libuv` library.',
    stepByStepBreakdown: [
      { step: 1, title: 'V8 Engine', detail: 'Parses and executes JavaScript code, allocating heap objects and managing garbage collection.' },
      { step: 2, title: 'Node.js Core APIs', detail: 'Provides native access to filesystem (fs), networking (http, net), and cryptography (crypto).' },
      { step: 3, title: 'libuv Event Loop', detail: 'Coordinates async callbacks, timers, I/O polling, and delegates heavy work to a 4-worker thread pool.' },
    ],
    syntaxCode: `import fs from 'node:fs/promises';
import path from 'node:path';

async function readProjectConfig() {
  try {
    const configPath = path.resolve('package.json');
    const rawData = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(rawData);
    console.log(\`Project: \${config.name} (v\${config.version})\`);
    return config;
  } catch (error) {
    console.error('Failed to read config:', error.message);
  }
}

readProjectConfig();`,
    codeExplanation: [
      { lineOrSection: 'import fs from "node:fs/promises"', explanation: 'Modern Node.js import using node: prefix and native Promise-based API.' },
      { lineOrSection: 'path.resolve("package.json")', explanation: 'Resolves cross-platform absolute filesystem paths safely across Windows and Linux.' },
    ],
    expectedOutput: 'Clean terminal output displaying project name and version read from package.json without blocking other I/O.',
    realWorldApplications: [
      'High-throughput REST and GraphQL APIs serving millions of concurrent requests.',
      'Real-time WebSocket chat and collaboration backends.',
      'Microservices orchestrating distributed cloud tasks.',
    ],
    commonMistakes: [
      'Using synchronous methods like `fs.readFileSync()` inside request handlers, which freezes the entire Node.js server for all users!',
      'Running heavy CPU mathematical loops on the main thread instead of worker threads or child processes.',
    ],
    bestPractices: [
      'Always use asynchronous `fs/promises` methods.',
      'Handle `process.on("unhandledRejection")` and `process.on("uncaughtException")` for graceful server shutdown.',
    ],
    practicalExercise: 'Write a script that reads all files in a directory and outputs their total size in kilobytes.',
    quiz: [
      {
        id: 'q1',
        question: 'Which component in Node.js manages the thread pool for filesystem I/O and cryptographic operations?',
        options: ['V8 Engine', 'libuv', 'npm', 'Blink'],
        correctAnswer: 1,
        explanation: 'libuv is the multi-platform C library that handles the event loop and thread pool for asynchronous I/O operations in Node.js.',
      },
    ],
    challenge: {
      title: 'Parse Environment String',
      description: 'Write `parseEnv(envStr)` that parses a .env formatted string into a JavaScript key-value object.',
      starterCode: `function parseEnv(str) {
  const out = {};
  str.split('\\n').forEach(l => {
    const t = l.trim();
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=');
      if (eq > 0) out[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
    }
  });
  return out;
}`,
      expectedOutput: '{"PORT":"5000","ENV":"production"}',
      testInput: 'JSON.stringify(parseEnv("PORT=5000\\n# comment\\nENV=production"))',
      hints: ['Split by newline, ignore empty lines and comments (#), split on first = sign.'],
      solutionCode: `function parseEnv(str) {
  const out = {};
  str.split('\\n').forEach(l => {
    const t = l.trim();
    if (t && !t.startsWith('#')) {
      const eq = t.indexOf('=');
      if (eq > 0) out[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
    }
  });
  return out;
}`,
    },
    prevLessonId: 'fe-react-intro-jsx',
    nextLessonId: 'be-sec-jwt-auth',
  },

  'be-sec-jwt-auth': {
    id: 'be-sec-jwt-auth',
    trackId: 'backend',
    moduleId: 'advanced-backend',
    moduleName: 'Backend Security & DevOps',
    title: 'JWT Authentication & Secure Authorization',
    order: 9,
    estimatedMinutes: 30,
    difficulty: 'Advanced',
    introduction: 'JSON Web Tokens (JWT) are an open standard (RFC 7519) that define a compact and self-contained way for securely transmitting information between parties as a verifiable JSON object.',
    objectives: [
      'Understand the 3 components of a JWT: Header, Payload, Signature.',
      'Implement secure token creation and verification middleware in Express.',
      'Protect routes using cryptographic signatures and Bearer token headers.',
    ],
    explanation: 'Unlike stateful session authentication where the backend maintains a centralized session table in a database or Redis, JWTs are stateless. The server signs the payload using a secret key (HMAC SHA-256). When the client presents the token in the `Authorization: Bearer <token>` header, any backend server in a distributed cluster can verify the signature mathematically without performing expensive database reads.',
    stepByStepBreakdown: [
      { step: 1, title: 'Header', detail: 'Contains metadata about the token type (JWT) and the cryptographic signing algorithm (HS256).' },
      { step: 2, title: 'Payload', detail: 'Contains claims (userId, email, role, expiration time exp).' },
      { step: 3, title: 'Signature', detail: 'Created by hashing Header + Payload with server JWT_SECRET.' },
      { step: 4, title: 'Verification', detail: 'Middleware recomputes the signature; any alteration triggers immediate rejection.' },
    ],
    syntaxCode: `import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function generateToken(user: { id: string; email: string }) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function requireAuth(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = decoded;
    next();
  });
}`,
    codeExplanation: [
      { lineOrSection: 'jwt.sign(..., { expiresIn: "7d" })', explanation: 'Ensures the token automatically expires, limiting exposure if intercepted.' },
      { lineOrSection: 'req.user = decoded', explanation: 'Makes the verified user identity accessible to subsequent route handlers.' },
    ],
    expectedOutput: 'Secure verification of user token, allowing authorized requests through and rejecting unauthenticated requests with HTTP 401/403.',
    realWorldApplications: [
      'Microservices where multiple independent services verify tokens without querying a central session database.',
      'Single Sign-On (SSO) and mobile app API authentication.',
    ],
    commonMistakes: [
      'Storing passwords or sensitive API keys inside the JWT payload (payload is only Base64-encoded, NOT encrypted!).',
      'Using a weak, easily guessable secret key like "secret123". Always generate a cryptographically strong 256-bit random string.',
    ],
    bestPractices: [
      'Keep access tokens short-lived (e.g. 15 minutes) and pair them with rotating refresh tokens stored in httpOnly secure cookies.',
      'Always validate authorization permissions (role-based access control) in addition to authentication.',
    ],
    practicalExercise: 'Decode a base64 encoded JWT payload string using `Buffer.from(payload, "base64").toString()` and inspect the claims.',
    quiz: [
      {
        id: 'q1',
        question: 'Are the contents of a standard JWT payload encrypted and hidden from the client?',
        options: [
          'Yes, they are encrypted with AES-256.',
          'No, they are only Base64URL-encoded and can be read by anyone.',
          'Only on mobile devices.',
          'Only when sent over HTTP.',
        ],
        correctAnswer: 1,
        explanation: 'Standard JWT payloads are signed, not encrypted. Anyone who has the token can decode the Base64 payload and inspect the claims. Never store sensitive credentials in a JWT payload!',
      },
    ],
    challenge: {
      title: 'Extract Bearer Token',
      description: 'Write `extractBearerToken(headerValue)` that extracts the token string from an Authorization header.',
      starterCode: `function extractBearerToken(header) {
  if (!header || typeof header !== 'string') return null;
  const p = header.trim().split(/\\s+/);
  return p.length === 2 && p[0].toLowerCase() === 'bearer' ? p[1] : null;
}`,
      expectedOutput: '"xyz123token"',
      testInput: 'extractBearerToken("Bearer xyz123token")',
      hints: ['Check if header starts with Bearer and split on space.'],
      solutionCode: `function extractBearerToken(header) {
  if (!header || typeof header !== 'string') return null;
  const p = header.trim().split(/\\s+/);
  return p.length === 2 && p[0].toLowerCase() === 'bearer' ? p[1] : null;
}`,
    },
    prevLessonId: 'be-node-intro',
    nextLessonId: 'dsa-big-o-analysis',
  },

  'dsa-big-o-analysis': {
    id: 'dsa-big-o-analysis',
    trackId: 'dsa',
    moduleId: 'dsa-foundations',
    moduleName: 'Complexity & Linear Data Structures',
    title: 'Time & Space Complexity (Big-O Notation)',
    order: 10,
    estimatedMinutes: 25,
    difficulty: 'Beginner',
    introduction: 'Big-O notation is the universal mathematical language used by computer scientists and software engineers to quantify the efficiency and scalability of algorithms as input size N grows towards infinity.',
    objectives: [
      'Master the common complexity orders: O(1), O(log N), O(N), O(N log N), O(N^2), O(2^N).',
      'Distinguish between Time Complexity (CPU operations) and Space Complexity (RAM memory).',
      'Identify and eliminate accidental quadratic (O(N^2)) bottlenecks in production code.',
    ],
    explanation: 'Hardware specifications differ across servers and laptops. Big-O notation measures the rate of growth of algorithmic steps relative to input size N. In technical coding interviews and enterprise system design, reducing an algorithm from O(N^2) to O(N log N) or O(N) is the difference between an application crashing under 100,000 users and scaling smoothly to millions.',
    stepByStepBreakdown: [
      { step: 1, title: 'O(1) Constant Time', detail: 'Execution time remains identical regardless of whether N is 10 or 10 billion (e.g. Hash Map lookup, array index access).' },
      { step: 2, title: 'O(log N) Logarithmic Time', detail: 'Divides the search space in half each step (e.g. Binary Search in a sorted array).' },
      { step: 3, title: 'O(N) Linear Time', detail: 'Operations scale directly proportionally to N (e.g. single loop scanning an array).' },
      { step: 4, title: 'O(N^2) Quadratic Time', detail: 'Nested loops over N. For N = 100,000, N^2 requires 10 billion operations, causing server freeze!' },
    ],
    syntaxCode: `// O(1) - Constant Time
function getFirstElement(arr) {
  return arr[0];
}

// O(N) - Linear Time
function findMax(arr) {
  let max = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}

// O(N) Optimized using Hash Set
function hasDuplicatesFast(arr) {
  const seen = new Set();
  for (const item of arr) {
    if (seen.has(item)) return true;
    seen.add(item);
  }
  return false;
}`,
    codeExplanation: [
      { lineOrSection: 'new Set()', explanation: 'Using a Hash Set reduces lookup time from O(N) to O(1), lowering overall complexity from O(N^2) to O(N).' },
    ],
    expectedOutput: 'hasDuplicatesFast completes in linear O(N) time with O(N) auxiliary space, scaling effortlessly to large datasets.',
    realWorldApplications: [
      'Database query optimization: Indexes use B-Trees to provide O(log N) lookups instead of O(N) full table scans.',
      'Frontend list rendering: Virtualizing 100,000 DOM elements to O(1) viewport items.',
    ],
    commonMistakes: [
      'Calling `arr.includes()` or `arr.indexOf()` inside a loop, which turns what appears to be a single loop into a hidden O(N^2) algorithm.',
      'Ignoring space complexity: using recursive calls without accounting for O(N) call stack memory.',
    ],
    bestPractices: [
      'Look for nested loops over the same dataset and replace with Hash Maps or Sets.',
      'Drop constants and non-dominant terms: O(3N + 5) simplifies to O(N); O(N^2 + N) simplifies to O(N^2).',
    ],
    practicalExercise: 'Analyze the time and space complexity of reversing an array in-place using two pointers vs creating a new array.',
    quiz: [
      {
        id: 'q1',
        question: 'What is the time complexity of looking up a key in a standard Hash Map / JavaScript object?',
        options: ['O(N)', 'O(1) average', 'O(N^2)', 'O(log N)'],
        correctAnswer: 1,
        explanation: 'Hash Maps calculate a hash code directly from the key to jump immediately to the memory bucket, providing O(1) average constant time lookup.',
      },
    ],
    challenge: {
      title: 'Two Sum in O(N) Time',
      description: 'Write `twoSum(nums, target)` returning the indices of two numbers that add up to `target` in O(N) time complexity using a Hash Map.',
      starterCode: `function twoSum(nums, target) {
  const m = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (m.has(comp)) return [m.get(comp), i];
    m.set(nums[i], i);
  }
  return [];
}`,
      expectedOutput: '[0,1]',
      testInput: 'JSON.stringify(twoSum([2, 7, 11, 15], 9))',
      hints: ['Store { number: index } in a Map. At each step check if (target - num) exists.'],
      solutionCode: `function twoSum(nums, target) {
  const m = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (m.has(comp)) return [m.get(comp), i];
    m.set(nums[i], i);
  }
  return [];
}`,
    },
    prevLessonId: 'be-sec-jwt-auth',
  },
};
