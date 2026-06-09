"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

export default function SidebarWrapper() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-40 w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
        aria-label="Open menu"
      >
        <Menu size={18} className="text-slate-600" />
      </button>
    </>
  );
}
