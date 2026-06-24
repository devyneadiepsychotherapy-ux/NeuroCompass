export interface Tool {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  type: "quick" | "guided" | "info" | "interactive";
  content: ToolContent;
  linkTo?: string; // if set, card navigates to this page instead of opening modal
}

export interface ToolContent {
  intro?: string;
  steps?: string[];
  tips?: string[];
  prompts?: string[];
  timerMinutes?: number;
  affirmation?: string;
  variants?: { label: string; description: string }[];
}

export const TOOL_CATEGORIES = [
  { id: "time", label: "Time Management", icon: "Clock", color: "bg-[#ede8e0] text-[#6b5f50]" },
  { id: "motivation", label: "Motivation & Activation", icon: "Zap", color: "bg-[#f0e8d0] text-[#7a6030]" },
  { id: "attention", label: "Attention & Focus", icon: "Brain", color: "bg-[#dde4ec] text-[#4a607a]" },
  { id: "planning", label: "Planning & Organization", icon: "ClipboardList", color: "bg-[#e4e8d8] text-[#4a6040]" },
  { id: "impulsivity", label: "Impulsivity", icon: "Wind", color: "bg-[#dce8e4] text-[#3a6860]" },
  { id: "sensory", label: "Sensory", icon: "Leaf", color: "bg-[#e8ede6] text-[#4a7050]" },
  { id: "selfcare", label: "Self-Care & Chores", icon: "Heart", color: "bg-[#f0e0e4] text-[#8a5060]" },
  { id: "eating", label: "Eating Challenges", icon: "Utensils", color: "bg-[#f0e4d8] text-[#7a5440]" },
  { id: "perfectionism", label: "Perfectionism", icon: "CheckCircle", color: "bg-[#ece0ec] text-[#7a5080]" },
  { id: "people", label: "People Pleasing", icon: "Users", color: "bg-[#f0eadc] text-[#786040]" },
  { id: "burnout", label: "Burnout Prevention", icon: "Battery", color: "bg-[#f0ddd8] text-[#9a5040]" },
  { id: "interoception", label: "Interoception", icon: "Activity", color: "bg-[#e4e0ec] text-[#5a5088]" },
  { id: "emotion", label: "Emotion Regulation", icon: "Heart", color: "bg-[#f0e4e0] text-[#8a5850]" },
];

export const TOOLS: Tool[] = [
  // TIME MANAGEMENT
  {
    id: "time-timer",
    title: "Time Timer",
    description: "Visual countdown to make time feel real and concrete",
    category: "time",
    icon: "Timer",
    type: "interactive",
    content: {
      intro: "Time blindness is real. This timer makes time visible so your brain can track it.",
      timerMinutes: 25,
      tips: [
        "Use for tasks you keep avoiding, set a small amount to start",
        "25 minutes = one Pomodoro. 5 minutes = a starter dose",
        "The goal isn't to finish, it's to start",
      ],
      affirmation: "Starting is the hardest part. Once you begin, your brain can catch up."
    }
  },
  {
    id: "time-anchors",
    title: "Time Anchors",
    description: "Use events (not clocks) to structure your day",
    category: "time",
    icon: "Anchor",
    type: "info",
    content: {
      intro: "Instead of scheduling by clock time, anchor tasks to events you already do.",
      steps: [
        "Identify 3-4 fixed anchors in your day (wake up, lunch, dinner, bed)",
        "Attach 1-2 tasks to each anchor: 'After coffee → check messages'",
        "Use transition phrases: 'right before', 'right after', 'during'",
        "Keep anchor tasks small and specific",
      ],
      tips: [
        "Morning anchor → evening anchor is easier than precise times",
        "This works well with rejection-sensitive routines",
      ],
      affirmation: "You don't have to live by the clock. Anchor to your life instead."
    }
  },
  {
    id: "time-blocking",
    title: "Flexible Time Blocking",
    description: "Block categories of time, not tasks, ND-friendly scheduling",
    category: "time",
    icon: "LayoutGrid",
    type: "info",
    content: {
      intro: "Traditional time blocking fails ND brains. This version gives structure without rigidity.",
      steps: [
        "Divide your day into 3 zones: Creative, Admin, Recovery",
        "Assign zones to rough time windows (not exact)",
        "Only plan 50-60% of your day, leave buffer",
        "Review the day before bed and adjust tomorrow",
      ],
      tips: [
        "If you miss a block, it's data, not failure",
        "Add 'transition time' between blocks (10-15 min)",
      ],
    }
  },
  {
    id: "body-double",
    title: "Body Doubling",
    description: "Work alongside someone (real or virtual) to activate focus",
    category: "time",
    icon: "Users",
    type: "guided",
    content: {
      intro: "Body doubling works because social presence activates the ADHD brain's accountability system.",
      timerMinutes: 25,
      steps: [
        "Find a body double: friend, virtual co-working session, or YouTube 'study with me' video",
        "Tell them what you plan to work on (even briefly)",
        "Work side by side, you don't have to talk",
        "Check in at the end: 'I got X done!'",
      ],
      tips: [
        "Try: Focusmate, Study Hall on Discord, or just a cafe",
        "Even a pet or a plant can help some brains",
        "Virtual is just as effective as in-person for many people",
      ],
      affirmation: "Needing company to work is not weakness. It's how your brain is wired."
    }
  },

  // MOTIVATION & ACTIVATION
  {
    id: "task-initiation",
    title: "Task Initiation Protocol",
    description: "A step-by-step bridge for when you can't start",
    category: "motivation",
    icon: "Rocket",
    type: "guided",
    content: {
      intro: "Task initiation difficulty is neurological, not laziness. This protocol bridges the gap.",
      steps: [
        "Name the task out loud or write it down",
        "Break it into the FIRST physical action only (open the document, not 'write the report')",
        "Set a 2-minute timer and commit to starting, not finishing",
        "Reduce friction: have everything you need within reach first",
        "If still stuck: do a 'body warm-up',stand up, shake hands, drink water",
      ],
      tips: [
        "The brain needs a runway. Give it permission to stop after 2 minutes.",
        "Imperfect action beats perfect inaction every time",
      ],
      affirmation: "You are not broken. Your brain needs a different on-ramp."
    }
  },
  {
    id: "dopamine-menu",
    title: "Dopamine Menu",
    description: "Build your personalized menu of dopamine-boosting activities",
    category: "motivation",
    icon: "Zap",
    type: "guided",
    content: {
      intro: "A menu of activities that boost dopamine, organized by how much energy they take.",
      variants: [
        { label: "Appetizers (low effort, 1-5 min)", description: "Doodle, stretch, listen to a song, look outside, pet an animal, make a funny face" },
        { label: "Main courses (moderate, 10-30 min)", description: "Walk, creative project, call a friend, cook something, dance, rewatch a comfort episode" },
        { label: "Desserts (treats, any time)", description: "Something you truly enjoy with zero guilt, gaming, bubble bath, special coffee, favourite food" },
        { label: "Sides (pair with hard tasks)", description: "Background music, fidget toy, comfy clothes, snack, change of location" },
      ],
      prompts: [
        "What did you love as a kid?",
        "What makes you lose track of time?",
        "What feels like a reward, not a chore?",
      ],
      affirmation: "Your dopamine needs are real. Meeting them is self-care, not self-indulgence."
    },
    linkTo: "/tools/dopamine-menu",
  },
  {
    id: "pinch-motivators",
    title: "Brain Fuel",
    description: "Your ADHD brain runs on specific kinds of fuel. Figure out what's available right now and how to activate more of it.",
    category: "motivation",
    icon: "Key",
    type: "interactive",
    linkTo: "/tools/brain-fuel",
    content: { intro: "" },
  },
  {
    id: "reward-ladder",
    title: "Reward Ladder",
    description: "Pair unpleasant tasks with immediate, meaningful rewards",
    category: "motivation",
    icon: "Trophy",
    type: "guided",
    content: {
      intro: "ADHD brains struggle with delayed rewards. Make the reward immediate and real.",
      steps: [
        "Choose a task you've been avoiding",
        "Choose a reward that feels genuinely good (not just 'I'll be proud of myself')",
        "Set the reward up in advance (have it ready before you start)",
        "Do the task",
        "Take the reward, without guilt",
      ],
      tips: [
        "The reward must come immediately after, not 'later tonight'",
        "Small tasks = small rewards. Big tasks = big rewards.",
        "Don't reward yourself with more work",
      ],
    }
  },
  {
    id: "activation-ramp",
    title: "Activation Ramp",
    description: "Warm up your nervous system before a hard task",
    category: "motivation",
    icon: "Flame",
    type: "guided",
    content: {
      intro: "A dysregulated nervous system can't focus. Regulate first, then task.",
      steps: [
        "5 minutes of movement (walk, jump, shake, dance)",
        "Drink a glass of water",
        "Do 3 deep belly breaths",
        "State your intention: 'I'm going to [task] for [time]'",
        "Begin",
      ],
      tips: [
        "Cold water on wrists or face can help reset the nervous system quickly",
        "Music with a beat helps prime the brain for action",
      ],
    }
  },

  // ATTENTION & FOCUS
  {
    id: "pomodoro-nd",
    title: "ND Pomodoro",
    description: "A flexible Pomodoro that adapts to your brain, not the other way around",
    category: "attention",
    icon: "Timer",
    type: "interactive",
    content: {
      intro: "Traditional Pomodoro is 25/5. But ND brains need flexibility. Choose your own rhythm.",
      timerMinutes: 25,
      variants: [
        { label: "Starter dose (5/3)", description: "5 min work, 3 min break, for very hard tasks or low-spoon days" },
        { label: "Classic (25/5)", description: "Standard Pomodoro, good for moderate focus days" },
        { label: "Flow state (52/17)", description: "Longer focus block, longer break, for hyperfocus mode" },
        { label: "Ultradian (90/20)", description: "Match your brain's natural rhythm,90 min work, 20 min real rest" },
      ],
      tips: [
        "If you're in flow, ignore the timer and keep going",
        "Break should mean actual rest, not scrolling",
        "Do not push through exhaustion, it costs more later",
      ],
    }
  },
  {
    id: "focus-ritual",
    title: "Focus Ritual",
    description: "A consistent pre-focus routine that signals your brain: it's time",
    category: "attention",
    icon: "Sparkles",
    type: "guided",
    content: {
      intro: "Rituals create a conditioned response, your brain starts associating the ritual with focus.",
      steps: [
        "Choose 3-4 consistent elements (tea, music, desk tidy, 3 breaths)",
        "Do them in the same order every time",
        "Keep the whole ritual under 5 minutes",
        "Start your task immediately when the ritual ends",
      ],
      tips: [
        "Ritual doesn't need to be fancy, just consistent",
        "Over time, even hearing your focus playlist will cue the brain",
      ],
    }
  },
  {
    id: "attention-anchors",
    title: "Attention Anchors",
    description: "Objects and senses to pull you back when you drift",
    category: "attention",
    icon: "Anchor",
    type: "info",
    content: {
      intro: "When you drift (and you will), you need something external to bring you back.",
      steps: [
        "Keep a physical anchor on your desk: fidget, textured object, something meaningful",
        "Use music as an anchor, instrumental or lyric-free for most tasks",
        "Write your task on a sticky note in your visual field",
        "Use the phrase 'back to it' or 'return' when you catch yourself drifting",
      ],
      tips: [
        "Drift is not failure, noticing the drift and returning is the skill",
        "Brown noise, binaural beats, or lo-fi often help ND brains focus",
      ],
    }
  },

  {
    id: "focus-garden",
    title: "The Focus Garden",
    description: "A focus timer with a growing plant. The longer you focus, the more your plant grows.",
    category: "attention",
    icon: "TreePine",
    type: "interactive",
    linkTo: "/focus-garden",
    content: {
      steps: [
        "Set your focus duration",
        "Watch your plant grow as you work",
        "Earn XP for completing sessions",
      ],
    },
  },

  // PLANNING & ORGANIZATION
  {
    id: "brain-dump",
    title: "Brain Dump",
    description: "Empty your mental load onto paper (or screen) in 10 minutes",
    category: "planning",
    icon: "Brain",
    type: "guided",
    content: {
      intro: "The brain is not a storage device, it's a processing device. Get it all out.",
      steps: [
        "Set a 10-minute timer",
        "Write EVERYTHING: tasks, worries, ideas, random thoughts, no filter",
        "Don't organize yet, just get it out",
        "When done, sort into: Do, Delete, Delegate, Defer",
        "Pick just ONE thing to do next",
      ],
      tips: [
        "Do this when overwhelmed, not just when planning",
        "Voice-to-text works well for this if writing feels like too much",
      ],
      affirmation: "Your brain doesn't need to hold everything. Let the paper hold it for now."
    }
  },
  {
    id: "task-breakdown",
    title: "Task Breakdown",
    description: "Break any task into tiny, doable steps",
    category: "planning",
    icon: "ListChecks",
    type: "guided",
    content: {
      intro: "Vague tasks don't get done. Specific, tiny actions do.",
      steps: [
        "Write the task at the top",
        "Ask: 'What is the very first physical action?'",
        "Break that down until each step takes less than 5 minutes",
        "Number the steps and check them off one at a time",
        "Do not look at the full list while working, cover it",
      ],
      prompts: [
        "What would I do first if I had to start right now?",
        "What's making this feel big or scary?",
        "What's the smallest possible piece I could start with?",
      ],
    }
  },
  {
    id: "weekly-review",
    title: "Weekly Review (ND Version)",
    description: "A low-pressure, flexible weekly reset",
    category: "planning",
    icon: "Calendar",
    type: "guided",
    content: {
      intro: "Not a rigid system, a gentle check-in with yourself and your week.",
      steps: [
        "What worked well this week? (Write at least one thing)",
        "What felt hard or didn't work?",
        "What do I need to carry forward?",
        "What are my top 3 priorities for next week?",
        "What do I need to protect (rest, time, energy)?",
      ],
      tips: [
        "Do this with a warm drink and no time pressure",
        "15 minutes is enough, don't over-engineer it",
        "If you miss a week, just start fresh, no guilt",
      ],
    }
  },

  {
    id: "eisenhower-matrix",
    title: "Eisenhower Matrix",
    description: "Sort tasks by urgency × importance to cut through overwhelm",
    category: "planning",
    icon: "LayoutGrid",
    type: "interactive",
    linkTo: "/planner/eisenhower",
    content: { intro: "" },
  },
  {
    id: "mind-map",
    title: "Mind Map",
    description: "Visual radial thinking for planning, decisions, or brain dumps",
    category: "planning",
    icon: "GitBranch",
    type: "interactive",
    linkTo: "/planner/mindmap",
    content: { intro: "" },
  },

  // IMPULSIVITY
  {
    id: "pause-practice",
    title: "The Pause Practice",
    description: "A brief pause between urge and action",
    category: "impulsivity",
    icon: "PauseCircle",
    type: "guided",
    content: {
      intro: "Impulsivity isn't a character flaw, it's a timing issue. The pause creates space for choice.",
      steps: [
        "Notice the urge (spend, say, send, eat, do)",
        "Name it: 'I notice an urge to ___'",
        "Pause for 60 seconds, set a timer",
        "Ask: 'Do I still want to do this?'",
        "Choose intentionally",
      ],
      tips: [
        "You're not suppressing the urge, you're adding a gap",
        "Impulsive spending: 24-hour rule. Sleep on it.",
        "Impulsive messages: draft and wait 10 minutes before sending",
      ],
    }
  },
  {
    id: "urge-surfing",
    title: "Urge Surfing",
    description: "Ride the urge like a wave, don't fight it",
    category: "impulsivity",
    icon: "Waves",
    type: "guided",
    content: {
      intro: "From DBT: urges peak and pass. You don't have to act on them.",
      steps: [
        "Notice the urge, where do you feel it in your body?",
        "Describe it: size, shape, sensation, intensity (1-10)",
        "Watch it: does it grow? peak? start to ease?",
        "Breathe and observe, don't engage or resist",
        "Most urges peak within 20-30 minutes and naturally subside",
      ],
      tips: [
        "Especially useful for: emotional eating, impulsive spending, angry messages",
        "The goal is not to never act on urges, it's to choose when you do",
      ],
    }
  },
  {
    id: "wind-down",
    title: "Task Transition Tool",
    description: "Help your brain switch between tasks without shutdown",
    category: "impulsivity",
    icon: "RefreshCw",
    type: "guided",
    content: {
      intro: "Task-switching is hard for ND brains. Transitions need a bridge.",
      steps: [
        "Signal the end: say or write 'I'm done with ___'",
        "Note where you left off (leave yourself a breadcrumb)",
        "Take a 5-minute transition break (walk, stretch, water)",
        "Name your next task before starting",
        "Do your focus ritual",
      ],
      tips: [
        "Hyperfocus endings are hardest, set an alarm 10 min before you need to stop",
        "Physical movement between tasks helps reset the nervous system",
      ],
    }
  },

  // SENSORY
  {
    id: "sensory-audit",
    title: "Sensory Environment Audit",
    description: "Identify what's draining you and what helps",
    category: "sensory",
    icon: "Search",
    type: "guided",
    content: {
      intro: "Your environment profoundly affects your nervous system. Audit it intentionally.",
      prompts: [
        "What sounds in my environment feel uncomfortable or distracting?",
        "What lighting bothers me? What lighting helps?",
        "What textures or clothing feel sensory-uncomfortable today?",
        "What smells are present? Are they helpful or triggering?",
        "How much visual clutter is in my space?",
        "What temperature do I feel regulated at?",
      ],
      steps: [
        "Go through each sense: sight, sound, touch, smell, taste, movement",
        "Rate each area: 🔴 draining, 🟡 neutral, 🟢 regulating",
        "Make one small change to remove or reduce a 🔴",
        "Add one element from your 🟢 list",
      ],
      affirmation: "Sensory needs are real and valid. Modifying your environment is self-advocacy."
    }
  },
  {
    id: "sensory-overload",
    title: "Sensory Overload Protocol",
    description: "What to do when your sensory system is overwhelmed",
    category: "sensory",
    icon: "ShieldAlert",
    type: "guided",
    content: {
      intro: "Sensory overload is real, not dramatic. Here's a step-by-step protocol.",
      steps: [
        "Signal safety: remove yourself from the overwhelming environment if possible",
        "Reduce input: dim lights, lower sounds, remove uncomfortable clothing",
        "Proprioceptive grounding: press your feet into the floor, wrap yourself in a blanket, squeeze something",
        "Slow deep breaths: in for 4, hold 2, out for 6",
        "Avoid demands until your system recovers",
        "After: name what happened and what helped",
      ],
      tips: [
        "Create a 'sensory kit': noise-cancelling headphones, sunglasses, fidget, comfort object",
        "Let trusted people know what you need when overwhelmed",
      ],
      affirmation: "Needing sensory recovery is not weakness. It's listening to your body."
    }
  },
  {
    id: "sensory-diet",
    title: "Sensory Diet Builder",
    description: "Design a daily routine of sensory input your nervous system needs",
    category: "sensory",
    icon: "Leaf",
    type: "info",
    content: {
      intro: "A 'sensory diet' is a planned schedule of sensory activities to keep your nervous system regulated throughout the day.",
      variants: [
        { label: "Alerting activities", description: "Jumping, cold water, spicy food, bright light, upbeat music, for when you're under-stimulated" },
        { label: "Calming activities", description: "Deep pressure, slow rocking, dim light, warm drink, quiet music, for when you're over-stimulated" },
        { label: "Organizing activities", description: "Proprioceptive input: carrying, pushing, pulling, chewing, helps regulate and focus" },
        { label: "Daily anchor activities", description: "Morning and evening sensory rituals that help signal transitions" },
      ],
    }
  },

  {
    id: "sensory-profile",
    title: "My Sensory Profile",
    description: "Map your personal triggers, soothers, and accommodations across all senses",
    category: "sensory",
    icon: "Map",
    type: "interactive",
    linkTo: "/tools/sensory-profile",
    content: { intro: "" },
  },

  {
    id: "sensory-soothing-kit",
    title: "Sensory Soothing Kit",
    description: "Build a personalised kit of items, strategies, and environments to regulate your nervous system",
    category: "sensory",
    icon: "Sparkles",
    type: "interactive",
    linkTo: "/tools/sensory-soothing-kit",
    content: { intro: "" },
  },

  {
    id: "sensory-contingency-plan",
    title: "Sensory Contingency Plan",
    description: "Your personal exit plan and support toolkit for sensory-intense environments",
    category: "sensory",
    icon: "ShieldAlert",
    type: "interactive",
    content: {
      intro: "Having a plan before you enter a sensory-intense environment reduces panic and helps you exit safely when needed.",
    },
  },

  // SELF-CARE & CHORES
  {
    id: "chore-hack",
    title: "The 2-Minute Reset",
    description: "Tiny consistent actions that prevent chore avalanche",
    category: "selfcare",
    icon: "Sparkles",
    type: "info",
    content: {
      intro: "The secret to not drowning in chores: many tiny actions, not big cleaning sessions.",
      timerMinutes: 2,
      steps: [
        "If it takes less than 2 minutes, do it now",
        "Attach chores to existing habits (dishes after meals, wipe sink after brushing teeth)",
        "Keep supplies in the room where they're needed",
        "One room 'reset' every evening, not a full clean",
        "Progress, not perfection: a tidier space is better than a perfect space",
      ],
      tips: [
        "Audiobooks and podcasts make chores tolerable",
        "Visual mess cues are real, closed doors, baskets, and bins help",
      ],
    }
  },
  {
    id: "self-care-minimum",
    title: "Minimum Viable Self-Care",
    description: "Your non-negotiable basics for hard days",
    category: "selfcare",
    icon: "Droplets",
    type: "guided",
    content: {
      intro: "When executive function is low, aim for minimum viable self-care, not your best self-care.",
      steps: [
        "Water (drink a glass right now)",
        "Food (anything counts, even a handful of crackers)",
        "Basic hygiene (face wipe, teeth brush, full shower optional)",
        "Movement (5 minutes, even standing and stretching)",
        "Sleep hygiene (lights low, screens off, same time)",
      ],
      tips: [
        "On hard days: pick just one. Something always beats nothing.",
        "Keep easy food options accessible for low-executive-function days",
        "Body wipes, dry shampoo, and face wipes are valid hygiene tools",
      ],
      affirmation: "Survival mode is valid. You are doing enough."
    }
  },
  {
    id: "habit-builder",
    title: "Habit Builder",
    description: "Start new habits or return to old ones -with a good-enough version for hard days",
    category: "selfcare",
    icon: "Sprout",
    type: "interactive",
    linkTo: "/habits",
    content: {
      intro: "Build habits in a way that actually works for your brain.",
    }
  },
  {
    id: "habit-stack",
    title: "Habit Stacking",
    description: "Attach new habits to things you already do reliably",
    category: "selfcare",
    icon: "ListChecks",
    type: "guided",
    content: {
      intro: "Instead of building new routines from scratch, piggyback on existing ones.",
      steps: [
        "List 5 things you do every day without thinking (coffee, phone, shower, etc.)",
        "Choose a habit you want to build",
        "Attach it directly before or after an existing habit: 'After I make coffee, I take my meds'",
        "Keep the new habit tiny at first",
        "Add a physical cue: put meds next to the coffee maker",
      ],
      tips: [
        "This works because you're borrowing an already-wired neural pathway",
        "Don't stack more than 2 new habits at once",
      ],
    }
  },

  // EATING CHALLENGES
  {
    id: "hunger-signals",
    title: "Hunger Signal Awareness",
    description: "Reconnect with interoceptive hunger cues",
    category: "eating",
    icon: "Thermometer",
    type: "guided",
    content: {
      intro: "Many ND people struggle to notice hunger until they're ravenous, or don't feel it at all. This is an interoception challenge, not a willpower issue.",
      steps: [
        "Set meal timers instead of relying on hunger cues (every 3-4 hours)",
        "Before eating: pause and scan, stomach empty/full? Light-headed? Irritable? These can be hunger",
        "Eat slowly enough to notice fullness arriving (it takes ~20 min)",
        "Keep an eating log just to track patterns, not calories",
      ],
      prompts: [
        "What does hunger feel like in MY body specifically?",
        "Do I feel hunger in my stomach, or somewhere else (head, hands, mood)?",
        "What are my personal low blood sugar signals?",
      ],
      affirmation: "Your hunger cues may be quieter or different. That's okay. You can learn to listen."
    }
  },
  {
    id: "easy-food",
    title: "Easy Food Protocol",
    description: "ND-friendly food strategies for low-spoon days",
    category: "eating",
    icon: "Utensils",
    type: "info",
    content: {
      intro: "Food prep is hard when executive function is low. These strategies reduce the barrier.",
      steps: [
        "Keep 'always foods' stocked: foods you'll always eat regardless of state",
        "Prep ingredients, not full meals, washed veg, cooked grain, boiled eggs last days",
        "Batch cook one thing when energy is high",
        "Accept convenience food, nutrition matters more than freshness or cooking",
        "Pair textures strategically if you have texture sensitivities",
      ],
      variants: [
        { label: "Zero-energy foods", description: "No cooking needed: cheese, crackers, fruit, yogurt, deli meat, cereal, nut butter" },
        { label: "Microwave meals", description: "Frozen meals, microwaved eggs, instant oatmeal, all valid nutrition sources" },
        { label: "Batch cooking wins", description: "Rice cooker rice, hard-boiled eggs x6, roasted veg sheet pan, mix and match all week" },
      ],
      affirmation: "Feeding yourself is an act of self-care regardless of what or how."
    }
  },
  {
    id: "eating-routine",
    title: "Eating Routine Builder",
    description: "Structure eating around anchors rather than hunger",
    category: "eating",
    icon: "Calendar",
    type: "guided",
    content: {
      intro: "For brains that don't reliably feel hunger, eating by schedule is a valid and helpful strategy.",
      steps: [
        "Choose 3 anchor meal times (not precise, approximate)",
        "Set gentle phone reminders with a kind message: 'Hey, time to fuel up'",
        "Plan a few 'default' meals for each time (reduces decision fatigue)",
        "Don't wait for hunger, eat at the time regardless",
        "Allow flexibility, the goal is consistent nourishment, not perfection",
      ],
      tips: [
        "ADHD meds can suppress appetite, eat before meds kick in if this is you",
        "Eating with others or while doing something enjoyable often helps",
      ],
    }
  },

  {
    id: "meal-planner",
    title: "Meal Planner",
    description: "Weekly meal grid with easy-food ideas and a shopping list",
    category: "eating",
    icon: "ShoppingCart",
    type: "interactive",
    linkTo: "/meal-plan",
    content: { intro: "" },
  },
  {
    id: "arfid-support",
    title: "ARFID and Picky Eating Support",
    description: "Compassionate strategies for navigating ARFID, food aversions, and selective eating",
    category: "eating",
    icon: "UtensilsCrossed",
    type: "interactive",
    content: {
      intro: "ARFID (Avoidant/Restrictive Food Intake Disorder) and picky eating are real neurological experiences, not preference or stubbornness. Your relationship with food makes complete sense given how your nervous system works.",
    }
  },
  {
    id: "nd-meals",
    title: "ND-Friendly Meal Ideas",
    description: "Low-effort, low-sensory-overwhelm meal ideas that work for neurodivergent brains",
    category: "eating",
    icon: "Utensils",
    type: "interactive",
    content: {
      intro: "No energy for cooking is valid. These meals are organised by effort level so you can find something that works for where you are right now.",
    }
  },

  // PERFECTIONISM
  {
    id: "done-better-perfect",
    title: "Done > Perfect",
    description: "Reframe perfectionism as a protective strategy",
    category: "perfectionism",
    icon: "CheckCircle",
    type: "guided",
    content: {
      intro: "Perfectionism in ND brains often comes from fear of criticism (RSD), shame, or past experiences of not meeting expectations. Understanding why it's there is the first step.",
      steps: [
        "Name the perfectionistic thought: 'If it's not perfect, it doesn't count'",
        "Ask: 'Is this true? What evidence do I have?'",
        "Set a 'good enough' standard before starting (not after)",
        "Use a timer: when the timer ends, it's done",
        "Submit/share before you feel ready",
      ],
      prompts: [
        "What would I tell a friend who did what I've done so far?",
        "What's the worst realistic outcome of this being imperfect?",
        "Is my standard realistic for my current capacity?",
      ],
      affirmation: "Done and imperfect creates more in the world than perfect and never finished."
    }
  },
  {
    id: "rsd-perfectionism",
    title: "RSD & Perfectionism",
    description: "Understand how rejection sensitivity fuels perfectionism",
    category: "perfectionism",
    icon: "Shield",
    type: "info",
    content: {
      intro: "Rejection Sensitive Dysphoria (RSD) is common in ADHD and autism. The fear of criticism or failure can drive perfectionism as a protection strategy.",
      steps: [
        "Recognize the pattern: 'I make it perfect so no one can criticize me'",
        "Validate the strategy, it makes sense given past experiences",
        "Practice separating self-worth from output quality",
        "Build tolerance for criticism in low-stakes situations first",
        "Practise self-compassion as a direct antidote",
      ],
      tips: [
        "RSD is not a character flaw, it's a neurological sensitivity",
        "Therapy (especially CBT and self-compassion work) is very effective here",
      ],
      affirmation: "Your worth is not your output. You are enough as you are."
    }
  },

  // PEOPLE PLEASING
  {
    id: "boundary-scripts",
    title: "Boundary Scripts",
    description: "Ready-to-use phrases for saying no and setting limits",
    category: "people",
    icon: "MessageCircle",
    type: "info",
    content: {
      intro: "For people pleasers, having pre-planned scripts reduces the in-the-moment panic of saying no.",
      steps: [
        "'Let me check my schedule and get back to you.' (buys thinking time)",
        "'That doesn't work for me right now.'",
        "'I'm not able to take that on at the moment.'",
        "'I'd love to help but I'm at capacity.'",
        "'I need to think about that before I commit.'",
      ],
      tips: [
        "No is a complete sentence, explanations are optional",
        "Practice saying no in low-stakes situations to build the muscle",
        "Guilt after saying no is normal, it doesn't mean you did something wrong",
      ],
      affirmation: "Saying no to others is often saying yes to yourself."
    }
  },
  {
    id: "fawn-response",
    title: "Understanding the Fawn Response",
    description: "Recognize when people pleasing is a nervous system response",
    category: "people",
    icon: "Users",
    type: "info",
    content: {
      intro: "The 'fawn' response (fight/flight/freeze/fawn) is a survival strategy, automatically prioritizing others to avoid conflict or rejection.",
      steps: [
        "Notice fawn triggers: conflict, disappointment, someone's anger, perceived rejection",
        "Body signals: sudden urge to agree, smile when you don't mean it, apologize unnecessarily",
        "Pause and check in: 'What do I actually want here?'",
        "Practice 'tolerating others' discomfort' in small steps",
        "Notice the pattern, awareness before change",
      ],
      tips: [
        "Fawning often comes from early experiences where it was genuinely necessary for safety",
        "Therapy (especially trauma-informed) is very helpful for fawn response work",
      ],
      affirmation: "Your people pleasing made sense once. It's safe to explore new ways of being now."
    }
  },
  {
    id: "needs-inventory",
    title: "Needs Inventory",
    description: "Reconnect with what YOU actually want and need",
    category: "people",
    icon: "Map",
    type: "guided",
    content: {
      intro: "People pleasers often don't know what they need, years of prioritizing others can make your own needs feel invisible.",
      prompts: [
        "What would I do today if no one was watching or judging?",
        "What have I said yes to recently that I wanted to say no to?",
        "What do I actually need right now, rest, connection, alone time, food?",
        "What resentment am I carrying? (Resentment is often a sign of unmet needs)",
        "What would I do if I knew I wouldn't disappoint anyone?",
      ],
      affirmation: "Your needs are not too much. They are not a burden. They matter."
    }
  },

  // BURNOUT
  {
    id: "burnout-signs",
    title: "Burnout Warning Signs",
    description: "Catch burnout early before it becomes collapse",
    category: "burnout",
    icon: "AlertTriangle",
    type: "info",
    content: {
      intro: "ND burnout is real, often severe, and preventable if caught early. It's different from regular tiredness.",
      steps: [
        "Physical: exhaustion that sleep doesn't fix, frequent illness, sensory sensitivity increase",
        "Cognitive: brain fog, memory issues, slower processing, trouble with words",
        "Emotional: emotional numbness, increased meltdowns/shutdowns, anhedonia",
        "Social: need for extreme isolation, masking feels impossible",
        "Functional: struggling with things you normally manage fine",
      ],
      tips: [
        "ND burnout can last weeks to months, prevention is much easier than recovery",
        "Burnout is often triggered by prolonged masking, overextension, and unmet needs",
      ],
      affirmation: "Burning out doesn't mean you failed. It means you gave too much without enough support."
    }
  },
  {
    id: "burnout-recovery",
    title: "Burnout Recovery Plan",
    description: "A gentle, realistic plan for recovering from ND burnout",
    category: "burnout",
    icon: "Battery",
    type: "guided",
    content: {
      intro: "Recovery from ND burnout requires genuine rest and a reduction of demands, not pushing through.",
      steps: [
        "Reduce masking: be more yourself with safe people",
        "Reduce demands: drop non-essential commitments, this is not optional",
        "Increase recovery activities: sleep, sensory comfort, no-demand time",
        "Communicate needs to those around you",
        "Expect fluctuation, good days don't mean recovery is complete",
        "Reintroduce activities very slowly, one at a time",
      ],
      tips: [
        "Recovery is not linear. Expect setbacks.",
        "Genuine recovery takes weeks to months depending on severity",
        "Professional support (ND-affirming therapist) is valuable here",
      ],
      affirmation: "Rest is not a reward for productivity. Rest is how you heal."
    }
  },
  {
    id: "energy-accounting",
    title: "Energy Accounting",
    description: "Track what drains and what restores your energy",
    category: "burnout",
    icon: "BatteryLow",
    type: "guided",
    content: {
      intro: "Think of your energy as a bank account. Know what deposits and what withdrawals look like for YOU.",
      prompts: [
        "What activities drain you more than they 'should'? (masking, social events, transitions)",
        "What restores your energy that others might not understand? (alone time, special interest, stimming)",
        "What are your biggest energy drains this week?",
        "What have you done to replenish this week?",
        "Are your deposits keeping up with your withdrawals?",
      ],
      steps: [
        "List your top 5 energy drains",
        "List your top 5 energy restorers",
        "Track daily: did I end with more or less energy than I started?",
        "Notice patterns and protect restoration time proactively",
      ],
    }
  },
  {
    id: "masking-costs",
    title: "Understanding Masking",
    description: "The cost of camouflaging your ND traits",
    category: "burnout",
    icon: "Eye",
    type: "info",
    content: {
      intro: "Masking (camouflaging ND traits to appear neurotypical) has a significant neurological and emotional cost, especially over time.",
      steps: [
        "Recognize your masking behaviors: scripting conversations, forcing eye contact, suppressing stimming",
        "Notice when masking increases (high-stakes social situations, workplaces)",
        "Identify safe spaces and people where you can unmask",
        "Reduce masking in small steps where it's safe to do so",
        "Understand that unmasking is a gradual, often emotional process",
      ],
      tips: [
        "Masking is a survival strategy, not a choice, avoid shaming yourself for it",
        "Unmasking is not the same as having no social skills, it's expressing yourself authentically",
      ],
      affirmation: "You don't have to earn your place in the world by hiding who you are."
    }
  },

  // INTEROCEPTION
  {
    id: "interoception-basics",
    title: "Interoception 101",
    description: "Understanding your body's internal sensing system",
    category: "interoception",
    icon: "Activity",
    type: "info",
    content: {
      intro: "Interoception is the sense of your body's internal states, hunger, thirst, temperature, pain, emotion, heartbeat. Many ND people have differences in interoception.",
      steps: [
        "Signs of reduced interoception: not noticing hunger, thirst, needing to use the bathroom, pain until it's extreme",
        "Signs of heightened interoception: hyperawareness of heartbeat, breathing, internal discomfort",
        "Both are common in ADHD and autism",
        "Interoception can be developed, it's a trainable skill",
      ],
      tips: [
        "Regular body scan practice builds interoceptive awareness over time",
        "Use external cues as backup: timers for eating, restroom breaks scheduled",
      ],
      affirmation: "Difficulty feeling your body is not your fault. Your sensory system is wired differently."
    }
  },
  {
    id: "body-scan",
    title: "Guided Body Scan",
    description: "A short interoception practice to check in with your body",
    category: "interoception",
    icon: "Crosshair",
    type: "guided",
    content: {
      intro: "This body scan is designed for ND brains, short, non-judgmental, and curiosity-focused.",
      steps: [
        "Find a comfortable position. You don't need to close your eyes.",
        "Start at your feet: notice temperature, pressure, any sensation",
        "Move to legs: any tension, tingling, heaviness, lightness?",
        "Stomach: any tightness, emptiness, butterflies, discomfort?",
        "Chest: how is your breathing? Fast, slow, shallow, deep?",
        "Shoulders and neck: any holding, tension, pain?",
        "Head: foggy, clear, pressure, tired?",
        "Note anything surprising, no judgment",
      ],
      tips: [
        "Can be done in 2 minutes or 20",
        "Don't try to change what you notice, just observe",
        "If you feel nothing, that's also data, not failure",
      ],
    }
  },
  {
    id: "thirst-hunger-cues",
    title: "Thirst & Hunger Cue Building",
    description: "Learn to recognize your personal signals",
    category: "interoception",
    icon: "Droplets",
    type: "guided",
    content: {
      intro: "Many ND people don't reliably notice thirst until dehydrated or hunger until ravenous. This tool helps you identify YOUR personal signals.",
      prompts: [
        "What does thirst feel like for me? (Dry mouth? Headache? Foggy? Irritable?)",
        "What does hunger feel like for me? (Low energy? Stomach growl? Shaky? Mood shift?)",
        "What does fullness feel like for me?",
        "What cues tell me I need to use the bathroom?",
      ],
      steps: [
        "Set regular hydration reminders (every 90 minutes)",
        "Before each reminder, pause and check: 'Am I actually thirsty?'",
        "Notice and name the sensation, write it down",
        "Over time, you'll start to notice patterns and earlier cues",
      ],
    }
  },

  // EMOTION REGULATION
  {
    id: "emotion-wheel",
    title: "Emotion Wheel",
    description: "Identify and name your emotions with precision using a structured wheel",
    category: "emotion",
    icon: "Target",
    type: "guided",
    content: {
      intro: "Naming emotions precisely reduces their intensity. The emotion wheel helps you move from vague feelings ('bad', 'fine') to specific words ('frustrated', 'disappointed', 'overwhelmed').",
      steps: [
        "Start with the core: Am I feeling something Joyful, Sad, Angry, Fearful, Disgusted, or Surprised?",
        "Go one layer deeper: e.g. Angry → Frustrated? Irritated? Jealous? Hurt?",
        "Go one more layer: e.g. Frustrated → Exasperated? Agitated? Grumpy?",
        "Say the word out loud or write it down: 'I feel ___'",
        "Notice what shifts when you name it accurately",
      ],
      prompts: [
        "Where do you feel this in your body?",
        "What triggered this feeling?",
        "What does this emotion need you to know?",
        "Is there a secondary emotion underneath?",
      ],
      tips: [
        "ND brains often experience alexithymia (difficulty identifying emotions) -this is very common",
        "Starting with body sensations (tight chest, heavy arms) can help when words don't come",
        "There is no wrong emotion. Naming it is the first step to working with it.",
      ],
      affirmation: "Emotions are information, not problems to fix. You are listening to yours."
    }
  },
  {
    id: "emotion-matrix",
    title: "Emotion Matrix",
    description: "Map your emotions by energy level and pleasantness to choose your response",
    category: "emotion",
    icon: "LayoutGrid",
    type: "info",
    content: {
      intro: "From Russ Harris's ACT work: emotions can be mapped on two axes -energy (high/low) and valence (pleasant/unpleasant). This helps you respond to emotions instead of reacting.",
      variants: [
        { label: "High energy + unpleasant", description: "Anxious, angry, panicked, overwhelmed → needs grounding and nervous system down-regulation" },
        { label: "Low energy + unpleasant", description: "Sad, numb, shut down, hopeless → needs gentle activation, warmth, and compassion" },
        { label: "High energy + pleasant", description: "Excited, joyful, enthusiastic → can be channelled into action and connection" },
        { label: "Low energy + pleasant", description: "Calm, content, peaceful, safe → protective and restorative, worth cultivating intentionally" },
      ],
      tips: [
        "Different quadrants need different tools: activation for low-energy states, regulation for high-energy ones",
        "Notice which quadrant you spend the most time in -it's useful data about your nervous system",
        "The goal isn't to feel pleasant all the time, it's to have flexibility across the matrix",
      ],
      prompts: [
        "Which quadrant am I in right now?",
        "Which quadrant do I most want to move toward?",
        "What has helped me shift states in the past?",
      ],
    }
  },
  {
    id: "feelings-thermometer",
    title: "Feelings Thermometer",
    description: "Track the intensity of your emotions on a 1–10 scale to choose the right response",
    category: "emotion",
    icon: "Thermometer",
    type: "guided",
    content: {
      intro: "Not all emotions need the same response. A '3' frustration needs a different tool than an '8' panic. The feelings thermometer helps you calibrate your response to the actual intensity.",
      steps: [
        "Notice the emotion -what are you feeling right now?",
        "Rate the intensity from 1 to 10 (1 = barely noticeable, 10 = overwhelming)",
        "1–3: Mild -gentle awareness, continue with what you're doing",
        "4–6: Moderate -pause, take 3 breaths, use a grounding tool",
        "7–8: High -step away if possible, regulate before responding",
        "9–10: Crisis level -do NOT make decisions, focus only on safety and nervous system regulation",
      ],
      tips: [
        "Regular check-ins throughout the day build interoceptive awareness over time",
        "For ND brains: emotions can escalate very fast -early detection (catching a 4 before it becomes an 8) is the skill",
        "Intensity doesn't tell you the emotion is wrong. It tells you how much support you need.",
      ],
      prompts: [
        "What number am I at right now?",
        "What does this level feel like in my body?",
        "What do I need at this intensity level?",
      ],
      affirmation: "High intensity emotions are not a character flaw. They are a signal. You are learning to read it."
    }
  },

  // UP-REGULATION FOR FREEZE
  {
    id: "freeze-upregulate",
    title: "Freeze State Up-Regulation",
    description: "Activate your nervous system out of shutdown and freeze",
    category: "motivation",
    icon: "Flame",
    type: "guided",
    content: {
      intro: "Freeze/shutdown is a dorsal vagal nervous system response, your body went offline to protect you. You can't think or reason your way out. You have to move your way out.",
      steps: [
        "FIRST: recognize you're in freeze (numb, heavy, can't start, staring, dissociated, exhausted but wired)",
        "Do NOT demand productivity from yourself yet, this will deepen the freeze",
        "Physical activation: jump, shake your hands, splash cold water on your face, do 10 jumping jacks",
        "Sound: hum, sing, say something out loud, vagal nerve stimulation through the throat",
        "Temperature: cold water on wrists or face, or a warm drink, either can shift the state",
        "Tiny movement: stand up. Walk to another room. Drink water. ONE small thing.",
        "After 5-10 minutes of movement, reassess, you may feel more available now",
      ],
      tips: [
        "Freeze looks like laziness from the outside. It is not.",
        "Shame deepens freeze, compassion helps you emerge faster",
        "Keep a 'freeze kit' nearby: fidget, cold pack, jump rope, gum, music playlist",
        "Some people find stimming (rocking, bouncing) extremely helpful for exiting freeze",
      ],
      affirmation: "You are not broken. Your nervous system is protecting you. Let's gently help it feel safe to re-emerge."
    }
  },
  {
    id: "freeze-playlist",
    title: "Activation Playlist Strategy",
    description: "Use music specifically to exit freeze and build momentum",
    category: "motivation",
    icon: "Music",
    type: "info",
    content: {
      intro: "Music with a strong beat bypasses the thinking brain and directly activates the nervous system, ideal for freeze states.",
      steps: [
        "Build 3 playlists in advance (not when frozen, planning ahead is key):",
        "Playlist 1,Spark (5 songs): upbeat, energizing, familiar favourites",
        "Playlist 2,Build (10 songs): moderate pace, increasingly energizing",
        "Playlist 3,Flow (work music): instrumental, steady beat, no lyrics",
        "When frozen: start with Spark, commit to just one song",
        "Move your body to it even slightly, nod, tap feet, hum",
        "Transition to Build, then Flow once momentum builds",
      ],
      tips: [
        "Nostalgia songs are especially powerful, they trigger emotion and activate the nervous system",
        "You don't have to feel motivated before starting. Let the music create the feeling.",
      ],
    }
  },
  {
    id: "freeze-compassion",
    title: "Freeze & Self-Compassion",
    description: "The role of self-compassion in exiting shutdown",
    category: "motivation",
    icon: "Heart",
    type: "guided",
    content: {
      intro: "Shame and self-criticism deepen the freeze response. Self-compassion is not just a nice idea, it is neurologically necessary for exiting shutdown.",
      steps: [
        "Name what's happening: 'I am in freeze right now. This is a nervous system response.'",
        "Normalize: 'This happens to many people, especially those with ND brains'",
        "Offer yourself what you'd offer a friend: 'You're exhausted. You're doing your best.'",
        "Place a hand on your chest. Feel your own warmth.",
        "Ask: 'What is the tiniest thing I could do right now that would be kind to myself?'",
        "Do that one thing, even if it's drinking water or looking out a window",
      ],
      prompts: [
        "If a loved one was in this state, what would I say to them?",
        "What does this freeze feel like in my body?",
        "What do I actually need right now (not what I 'should' need)?",
      ],
      affirmation: "You don't have to earn the right to rest. Rest is part of recovery."
    }
  },

];

