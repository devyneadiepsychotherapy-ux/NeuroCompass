export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "skipped";
export type RecurType = "daily" | "weekdays" | "weekends" | "weekly" | "custom";
export type RewardType = "xp" | "coins";
export type TaskItemType = "task" | "appointment" | "time-block";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  xpReward: number;
  rewardType?: RewardType;
  dueDate?: string;
  isRecurring: boolean;
  recurType?: RecurType;
  recurDays?: number[]; // 0=Sun ... 6=Sat
  tags: string[];
  timeEstimate?: number; // minutes
  completedAt?: string;
  createdAt: string;
  category?: string;
  showOn?: ("day" | "week" | "month")[]; // which views show this task; undefined = all views
  type?: TaskItemType; // defaults to 'task'
  duration?: string; // freeform e.g. "30 min", "1 hour"
}

export interface ShopReward {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string; // Lucide icon name
  isCustom?: boolean;
}

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type PleasantnessLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
  id: string;
  energy: EnergyLevel;
  pleasantness: PleasantnessLevel;
  emotions: string[];
  bodyNotes?: string;
  bodyAreas?: string[];
  notes?: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  name: string;
  totalXp: number;
  level: number;
  strengths: string[];
  ndIdentities: string[];
  theme: "calm" | "dark" | "vibrant" | "nature";
  reducedMotion: boolean;
}

export interface ToolFavorite {
  toolId: string;
  addedAt: string;
}

export interface Appointment {
  id: string;
  time: string; // "HH:MM"
  title: string;
  notes?: string;
  createdAt: string;
}

export interface TopPriority {
  id: string;
  text: string;
  completed: boolean;
}

export interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // array of date keys "YYYY-MM-DD"
  createdAt: string;
}

export interface SectionVisibility {
  schedule: boolean;
  top3: boolean;
  tasks: boolean;
  habits: boolean;
}

export interface FocusSession {
  isActive: boolean;
  durationSeconds: number;
  startedAt: string; // ISO timestamp used to compute remaining from wall clock
  selectedMinutes: number;
  isPaused: boolean;
  pausedAt?: string; // ISO timestamp when paused (only valid when isPaused=true)
  totalPausedSeconds: number; // cumulative seconds already paused (excluding current pause)
}

export interface SensoryProfileData {
  triggers: Record<string, string[]>;
  soothers: Record<string, string[]>;
  accommodators: Record<string, string[]>;
}

export interface SoothingKit {
  id: string;
  name: string;
  selectedSenses: string[];
  senseItems: Record<string, string[]>;
  physicalItems: string[];
  createdAt: string;
}

export interface DopamineMenuItem {
  id: string;
  category: string;
  text: string;
}

export interface RewardLadderItem {
  id: string;
  level: string;
  task: string;
  reward: string;
}

export interface AttentionAnchor {
  id: string;
  text: string;
}

export interface TimeAnchorItem {
  id: string;
  label: string;
  time: string;
}

export interface MVSCItem {
  id: string;
  text: string;
  completedDates: string[];
}

export interface HabitStack {
  id: string;
  anchor: string;
  newHabit: string;
}

export interface BoundaryScript {
  id: string;
  text: string;
  createdAt: string;
}

export interface BurnoutDemandItem {
  id: string;
  name: string;
  currentlyDoing: boolean;
  reduceTo: string;
}

export interface BurnoutReintroductionItem {
  id: string;
  name: string;
  readiness: "not-yet" | "almost" | "ready";
  plannedDate: string;
}

export interface BurnoutRecoveryPlan {
  masking: string;
  commitments: string;
  recovery: string;
  communication: string;
  reintroduce: string;
  demands: BurnoutDemandItem[];
  demandNotes: string;
  reintroductions: BurnoutReintroductionItem[];
  reintroductionNotes: string;
}

export interface EmotionLogEntry {
  id: string;
  coreEmotion: string;
  specificEmotion: string;
  timestamp: string;
}

export interface SensoryContingencyContact {
  id: string;
  name: string;
  role: string;
}

export interface SensoryContingencyPlan {
  exitPlan: string;
  soothersToBring: string[];
  supportContacts: SensoryContingencyContact[];
  earlyWarningSigns: string;
  recoveryPlan: string;
}

export interface EnergyLogEntry {
  id: string;
  label: string;
  type: "drain" | "restore";
  date: string;
}

export interface UserListItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface UserList {
  id: string;
  name: string;
  items: UserListItem[];
  createdAt: string;
}

export interface SpecialInterest {
  id: string;
  name: string;
  description?: string;
  intensity: "casual" | "active" | "hyperfocused";
  startDate: string;
}

export interface EnergyItem {
  id: string;
  label: string;
  intensity: "low" | "medium" | "high";
}
