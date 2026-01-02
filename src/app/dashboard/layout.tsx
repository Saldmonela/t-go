"use client";

import React, { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { useThemeStore } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Prevent hydration mismatch by rendering only after mount
  const [mounted, setMounted] = useState(false);
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render a minimal loading state during SSR/hydration
  if (!mounted) {
    return null; // Or a simple skeleton that matches both themes
  }

  return (
    <div
      className={`min-h-screen flex justify-center items-center transition-colors duration-500 ${
        isDarkMode ? "bg-[#08080A]" : "bg-[#F2F4F7]"
      } md:p-4 font-['Poppins']`}
    >
      {/* Device Frame Simulation */}
      <div
        className={`relative w-full max-w-[430px] h-screen md:h-[90vh] md:rounded-[48px] overflow-hidden flex flex-col md:border-8 transition-all duration-500 ${
          isDarkMode
            ? " border-slate-800"
            : "bg-white border-white md:border-slate-900 shadow-2xl"
        }`}
      >
        {/* Dynamic Notch */}
        <div
          className={`hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 rounded-b-[20px] z-50 transition-colors duration-500 ${
            isDarkMode ? "bg-slate-800" : "bg-slate-900"
          }`}
        ></div>

        {/* Main Content */}
        <div
          id="main-scroll-container"
          className={`flex-1 overflow-y-auto no-scrollbar theme-transition ${
            isDarkMode ? "dark bg-[#121216]" : "bg-[#FDFDFF]"
          }`}
        >
          {children}
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
