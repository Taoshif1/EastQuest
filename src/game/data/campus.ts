import type { Collectible, Quest } from "@/types/game";
export { WORLD } from "./campus/index";
export { locations } from "./campus/pois";
export const collectibles: Collectible[] = [
  {
    id: "explorer-pass",
    name: "Explorer Pass",
    description: "Your invitation to take the first step.",
    location: "gate",
    whyItMatters:
      "Learn how to explore, investigate a marker, and keep what you discover.",
    icon: "pass",
  },
  {
    id: "knowledge-key",
    name: "Knowledge Key",
    description: "Good questions deserve trustworthy sources.",
    location: "library",
    whyItMatters:
      "Research skills help you evaluate evidence for assignments and beyond.",
    icon: "key",
  },
  {
    id: "tech-chip",
    name: "Tech Chip",
    description: "Small details. Big possibilities.",
    location: "ics",
    whyItMatters:
      "Practice patient debugging and build confidence with technology.",
    icon: "chip",
  },
  {
    id: "career-compass",
    name: "Career Compass",
    description: "Find direction in the things you build.",
    location: "career",
    whyItMatters:
      "Specific examples communicate your skills more clearly than broad claims.",
    icon: "compass",
  },
  {
    id: "support-beacon",
    name: "Support Beacon",
    description: "A reminder that you do not have to do it alone.",
    location: "support",
    whyItMatters:
      "Recognize when someone needs support and seek an appropriate trusted resource.",
    icon: "beacon",
  },
];
export const quests: Quest[] = [
  {
    id: "welcome",
    locationId: "gate",
    title: "Welcome to EastQuest",
    description: "Every campus story starts with a first step.",
    type: "tutorial",
    prerequisites: [],
    rewardXp: 50,
    collectibleId: "explorer-pass",
    config: {
      question: "Ready to make this campus your own?",
      options: ["Begin my quest"],
      correctIndex: 0,
      explanation:
        "Your Explorer Pass is yours. Continue through security and the punch gate to the courtyard. Find the Library in Block B, Fifth Floor, using its lift or stairs.",
      steps: [
        "MOVE · Use WASD, arrow keys, or the touch D-pad.",
        "DISCOVER · Walk toward a glowing location marker.",
        "INTERACT · Press E or tap Investigate to open a quest.",
        "COLLECT · Complete challenges to earn XP and useful Campus Keys.",
      ],
    },
  },
  {
    id: "research",
    locationId: "library",
    title: "The source of knowledge",
    description:
      "A research challenge. General learning advice, not official library policy.",
    type: "multiple-choice",
    prerequisites: ["welcome"],
    rewardXp: 100,
    collectibleId: "knowledge-key",
    config: {
      question: "Which source is generally strongest for academic research?",
      options: [
        "An anonymous social post",
        "A peer-reviewed journal",
        "A random advertisement",
        "An unverified comment",
      ],
      correctIndex: 1,
      explanation:
        "Peer review adds expert scrutiny. You should still evaluate relevance, methods, and the quality of evidence.",
    },
  },
  {
    id: "debug",
    locationId: "ics",
    title: "Close the loop",
    description: "Every developer starts with a little curiosity.",
    type: "logic",
    prerequisites: ["welcome"],
    rewardXp: 100,
    collectibleId: "tech-chip",
    config: {
      question:
        'Which closing symbol is missing?\nconsole.log("Hello EastQuest"',
      options: ["]", "}", ")", ">"],
      correctIndex: 2,
      explanation:
        "The opening parenthesis needs a matching closing parenthesis to finish the function call.",
    },
  },
  {
    id: "future",
    locationId: "career",
    title: "Show what you can do",
    description: "Make your experience speak for itself.",
    type: "quick-decision",
    prerequisites: ["welcome"],
    rewardXp: 100,
    collectibleId: "career-compass",
    config: {
      question: "Which CV statement communicates work more effectively?",
      options: [
        "I know React.",
        "Built a React application integrated with REST APIs.",
      ],
      correctIndex: 1,
      explanation:
        "A concrete project demonstrates how you applied a skill. Add truthful outcomes when you have them.",
    },
  },
  {
    id: "care",
    locationId: "support",
    title: "Look out for each other",
    description:
      "General support awareness, not medical advice or an official EWU procedure.",
    type: "scenario",
    prerequisites: ["welcome"],
    rewardXp: 100,
    collectibleId: "support-beacon",
    config: {
      question:
        "A classmate says they feel overwhelmed and would like help. What is a supportive response?",
      options: [
        "Dismiss their concerns",
        "Listen and help them find a trusted support resource",
        "Post their situation publicly",
      ],
      correctIndex: 1,
      explanation:
        "Listen respectfully, protect their privacy, and help them connect with a trusted support resource.",
    },
  },
];
