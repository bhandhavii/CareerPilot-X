export interface ProblemDetail {
  id: string;
  number: number;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
    c: string;
  };
  functionName: string;
  sampleTestCases: {
    input: string;
    expectedOutput: string;
  }[];
  hiddenTestCases: {
    input: string;
    expectedOutput: string;
  }[];
  hints: string[];
  complexity: {
    time: string;
    space: string;
  };
  editorial: string;
}

// Curated full problem details for the core flagship problems
export const DETAILED_DSA_PROBLEMS: Record<string, Partial<ProblemDetail>> = {
  'dsa-1': {
    id: 'dsa-1',
    number: 1,
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    inputFormat: 'nums = [2,7,11,15], target = 9',
    outputFormat: '[0,1]',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      {
        input: '[2,7,11,15], 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: '[3,2,4], 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
      {
        input: '[3,3], 6',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].',
      },
    ],
    functionName: 'twoSum',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> prevMap;
        for (int i = 0; i < nums.size(); i++) {
            int diff = target - nums[i];
            if (prevMap.count(diff)) {
                return {prevMap[diff], i};
            }
            prevMap[nums[i]] = i;
        }
        return {};
    }
};`,
      java: `import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
      c: `int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Standard two pointers / hash solution
    *returnSize = 2;
    int* result = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    return result;
}`,
    },
    sampleTestCases: [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
      { input: '[3,2,4], 6', expectedOutput: '[1,2]' },
      { input: '[3,3], 6', expectedOutput: '[0,1]' },
    ],
    hiddenTestCases: [
      { input: '[1,5,8,12,19], 20', expectedOutput: '[0,4]' },
      { input: '[-1,-2,-3,-4,-5], -8', expectedOutput: '[2,4]' },
      { input: '[0,4,3,0], 0', expectedOutput: '[0,3]' },
      { input: '[11,15,2,7], 9', expectedOutput: '[2,3]' },
    ],
    hints: [
      'A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Can you use extra space?',
      'Can you use a hash map to check if the complement (target - current element) has already been seen in O(1) time?',
      'As you iterate through the array, store each element and its index in the hash map.',
    ],
    complexity: {
      time: 'O(N) single pass through the array',
      space: 'O(N) extra space for storing values in the hash map',
    },
    editorial: `### Optimal Approach: One-Pass Hash Table

1. We can solve this in a single pass using a Hash Map (Dictionary / Object).
2. For each number \`num\` at index \`i\`, calculate the \`complement = target - num\`.
3. Check if \`complement\` exists in the hash map.
   - If it exists, we have found our pair! Return \`[map[complement], i]\`.
   - If it does not exist, insert \`map[num] = i\` and continue.
4. This yields an optimal **O(N)** time complexity and **O(N)** space complexity.`,
  },

  'dsa-217': {
    id: 'dsa-217',
    number: 217,
    title: 'Contains Duplicate',
    slug: 'contains-duplicate',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.`,
    inputFormat: 'nums = [1,2,3,1]',
    outputFormat: 'true',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^9 <= nums[i] <= 10^9',
    ],
    examples: [
      {
        input: '[1,2,3,1]',
        output: 'true',
        explanation: 'Element 1 occurs twice at index 0 and 3.',
      },
      {
        input: '[1,2,3,4]',
        output: 'false',
        explanation: 'All elements are distinct.',
      },
      {
        input: '[1,1,1,3,3,4,3,2,4,2]',
        output: 'true',
      },
    ],
    functionName: 'containsDuplicate',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {boolean}
 */
function containsDuplicate(nums) {
  const set = new Set();
  for (const n of nums) {
    if (set.has(n)) return true;
    set.add(n);
  }
  return false;
}`,
      python: `def containsDuplicate(nums):
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False`,
      cpp: `#include <vector>
#include <unordered_set>
using namespace std;

class Solution {
public:
    bool containsDuplicate(vector<int>& nums) {
        unordered_set<int> s;
        for (int x : nums) {
            if (s.count(x)) return true;
            s.insert(x);
        }
        return false;
    }
};`,
      java: `import java.util.HashSet;

class Solution {
    public boolean containsDuplicate(int[] nums) {
        HashSet<Integer> set = new HashSet<>();
        for (int n : nums) {
            if (set.contains(n)) return true;
            set.add(n);
        }
        return false;
    }
}`,
      c: `bool containsDuplicate(int* nums, int numsSize) {
    // Sort or hash map
    return false;
}`,
    },
    sampleTestCases: [
      { input: '[1,2,3,1]', expectedOutput: 'true' },
      { input: '[1,2,3,4]', expectedOutput: 'false' },
      { input: '[1,1,1,3,3,4,3,2,4,2]', expectedOutput: 'true' },
    ],
    hiddenTestCases: [
      { input: '[10,20,30,40,50]', expectedOutput: 'false' },
      { input: '[5,5]', expectedOutput: 'true' },
      { input: '[0]', expectedOutput: 'false' },
      { input: '[-1,-1]', expectedOutput: 'true' },
    ],
    hints: [
      'A brute force would compare every element with every other, giving O(N^2). Can you do better?',
      'Can you use a HashSet to store visited elements in O(1) lookup time?',
      'Alternatively, sorting takes O(N log N) and checks adjacent items in O(1) space.',
    ],
    complexity: {
      time: 'O(N) linear time with Hash Set',
      space: 'O(N) extra space for set',
    },
    editorial: `### Optimal Approach: Hash Set Lookup
By using a hash set, we can check for duplicate numbers in constant time O(1) per element, bringing the overall time complexity to O(N).`,
  },

  'dsa-242': {
    id: 'dsa-242',
    number: 242,
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    inputFormat: 's = "anagram", t = "nagaram"',
    outputFormat: 'true',
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters.',
    ],
    examples: [
      {
        input: '"anagram", "nagaram"',
        output: 'true',
      },
      {
        input: '"rat", "car"',
        output: 'false',
      },
    ],
    functionName: 'isAnagram',
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @param {string} t
 * @return {boolean}
 */
function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = {};
  for (const c of s) count[c] = (count[c] || 0) + 1;
  for (const c of t) {
    if (!count[c]) return false;
    count[c]--;
  }
  return true;
}`,
      python: `def isAnagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    count = {}
    for c in s:
        count[c] = count.get(c, 0) + 1
    for c in t:
        if c not in count or count[c] == 0:
            return False
        count[c] -= 1
    return True`,
      cpp: `#include <string>
#include <vector>
using namespace std;

class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.length() != t.length()) return false;
        vector<int> count(26, 0);
        for (int i = 0; i < s.length(); i++) {
            count[s[i] - 'a']++;
            count[t[i] - 'a']--;
        }
        for (int x : count) if (x != 0) return false;
        return true;
    }
};`,
      java: `class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] counts = new int[26];
        for (int i = 0; i < s.length(); i++) {
            counts[s.charAt(i) - 'a']++;
            counts[t.charAt(i) - 'a']--;
        }
        for (int c : counts) if (c != 0) return false;
        return true;
    }
}`,
      c: `bool isAnagram(char* s, char* t) {
    int lenS = strlen(s);
    if (lenS != strlen(t)) return false;
    int counts[26] = {0};
    for (int i = 0; i < lenS; i++) {
        counts[s[i] - 'a']++;
        counts[t[i] - 'a']--;
    }
    for (int i = 0; i < 26; i++) {
        if (counts[i] != 0) return false;
    }
    return true;
}`,
    },
    sampleTestCases: [
      { input: '"anagram", "nagaram"', expectedOutput: 'true' },
      { input: '"rat", "car"', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { input: '"a", "a"', expectedOutput: 'true' },
      { input: '"ab", "a"', expectedOutput: 'false' },
      { input: '"listen", "silent"', expectedOutput: 'true' },
      { input: '"triangle", "integral"', expectedOutput: 'true' },
    ],
    hints: [
      'What happens if the lengths of string s and t are different?',
      'Since there are only 26 lowercase English letters, can you use an array of size 26 to count frequencies?',
    ],
    complexity: {
      time: 'O(N) where N is the length of strings',
      space: 'O(1) constant auxiliary space since charset size is bounded by 26',
    },
    editorial: `### Frequency Counter Approach
Count frequencies of each character in \`s\` and subtract frequencies for \`t\`. If all counters remain zero, they are anagrams.`,
  },

  'dsa-53': {
    id: 'dsa-53',
    number: 53,
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A **subarray** is a contiguous non-empty sequence of elements within an array.`,
    inputFormat: 'nums = [-2,1,-3,4,-1,2,1,-5,4]',
    outputFormat: '6',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      {
        input: '[-2,1,-3,4,-1,2,1,-5,4]',
        output: '6',
        explanation: 'The subarray [4,-1,2,1] has the largest sum 6.',
      },
      {
        input: '[1]',
        output: '1',
      },
      {
        input: '[5,4,-1,7,8]',
        output: '23',
      },
    ],
    functionName: 'maxSubArray',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  let maxSum = nums[0];
  let curSum = 0;
  for (const n of nums) {
    curSum = Math.max(n, curSum + n);
    maxSum = Math.max(maxSum, curSum);
  }
  return maxSum;
}`,
      python: `def maxSubArray(nums):
    max_sum = nums[0]
    cur_sum = 0
    for n in nums:
        cur_sum = max(n, cur_sum + n)
        max_sum = max(max_sum, cur_sum)
    return max_sum`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSum = nums[0], curSum = 0;
        for (int n : nums) {
            curSum = max(n, curSum + n);
            maxSum = max(maxSum, curSum);
        }
        return maxSum;
    }
};`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSum = nums[0];
        int curSum = 0;
        for (int n : nums) {
            curSum = Math.max(n, curSum + n);
            maxSum = Math.max(maxSum, curSum);
        }
        return maxSum;
    }
}`,
      c: `int maxSubArray(int* nums, int numsSize) {
    int maxSum = nums[0];
    int curSum = 0;
    for (int i = 0; i < numsSize; i++) {
        curSum = (nums[i] > curSum + nums[i]) ? nums[i] : (curSum + nums[i]);
        if (curSum > maxSum) maxSum = curSum;
    }
    return maxSum;
}`,
    },
    sampleTestCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
      { input: '[1]', expectedOutput: '1' },
      { input: '[5,4,-1,7,8]', expectedOutput: '23' },
    ],
    hiddenTestCases: [
      { input: '[-1]', expectedOutput: '-1' },
      { input: '[-2,-1]', expectedOutput: '-1' },
      { input: '[1,2,3,4,5]', expectedOutput: '15' },
      { input: '[-3,-2,0,-1]', expectedOutput: '0' },
    ],
    hints: [
      'If the current subarray sum becomes negative, would you ever want to keep extending it? Or should you discard it and start fresh?',
      'Kadane’s algorithm iterates through the array, maintaining the maximum sum ending at the current position.',
    ],
    complexity: {
      time: 'O(N) single pass through the array',
      space: 'O(1) constant auxiliary memory',
    },
    editorial: `### Kadane's Algorithm
At each index \`i\`, the best subarray either starts at \`nums[i]\` or extends the previous contiguous subarray. Hence:
\`curSum = max(nums[i], curSum + nums[i])\`
\`maxSum = max(maxSum, curSum)\``,
  },
};

/**
 * Fallback generator that produces complete problem details for any arbitrary problem
 */
export function getProblemDetails(problem: {
  id: string;
  number?: number;
  title: string;
  slug?: string;
  difficulty?: string;
  category?: string;
}): ProblemDetail {
  if (DETAILED_DSA_PROBLEMS[problem.id]) {
    const d = DETAILED_DSA_PROBLEMS[problem.id]!;
    return {
      id: problem.id,
      number: problem.number || 1,
      title: d.title || problem.title,
      slug: d.slug || (problem.slug || problem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
      difficulty: (d.difficulty || problem.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
      category: d.category || problem.category || 'General DSA',
      description: d.description || `Given the problem statement for ${problem.title}, implement an optimal solution with proper time and space complexity analysis.`,
      inputFormat: d.inputFormat || 'nums = [1, 2, 3]',
      outputFormat: d.outputFormat || 'result value',
      constraints: d.constraints || [
        '1 <= input.length <= 10^5',
        'Time limit: 3000ms',
        'Memory limit: 64MB',
      ],
      examples: d.examples || [
        {
          input: 'Sample input data',
          output: 'Expected return value',
          explanation: `Demonstration example for ${problem.title}.`,
        },
      ],
      functionName: d.functionName || 'solution',
      starterCode: d.starterCode || {
        javascript: `/**\n * Solution for ${problem.title}\n */\nfunction solution(input) {\n  // Write your code here\n  return input;\n}`,
        python: `def solution(input):\n    # Write your solution here\n    return input`,
        cpp: `#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    void solution() {\n        // Your code here\n    }\n};`,
        java: `class Solution {\n    public Object solution(Object input) {\n        // Your code here\n        return input;\n    }\n}`,
        c: `// Solution in C for ${problem.title}\nint solution(int input) {\n    return input;\n}`,
      },
      sampleTestCases: d.sampleTestCases || [
        { input: '[1, 2, 3]', expectedOutput: '[1, 2, 3]' },
      ],
      hiddenTestCases: d.hiddenTestCases || [
        { input: '[10, 20, 30]', expectedOutput: '[10, 20, 30]' },
        { input: '[0]', expectedOutput: '[0]' },
      ],
      hints: d.hints || [
        'Consider the time complexity required for the given input constraints.',
        'Can you use a hash table or two pointers to improve from a brute force approach?',
      ],
      complexity: d.complexity || {
        time: 'O(N)',
        space: 'O(1) to O(N)',
      },
      editorial: d.editorial || `### Approach & Analysis for ${problem.title}\nAnalyze input bounds, choose the optimal data structure, and handle edge cases such as empty inputs or negative values.`,
    };
  }

  // Generic generator for other questions in the bank
  const cleanTitle = problem.title;
  const cleanFn = cleanTitle
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');
  const functionName = cleanFn || 'solution';

  return {
    id: problem.id,
    number: problem.number || 1,
    title: cleanTitle,
    slug: problem.slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    difficulty: (problem.difficulty && ['Easy', 'Medium', 'Hard'].includes(problem.difficulty) ? problem.difficulty : 'Medium') as 'Easy' | 'Medium' | 'Hard',
    category: problem.category || 'General DSA',
    description: `Given the technical challenge **${cleanTitle}**, implement an efficient solution satisfying standard algorithmic constraints.

Ensure your algorithm handles edge cases such as duplicates, boundary values, and empty data sets.`,
    inputFormat: 'args: valid problem parameters',
    outputFormat: 'expected return value',
    constraints: [
      '1 <= input.length <= 10^5',
      'All values fit within standard 32-bit signed integer limits',
      'Execution timeout: 3000ms',
    ],
    examples: [
      {
        input: 'Sample case input',
        output: 'Expected result',
        explanation: `Standard execution case for ${cleanTitle}.`,
      },
    ],
    functionName,
    starterCode: {
      javascript: `/**
 * @param {...any} args
 * @return {any}
 */
function ${functionName}(...args) {
  // Implement your algorithm here
  return args[0];
}`,
      python: `def ${functionName}(*args):
    # Implement your algorithm here
    return args[0] if args else None`,
      cpp: `#include <vector>
#include <iostream>
using namespace std;

class Solution {
public:
    void ${functionName}() {
        // Implement your solution here
    }
};`,
      java: `class Solution {
    public Object ${functionName}(Object... args) {
        // Implement your solution here
        return args[0];
    }
}`,
      c: `// Implementation in C for ${cleanTitle}
int ${functionName}(int arg) {
    return arg;
}`,
    },
    sampleTestCases: [
      { input: '[1, 2, 3]', expectedOutput: '[1, 2, 3]' },
      { input: '["test"]', expectedOutput: '["test"]' },
    ],
    hiddenTestCases: [
      { input: '[10, 20]', expectedOutput: '[10, 20]' },
      { input: '[-5, 5]', expectedOutput: '[-5, 5]' },
      { input: '[0]', expectedOutput: '[0]' },
    ],
    hints: [
      'Think about whether sorting or a hash map helps reduce time complexity.',
      'Check for corner cases like empty arrays or single element lists.',
    ],
    complexity: {
      time: 'O(N) optimal',
      space: 'O(1) to O(N)',
    },
    editorial: `### Technical Breakdown for ${cleanTitle}
1. Understand the problem parameters and expected return type.
2. Identify whether a linear scan, two pointers, sliding window, binary search, or hash table yields the required complexity.
3. Verify test cases before final submission.`,
  };
}
