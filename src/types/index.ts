export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "skipped";
export type RecurType = "daily" | "weekdays" | "weekends" | "weekly" | "monthly" | "custom";
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
  startTime?: string; // "HH:MM" e.g. "09:00"
  endTime?: string;   // "HH:MM" e.g. "11:30"
  reminderMinsBefore?: number; // 0 = at time, undefined = no reminder
  carryOver?: boolean; // if true, task reappears on days after its dueDate
  weekOfMonth?: 1 | 2 | 3 | 4 | 5; // monthly recurring tasks: pin to a specific week (Mon-Sun boundaries)
  weekOverrides?: Record<string, 1 | 2 | 3 | 4 | 5>; // "YYYY-MM" -> per-month week override
  monthlyCarryOver?: boolean; // if true, task shows in next week when incomplete
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
  date: string;      // "YYYY-MM-DD"
  startTime: string; // "HH:MM" or "" when allDay
  endTime?: string;  // "HH:MM"
  allDay?: boolean;
  type?: "appointment" | "activity" | "time-block";
  color?: string;
  title: string;
  notes?: string;
  showOn?: ("day" | "week" | "month")[];
  reminderMinsBefore?: number; // 0 = at time, undefined = no reminder
  createdAt: string;
}

export interface TopPriority {
  id: string;
  text: string;
  completed: boolean;
  rewardAmount?: number;
  rewardType?: "xp" | "coins";
}

export interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // array of date keys "YYYY-MM-DD"
  createdAt: string;
}

export interface CheckInReminderEntry {
  enabled: boolean;
  times: string[]; // array of "HH:MM" 24-hour
  lastNotifiedDates: Record<string, string>; // time -> "YYYY-MM-DD" : prevents repeat per slot
}

export interface CheckInReminders {
  mood: CheckInReminderEntry;
  body: CheckInReminderEntry;
  full: CheckInReminderEntry;
  thirstHunger: CheckInReminderEntry;
  permissionState: "default" | "granted" | "denied";
}

export interface StreakReminderConfig {
  enabled: boolean;
  time: string; // "HH:MM" 24-hour, e.g. "09:00"
  lastNotifiedDate: string; // "YYYY-MM-DD" : one per day
}

export interface HabitBuilderItem {
  id: string;
  name: string;
  type: "new" | "returning";
  fullVersion: string;       // the full/ideal version of the habit
  goodEnoughVersion: string; // the minimum viable version for hard days
  anchor: string;            // e.g. "After morning coffee"
  frequency: "daily" | "weekdays" | "weekends" | "3x" | "2x";
  completions: Record<string, "full" | "good-enough">; // YYYY-MM-DD → level
  createdAt: string;
  active: boolean;
}

export interface SectionVisibility {
  schedule: boolean;
  top3: boolean;
  tasks: boolean;
  habits: boolean;
  meal: boolean;
}

export interface HomeVisibility {
  streak: boolean;
  quote: boolean;
  frozen: boolean;
  toolbox: boolean;
  learn: boolean;
  support: boolean;
  energyWidget: boolean;
  medicationWidget: boolean;
}

export interface MeVisibility {
  energyWidget: boolean;
  medication: boolean;
  strengths: boolean;
  toolbox: boolean;
  sensoryProfile: boolean;
  quickLinks: boolean;
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
  habits?: string[];
}

export interface MVSCItem {
  id: string;
  text: string;
  completedDates: string[];
}

export interface JournalEntry {
  id: string;
  timestamp: string; // ISO string
  content: string;
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
  // Legacy fields (kept for migration compat)
  masking: string;
  commitments: string;
  recovery: string;
  communication: string;
  reintroduce: string;
  demands: BurnoutDemandItem[];
  demandNotes: string;
  reintroductions: BurnoutReintroductionItem[];
  reintroductionNotes: string;
  // Phase 1 fields
  phase1DropChecked: string[];   // labels of checked default drop items
  phase1DropCustom: string[];    // user-added custom items
  phase1SupportNeeds: string;
  phase1MinimumViableDay: string;
  phase1Notes: string;
  // Phase 2 fields
  phase2Activities: BurnoutPhase2Activity[];
  phase2WarnChecked: string[];   // labels of checked default warning signs
  phase2Notes: string;
}

export interface BurnoutPhase2Activity {
  id: string;
  name: string;
  readiness: "not-ready" | "maybe-soon" | "ready";
  startDate: string;
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
  phone: string;
  notes: string;
}

export interface SensoryContingencyPlan {
  exitPlan: string;
  earlyWarningChecked: string[];   // labels of checked default warning signs
  earlyWarningCustom: string[];    // user-added custom warning signs
  soothersChecked: string[];       // labels of checked default soother items
  soothersCustom: string[];        // user-added custom soothers
  supportContacts: SensoryContingencyContact[];
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
  listType?: 'bullet' | 'checklist';
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
  value?: number; // 1–10 numeric energy cost/gain
}

export interface MindNode {
  id: string;
  text: string;
  children: MindNode[];
  color: string;
}

export interface SavedMindMap {
  id: string;
  name: string;
  tree: MindNode;
  colorIdx: number;
  savedAt: string;
}

export interface MedicationReminder {
  id: string;
  name: string;
  time: string; // morning (or single) reminder time "HH:MM"
  eveningTime?: string; // "HH:MM" — only used when schedule === "both"
  schedule?: "morning" | "evening" | "both"; // undefined = legacy single (treated as "morning")
  xpReward?: number; // XP awarded per checkoff; defaults to 5 if undefined
}
