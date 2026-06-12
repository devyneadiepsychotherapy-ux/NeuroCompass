"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Heart, Wrench, Gift, User } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/",      icon: House,  label: "Home"     },
  { href: "/mood",  icon: Heart,  label: "Check-In" },
  { href: "/tools", icon: Wrench, label: "Tools"    },
  { href: "/shop",  icon: Gift,   label: "Shop"     },
  { href: "/me",    icon: User,   label: "Me"       },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-black/5 px-2">
        <div className="flex justify-around items-center h-[60px]">
          {nav.map(({ href, icon: Icon, label }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 px-3 py-2 relative"
              >
                <div className={cn(
                  "w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
                  active ? "bg-sage-100" : ""
                )}>
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.8}
                    className={active ? "text-sage-700" : "text-stone-400"}
                  />
                </div>
                <span className={cn(
                  "text-[9px] font-semibold tracking-wide transition-colors",
                  active ? "text-sage-700" : "text-stone-400"
                )}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
