"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { Plus, X, Sparkles, Flame, Lightbulb, Brain, Heart, Target, Zap, Shield, MessageCircle, RefreshCw, GitBranch, Crosshair, Leaf, Eye, Users, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ND_IDENTITIES = [
  "ADHD", "Autism", "AuDHD", "Dyslexia", "Dyspraxia",
  "Dyscalculia", "Tourette's", "Sensory Processing", "OCD", "Other"
];

const STRENGTH_SUGGESTIONS: { icon: LucideIcon; label: string; desc: string }[] = [
  { icon: Flame,          label: "Hyperfocus",             desc: "The ability to dive deep and achieve incredible output on things that matter" },
  { icon: Lightbulb,      label: "Creative thinking",      desc: "Connecting ideas in unexpected ways, outside-the-box solutions" },
  { icon: Brain,          label: "Pattern recognition",    desc: "Seeing systems, patterns, and connections others miss" },
  { icon: Heart,          label: "Deep empathy",           desc: "Feeling with others deeply, strong emotional attunement" },
  { icon: Target,         label: "Passionate expertise",   desc: "Becoming deeply knowledgeable in areas of interest" },
  { icon: Zap,            label: "Urgency bias",           desc: "High performance in crises and high-stakes situations" },
  { icon: Shield,         label: "Strong values",          desc: "Deep sense of justice, ethics, and what matters" },
  { icon: Sparkles,       label: "Artistic vision",        desc: "Vivid imagination and unique aesthetic perspective" },
  { icon: MessageCircle,  label: "Authentic communication",desc: "Directness, honesty, saying what others think but don't say" },
  { icon: RefreshCw,      label: "Adaptability",           desc: "Pivoting quickly, thriving in change and novelty" },
  { icon: GitBranch,      label: "Systems thinking",       desc: "Understanding how complex systems fit together" },
  { icon: Crosshair,      label: "Problem-solving",        desc: "Thriving on puzzles, challenges, and finding solutions" },
  { icon: Leaf,           label: "Resilience",             desc: "You've navigated a neurotypical world, that takes incredible strength" },
  { icon: Eye,            label: "Social insight",         desc: "Noticing social dynamics, subtext, and unspoken rules acutely" },
  { icon: Users,          label: "Advocacy",               desc: "Standing up for yourself and others, often especially for the underdog" },
  { icon: Star,           label: "Authenticity",           desc: "Deep commitment to being genuine, real, and true to yourself" },
];

const AFFIRMATIONS = [
  "Your ND brain is not a deficit. It's a different operating system.",
  "The same traits that create challenges often power your greatest gifts.",
  "You've spent your whole life navigating a world not built for you. That takes extraordinary strength.",
  "Neurodivergence is a natural and valuable part of human diversity.",
  "Your creativity, empathy, and depth are your superpowers.",
  "Struggling does not cancel out succeeding. Both are true at once.",
];

export default function StrengthsPage() {
  const { profile, updateProfile } = useAppStore();
  const [customStrength, setCustomStrength] = useState("");
  const [affirmIdx, setAffirmIdx] = useState(0);

  const toggleIdentity = (id: string) => {
    const current = profile.ndIdentities;
    updateProfile({
      ndIdentities: current.includes(id)
        ? current.filter(x => x !== id)
        : [...current, id]
    });
  };

  const toggleStrength = (label: string) => {
    const current = profile.strengths;
    updateProfile({
      strengths: current.includes(label)
        ? current.filter(x => x !== label)
        : [...current, label]
    });
  };

  const addCustom = () => {
    if (!customStrength.trim()) return;
    const current = profile.strengths;
    if (!current.includes(customStrength.trim())) {
      updateProfile({ strengths: [...current, customStrength.trim()] });
    }
    setCustomStrength("");
  };

  return (
    <div className="px-4 pt-12 pb-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My ND Strengths</h1>
        <p className="text-sm text-slate-500">A strengths-based profile, built by you, for you</p>
      </div>

      {/* Rotating affirmation */}
      <div
        className="bg-gradient-to-br from-sage-50 to-stone-100 rounded-2xl p-5 border border-sage-100 cursor-pointer text-center"
        onClick={() => setAffirmIdx((affirmIdx + 1) % AFFIRMATIONS.length)}
      >
        <Sparkles size={20} className="text-sage-400 mx-auto mb-2" />
        <p className="text-sm text-slate-700 font-medium mt-2 leading-relaxed italic">
          &ldquo;{AFFIRMATIONS[affirmIdx]}&rdquo;
        </p>
        <p className="text-xs text-slate-400 mt-3">Tap for another</p>
      </div>

      {/* ND identity */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">My neurodivergent identity</h2>
        <div className="flex flex-wrap gap-2">
          {ND_IDENTITIES.map((id) => (
            <button
              key={id}
              onClick={() => toggleIdentity(id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                profile.ndIdentities.includes(id)
                  ? "bg-sage-600 text-white border-sage-600"
                  : "bg-cream-50 text-slate-600 border-slate-200 hover:border-sage-300"
              )}
            >
              {id}
            </button>
          ))}
        </div>
        {profile.ndIdentities.length > 0 && (
          <p className="text-xs text-slate-400 mt-2">
            You selected: {profile.ndIdentities.join(", ")}
          </p>
        )}
      </div>

      {/* Strengths picker */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-1">My strengths</h2>
        <p className="text-xs text-slate-400 mb-3">Select any that resonate with you</p>
        <div className="grid grid-cols-1 gap-2">
          {STRENGTH_SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => toggleStrength(s.label)}
              className={cn(
                "w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3",
                profile.strengths.includes(s.label)
                  ? "bg-sage-50 border-sage-300"
                  : "bg-cream-50 border-slate-100 hover:border-sage-200"
              )}
            >
              <div className="w-8 h-8 rounded-lg bg-sage-50 flex items-center justify-center shrink-0 mt-0.5">
                <s.icon size={16} className="text-sage-500" />
              </div>
              <div>
                <p className={cn("font-semibold text-sm", profile.strengths.includes(s.label) ? "text-sage-700" : "text-slate-800")}>
                  {s.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
              {profile.strengths.includes(s.label) && (
                <Sparkles size={16} className="text-sage-400 shrink-0 ml-auto mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom strength */}
      <div>
        <p className="text-sm font-semibold text-slate-700 mb-2">Add your own</p>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder="Your unique strength..."
            value={customStrength}
            onChange={(e) => setCustomStrength(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
          />
          <button onClick={addCustom}
            className="bg-sage-600 text-white px-4 py-2.5 rounded-xl hover:bg-sage-700 transition-all">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Current profile summary */}
      {profile.strengths.length > 0 && (
        <div className="bg-cream-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-sm font-semibold text-slate-700 mb-3">Your strengths profile</p>
          <div className="flex flex-wrap gap-2">
            {profile.strengths.map((s) => {
              const match = STRENGTH_SUGGESTIONS.find(x => x.label === s);
              const IC = match?.icon;
              return (
                <div key={s} className="flex items-center gap-1.5 bg-sage-50 text-sage-700 px-3 py-1.5 rounded-full text-sm font-medium">
                  {IC && <IC size={13} className="text-sage-500" />}
                  {s}
                  <button onClick={() => toggleStrength(s)} className="hover:text-red-400 transition-colors ml-1">
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {profile.strengths.length === 0 && (
        <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
          <Leaf size={28} className="text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-medium">Start building your profile</p>
          <p className="text-sm text-slate-400 mt-1">Select the strengths that feel true for you above</p>
        </div>
      )}
    </div>
  );
}
