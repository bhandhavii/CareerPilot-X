import React, { useEffect, useMemo, useState } from 'react';
import { AlarmClock, ArrowLeft, ArrowRight, CheckCircle2, Clock3, History, RotateCcw, Send, Target } from 'lucide-react';
import { api } from '../../services/api';
import { cyberAudio } from '../../utils/audio';

type MockQuestion = {
  id: string;
  subject: string;
  topic: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const MOCK_QUESTION_BANK: MockQuestion[] = [
  // Python
  { id:'py1',subject:'Python',topic:'Data Types',question:'Which Python collection is ordered and immutable?',options:['List','Tuple','Set','Dictionary'],answer:1,explanation:'A tuple preserves order and cannot be modified after creation.' },
  { id:'py2',subject:'Python',topic:'Functions',question:'What does the len() function return for a list?',options:['The last index','The number of elements','The memory size in bytes','The data type'],answer:1,explanation:'len() returns the number of items in the collection.' },
  { id:'py3',subject:'Python',topic:'Dictionary',question:'Which expression safely reads key \"city\" from dictionary d and returns None if absent?',options:['d[\"city\"]','d.get(\"city\")','d.city','d.find(\"city\")'],answer:1,explanation:'dict.get() returns None by default when the key is missing.' },
  { id:'py4',subject:'Python',topic:'OOP',question:'Which method is called when a new Python object is initialized?',options:['__start__','__init__','__newclass__','__main__'],answer:1,explanation:'__init__ initializes an instance after it has been created.' },
  { id:'py5',subject:'Python',topic:'Comprehensions',question:'What is the result of [x*x for x in range(3)]?',options:['[1, 4, 9]','[0, 1, 4]','[0, 1, 2]','[0, 2, 4]'],answer:1,explanation:'range(3) yields 0, 1, 2; squaring gives 0, 1, 4.' },
  // Java
  { id:'ja1',subject:'Java',topic:'JVM',question:'What is the primary role of the JVM?',options:['Write Java source code','Execute Java bytecode','Design databases','Compile CSS'],answer:1,explanation:'The Java Virtual Machine executes bytecode and provides a runtime environment.' },
  { id:'ja2',subject:'Java',topic:'Strings',question:'Which method compares the contents of two Java strings?',options:['==','equals()','compareRef()','same()'],answer:1,explanation:'String.equals() compares character content; == compares references.' },
  { id:'ja3',subject:'Java',topic:'Collections',question:'Which Java collection allows duplicates and maintains insertion order?',options:['HashSet','ArrayList','TreeSet','Map'],answer:1,explanation:'ArrayList allows duplicates and preserves insertion order.' },
  { id:'ja4',subject:'Java',topic:'Exceptions',question:'Which block normally runs whether an exception occurs or not?',options:['try','catch','finally','throw'],answer:2,explanation:'A finally block runs after try/catch in normal completion paths.' },
  { id:'ja5',subject:'Java',topic:'OOP',question:'Which concept allows a subclass to provide its own implementation of a superclass method?',options:['Encapsulation','Overriding','Overloading','Abstraction'],answer:1,explanation:'Method overriding changes inherited method behavior in a subclass.' },
  // C / C++
  { id:'cc1',subject:'C / C++',topic:'Pointers',question:'What does a pointer store?',options:['A character only','A memory address','A loop count','A file name'],answer:1,explanation:'A pointer stores the memory address of another object or function.' },
  { id:'cc2',subject:'C / C++',topic:'Memory',question:'Which C function releases memory allocated by malloc()?',options:['delete','remove()','free()','clear()'],answer:2,explanation:'free() releases dynamically allocated memory in C.' },
  { id:'cc3',subject:'C / C++',topic:'STL',question:'Which C++ STL container provides dynamic array behavior?',options:['std::vector','std::stack','std::map','std::queue'],answer:0,explanation:'std::vector is a resizable contiguous sequence container.' },
  { id:'cc4',subject:'C / C++',topic:'Input',question:'Which C++ stream is commonly used for standard input?',options:['cout','cerr','cin','clog'],answer:2,explanation:'cin is the standard input stream.' },
  { id:'cc5',subject:'C / C++',topic:'OOP',question:'Defining multiple functions with the same name but different parameter lists is called:',options:['Overriding','Overloading','Inheritance','Casting'],answer:1,explanation:'Function overloading selects a function based on its parameter list.' },
  // DSA
  { id:'ds1',subject:'DSA',topic:'Stack',question:'Which principle does a stack follow?',options:['FIFO','LIFO','Random access','Priority only'],answer:1,explanation:'A stack follows Last In, First Out.' },
  { id:'ds2',subject:'DSA',topic:'Graphs',question:'Which data structure is commonly used in BFS?',options:['Stack','Queue','Heap','Trie'],answer:1,explanation:'BFS uses a queue to process vertices level by level.' },
  { id:'ds3',subject:'DSA',topic:'Searching',question:'Binary search requires the input array to be:',options:['Unsorted','Sorted','Circular','A linked list'],answer:1,explanation:'Binary search repeatedly halves the search range in sorted data.' },
  { id:'ds4',subject:'DSA',topic:'Sorting',question:'What is the average time complexity of merge sort?',options:['O(n)','O(log n)','O(n log n)','O(n²)'],answer:2,explanation:'Merge sort divides and merges at each of log n levels, processing n elements per level.' },
  { id:'ds5',subject:'DSA',topic:'Hashing',question:'Average-case lookup in a well-designed hash table is typically:',options:['O(1)','O(log n)','O(n)','O(n log n)'],answer:0,explanation:'A good hash function distributes keys, giving expected constant-time lookup.' },
  // DBMS
  { id:'db1',subject:'DBMS',topic:'Keys',question:'Which constraint uniquely identifies each row in a table and cannot be NULL?',options:['Foreign key','Primary key','Candidate attribute','Index only'],answer:1,explanation:'A primary key uniquely identifies a row and cannot contain NULL values.' },
  { id:'db2',subject:'DBMS',topic:'Transactions',question:'What does the A in ACID stand for?',options:['Accuracy','Atomicity','Availability','Authorization'],answer:1,explanation:'Atomicity means a transaction completes fully or has no effect.' },
  { id:'db3',subject:'DBMS',topic:'Normalization',question:'First Normal Form (1NF) requires:',options:['No primary key','Atomic column values','No foreign keys','Only one table'],answer:1,explanation:'1NF requires each field to contain an atomic value and no repeating groups.' },
  { id:'db4',subject:'DBMS',topic:'Joins',question:'Which join returns only rows with matching values in both tables?',options:['LEFT JOIN','RIGHT JOIN','INNER JOIN','CROSS JOIN'],answer:2,explanation:'INNER JOIN returns rows where the join condition matches in both tables.' },
  { id:'db5',subject:'DBMS',topic:'Indexes',question:'What is a common purpose of a database index?',options:['Encrypt rows','Speed up data retrieval','Replace transactions','Remove duplicates automatically'],answer:1,explanation:'Indexes can improve read/query performance, with storage and write costs.' },
  // Operating Systems
  { id:'os1',subject:'Operating Systems',topic:'Processes',question:'A process is best described as:',options:['A program in execution','A source-code comment','A CPU register','A file extension'],answer:0,explanation:'A process is an executing program with its own execution state and resources.' },
  { id:'os2',subject:'Operating Systems',topic:'Threads',question:'Threads within the same process commonly share:',options:['Their stack','Program code and heap/address space','Their instruction pointer','Their CPU registers'],answer:1,explanation:'Threads share process resources such as code and heap, while each has its own stack and registers.' },
  { id:'os3',subject:'Operating Systems',topic:'Deadlocks',question:'Which is one of the necessary Coffman conditions for deadlock?',options:['Preemption always allowed','Circular wait','No resource sharing','Single user mode'],answer:1,explanation:'Circular wait is one of the four necessary deadlock conditions.' },
  { id:'os4',subject:'Operating Systems',topic:'Scheduling',question:'Round Robin scheduling is especially associated with:',options:['Time quantum','Shortest remaining time only','No context switching','Batch sorting'],answer:0,explanation:'Round Robin assigns each ready process a fixed time quantum in turn.' },
  { id:'os5',subject:'Operating Systems',topic:'Memory',question:'Virtual memory allows a process to:',options:['Use only CPU cache','Address memory beyond currently available physical RAM','Avoid all page faults','Run without storage'],answer:1,explanation:'Virtual memory maps virtual addresses to physical memory and can use secondary storage.' },
  // Computer Networks
  { id:'cn1',subject:'Computer Networks',topic:'TCP',question:'What is the correct TCP three-way handshake order?',options:['ACK, SYN, FIN','SYN, SYN-ACK, ACK','SYN, FIN, ACK','FIN, ACK, SYN'],answer:1,explanation:'A client sends SYN, the server responds SYN-ACK, and the client sends ACK.' },
  { id:'cn2',subject:'Computer Networks',topic:'DNS',question:'What is the main purpose of DNS?',options:['Encrypt files','Translate domain names to IP addresses','Assign MAC addresses','Compress packets'],answer:1,explanation:'DNS resolves domain names to resource records, commonly IP addresses.' },
  { id:'cn3',subject:'Computer Networks',topic:'HTTP',question:'Which default port is used by HTTPS?',options:['21','25','80','443'],answer:3,explanation:'HTTPS commonly uses TCP port 443.' },
  { id:'cn4',subject:'Computer Networks',topic:'Devices',question:'Which device forwards packets between different IP networks?',options:['Hub','Router','Repeater','Bridge only'],answer:1,explanation:'Routers forward packets between networks using network-layer addressing.' },
  { id:'cn5',subject:'Computer Networks',topic:'TCP vs UDP',question:'Which statement about UDP is correct?',options:['It guarantees delivery','It is connection-oriented','It has no built-in delivery guarantee','It always retransmits lost packets'],answer:2,explanation:'UDP is connectionless and does not guarantee delivery or ordering.' },
  // Aptitude
  { id:'ap1',subject:'Aptitude',topic:'Percentages',question:'A value increases from 80 to 100. What is the percentage increase?',options:['20%','25%','30%','40%'],answer:1,explanation:'Increase = 20; percentage increase = 20/80 × 100 = 25%.' },
  { id:'ap2',subject:'Aptitude',topic:'Speed',question:'A car travels 150 km in 3 hours. What is its average speed?',options:['30 km/h','40 km/h','50 km/h','60 km/h'],answer:2,explanation:'Average speed = distance/time = 150/3 = 50 km/h.' },
  { id:'ap3',subject:'Aptitude',topic:'Average',question:'The average of 4, 6, 8 and 10 is:',options:['6','7','8','9'],answer:1,explanation:'(4 + 6 + 8 + 10) / 4 = 7.' },
  { id:'ap4',subject:'Aptitude',topic:'Ratio',question:'If the ratio is 2:3 and the total is 25, what is the smaller part?',options:['5','10','12','15'],answer:1,explanation:'Total parts = 5; one part = 5; smaller part = 2 × 5 = 10.' },
  { id:'ap5',subject:'Aptitude',topic:'Simple Interest',question:'Find simple interest on ₹1,000 at 10% per year for 2 years.',options:['₹100','₹150','₹200','₹250'],answer:2,explanation:'SI = P × R × T / 100 = 1000 × 10 × 2 / 100 = ₹200.' },
  // Web
  { id:'web1',subject:'HTML / CSS / JavaScript',topic:'HTML',question:'Which HTML element represents the main content of a document?',options:['<aside>','<main>','<footer>','<small>'],answer:1,explanation:'The main element represents the dominant content of the body.' },
  { id:'web2',subject:'HTML / CSS / JavaScript',topic:'CSS',question:'Which CSS layout model is designed for one-dimensional row or column layouts?',options:['Flexbox','Float','Table layout','Inline formatting only'],answer:0,explanation:'Flexbox is a one-dimensional layout model for arranging items in a row or column.' },
  { id:'web3',subject:'HTML / CSS / JavaScript',topic:'JavaScript',question:'Which keyword declares a block-scoped variable that cannot be reassigned?',options:['var','let','const','static'],answer:2,explanation:'const creates a block-scoped binding that cannot be reassigned.' },
  { id:'web4',subject:'HTML / CSS / JavaScript',topic:'JavaScript',question:'Promise callbacks are normally processed in which event-loop queue?',options:['Task queue only','Microtask queue','Render queue','Network queue'],answer:1,explanation:'Promise reactions are queued as microtasks.' },
  { id:'web5',subject:'HTML / CSS / JavaScript',topic:'Browser APIs',question:'Which browser storage persists data across browser restarts until cleared?',options:['sessionStorage','localStorage','A local variable','The call stack'],answer:1,explanation:'localStorage persists key/value data across browser sessions.' },
  // AI / ML
  { id:'ai1',subject:'AI / ML',topic:'Learning Types',question:'A model trained using labeled input-output examples uses:',options:['Unsupervised learning','Supervised learning','Reinforcement only','Clustering only'],answer:1,explanation:'Supervised learning uses labeled examples to learn a mapping from inputs to targets.' },
  { id:'ai2',subject:'AI / ML',topic:'Generalization',question:'Overfitting occurs when a model:',options:['Performs well on unseen data only','Memorizes training patterns and generalizes poorly','Has no parameters','Always predicts the mean'],answer:1,explanation:'An overfit model performs well on training data but poorly on unseen data.' },
  { id:'ai3',subject:'AI / ML',topic:'Tasks',question:'Predicting whether an email is spam or not spam is a:',options:['Regression task','Classification task','Dimensionality reduction task','Sorting task'],answer:1,explanation:'Spam/not-spam prediction assigns an input to one of two classes.' },
  { id:'ai4',subject:'AI / ML',topic:'Clustering',question:'K-means is commonly used for:',options:['Unsupervised clustering','Text encryption','Sorting arrays','Supervised regression'],answer:0,explanation:'K-means partitions data into k clusters based on distances to centroids.' },
  { id:'ai5',subject:'AI / ML',topic:'Optimization',question:'Gradient descent updates model parameters using:',options:['Random sorting','The gradient of the loss function','Only the largest input value','A database index'],answer:1,explanation:'Gradient descent moves parameters in the direction that reduces the loss.' },
  // Additional questions rotate the five-question daily set instead of repeating one fixed test.
  { id:'py6',subject:'Python',topic:'Slicing',question:'What does values[::-1] produce for a Python list?',options:['A sorted list','A reversed copy using slicing','An empty list','A tuple'],answer:1,explanation:'A step of -1 traverses the list from the end to the beginning.' },
  { id:'py7',subject:'Python',topic:'Lambda',question:'Which statement about a lambda expression is correct?',options:['It defines an anonymous function','It creates a class','It opens a file','It starts a thread'],answer:0,explanation:'A lambda creates a small anonymous function expression.' },
  { id:'py8',subject:'Python',topic:'File Handling',question:'Which file mode opens a file for appending text?',options:['r','w','a','x'],answer:2,explanation:'The a mode appends to a file and creates it if it does not exist.' },
  { id:'ja6',subject:'Java',topic:'Abstraction',question:'Which Java type cannot be instantiated directly and can contain abstract methods?',options:['Final class','Abstract class','Enum only','Record only'],answer:1,explanation:'An abstract class cannot be instantiated and may declare abstract methods.' },
  { id:'ja7',subject:'Java',topic:'Interfaces',question:'A Java class can implement:',options:['Only one interface','Multiple interfaces','No interfaces','Only interfaces from the same package'],answer:1,explanation:'Java classes can implement multiple interfaces.' },
  { id:'ja8',subject:'Java',topic:'Memory',question:'Which Java component automatically reclaims unreachable heap objects?',options:['JIT compiler','Garbage collector','Class loader','JDBC driver'],answer:1,explanation:'The garbage collector reclaims heap memory occupied by unreachable objects.' },
  { id:'cc6',subject:'C / C++',topic:'References',question:'In C++, a reference is best described as:',options:['A nullable pointer by default','An alias for an existing object','A heap allocator','A preprocessor macro'],answer:1,explanation:'A reference is another name for an existing object and must be initialized.' },
  { id:'cc7',subject:'C / C++',topic:'Polymorphism',question:'Which keyword enables runtime polymorphism through a base-class method?',options:['static','virtual','inline','friend'],answer:1,explanation:'A virtual method supports dynamic dispatch when called through a base pointer or reference.' },
  { id:'cc8',subject:'C / C++',topic:'STL',question:'Which STL container stores key-value pairs in sorted key order?',options:['std::vector','std::queue','std::map','std::stack'],answer:2,explanation:'std::map stores unique keys in sorted order.' },
  { id:'ds6',subject:'DSA',topic:'Linked Lists',question:'Which technique can detect a cycle in a linked list using O(1) extra space?',options:['Binary search','Floyd slow and fast pointers','Merge sort','Prefix sums'],answer:1,explanation:'Floyd’s cycle detection uses two pointers moving at different speeds.' },
  { id:'ds7',subject:'DSA',topic:'Heaps',question:'What is the time complexity of inserting an item into a binary heap?',options:['O(1) worst case','O(log n)','O(n log n)','O(n²)'],answer:1,explanation:'Insertion restores the heap property by bubbling up at most the height of the heap.' },
  { id:'ds8',subject:'DSA',topic:'Dynamic Programming',question:'Dynamic programming is most useful when a problem has:',options:['Only sorted input','Overlapping subproblems and optimal substructure','No repeated states','Only constant-size input'],answer:1,explanation:'DP stores solutions to overlapping subproblems and combines them using optimal substructure.' },
  { id:'db6',subject:'DBMS',topic:'Relationships',question:'A foreign key is used to:',options:['Encrypt a table','Reference a key in another or the same table','Guarantee sorting','Create a database backup'],answer:1,explanation:'A foreign key enforces referential integrity between related records.' },
  { id:'db7',subject:'DBMS',topic:'Normalization',question:'Second Normal Form (2NF) removes:',options:['All indexes','Partial dependency on a candidate key','All foreign keys','All joins'],answer:1,explanation:'2NF requires 1NF and no non-prime attribute to depend on only part of a candidate key.' },
  { id:'db8',subject:'DBMS',topic:'Transactions',question:'Which SQL command undoes uncommitted transaction changes?',options:['COMMIT','ROLLBACK','GRANT','SELECT'],answer:1,explanation:'ROLLBACK reverses changes made in the current uncommitted transaction.' },
  { id:'os6',subject:'Operating Systems',topic:'Synchronization',question:'A semaphore is commonly used for:',options:['Image compression','Process/thread synchronization','DNS resolution','File formatting'],answer:1,explanation:'Semaphores coordinate access to shared resources and synchronization between threads/processes.' },
  { id:'os7',subject:'Operating Systems',topic:'Memory',question:'Paging divides virtual memory into fixed-size:',options:['Segments','Pages','Processes','Threads'],answer:1,explanation:'Paging divides virtual address spaces into fixed-size pages mapped to physical frames.' },
  { id:'os8',subject:'Operating Systems',topic:'Scheduling',question:'A context switch involves:',options:['Changing a variable name','Saving and restoring execution state','Deleting a process permanently','Compiling a program'],answer:1,explanation:'The OS saves one task’s CPU state and restores another task’s state.' },
  { id:'cn6',subject:'Computer Networks',topic:'IP Addressing',question:'What does a subnet mask identify?',options:['The application protocol','The network and host portions of an IP address','The DNS server password','The physical cable type'],answer:1,explanation:'A subnet mask identifies which IP address bits represent the network prefix.' },
  { id:'cn7',subject:'Computer Networks',topic:'Data Link Layer',question:'A MAC address is primarily used at which OSI layer?',options:['Application','Transport','Data Link','Session'],answer:2,explanation:'MAC addressing is used for local frame delivery at the data-link layer.' },
  { id:'cn8',subject:'Computer Networks',topic:'Protocols',question:'Which protocol is connectionless and commonly used for real-time streaming?',options:['TCP','UDP','FTP','SSH'],answer:1,explanation:'UDP avoids connection setup and is often used where low latency is preferred.' },
  { id:'ap6',subject:'Aptitude',topic:'Work and Time',question:'A completes a task in 10 days. At the same rate, what fraction is completed in 1 day?',options:['1/5','1/10','1/15','10'],answer:1,explanation:'One day’s work is 1 divided by 10, or 1/10 of the task.' },
  { id:'ap7',subject:'Aptitude',topic:'Profit and Loss',question:'An item bought for ₹400 is sold for ₹500. What is the profit percentage?',options:['20%','25%','30%','40%'],answer:1,explanation:'Profit is ₹100; profit percentage = 100/400 × 100 = 25%.' },
  { id:'ap8',subject:'Aptitude',topic:'Probability',question:'A fair coin is tossed once. What is the probability of getting heads?',options:['0','1/4','1/2','1'],answer:2,explanation:'There are two equally likely outcomes, so the probability of heads is 1/2.' },
  { id:'web6',subject:'HTML / CSS / JavaScript',topic:'JavaScript Events',question:'Event delegation commonly relies on:',options:['Event bubbling','CSS inheritance','Local storage','The call stack only'],answer:0,explanation:'A parent listener can handle bubbled events from its descendants.' },
  { id:'web7',subject:'HTML / CSS / JavaScript',topic:'Responsive Design',question:'Which HTML tag helps set the viewport for responsive layouts?',options:['<meta name=\"viewport\">','<canvas>','<source>','<track>'],answer:0,explanation:'The viewport meta tag controls the layout viewport on mobile devices.' },
  { id:'web8',subject:'HTML / CSS / JavaScript',topic:'Async JavaScript',question:'What does await do inside an async function?',options:['Blocks the entire browser thread','Pauses that async function until a promise settles','Converts a promise into a callback','Stops all network requests'],answer:1,explanation:'await suspends the async function continuation while the promise settles; it does not block the main thread.' },
  { id:'ai6',subject:'AI / ML',topic:'Evaluation',question:'Precision measures:',options:['Correct positive predictions among all predicted positives','Correct negatives among all negatives','Total training time','Number of model parameters'],answer:0,explanation:'Precision = true positives / (true positives + false positives).' },
  { id:'ai7',subject:'AI / ML',topic:'Evaluation',question:'Why is a test set kept separate from training data?',options:['To increase training size','To estimate performance on unseen data','To remove labels','To reduce the number of features'],answer:1,explanation:'A held-out test set estimates generalization to unseen examples.' },
  { id:'ai8',subject:'AI / ML',topic:'Regression',question:'Predicting the price of a house is usually a:',options:['Classification task','Regression task','Clustering task','Association rule task'],answer:1,explanation:'House price is a continuous numeric target, so this is regression.' },
];

const SUBJECTS = [
  'Python', 'Java', 'C / C++', 'DSA', 'DBMS',
  'Operating Systems', 'Computer Networks', 'Aptitude',
  'HTML / CSS / JavaScript', 'AI / ML',
];

export const DailyMockTestTab: React.FC = () => {
  const [subject, setSubject] = useState('Python');
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [saving, setSaving] = useState(false);
  const questions = useMemo(() => {
    const bank = MOCK_QUESTION_BANK.filter((q) => q.subject === subject);
    const dayNumber = Math.floor(Date.now() / 86_400_000);
    const start = bank.length ? dayNumber % bank.length : 0;
    return Array.from({ length: Math.min(5, bank.length) }, (_, index) => bank[(start + index) % bank.length]);
  }, [subject]);
  const activeQuestion = questions[activeIndex];
  const score = questions.filter((q) => answers[q.id] === q.answer).length;

  useEffect(() => {
    api.getPracticeHistory().then((items) => setHistory(items.filter((item) => item.category === 'mock_test').reverse())).catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    if (!started || submitted || secondsLeft <= 0) return;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [started, submitted, secondsLeft]);

  useEffect(() => {
    if (started && secondsLeft === 0 && !submitted) void handleSubmit();
  }, [secondsLeft, started, submitted]);

  const beginTest = () => {
    setAnswers({});
    setActiveIndex(0);
    setSubmitted(false);
    setSecondsLeft(15 * 60);
    setStarted(true);
    cyberAudio.playClick();
  };

  const handleSubmit = async () => {
    if (submitted || saving) return;
    setSaving(true);
    setSubmitted(true);
    const weakAreas = questions.filter((q) => answers[q.id] !== q.answer).map((q) => q.topic);
    const strengths = questions.filter((q) => answers[q.id] === q.answer).map((q) => q.topic);
    try {
      const result = await api.submitMockTest({ subject, score, total: questions.length, weakAreas, strengths });
      setHistory((items) => [result.attempt, ...items]);
      cyberAudio.playSuccess();
    } catch (error) {
      console.error('Could not save mock test:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  if (submitted) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 animate-fadeIn">
        <div className="rounded-3xl border border-[#273244] bg-[#101722] p-7 md:p-9">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-[#8DA7FF]"><CheckCircle2 size={15} /> Test submitted</div>
          <h1 className="mt-3 text-3xl font-bold text-white">{subject} Mock Test</h1>
          <div className="mt-6 flex flex-wrap items-end gap-4">
            <div className="text-5xl font-black text-white">{score}<span className="text-xl text-[#75839A]"> / {questions.length}</span></div>
            <div className="pb-1 text-sm text-[#A8B0BC]">{Math.round((score / questions.length) * 100)}% accuracy</div>
          </div>
          <p className="mt-3 text-sm text-[#A8B0BC]">{score >= 4 ? 'Good work. Review the explanations to reinforce the concepts.' : 'Use the explanations below to identify topics to revise before your next attempt.'}</p>
          <button onClick={() => { setStarted(false); setSubmitted(false); }} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#245BFF] px-4 py-3 text-xs font-bold text-white"><RotateCcw size={14} /> Choose another test</button>
        </div>
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <article key={q.id} className="rounded-2xl border border-[#273244] bg-[#101722] p-5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8DA7FF]">Question {idx + 1} · {q.topic}</div>
              <h3 className="mt-2 text-sm font-semibold text-white">{q.question}</h3>
              <div className="mt-3 space-y-2 text-xs">
                {q.options.map((option, optionIndex) => (
                  <div key={optionIndex} className={`rounded-lg border px-3 py-2 ${optionIndex === q.answer ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : answers[q.id] === optionIndex ? 'border-rose-500/40 bg-rose-500/10 text-rose-200' : 'border-[#273244] text-[#A8B0BC]'}`}>
                    {String.fromCharCode(65 + optionIndex)}. {option}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-[#A8B0BC]"><strong className="text-[#B7FF32]">Explanation:</strong> {q.explanation}</p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7 animate-fadeIn">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-[#8DA7FF]"><Target size={14} /> Daily assessment</div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">Daily Mock Test<span className="text-[#B7FF32]">.</span></h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#A8B0BC]">Take a focused five-question test, review explanations and save every attempt to your account history.</p>
      </div>

      {!started ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-3xl border border-[#273244] bg-[#101722] p-6 md:p-8">
            <h2 className="text-lg font-bold text-white">Choose your subject</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {SUBJECTS.map((item) => (
                <button key={item} onClick={() => setSubject(item)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold transition ${subject === item ? 'border-[#245BFF] bg-[#245BFF]/15 text-white' : 'border-[#273244] bg-[#0B1422] text-[#A8B0BC] hover:border-[#52627C]'}`}>{item}</button>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-[#273244] bg-[#0B1422] p-4">
              <div className="text-sm font-semibold text-white">{subject} · Daily Test</div>
              <p className="mt-1 text-xs text-[#8D9AAF]">5 MCQs · 15 minutes · instant score and explanations</p>
              <button onClick={beginTest} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#245BFF] px-5 py-3 text-xs font-bold text-white"><ArrowRight size={15} /> Start Test</button>
            </div>
          </section>

          <aside className="rounded-3xl border border-[#273244] bg-[#101722] p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-white"><History size={16} className="text-[#8DA7FF]" /> Recent attempts</div>
            {history.length ? (
              <div className="mt-4 space-y-3">
                {history.slice(0, 6).map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center justify-between border-b border-[#273244] pb-3">
                    <div><div className="text-xs font-semibold text-white">{item.topic}</div><div className="mt-1 text-[10px] text-[#71819A]">{new Date(item.date).toLocaleDateString()}</div></div>
                    <div className="font-mono text-xs text-[#B7FF32]">{item.score}/{item.total}</div>
                  </div>
                ))}
              </div>
            ) : <p className="mt-4 text-xs leading-5 text-[#71819A]">Your submitted tests will appear here.</p>}
          </aside>
        </div>
      ) : (
        <section className="rounded-3xl border border-[#273244] bg-[#101722] p-5 md:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#273244] pb-4">
            <div><div className="text-xs text-[#8DA7FF]">{subject}</div><div className="mt-1 text-sm font-bold text-white">Question {activeIndex + 1} of {questions.length}</div></div>
            <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-sm ${secondsLeft < 60 ? 'border-rose-500/40 text-rose-300' : 'border-[#273244] text-white'}`}><AlarmClock size={15} /> {formatTime(secondsLeft)}</div>
          </div>
          <div className="mb-5 flex gap-2">{questions.map((q, idx) => <button key={q.id} onClick={() => setActiveIndex(idx)} className={`h-8 w-8 rounded-lg text-xs font-bold ${idx === activeIndex ? 'bg-[#245BFF] text-white' : answers[q.id] !== undefined ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-[#0B1422] text-[#8D9AAF] border border-[#273244]'}`}>{idx + 1}</button>)}</div>
          {activeQuestion && (
            <>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#8D9AAF]">{activeQuestion.topic}</div>
              <h2 className="mt-3 text-lg font-semibold leading-7 text-white">{activeQuestion.question}</h2>
              <div className="mt-6 space-y-3">
                {activeQuestion.options.map((option, idx) => (
                  <button key={idx} onClick={() => setAnswers((prev) => ({ ...prev, [activeQuestion.id]: idx }))} className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${answers[activeQuestion.id] === idx ? 'border-[#245BFF] bg-[#245BFF]/15 text-white' : 'border-[#273244] bg-[#0B1422] text-[#A8B0BC] hover:border-[#52627C]'}`}>
                    <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/5 text-[10px] font-bold">{String.fromCharCode(65 + idx)}</span>{option}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#273244] pt-5">
            <button disabled={activeIndex === 0} onClick={() => setActiveIndex((idx) => idx - 1)} className="inline-flex items-center gap-2 rounded-xl border border-[#273244] px-4 py-2.5 text-xs font-semibold text-[#A8B0BC] disabled:opacity-30"><ArrowLeft size={14} /> Previous</button>
            <div className="text-xs text-[#8D9AAF]">{Object.keys(answers).length} / {questions.length} answered</div>
            {activeIndex < questions.length - 1 ? (
              <button onClick={() => setActiveIndex((idx) => idx + 1)} className="inline-flex items-center gap-2 rounded-xl bg-[#245BFF] px-4 py-2.5 text-xs font-semibold text-white">Next <ArrowRight size={14} /></button>
            ) : (
              <button disabled={saving} onClick={() => void handleSubmit()} className="inline-flex items-center gap-2 rounded-xl bg-[#B7FF32] px-4 py-2.5 text-xs font-bold text-[#101722] disabled:opacity-60"><Send size={14} /> {saving ? 'Saving…' : 'Submit Test'}</button>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
