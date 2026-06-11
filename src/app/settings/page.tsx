"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { getTheme } from "@/lib/themes";
import { getAvatarOption } from "@/app/onboarding/page";
import {
  ArrowLeft, Check, Bell, BellOff, BellRing, User,
  Cat, Star, Moon, Leaf, Zap, Sparkles, Mountain, Flower2, Compass, BookOpen,
  Music, Gamepad2, Heart, Telescope, Feather, Waves, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Avatar picker (reused from onboarding)
// ---------------------------------------------------------------------------

type AvatarOption = {
  id: string;
  label: string;
  Icon: React.ElementType;
  bg: string;
  iconColor: string;
};

const AVATARS: AvatarOption[] = [
  { id: "cat",       label: "Cat",       Icon: Cat,       bg: "bg-stone-100",   iconColor: "text-stone-600"   },
  { id: "star",      label: "Star",      Icon: Star,      bg: "bg-lavender-100",  iconColor: "text-lavender-600"  },
  { id: "moon",      label: "Moon",      Icon: Moon,      bg: "bg-indigo-100",  iconColor: "text-indigo-500"  },
  { id: "leaf",      label: "Leaf",      Icon: Leaf,      bg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { id: "zap",       label: "Lightning", Icon: Zap,       bg: "bg-stone-100",  iconColor: "text-stone-500"  },
  { id: "sparkles",  label: "Sparkles",  Icon: Sparkles,  bg: "bg-pink-100",    iconColor: "text-pink-500"    },
  { id: "mountain",  label: "Mountain",  Icon: Mountain,  bg: "bg-stone-200",   iconColor: "text-stone-600"   },
  { id: "flower",    label: "Flower",    Icon: Flower2,   bg: "bg-rose-100",    iconColor: "text-rose-500"    },
  { id: "compass",   label: "Compass",   Icon: Compass,   bg: "bg-sage-100",    iconColor: "text-sage-700"    },
  { id: "book",      label: "Book",      Icon: BookOpen,  bg: "bg-blue-100",    iconColor: "text-blue-600"    },
  { id: "music",     label: "Music",     Icon: Music,     bg: "bg-violet-100",  iconColor: "text-violet-600"  },
  { id: "gamepad",   label: "Gamepad",   Icon: Gamepad2,  bg: "bg-cyan-100",    iconColor: "text-cyan-600"    },
  { id: "heart",     label: "Heart",     Icon: Heart,     bg: "bg-red-100",     iconColor: "text-red-500"     },
  { id: "telescope", label: "Telescope", Icon: Telescope, bg: "bg-sky-100",     iconColor: "text-sky-600"     },
  { id: "feather",   label: "Feather",   Icon: Feather,   bg: "bg-teal-100",    iconColor: "text-teal-600"    },
  { id: "waves",     label: "Waves",     Icon: Waves,     bg: "bg-blue-50",     iconColor: "text-blue-400"    },
];

// ---------------------------------------------------------------------------
// Section heading
// ---------------------------------------------------------------------------

function SectionHeading({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 mt-1">
      {label}
    </p>
  );
}

// ---------------------------------------------------------------------------
// Settings page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const router = useRouter();
  const {
    userName, userAvatar, profile,
    activeTheme,
    notificationStyle, setNotificationStyle,
    updateProfile,
  } = useAppStore();

  const [editingProfile, setEditingProfile] = useState(false);
  const [draftName, setDraftName] = useState(userName);
  const [draftAvatar, setDraftAvatar] = useState(userAvatar);

  const saveProfile = () => {
    if (draftName.trim()) updateProfile({ name: draftName.trim() });
    // userName & userAvatar stored separately in store
    useAppStore.setState({ userName: draftName.trim() || userName, userAvatar: draftAvatar || userAvatar });
    setEditingProfile(false);
  };

  const userLevel = profile.level;
  const avatarInfo = getAvatarOption(userAvatar);

  const notifOptions: { id: 'cheerleader' | 'gentle' | 'silent'; label: string; desc: string; Icon: React.ElementType }[] = [
    {
      id: 'cheerleader',
      label: 'Cheerleader',
      desc: 'Regular encouragement, streak reminders, and celebration alerts',
      Icon: BellRing,
    },
    {
      id: 'gentle',
      label: 'Gentle Reminders',
      desc: 'Occasional check-ins and important reminders only',
      Icon: Bell,
    },
    {
      id: 'silent',
      label: 'Silent',
      desc: 'No notifications',
      Icon: BellOff,
    },
  ];

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--background)]/90 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Settings</h1>
      </div>

      <div className="px-4 pt-6 space-y-8">

        {/* ── Profile ── */}
        <section>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-4">

            {/* Current profile display */}
            <div className="flex items-center gap-3">
              {avatarInfo ? (
                <div className={cn("w-14 h-14 rounded-full flex items-center justify-center shrink-0", avatarInfo.bg)}>
                  <avatarInfo.Icon size={26} className={avatarInfo.iconColor} />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <User size={26} className="text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-base leading-tight">{userName || "Explorer"}</p>
                <p className="text-xs text-slate-400 mt-0.5">Level {userLevel}</p>
                <p className="text-xs text-slate-400 mt-0.5">devyneadie98@gmail.com</p>
              </div>
              <button
                onClick={() => { setDraftName(userName); setDraftAvatar(userAvatar); setEditingProfile(true); }}
                className="text-xs font-semibold text-sage-600 hover:text-sage-700 border border-sage-200 rounded-xl px-3 py-1.5 hover:bg-sage-50 transition-all shrink-0"
              >
                Edit
              </button>
            </div>

            {/* Edit profile expanded */}
            {editingProfile && (
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">Display name</label>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="w-full border border-sage-200 focus:border-sage-500 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-cream-50 focus:outline-none transition-colors"
                    placeholder="What should we call you?"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-2 block">Avatar</label>
                  <div className="grid grid-cols-4 gap-2.5">
                    {AVATARS.map(({ id, label, Icon, bg, iconColor }) => {
                      const selected = draftAvatar === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setDraftAvatar(id)}
                          aria-label={label}
                          className="flex flex-col items-center gap-1"
                        >
                          <div className={cn(
                            "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                            bg,
                            selected
                              ? "ring-2 ring-sage-500 ring-offset-2 scale-105 shadow-md"
                              : "hover:scale-105 active:scale-[0.97]"
                          )}>
                            {selected
                              ? <Check size={24} className={iconColor} strokeWidth={2.5} />
                              : <Icon size={24} className={iconColor} />}
                          </div>
                          <span className="text-[9px] text-slate-400 font-medium">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="flex-1 border border-slate-200 text-slate-600 font-semibold rounded-xl py-2.5 text-sm hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    className="flex-1 bg-sage-600 text-white font-semibold rounded-xl py-2.5 text-sm hover:bg-sage-700 transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Notifications ── */}
        <section>
          <SectionHeading label="Notifications" />

          {/* Notification style */}
          <div className="space-y-2">
            {notifOptions.map(({ id, label, desc, Icon }) => {
              const active = notificationStyle === id;
              return (
                <button
                  key={id}
                  onClick={() => setNotificationStyle(id)}
                  className={cn(
                    "w-full flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                    active
                      ? "bg-sage-50 border-sage-300 shadow-sm"
                      : "bg-white border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                    active ? "bg-sage-100" : "bg-stone-100"
                  )}>
                    <Icon size={17} className={active ? "text-sage-600" : "text-slate-400"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold", active ? "text-sage-800" : "text-slate-700")}>{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{desc}</p>
                  </div>
                  {active && (
                    <div className="w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 mt-2 px-1">
            Set check-in reminder times on the <Link href="/mood" className="underline text-sage-600">Check-In page</Link>.
          </p>
        </section>

        {/* ── Themes ── */}
        <section>
          <SectionHeading label="Themes" />
          <Link
            href="/themes"
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 hover:border-slate-200 transition-all"
          >
            <div className="flex rounded-lg overflow-hidden h-7 w-16 shrink-0 border border-black/10">
              {getTheme(activeTheme).preview.map((c, i) => (
                <div key={i} className="flex-1" style={{ background: c }} />
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-700">
                {getTheme(activeTheme).name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Tap to browse all themes</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 shrink-0" />
          </Link>
        </section>

      </div>
    </div>
  );
}
