import type {
  HiddenDiscovery,
  NPCDefinition,
  SideQuestDefinition,
  WorldInteraction,
} from "@/types/game";

/** Content for the campus-life layer. Coordinates are deliberately data, not scene logic. */
export const worldInteractions: WorldInteraction[] = [
  { id: "noticeboard-ground", floorId: "ground", position: { x: 520, y: 470 }, title: "Student noticeboard", prompt: "Read the board", description: "A rotating board of clubs and public events. Take a note, not a poster.", kind: "interaction", activityId: "club-pitch" },
  { id: "courtyard-bench", floorId: "ground", position: { x: 755, y: 615 }, title: "Courtyard bench", prompt: "Pause a moment", description: "The courtyard is a good place to reset and notice who else is around.", kind: "interaction" },
  { id: "gate-punch", floorId: "ground", position: { x: 1270, y: 1320 }, title: "Old punch gate", prompt: "Inspect the mechanism", description: "A retired entry mechanism now serves as a tiny piece of campus history.", kind: "discovery", discoveryId: "punch-gate-story", rewardXp: 15 },
  { id: "library-atlas", floorId: "fifth", position: { x: 760, y: 360 }, title: "Campus atlas", prompt: "Turn a page", description: "A fictional atlas invites you to compare what is documented with what you actually see.", kind: "interaction", activityId: "source-sleuth" },
  { id: "library-window", floorId: "fifth", position: { x: 1170, y: 335 }, title: "Quiet window", prompt: "Look outside", description: "Light, leaves, and a reminder that good research starts with observation.", kind: "discovery", discoveryId: "quiet-window", rewardXp: 15 },
  { id: "ics-parts-tray", floorId: "fourth", position: { x: 740, y: 340 }, title: "Parts tray", prompt: "Sort the tray", description: "A small maker ritual: label what you use so the next person can find it.", kind: "interaction", activityId: "debug-dash" },
  { id: "ics-terminal", floorId: "fourth", position: { x: 1100, y: 480 }, title: "Unplugged terminal", prompt: "Read the note", description: "The note asks explorers to reproduce a problem before proposing a fix.", kind: "discovery", discoveryId: "terminal-note", rewardXp: 20 },
  { id: "admin-community-board", floorId: "second", position: { x: 950, y: 420 }, title: "Community board", prompt: "Check the board", description: "A fictional list of volunteer shifts connects small acts to a bigger campus.", kind: "interaction", activityId: "campus-budget" },
  { id: "sports-board", floorId: "ground", position: { x: 900, y: 600 }, title: "EastQuest Sports Board", prompt: "Enter Sports Arcade", description: "A fictional campus board lists short, friendly arcade challenges.", kind: "interaction", activityId: "cricket-boundary-timing" },
  { id: "admin-stair-landing", floorId: "second", position: { x: 1260, y: 740 }, title: "Landing window", prompt: "Spot the mark", description: "A pencil mark records the height of a long-ago orientation banner.", kind: "discovery", discoveryId: "landing-mark", rewardXp: 15 },
  { id: "support-water-station", floorId: "first", position: { x: 660, y: 830 }, title: "Water station", prompt: "Refill your plan", description: "A gentle reminder to take care of the explorer behind the avatar.", kind: "interaction" },
  { id: "support-notice", floorId: "first", position: { x: 1100, y: 810 }, title: "Support notice", prompt: "Read the sign", description: "A fictional sign points toward respectful, private support conversations.", kind: "discovery", discoveryId: "support-note", rewardXp: 20 },
  { id: "roof-planter", floorId: "sixth", position: { x: 460, y: 720 }, title: "Garden planter", prompt: "Check the new leaf", description: "A public green-space story grows one careful observation at a time.", kind: "discovery", discoveryId: "first-leaf", rewardXp: 20 },
  { id: "third-gallery", floorId: "third", position: { x: 820, y: 420 }, title: "Gallery rail", prompt: "Follow the line", description: "A fictional student exhibition links sketches from several disciplines.", kind: "interaction" },
  { id: "sixth-study-nook", floorId: "sixth", position: { x: 460, y: 720 }, title: "Study nook", prompt: "Leave a kind note", description: "One sentence of encouragement can make a shared study space feel welcoming.", kind: "interaction" },
  { id: "seventh-rooftop-log", floorId: "seventh", position: { x: 1140, y: 350 }, title: "Weather log", prompt: "Add an observation", description: "A fictional weather log rewards careful attention to the everyday.", kind: "discovery", discoveryId: "weather-log", rewardXp: 20 },
  { id: "lower-archive-box", floorId: "lower-basement", position: { x: 770, y: 480 }, title: "Archive box", prompt: "Read the label", description: "The label is a fictional reminder that archives need context, dates, and care.", kind: "discovery", discoveryId: "archive-label", rewardXp: 20 },
  { id: "mark-one", floorId: "fifth", position: { x: 760, y: 360 }, title: "A strange mark", prompt: "Trace the symbol", description: "One quiet symbol appears beside the atlas margin.", kind: "discovery", discoveryId: "three-marks-i", rewardXp: 10 },
  { id: "mark-two", floorId: "fourth", position: { x: 740, y: 340 }, title: "A second mark", prompt: "Compare the symbol", description: "The same geometry returns, shifted just enough to suggest a route.", kind: "discovery", discoveryId: "three-marks-ii", rewardXp: 10 },
  { id: "mark-three", floorId: "second", position: { x: 950, y: 420 }, title: "The final mark", prompt: "Complete the pattern", description: "Three marks become a small fictional campus signature.", kind: "discovery", discoveryId: "three-marks-iii", rewardXp: 15 },
];

export const hiddenDiscoveries: HiddenDiscovery[] = [
  { id: "punch-gate-story", title: "The punch gate story", description: "An old entry ritual became a welcome for every new explorer.", floorId: "ground", position: { x: 1270, y: 1320 }, set: "Campus traces", stamp: "TRACE-01", rewardXp: 15, interactionId: "gate-punch" },
  { id: "quiet-window", title: "The quiet window", description: "A bright corner turns an ordinary library pause into a small ritual.", floorId: "fifth", position: { x: 1170, y: 335 }, set: "Campus traces", stamp: "TRACE-02", rewardXp: 15, interactionId: "library-window" },
  { id: "terminal-note", title: "The terminal note", description: "Reproduce, observe, then change one thing: a maker's pocket rule.", floorId: "fourth", position: { x: 1100, y: 480 }, set: "Campus traces", stamp: "TRACE-03", rewardXp: 20, interactionId: "ics-terminal" },
  { id: "landing-mark", title: "The landing mark", description: "A pencil line keeps a fictional orientation memory alive.", floorId: "second", position: { x: 1260, y: 740 }, set: "People & places", stamp: "PEOPLE-01", rewardXp: 15, interactionId: "admin-stair-landing" },
  { id: "support-note", title: "The support note", description: "A private invitation to ask for help without having to explain everything at once.", floorId: "first", position: { x: 1100, y: 810 }, set: "People & places", stamp: "PEOPLE-02", rewardXp: 20, interactionId: "support-notice" },
  { id: "first-leaf", title: "The first leaf", description: "A new leaf marks the sixth-floor garden's fictional seasonal beginning.", floorId: "sixth", position: { x: 460, y: 720 }, set: "People & places", stamp: "PEOPLE-03", rewardXp: 20, interactionId: "roof-planter" },
  { id: "weather-log", title: "The weather log", description: "A careful note turns a passing sky into a shared campus record.", floorId: "seventh", position: { x: 1140, y: 350 }, set: "Campus traces", stamp: "TRACE-04", rewardXp: 20, interactionId: "seventh-rooftop-log" },
  { id: "archive-label", title: "The archive label", description: "Context is part of every good discovery, even a fictional one.", floorId: "lower-basement", position: { x: 770, y: 480 }, set: "Campus traces", stamp: "TRACE-05", rewardXp: 20, interactionId: "lower-archive-box" },
  { id: "three-marks-i", title: "The Three Marks · I", description: "A symbol with no instruction, only an invitation to remember it.", floorId: "fifth", position: { x: 760, y: 360 }, set: "The Three Marks", stamp: "MARK-I", rewardXp: 10, interactionId: "mark-one" },
  { id: "three-marks-ii", title: "The Three Marks · II", description: "The second mark rotates the pattern and points back toward circulation.", floorId: "fourth", position: { x: 740, y: 340 }, set: "The Three Marks", stamp: "MARK-II", rewardXp: 10, interactionId: "mark-two" },
  { id: "three-marks-iii", title: "The Three Marks · III", description: "The final mark completes an optional fictional campus mystery.", floorId: "second", position: { x: 950, y: 420 }, set: "The Three Marks", stamp: "MARK-III", rewardXp: 15, interactionId: "mark-three" },
];

export const npcs: NPCDefinition[] = [
  { id: "mina", name: "Mina", role: "night-shift custodian", floorId: "ground", position: { x: 640, y: 585 }, bio: "Mina knows which public corners sound different after rain.", greeting: "The campus has more stories than locked doors. Ask before you enter, always.", rumorIds: ["midnight-stairwell"], questIds: ["echoes-and-edges"], accent: "#f1bd6c" },
  { id: "rafi", name: "Rafi", role: "gardening club volunteer", floorId: "sixth", position: { x: 460, y: 720 }, bio: "Rafi keeps the fictional sixth-floor planters labelled and watered.", greeting: "A garden is a team sport: notice, share, and leave it better.", rumorIds: ["rooftop-garden"], questIds: ["green-route"], accent: "#8bc8a1" },
  { id: "toma", name: "Toma", role: "student maker", floorId: "fourth", position: { x: 900, y: 410 }, bio: "Toma prototypes tiny tools and writes down what failed.", greeting: "If it breaks, that is a clue. What did you observe?", rumorIds: [], questIds: ["signal-to-story"], accent: "#86c5ca" },
  { id: "sana", name: "Sana", role: "peer mentor", floorId: "first", position: { x: 700, y: 820 }, bio: "Sana helps students find a next step without taking over their choices.", greeting: "You can ask for directions, support, or simply a quiet minute.", rumorIds: [], questIds: ["open-door-route"], accent: "#d7a0cf" },
  { id: "javed", name: "Javed", role: "student council treasurer", floorId: "second", position: { x: 780, y: 420 }, bio: "Javed makes fictional club budgets readable and kind to first-time organisers.", greeting: "A good plan leaves room for the person who has not arrived yet.", rumorIds: [], questIds: ["shared-campus"], accent: "#eaa77b" },
  { id: "lina", name: "Lina", role: "library research fellow", floorId: "fifth", position: { x: 990, y: 340 }, bio: "Lina keeps an atlas of questions, sources, and surprising connections.", greeting: "Bring me a question and one source you trust. We can follow the thread.", rumorIds: [], questIds: ["echoes-and-edges", "signal-to-story"], accent: "#b3a6e8" },
];

export const sideQuests: SideQuestDefinition[] = [
  {
    id: "echoes-and-edges",
    title: "Echoes & Edges",
    description: "Follow a respectful rumor from a public story to a documented source.",
    rewardXp: 90,
    steps: [
      { id: "ask-mina", title: "Ask Mina", description: "Hear the public version of the stairwell story.", npcId: "mina" },
      { id: "check-atlas", title: "Check the atlas", description: "Compare the story with a campus reference.", interactionId: "library-atlas", domain: "ACADEMICS" },
      { id: "share-lina", title: "Share with Lina", description: "Bring the thread to a research fellow.", npcId: "lina", domain: "ACADEMICS" },
    ],
  },
  {
    id: "green-route",
    title: "The Green Route",
    description: "Help a fictional gardening club make a welcoming public route.",
    rewardXp: 85,
    steps: [
      { id: "meet-rafi", title: "Meet Rafi", description: "Hear what the planters need.", npcId: "rafi" },
      { id: "read-notice", title: "Read the noticeboard", description: "Find the public green-space note.", interactionId: "noticeboard-ground", domain: "COMMUNITY" },
      { id: "find-leaf", title: "Find the first leaf", description: "Record the rooftop discovery.", interactionId: "roof-planter", domain: "WELLBEING" },
    ],
  },
  {
    id: "signal-to-story",
    title: "Signal to Story",
    description: "Connect a maker observation to a clear explanation.",
    rewardXp: 100,
    steps: [
      { id: "meet-toma", title: "Meet Toma", description: "Take the broken prototype seriously.", npcId: "toma", domain: "TECH" },
      { id: "parts-tray", title: "Sort the parts", description: "Put the maker ritual in order.", interactionId: "ics-parts-tray", domain: "TECH" },
      { id: "lina-source", title: "Find a source", description: "Use the atlas to explain the next test.", npcId: "lina", domain: "ACADEMICS" },
    ],
  },
  {
    id: "open-door-route",
    title: "An Open Door",
    description: "Build a supportive route that respects privacy and choice.",
    rewardXp: 80,
    steps: [
      { id: "meet-sana", title: "Meet Sana", description: "Listen for the next step.", npcId: "sana", domain: "WELLBEING" },
      { id: "read-support", title: "Read the support note", description: "Find the public signpost.", interactionId: "support-notice", domain: "WELLBEING" },
      { id: "water-break", title: "Take a water break", description: "Pause before you continue.", interactionId: "support-water-station", domain: "WELLBEING" },
    ],
  },
  {
    id: "shared-campus",
    title: "Shared Campus",
    description: "A cross-domain route from budget to community to sport.",
    rewardXp: 120,
    steps: [
      { id: "meet-javed", title: "Meet Javed", description: "Start with an accessible event plan.", npcId: "javed", domain: "LEADERSHIP" },
      { id: "board", title: "Check the board", description: "Find a community partner.", interactionId: "admin-community-board", domain: "COMMUNITY", branch: "community" },
      { id: "sport-choice", title: "Choose your route", description: "Pick a sports or study finish.", branch: "sport" },
      { id: "finish", title: "Share the plan", description: "Return to Javed with the route you chose.", npcId: "javed" },
    ],
    branches: { sport: ["sports-arcade"], study: ["library-atlas"] },
  },
];

export const interactionById = (id: string) => worldInteractions.find((item) => item.id === id);
export const npcById = (id: string) => npcs.find((item) => item.id === id);
export const discoveryById = (id: string) => hiddenDiscoveries.find((item) => item.id === id);
export const sideQuestById = (id: string) => sideQuests.find((item) => item.id === id);
