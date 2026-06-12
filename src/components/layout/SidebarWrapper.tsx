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
      <header className="h-14 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-9 h-9 flex items-center justify-center hover:opacity-70 transition-opacity shrink-0"
          aria-label="Open menu"
        >
          <Menu size={22} className="text-slate-700" />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 select-none">
          <Image
            src="/compass.png"
            alt="NeuroCompass"
            width={24}
            height={24}
            className="shrink-0"
          />
          <span className="text-[17px] font-bold text-[var(--foreground)]" style={{ fontFamily: "var(--font-fraunces)" }}>
            NeuroCompass
          </span>
        </div>
      </header>
    </>
  );
}
