"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CheckSquare, Heart, Wrench, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/planner", icon: CheckSquare, label: "Planner" },
  { href: "/mood", icon: Heart, label: "Check-In" },
  { href: "/tools", icon: Wrench, label: "Tools" },
  { href: "/shop", icon: Gift, label: "Shop" },
  { href: "/me", icon: User, label: "Me" },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-t border-cream-200 dark:border-stone-700 safe-area-pb">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200",
                active
                  ? "text-sage-600 dark:text-sage-400 bg-sage-50 dark:bg-sage-900/30"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-700"
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
