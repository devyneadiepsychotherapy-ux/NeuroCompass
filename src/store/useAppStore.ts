"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Task,
  MoodEntry,
  UserProfile,
  ToolFavorite,
  Appointment,
  TopPriority,
  Habit,
  SectionVisibility,
  FocusSession,
  SensoryProfileData,
  SoothingKit,
  DopamineMenuItem,
  RewardLadderItem,
  AttentionAnchor,
  TimeAnchorItem,
  MVSCItem,
  HabitStack,
  BoundaryScript,
  BurnoutRecoveryPlan,
  BurnoutDemandItem,
  BurnoutReintroductionItem,
  EnergyLogEntry,
  ShopReward,
  UserList,
  SpecialInterest,
  EnergyItem,
  EmotionLogEntry,
  SensoryContingencyPlan,
  SensoryContingencyContact,
} from "@/types";
import { generateId, levelFromXp, getTodayKey } from "@/lib/utils";

interface AppState {
  tasks: Task[];
  moodEntries: MoodEntry[];
  profile: UserProfile;
  favorites: ToolFavorite[];

  // Planner extras
  appointments: Appointment[];
  topPriorities: TopPriority[]; // always exactly 3 items
  habits: Habit[];
  sectionVisibility: SectionVisibility;

  // Tasks
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  editTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;

  // Mood
  addMoodEntry: (entry: Omit<MoodEntry, "id" | "timestamp">) => void;

  // Profile
  updateProfile: (updates: Partial<UserProfile>) => void;
  addXp: (amount: number) => void;

  // Favorites
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;

  // Appointments
  addAppointment: (appt: Omit<Appointment, "id" | "createdAt">) => void;
  deleteAppointment: (id: string) => void;

  // Top 3 Priorities
  updateTopPriority: (id: string, updates: Partial<Omit<TopPriority, "id">>) => void;

  // Habits
  addHabit: (name: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabitToday: (id: string) => void;

  // Section visibility
  toggleSection: (section: keyof SectionVisibility) => void;

  // Focus session
  focusSession: FocusSession | null;
  startFocusSession: (durationSeconds: number, selectedMinutes?: number) => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  stopFocusSession: () => void;
  resetFocusSession: () => void;

  // Sensory profile
  sensoryProfile: SensoryProfileData;
  updateSensoryProfile: (data: SensoryProfileData) => void;

  // Soothing kits
  soothingKits: SoothingKit[];
  addSoothingKit: (kit: Omit<SoothingKit, "id" | "createdAt">) => void;
  updateSoothingKit: (id: string, updates: Partial<Omit<SoothingKit, "id" | "createdAt">>) => void;
  deleteSoothingKit: (id: string) => void;

  // Tool interactive persistent data
  dopamineMenuItems: DopamineMenuItem[];
  addDopamineMenuItem: (category: string, text: string) => void;
  removeDopamineMenuItem: (id: string) => void;

  rewardLadder: RewardLadderItem[];
  addRewardLadderItem: (level: string, task: string, reward: string) => void;
  removeRewardLadderItem: (id: string) => void;

  attentionAnchors: AttentionAnchor[];
  addAttentionAnchor: (text: string) => void;
  removeAttentionAnchor: (id: string) => void;

  timeAnchorsData: TimeAnchorItem[];
  addTimeAnchor: (label: string, time: string) => void;
  removeTimeAnchor: (id: string) => void;

  mvscList: MVSCItem[];
  addMVSCItem: (text: string) => void;
  removeMVSCItem: (id: string) => void;
  toggleMVSCToday: (id: string) => void;

  habitStacks: HabitStack[];
  addHabitStack: (anchor: string, newHabit: string) => void;
  removeHabitStack: (id: string) => void;

  boundaryScripts: BoundaryScript[];
  addBoundaryScript: (text: string) => void;
  removeBoundaryScript: (id: string) => void;

  burnoutRecoveryPlan: BurnoutRecoveryPlan;
  updateBurnoutRecoveryPlan: (updates: Partial<BurnoutRecoveryPlan>) => void;

  energyLog: EnergyLogEntry[];
  addEnergyLogEntry: (label: string, type: "drain" | "restore") => void;
  removeEnergyLogEntry: (id: string) => void;

  // ARFID support: user-saved custom accommodations
  arfidAccommodations: string[];
  addArfidAccommodation: (text: string) => void;
  removeArfidAccommodation: (text: string) => void;

  // ND-friendly meals: saved/bookmarked meal names
  savedNDMeals: string[];
  toggleSavedNDMeal: (meal: string) => void;

  // Focus ritual
  focusRitual: string;
  setFocusRitual: (ritual: string) => void;

  // Sensory diet selections (category -> selected activity names)
  sensoryDiet: Record<string, string[]>;
  setSensoryDiet: (diet: Record<string, string[]>) => void;

  // Easy food list (category -> selected food names)
  easyFoodList: Record<string, string[]>;
  setEasyFoodList: (list: Record<string, string[]>) => void;

  // Eating routine freetext
  eatingRoutine: string;
  setEatingRoutine: (routine: string) => void;

  // Personal burnout warning signs
  personalBurnoutSigns: string[];
  addPersonalBurnoutSign: (sign: string) => void;
  removePersonalBurnoutSign: (sign: string) => void;

  // Shop / Rewards
  coins: number;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  shopRewards: ShopReward[];
  purchasedRewards: string[];
  addShopReward: (reward: Omit<ShopReward, "id">) => void;
  updateShopReward: (id: string, updates: Partial<Omit<ShopReward, "id">>) => void;
  deleteShopReward: (id: string) => void;
  purchaseReward: (id: string) => boolean;
  streakFreezes: number;
  addStreakFreeze: () => void;
  useStreakFreeze: () => void;
  showStreakCelebration: boolean;
  setShowStreakCelebration: (v: boolean) => void;
  showFreezeSaved: boolean;
  setShowFreezeSaved: (v: boolean) => void;

  // Daily streak & simple XP
  streak: number;
  lastOpenedDate: string;
  longestStreak: number;
  xp: number;
  checkAndUpdateStreak: () => void;
  addXP: (amount: number) => void;

  // User lists
  userLists: UserList[];
  addUserList: (name: string) => void;
  deleteUserList: (id: string) => void;
  addListItem: (listId: string, text: string) => void;
  toggleListItem: (listId: string, itemId: string) => void;
  deleteListItem: (listId: string, itemId: string) => void;

  // Special interests
  specialInterests: SpecialInterest[];
  addSpecialInterest: (interest: Omit<SpecialInterest, "id">) => void;
  updateSpecialInterest: (id: string, updates: Partial<Omit<SpecialInterest, "id">>) => void;
  deleteSpecialInterest: (id: string) => void;

  // Energy Accounting
  energyDrains: EnergyItem[];
  energyRestorers: EnergyItem[];
  addEnergyDrain: (item: Omit<EnergyItem, "id">) => void;
  removeEnergyDrain: (id: string) => void;
  addEnergyRestorer: (item: Omit<EnergyItem, "id">) => void;
  removeEnergyRestorer: (id: string) => void;

  // Okay Mode (not persisted)
  okayMode: boolean;
  setOkayMode: (val: boolean) => void;

  // Onboarding
  hasOnboarded: boolean;
  userName: string;
  userAvatar: string;
  completeOnboarding: (name: string, avatar: string) => void;
}

const defaultShopRewards: ShopReward[] = [
  { id: "sr-1", name: "Movie Night", description: "Go see a movie in theatres", cost: 50, icon: "Film", isCustom: false },
  { id: "sr-2", name: "Takeout Treat", description: "Order from your favourite restaurant", cost: 40, icon: "UtensilsCrossed", isCustom: false },
  { id: "sr-3", name: "New Book", description: "Buy a book you've been eyeing", cost: 35, icon: "BookOpen", isCustom: false },
  { id: "sr-4", name: "Bubble Bath", description: "Long relaxing bath with all the extras", cost: 20, icon: "Sparkles", isCustom: false },
  { id: "sr-5", name: "Game Time", description: "Play video games guilt-free for 2 hours", cost: 25, icon: "Gamepad2", isCustom: false },
  { id: "sr-6", name: "Sleep In", description: "Give yourself permission to sleep in tomorrow", cost: 15, icon: "Moon", isCustom: false },
  { id: "sr-7", name: "Coffee Shop", description: "Treat yourself to a fancy coffee", cost: 10, icon: "Coffee", isCustom: false },
  { id: "sr-8", name: "Screen Time", description: "Guilt-free social media scroll for 30 mins", cost: 10, icon: "Smartphone", isCustom: false },
  { id: "sr-9", name: "Nature Walk", description: "Take a slow walk somewhere green", cost: 15, icon: "TreePine", isCustom: false },
  { id: "sr-10", name: "Craft Session", description: "Do a creative project you enjoy", cost: 20, icon: "Palette", isCustom: false },
  { id: "sr-11", name: "Streak Freeze", description: "Protect your streak for one missed day", cost: 30, icon: "Snowflake", isCustom: false },
];

const defaultProfile: UserProfile = {
  id: generateId(),
  name: "Explorer",
  totalXp: 0,
  level: 1,
  strengths: [],
  ndIdentities: [],
  theme: "calm",
  reducedMotion: false,
};

const defaultTopPriorities: TopPriority[] = [
  { id: "p1", text: "", completed: false },
  { id: "p2", text: "", completed: false },
  { id: "p3", text: "", completed: false },
];

const defaultSectionVisibility: SectionVisibility = {
  schedule: true,
  top3: true,
  tasks: true,
  habits: true,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tasks: [],
      moodEntries: [],
      profile: defaultProfile,
      favorites: [],
      appointments: [],
      topPriorities: defaultTopPriorities,
      habits: [],
      sectionVisibility: defaultSectionVisibility,
      focusSession: null,
      sensoryProfile: { triggers: {}, soothers: {}, accommodators: {} },
      soothingKits: [],
      dopamineMenuItems: [],
      rewardLadder: [],
      attentionAnchors: [],
      timeAnchorsData: [],
      mvscList: [],
      habitStacks: [],
      boundaryScripts: [],
      burnoutRecoveryPlan: { masking: "", commitments: "", recovery: "", communication: "", reintroduce: "", demands: [], demandNotes: "", reintroductions: [], reintroductionNotes: "" },
      energyLog: [],
      arfidAccommodations: [],
      savedNDMeals: [],
      focusRitual: "",
      sensoryDiet: {},
      easyFoodList: {},
      eatingRoutine: "",
      personalBurnoutSigns: [],
      coins: 0,
      shopRewards: defaultShopRewards,
      purchasedRewards: [],
      streakFreezes: 0,
      showStreakCelebration: false,
      showFreezeSaved: false,
      streak: 0,
      lastOpenedDate: "",
      longestStreak: 0,
      xp: 0,
      energyDrains: [],
      energyRestorers: [],
      okayMode: false,
      hasOnboarded: false,
      userName: "",
      userAvatar: "",

      addTask: (task) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            { ...task, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      editTask: (id, updates) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      deleteTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      completeTask: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status: "done", completedAt: new Date().toISOString() }
              : t
          ),
        }));
        if (task.rewardType === "coins") {
          get().addCoins(task.xpReward);
        } else {
          get().addXp(task.xpReward);
        }
      },

      addMoodEntry: (entry) =>
        set((s) => ({
          moodEntries: [
            { ...entry, id: generateId(), timestamp: new Date().toISOString() },
            ...s.moodEntries,
          ],
        })),

      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      addXp: (amount) =>
        set((s) => {
          const newXp = s.profile.totalXp + amount;
          return {
            profile: {
              ...s.profile,
              totalXp: newXp,
              level: levelFromXp(newXp),
            },
          };
        }),

      toggleFavorite: (toolId) =>
        set((s) => {
          const exists = s.favorites.some((f) => f.toolId === toolId);
          return {
            favorites: exists
              ? s.favorites.filter((f) => f.toolId !== toolId)
              : [
                  ...s.favorites,
                  { toolId, addedAt: new Date().toISOString() },
                ],
          };
        }),

      isFavorite: (toolId) =>
        get().favorites.some((f) => f.toolId === toolId),

      addAppointment: (appt) =>
        set((s) => ({
          appointments: [
            ...s.appointments,
            { ...appt, id: generateId(), createdAt: new Date().toISOString() },
          ].sort((a, b) => a.time.localeCompare(b.time)),
        })),

      deleteAppointment: (id) =>
        set((s) => ({
          appointments: s.appointments.filter((a) => a.id !== id),
        })),

      updateTopPriority: (id, updates) =>
        set((s) => ({
          topPriorities: s.topPriorities.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      addHabit: (name) =>
        set((s) => ({
          habits: [
            ...s.habits,
            {
              id: generateId(),
              name: name.trim(),
              completedDates: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      deleteHabit: (id) =>
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) })),

      toggleHabitToday: (id) => {
        const today = getTodayKey();
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h;
            const done = h.completedDates.includes(today);
            return {
              ...h,
              completedDates: done
                ? h.completedDates.filter((d) => d !== today)
                : [...h.completedDates, today],
            };
          }),
        }));
      },

      toggleSection: (section) =>
        set((s) => ({
          sectionVisibility: {
            ...s.sectionVisibility,
            [section]: !s.sectionVisibility[section],
          },
        })),

      startFocusSession: (durationSeconds, selectedMinutes) =>
        set({
          focusSession: {
            isActive: true,
            durationSeconds,
            startedAt: new Date().toISOString(),
            selectedMinutes: selectedMinutes ?? Math.round(durationSeconds / 60),
            isPaused: false,
            totalPausedSeconds: 0,
          },
        }),

      pauseFocusSession: () =>
        set((s) => {
          if (!s.focusSession || !s.focusSession.isActive || s.focusSession.isPaused) return s;
          return {
            focusSession: {
              ...s.focusSession,
              isPaused: true,
              pausedAt: new Date().toISOString(),
            },
          };
        }),

      resumeFocusSession: () =>
        set((s) => {
          if (!s.focusSession || !s.focusSession.isPaused) return s;
          const pausedSeconds = s.focusSession.pausedAt
            ? (Date.now() - new Date(s.focusSession.pausedAt).getTime()) / 1000
            : 0;
          return {
            focusSession: {
              ...s.focusSession,
              isPaused: false,
              pausedAt: undefined,
              totalPausedSeconds: s.focusSession.totalPausedSeconds + pausedSeconds,
            },
          };
        }),

      stopFocusSession: () =>
        set({ focusSession: null }),

      resetFocusSession: () =>
        set({ focusSession: null }),

      updateSensoryProfile: (data) =>
        set({ sensoryProfile: data }),

      addSoothingKit: (kit) =>
        set((s) => ({
          soothingKits: [
            ...s.soothingKits,
            { ...kit, id: generateId(), createdAt: new Date().toISOString() },
          ],
        })),

      updateSoothingKit: (id, updates) =>
        set((s) => ({
          soothingKits: s.soothingKits.map((k) => (k.id === id ? { ...k, ...updates } : k)),
        })),

      deleteSoothingKit: (id) =>
        set((s) => ({ soothingKits: s.soothingKits.filter((k) => k.id !== id) })),

      addDopamineMenuItem: (category, text) =>
        set((s) => ({
          dopamineMenuItems: [...s.dopamineMenuItems, { id: generateId(), category, text }],
        })),
      removeDopamineMenuItem: (id) =>
        set((s) => ({ dopamineMenuItems: s.dopamineMenuItems.filter((i) => i.id !== id) })),

      addRewardLadderItem: (level, task, reward) =>
        set((s) => ({
          rewardLadder: [...s.rewardLadder, { id: generateId(), level, task, reward }],
        })),
      removeRewardLadderItem: (id) =>
        set((s) => ({ rewardLadder: s.rewardLadder.filter((i) => i.id !== id) })),

      addAttentionAnchor: (text) =>
        set((s) => ({
          attentionAnchors: [...s.attentionAnchors, { id: generateId(), text }],
        })),
      removeAttentionAnchor: (id) =>
        set((s) => ({ attentionAnchors: s.attentionAnchors.filter((a) => a.id !== id) })),

      addTimeAnchor: (label, time) =>
        set((s) => ({
          timeAnchorsData: [...s.timeAnchorsData, { id: generateId(), label, time }],
        })),
      removeTimeAnchor: (id) =>
        set((s) => ({ timeAnchorsData: s.timeAnchorsData.filter((a) => a.id !== id) })),

      addMVSCItem: (text) =>
        set((s) => ({
          mvscList: [...s.mvscList, { id: generateId(), text, completedDates: [] }],
        })),
      removeMVSCItem: (id) =>
        set((s) => ({ mvscList: s.mvscList.filter((i) => i.id !== id) })),
      toggleMVSCToday: (id) => {
        const today = getTodayKey();
        set((s) => ({
          mvscList: s.mvscList.map((i) => {
            if (i.id !== id) return i;
            const done = i.completedDates.includes(today);
            return {
              ...i,
              completedDates: done
                ? i.completedDates.filter((d) => d !== today)
                : [...i.completedDates, today],
            };
          }),
        }));
      },

      addHabitStack: (anchor, newHabit) =>
        set((s) => ({
          habitStacks: [...s.habitStacks, { id: generateId(), anchor, newHabit }],
        })),
      removeHabitStack: (id) =>
        set((s) => ({ habitStacks: s.habitStacks.filter((h) => h.id !== id) })),

      addBoundaryScript: (text) =>
        set((s) => ({
          boundaryScripts: [
            ...s.boundaryScripts,
            { id: generateId(), text, createdAt: new Date().toISOString() },
          ],
        })),
      removeBoundaryScript: (id) =>
        set((s) => ({ boundaryScripts: s.boundaryScripts.filter((b) => b.id !== id) })),

      updateBurnoutRecoveryPlan: (updates) =>
        set((s) => ({ burnoutRecoveryPlan: { ...s.burnoutRecoveryPlan, ...updates } })),

      addEnergyLogEntry: (label, type) =>
        set((s) => ({
          energyLog: [
            ...s.energyLog,
            { id: generateId(), label, type, date: getTodayKey() },
          ],
        })),
      removeEnergyLogEntry: (id) =>
        set((s) => ({ energyLog: s.energyLog.filter((e) => e.id !== id) })),

      addArfidAccommodation: (text) =>
        set((s) => ({
          arfidAccommodations: s.arfidAccommodations.includes(text)
            ? s.arfidAccommodations
            : [...s.arfidAccommodations, text],
        })),
      removeArfidAccommodation: (text) =>
        set((s) => ({
          arfidAccommodations: s.arfidAccommodations.filter((a) => a !== text),
        })),

      toggleSavedNDMeal: (meal) =>
        set((s) => ({
          savedNDMeals: s.savedNDMeals.includes(meal)
            ? s.savedNDMeals.filter((m) => m !== meal)
            : [...s.savedNDMeals, meal],
        })),

      setFocusRitual: (ritual) => set({ focusRitual: ritual }),

      setSensoryDiet: (diet) => set({ sensoryDiet: diet }),

      setEasyFoodList: (list) => set({ easyFoodList: list }),

      setEatingRoutine: (routine) => set({ eatingRoutine: routine }),

      addPersonalBurnoutSign: (sign) =>
        set((s) => ({ personalBurnoutSigns: [...s.personalBurnoutSigns, sign] })),
      removePersonalBurnoutSign: (sign) =>
        set((s) => ({ personalBurnoutSigns: s.personalBurnoutSigns.filter((x) => x !== sign) })),

      addCoins: (amount) =>
        set((s) => ({ coins: s.coins + amount })),

      spendCoins: (amount) => {
        const { coins } = get();
        if (coins < amount) return false;
        set((s) => ({ coins: s.coins - amount }));
        return true;
      },

      addShopReward: (reward) =>
        set((s) => ({
          shopRewards: [...s.shopRewards, { ...reward, id: generateId() }],
        })),

      updateShopReward: (id, updates) =>
        set((s) => ({
          shopRewards: s.shopRewards.map((r) => (r.id === id ? { ...r, ...updates } : r)),
        })),

      deleteShopReward: (id) =>
        set((s) => ({ shopRewards: s.shopRewards.filter((r) => r.id !== id) })),

      purchaseReward: (id) => {
        const reward = get().shopRewards.find((r) => r.id === id);
        if (!reward) return false;
        if (!get().okayMode) {
          const spent = get().spendCoins(reward.cost);
          if (!spent) return false;
        }
        if (reward.id === "sr-11" || reward.name === "Streak Freeze") {
          get().addStreakFreeze();
        }
        set((s) => ({ purchasedRewards: [...s.purchasedRewards, id] }));
        return true;
      },

      addStreakFreeze: () =>
        set((s) => ({ streakFreezes: s.streakFreezes + 1 })),

      useStreakFreeze: () =>
        set((s) => ({ streakFreezes: Math.max(0, s.streakFreezes - 1) })),

      setShowStreakCelebration: (v) => set({ showStreakCelebration: v }),

      setShowFreezeSaved: (v) => set({ showFreezeSaved: v }),

      checkAndUpdateStreak: () => {
        const today = new Date().toISOString().split("T")[0];
        const { streak, lastOpenedDate, longestStreak, streakFreezes } = get();
        if (today === lastOpenedDate) return;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        if (lastOpenedDate === yesterday) {
          // Consecutive day — increment streak
          const newStreak = streak + 1;
          const newLongest = Math.max(newStreak, longestStreak);
          const getsFreeze = newStreak % 7 === 0;
          set({
            streak: newStreak,
            lastOpenedDate: today,
            longestStreak: newLongest,
            showStreakCelebration: true,
            streakFreezes: getsFreeze ? streakFreezes + 1 : streakFreezes,
          });
        } else if (lastOpenedDate !== "" && streakFreezes > 0) {
          // Missed a day but has a freeze — protect the streak
          set({
            streakFreezes: streakFreezes - 1,
            lastOpenedDate: today,
            showFreezeSaved: true,
          });
        } else {
          // Missed days (no freeze) or first-ever open — start/reset streak
          const newStreak = 1;
          const newLongest = Math.max(newStreak, longestStreak);
          set({
            streak: newStreak,
            lastOpenedDate: today,
            longestStreak: newLongest,
            showStreakCelebration: true,
          });
        }
      },

      addXP: (amount) =>
        set((s) => ({ xp: s.xp + amount })),

      userLists: [],

      addUserList: (name) =>
        set((s) => ({
          userLists: [
            ...s.userLists,
            { id: generateId(), name: name.trim(), items: [], createdAt: new Date().toISOString() },
          ],
        })),

      deleteUserList: (id) =>
        set((s) => ({ userLists: s.userLists.filter((l) => l.id !== id) })),

      addListItem: (listId, text) =>
        set((s) => ({
          userLists: s.userLists.map((l) =>
            l.id !== listId
              ? l
              : { ...l, items: [...l.items, { id: generateId(), text: text.trim(), checked: false }] }
          ),
        })),

      toggleListItem: (listId, itemId) =>
        set((s) => ({
          userLists: s.userLists.map((l) =>
            l.id !== listId
              ? l
              : { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)) }
          ),
        })),

      deleteListItem: (listId, itemId) =>
        set((s) => ({
          userLists: s.userLists.map((l) =>
            l.id !== listId ? l : { ...l, items: l.items.filter((i) => i.id !== itemId) }
          ),
        })),

      specialInterests: [],

      addSpecialInterest: (interest) =>
        set((s) => ({
          specialInterests: [...s.specialInterests, { ...interest, id: generateId() }],
        })),

      updateSpecialInterest: (id, updates) =>
        set((s) => ({
          specialInterests: s.specialInterests.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),

      deleteSpecialInterest: (id) =>
        set((s) => ({ specialInterests: s.specialInterests.filter((i) => i.id !== id) })),

      addEnergyDrain: (item) =>
        set((s) => ({ energyDrains: [...s.energyDrains, { ...item, id: generateId() }] })),
      removeEnergyDrain: (id) =>
        set((s) => ({ energyDrains: s.energyDrains.filter((e) => e.id !== id) })),

      addEnergyRestorer: (item) =>
        set((s) => ({ energyRestorers: [...s.energyRestorers, { ...item, id: generateId() }] })),
      removeEnergyRestorer: (id) =>
        set((s) => ({ energyRestorers: s.energyRestorers.filter((e) => e.id !== id) })),

      setOkayMode: (val) => set({ okayMode: val }),

      completeOnboarding: (name, avatar) =>
        set({ hasOnboarded: true, userName: name, userAvatar: avatar }),
    }),
    {
      name: "neurocompass-store",
      version: 1,
      // Exclude ephemeral UI flags — they should always start false on a fresh load.
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { showStreakCelebration, showFreezeSaved, okayMode, ...rest } = state;
        return rest;
      },
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 1) {
          // Before v1, shopRewards may have been stored as [] before defaults were seeded.
          // Restore defaults for any device that has an empty array.
          const rewards = state.shopRewards;
          if (!Array.isArray(rewards) || rewards.length === 0) {
            state.shopRewards = defaultShopRewards;
          }
        }
        return state;
      },
    }
  )
);
