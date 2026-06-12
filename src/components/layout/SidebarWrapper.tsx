"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import Sidebar from "@/components/layout/Sidebar";

export default function SidebarWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-4 bg-[var(--background)]/80 backdrop-blur-md">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm border border-sage-200/60 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all shrink-0"
          aria-label="Open menu"
        >
          <Menu size={18} className="text-sage-600" />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 select-none">
          <Image
            src="/compass.png"
            alt="NeuroCompass"
            width={24}
            height={24}
            className="shrink-0"
          />
          <span className="text-[16px] font-extrabold tracking-wide text-[var(--foreground)]">
            NeuroCompass
          </span>
        </div>
      </header>
    </>
  );
}
