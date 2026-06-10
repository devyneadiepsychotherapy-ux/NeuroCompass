"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { getAvatarOption } from "@/app/onboarding/page";
import { getTheme } from "@/lib/themes";
import { X, Settings, Info, User, ChevronRight, Star, Palette, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const userName = useAppStore((s) => s.userName);
  const userAvatar = useAppStore((s) => s.userAvatar);
  const profile = useAppStore((s) => s.profile);
  const activeTheme = useAppStore((s) => s.activeTheme);

  const avatarInfo = getAvatarOption(userAvatar);
  const theme = getTheme(activeTheme);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-72 max-w-[85vw] flex flex-col",
          "bg-cream-50 border-r border-slate-100 shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button */}
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <p className="text-sm font-semibold text-sage-700 tracking-widest uppercase">
            NeuroCompass
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
            aria-label="Close menu"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* Profile section */}
        <div className="px-5 pb-5">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
            {avatarInfo ? (
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                avatarInfo.bg
              )}>
                <avatarInfo.Icon size={22} className={avatarInfo.iconColor} />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <User size={22} className="text-slate-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 text-sm leading-tight truncate">
                {userName || "Explorer"}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-sage-600 flex items-center justify-center">
                  <Star size={8} className="text-white fill-white" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Level {profile.level}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink
            href="/"
            icon={Home}
            label="Home"
            onClose={onClose}
          />

          {/* Themes */}
          <Link
            href="/themes"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-stone-100 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-colors shrink-0">
              <Palette size={16} className="text-slate-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-slate-700">Themes</span>
              <p className="text-xs text-slate-400 leading-tight truncate">{theme.name}</p>
            </div>
            {/* Colour swatch */}
            <div className="flex rounded-md overflow-hidden h-5 w-10 shrink-0 border border-black/10">
              {theme.preview.map((c, i) => (
                <div key={i} className="flex-1" style={{ background: c }} />
              ))}
            </div>
            <ChevronRight size={14} className="text-slate-300 shrink-0" />
          </Link>

          <SidebarLink
            href="/settings"
            icon={Settings}
            label="Settings"
            onClose={onClose}
          />

          <div className="pt-4 pb-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
              Info
            </p>
          </div>
          <AboutRow onClose={onClose} />
        </nav>

        {/* Footer */}
        <div className="px-5 pb-8 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            NeuroCompass · built for neurodivergent minds.
          </p>
        </div>
      </div>
    </>
  );
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  onClose,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-stone-100 transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center transition-colors">
        <Icon size={16} className="text-slate-600" />
      </div>
      <span className="text-sm font-medium text-slate-700 flex-1">{label}</span>
      <ChevronRight size={14} className="text-slate-300" />
    </Link>
  );
}

function AboutRow({ onClose }: { onClose: () => void }) {
  return (
    <Link
      href="/about"
      onClick={onClose}
      className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-stone-100 transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-stone-200 flex items-center justify-center shrink-0 transition-colors">
        <Info size={16} className="text-slate-500" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-700">About NeuroCompass</p>
        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
          A compassionate app built for ADHD, autism, and other neurodivergent experiences.
        </p>
      </div>
      <ChevronRight size={14} className="text-slate-300 shrink-0 mt-1" />
    </Link>
  );
}
