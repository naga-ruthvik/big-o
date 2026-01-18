import { Problem, TOPICS } from '../types';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.now();

export const DEMO_DATA: Problem[] = [
  // 1. Existing User Problem
  {
    "id": "1768479135221",
    "title": "Longest Sub-Array with Sum K",
    "link": "https://www.geeksforgeeks.org/problems/longest-sub-array-with-sum-k0809/1",
    "topic": "Arrays & Hashing",
    "pattern": "Prefix Sum + Hash Map",
    "difficulty": "Medium",
    "confidence": 4,
    "constraints": "Time O(n), Space O(n); n <= 10^5.",
    "trigger": "Longest contiguous subarray with sum exactly K.",
    "aha": "Use a map to store the *first* index of every prefix sum. Distance = current_index - map[current_sum - k].",
    "mistake": "Forgot to handle the case where the subarray starts from index 0 (prefix_map[0] = -1).",
    "relatedTo": "Two Sum, Subarray Sum Equals K",
    "codeSnippet": "def longestSubarray(arr, k):\n    prefix = {0: -1}\n    cur = 0\n    res = 0\n    for i, n in enumerate(arr):\n        cur += n\n        if cur - k in prefix:\n            res = max(res, i - prefix[cur - k])\n        if cur not in prefix:\n            prefix[cur] = i\n    return res",
    "lastReviewed": NOW - (1 * DAY_MS),
    "nextReviewDate": NOW + (3 * DAY_MS),
    "revisionCount": 3,
    "easinessFactor": 2.6,
    "interval": 4,
    "reviewHistory": [
      { date: NOW - (10 * DAY_MS), quality: 3 },
      { date: NOW - (5 * DAY_MS), quality: 4 },
      { date: NOW - (1 * DAY_MS), quality: 5 }
    ]
  },
  // 2. CRITICAL (Due for review) - Graph BFS
  {
    "id": "demo-2",
    "title": "Number of Islands",
    "link": "https://leetcode.com/problems/number-of-islands/",
    "topic": "Graphs",
    "pattern": "Flood Fill / BFS",
    "difficulty": "Medium",
    "confidence": 2,
    "constraints": "m, n <= 300. O(m*n)",
    "trigger": "Count connected components of '1's in a grid.",
    "aha": "Iterate through grid. If '1' found, increment count and sink the island (turn '1's to '0's) using BFS/DFS so we don't count it again.",
    "mistake": "Stack overflow on DFS for large grids; switched to BFS queue.",
    "relatedTo": "Max Area of Island",
    "codeSnippet": "def numIslands(grid):\n    count = 0\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                bfs(r, c)\n                count += 1\n    return count",
    "lastReviewed": NOW - (4 * DAY_MS),
    "nextReviewDate": NOW - (1 * DAY_MS),
    "revisionCount": 2,
    "easinessFactor": 1.9,
    "interval": 2,
    "reviewHistory": [
      { date: NOW - (7 * DAY_MS), quality: 3 },
      { date: NOW - (4 * DAY_MS), quality: 2 }
    ]
  },
  // 3. MASTERED - Two Pointers
  {
    "id": "demo-3",
    "title": "Container With Most Water",
    "link": "https://leetcode.com/problems/container-with-most-water/",
    "topic": "Two Pointers",
    "pattern": "Shrinking Window",
    "difficulty": "Medium",
    "confidence": 5,
    "constraints": "O(n) time.",
    "trigger": "Find two lines that form a container with x-axis for max area.",
    "aha": "Area limited by shorter line. Always move the pointer of the shorter line inwards to hopefully find a taller line.",
    "mistake": "",
    "relatedTo": "Trapping Rain Water",
    "codeSnippet": "l, r = 0, len(height) - 1\nmax_area = 0\nwhile l < r:\n    area = (r - l) * min(height[l], height[r])\n    max_area = max(max_area, area)\n    if height[l] < height[r]:\n        l += 1\n    else:\n        r -= 1",
    "lastReviewed": NOW - (12 * DAY_MS),
    "nextReviewDate": NOW + (15 * DAY_MS),
    "revisionCount": 5,
    "easinessFactor": 2.9,
    "interval": 21,
    "reviewHistory": [
      { date: NOW - (30 * DAY_MS), quality: 3 },
      { date: NOW - (12 * DAY_MS), quality: 5 }
    ]
  },
  // 4. FADING - Sliding Window
  {
    "id": "demo-4",
    "title": "Longest Substring Without Repeating Characters",
    "link": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "topic": "Sliding Window",
    "pattern": "Dynamic Window + Set",
    "difficulty": "Medium",
    "confidence": 3,
    "constraints": "s.length <= 5 * 10^4",
    "trigger": "Find max length contiguous substring with unique chars.",
    "aha": "Use a set/map for characters in current window. If duplicates found (s[r] in set), shrink window from left until s[r] is removed.",
    "mistake": "Forgot to remove s[l] from set before incrementing l.",
    "relatedTo": "Max Consecutive Ones III",
    "codeSnippet": "charSet = set()\nl = 0\nres = 0\nfor r in range(len(s)):\n    while s[r] in charSet:\n        charSet.remove(s[l])\n        l += 1\n    charSet.add(s[r])\n    res = max(res, r - l + 1)",
    "lastReviewed": NOW - (5 * DAY_MS),
    "nextReviewDate": NOW + (1 * DAY_MS),
    "revisionCount": 2,
    "easinessFactor": 2.3,
    "interval": 5,
    "reviewHistory": [
      { date: NOW - (10 * DAY_MS), quality: 4 },
      { date: NOW - (5 * DAY_MS), quality: 3 }
    ]
  },
  // 5. CRITICAL - DP
  {
    "id": "demo-5",
    "title": "Climbing Stairs",
    "link": "https://leetcode.com/problems/climbing-stairs/",
    "topic": "1-D DP",
    "pattern": "Fibonacci Sequence",
    "difficulty": "Easy",
    "confidence": 2,
    "constraints": "n <= 45",
    "trigger": "Count distinct ways to reach step n taking 1 or 2 steps.",
    "aha": "dp[i] = dp[i-1] + dp[i-2]. Can optimize space to O(1) using two variables.",
    "mistake": "Confused base cases n=1 and n=2.",
    "relatedTo": "House Robber",
    "codeSnippet": "one, two = 1, 1\nfor i in range(n - 1):\n    temp = one\n    one = one + two\n    two = temp\nreturn one",
    "lastReviewed": NOW - (6 * DAY_MS),
    "nextReviewDate": NOW - (2 * DAY_MS),
    "revisionCount": 1,
    "easinessFactor": 1.7,
    "interval": 3,
    "reviewHistory": [
      { date: NOW - (6 * DAY_MS), quality: 1 }
    ]
  },
  // 6. MASTERED - Trees
  {
    "id": "demo-6",
    "title": "Invert Binary Tree",
    "link": "https://leetcode.com/problems/invert-binary-tree/",
    "topic": "Trees",
    "pattern": "Pre-order Traversal",
    "difficulty": "Easy",
    "confidence": 5,
    "constraints": "Nodes <= 100",
    "trigger": "Mirror the tree structure.",
    "aha": "Swap left and right children, then recurse on both.",
    "mistake": "",
    "relatedTo": "Symmetric Tree",
    "codeSnippet": "if not root: return None\nroot.left, root.right = root.right, root.left\ninvertTree(root.left)\ninvertTree(root.right)\nreturn root",
    "lastReviewed": NOW - (20 * DAY_MS),
    "nextReviewDate": NOW + (30 * DAY_MS),
    "revisionCount": 6,
    "easinessFactor": 3.0,
    "interval": 45,
    "reviewHistory": [
      { date: NOW - (20 * DAY_MS), quality: 5 }
    ]
  },
  // 7. FADING - Linked List
  {
    "id": "demo-7",
    "title": "Reverse Linked List",
    "link": "https://leetcode.com/problems/reverse-linked-list/",
    "topic": "Linked List",
    "pattern": "Iterative Pointer Manipulation",
    "difficulty": "Easy",
    "confidence": 3,
    "constraints": "O(n) time, O(1) space",
    "trigger": "Reverse directions of next pointers.",
    "aha": "Need three pointers: prev, curr, nxt. Save nxt, point curr to prev, move prev and curr forward.",
    "mistake": "Lost reference to the rest of the list before breaking the link.",
    "relatedTo": "Reverse Nodes in k-Group",
    "codeSnippet": "prev, curr = None, head\nwhile curr:\n    nxt = curr.next\n    curr.next = prev\n    prev = curr\n    curr = nxt\nreturn prev",
    "lastReviewed": NOW - (8 * DAY_MS),
    "nextReviewDate": NOW + (2 * DAY_MS),
    "revisionCount": 3,
    "easinessFactor": 2.5,
    "interval": 10,
    "reviewHistory": [
      { date: NOW - (8 * DAY_MS), quality: 3 }
    ]
  },
  // 8. CRITICAL - Heap
  {
    "id": "demo-8",
    "title": "Kth Largest Element in an Array",
    "link": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "topic": "Heap / Priority Queue",
    "pattern": "Min-Heap of size k",
    "difficulty": "Medium",
    "confidence": 2,
    "constraints": "O(n log k)",
    "trigger": "Find the Kth largest/smallest element.",
    "aha": "Maintain a Min-Heap of size K. Iterate through array, push elements. If heap size > K, pop min. The top is the Kth largest.",
    "mistake": "Used Max-Heap and popped k-1 times (O(n + klogn)), which is slower than maintaining size k min-heap.",
    "relatedTo": "Top K Frequent Elements",
    "codeSnippet": "import heapq\nheap = []\nfor n in nums:\n    heapq.heappush(heap, n)\n    if len(heap) > k:\n        heapq.heappop(heap)\nreturn heap[0]",
    "lastReviewed": NOW - (3 * DAY_MS),
    "nextReviewDate": NOW - (1 * DAY_MS),
    "revisionCount": 1,
    "easinessFactor": 2.1,
    "interval": 2,
    "reviewHistory": [
      { date: NOW - (3 * DAY_MS), quality: 2 }
    ]
  },
  // 9. MASTERED - Backtracking
  {
    "id": "demo-9",
    "title": "Permutations",
    "link": "https://leetcode.com/problems/permutations/",
    "topic": "Backtracking",
    "pattern": "DFS + State Cleanup",
    "difficulty": "Medium",
    "confidence": 5,
    "constraints": "n <= 6",
    "trigger": "Return all possible orderings.",
    "aha": "For loop through options. If not in current path, append to path, recurse, then POP to backtrack.",
    "mistake": "",
    "relatedTo": "Subsets",
    "codeSnippet": "res = []\ndef backtrack(path):\n    if len(path) == len(nums):\n        res.append(path[:])\n        return\n    for n in nums:\n        if n not in path:\n            path.append(n)\n            backtrack(path)\n            path.pop()",
    "lastReviewed": NOW - (15 * DAY_MS),
    "nextReviewDate": NOW + (20 * DAY_MS),
    "revisionCount": 4,
    "easinessFactor": 2.8,
    "interval": 30,
    "reviewHistory": [
      { date: NOW - (15 * DAY_MS), quality: 5 }
    ]
  },
  // 10. FADING - Trie
  {
    "id": "demo-10",
    "title": "Implement Trie (Prefix Tree)",
    "link": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "topic": "Tries",
    "pattern": "Tree of Maps",
    "difficulty": "Medium",
    "confidence": 3,
    "constraints": "word length <= 2000",
    "trigger": "Prefix search operations.",
    "aha": "Each node has a hashmap of children (char -> node) and an endOfWord boolean.",
    "mistake": "Forgot to mark endOfWord=True at the end of insertion.",
    "relatedTo": "Design Add and Search Words Data Structure",
    "codeSnippet": "class TrieNode:\n    def __init__(self):\n        self.children = {}\n        self.end = False",
    "lastReviewed": NOW - (6 * DAY_MS),
    "nextReviewDate": NOW + (2 * DAY_MS),
    "revisionCount": 2,
    "easinessFactor": 2.4,
    "interval": 7,
    "reviewHistory": [
      { date: NOW - (6 * DAY_MS), quality: 3 }
    ]
  },
  // 11. CRITICAL - Stack
  {
    "id": "demo-11",
    "title": "Valid Parentheses",
    "link": "https://leetcode.com/problems/valid-parentheses/",
    "topic": "Stack",
    "pattern": "Matching LIFO",
    "difficulty": "Easy",
    "confidence": 1,
    "constraints": "O(n)",
    "trigger": "Check if brackets are balanced.",
    "aha": "Use a stack. Push openers. For closers, pop and check if matches map[closer]. If stack not empty at end, return False.",
    "mistake": "Did not check if stack was empty before popping.",
    "relatedTo": "Generate Parentheses",
    "codeSnippet": "stack = []\ncloseToOpen = {')': '(', ']': '[', '}': '{'}\nfor c in s:\n    if c in closeToOpen:\n        if stack and stack[-1] == closeToOpen[c]:\n            stack.pop()\n        else:\n            return False\n    else:\n        stack.append(c)\nreturn True if not stack else False",
    "lastReviewed": NOW - (2 * DAY_MS),
    "nextReviewDate": NOW - (1 * DAY_MS),
    "revisionCount": 1,
    "easinessFactor": 1.5,
    "interval": 1,
    "reviewHistory": [
      { date: NOW - (2 * DAY_MS), quality: 1 }
    ]
  },
  // 12. MASTERED - Intervals
  {
    "id": "demo-12",
    "title": "Merge Intervals",
    "link": "https://leetcode.com/problems/merge-intervals/",
    "topic": "Arrays & Hashing",
    "pattern": "Sorting + Overlap Check",
    "difficulty": "Medium",
    "confidence": 5,
    "constraints": "O(nlogn) due to sorting",
    "trigger": "Merge overlapping time ranges.",
    "aha": "Sort by start time. Iterate: if current start < previous end, merge (max of ends). Else append new interval.",
    "mistake": "",
    "relatedTo": "Non-overlapping Intervals",
    "codeSnippet": "intervals.sort(key=lambda i: i[0])\noutput = [intervals[0]]\nfor start, end in intervals[1:]:\n    lastEnd = output[-1][1]\n    if start <= lastEnd:\n        output[-1][1] = max(lastEnd, end)\n    else:\n        output.append([start, end])",
    "lastReviewed": NOW - (10 * DAY_MS),
    "nextReviewDate": NOW + (25 * DAY_MS),
    "revisionCount": 3,
    "easinessFactor": 2.7,
    "interval": 35,
    "reviewHistory": [
      { date: NOW - (10 * DAY_MS), quality: 5 }
    ]
  },
  // 13. MASTERED - Bit Manipulation
  {
    "id": "demo-13",
    "title": "Single Number",
    "link": "https://leetcode.com/problems/single-number/",
    "topic": "Bit Manipulation",
    "pattern": "XOR Cancellation",
    "difficulty": "Easy",
    "confidence": 5,
    "constraints": "Time O(n), Space O(1)",
    "trigger": "Every element appears twice except for one.",
    "aha": "XORing a number with itself is 0. XORing with 0 is the number. XOR all numbers; the duplicates cancel out.",
    "mistake": "",
    "relatedTo": "Missing Number",
    "codeSnippet": "res = 0\nfor n in nums:\n    res = res ^ n\nreturn res",
    "lastReviewed": NOW - (20 * DAY_MS),
    "nextReviewDate": NOW + (40 * DAY_MS),
    "revisionCount": 4,
    "easinessFactor": 2.8,
    "interval": 40,
    "reviewHistory": [
      { date: NOW - (20 * DAY_MS), quality: 5 }
    ]
  },
  // 14. CRITICAL - Math & Geometry
  {
    "id": "demo-14",
    "title": "Happy Number",
    "link": "https://leetcode.com/problems/happy-number/",
    "topic": "Math & Geometry",
    "pattern": "Cycle Detection (Floyd's)",
    "difficulty": "Easy",
    "confidence": 2,
    "constraints": "Input fits in integer",
    "trigger": "Process repeats infinitely if it doesn't reach 1.",
    "aha": "Treat the sequence of numbers as a linked list. Use Fast & Slow pointers to detect a cycle.",
    "mistake": "Infinite loop because I didn't detect the cycle.",
    "relatedTo": "Linked List Cycle",
    "codeSnippet": "slow, fast = n, sumSq(n)\nwhile fast != 1 and slow != fast:\n    slow = sumSq(slow)\n    fast = sumSq(sumSq(fast))\nreturn fast == 1",
    "lastReviewed": NOW - (3 * DAY_MS),
    "nextReviewDate": NOW - (1 * DAY_MS),
    "revisionCount": 1,
    "easinessFactor": 1.8,
    "interval": 2,
    "reviewHistory": [
      { date: NOW - (3 * DAY_MS), quality: 2 }
    ]
  },
  // 15. FADING - 2-D DP
  {
    "id": "demo-15",
    "title": "Unique Paths",
    "link": "https://leetcode.com/problems/unique-paths/",
    "topic": "2-D DP",
    "pattern": "Grid Traversal Math",
    "difficulty": "Medium",
    "confidence": 3,
    "constraints": "m, n <= 100",
    "trigger": "Count paths from top-left to bottom-right moving only down/right.",
    "aha": "dp[r][c] = dp[r+1][c] + dp[r][c+1]. Base case: bottom or right edge = 1 way.",
    "mistake": "Forgot to initialize bottom row and rightmost column to 1.",
    "relatedTo": "Unique Paths II",
    "codeSnippet": "row = [1] * n\nfor i in range(m - 1):\n    newRow = [1] * n\n    for j in range(n - 2, -1, -1):\n        newRow[j] = newRow[j + 1] + row[j]\n    row = newRow\nreturn row[0]",
    "lastReviewed": NOW - (7 * DAY_MS),
    "nextReviewDate": NOW + (1 * DAY_MS),
    "revisionCount": 2,
    "easinessFactor": 2.2,
    "interval": 6,
    "reviewHistory": [
      { date: NOW - (7 * DAY_MS), quality: 3 }
    ]
  },
  // 16. MASTERED - Binary Search
  {
    "id": "demo-16",
    "title": "Search a 2D Matrix",
    "link": "https://leetcode.com/problems/search-a-2d-matrix/",
    "topic": "Binary Search",
    "pattern": "Double Binary Search",
    "difficulty": "Medium",
    "confidence": 5,
    "constraints": "Time O(log(m*n))",
    "trigger": "Sorted matrix, find target.",
    "aha": "Treat matrix as a flattened sorted array or do 2 binary searches: one for row, one for col.",
    "mistake": "",
    "relatedTo": "Binary Search",
    "codeSnippet": "top, bot = 0, ROWS - 1\nwhile top <= bot:\n    mid = (top + bot) // 2\n    if target > matrix[mid][-1]: top = mid + 1\n    elif target < matrix[mid][0]: bot = mid - 1\n    else: break\n# ... second BS on matrix[mid] ...",
    "lastReviewed": NOW - (18 * DAY_MS),
    "nextReviewDate": NOW + (35 * DAY_MS),
    "revisionCount": 5,
    "easinessFactor": 2.9,
    "interval": 35,
    "reviewHistory": [
      { date: NOW - (18 * DAY_MS), quality: 5 }
    ]
  }
];