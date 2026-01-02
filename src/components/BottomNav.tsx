"use client";

import { Home, Map as MapIcon, Ticket, User, Navigation } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/store";
import React from "react";

const BottomNav = () => {
  const pathname = usePathname();
  const { isDarkMode } = useThemeStore(); 

  const navItems = [
    { path: "/dashboard", icon: <Home />, label: 'Beranda' },
    { path: "/dashboard/map", icon: <MapIcon />, label: 'Peta' },
    { path: "/dashboard/booking", icon: <Navigation />, label: 'Pesan' },
    { path: "/dashboard/ticket", icon: <Ticket />, label: 'Tiket' },
    { path: "/dashboard/profile", icon: <User />, label: 'Akun' },
  ];

  return (
    <div className={`backdrop-blur-xl border-t px-4 py-3 pb-8 sticky bottom-0 z-50 transition-all duration-500 animate-in slide-in-from-bottom-full duration-500 ${isDarkMode ? 'bg-[#1A1A20]/90 border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]' : 'bg-white/90 border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]'}`}>
      <nav className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className="relative flex flex-col items-center py-1 outline-none group"
            >
              <div className={`absolute inset-x-[-8px] inset-y-[-4px] rounded-2xl transition-all duration-500 ease-out ${isActive ? (isDarkMode ? 'bg-[#7B2CBF]/20' : 'bg-[#7B2CBF]/10') : 'opacity-0 scale-75'}`} />
              <div className={`z-10 transition-all duration-300 ${isActive ? 'text-[#7B2CBF] scale-110' : (isDarkMode ? 'text-gray-600' : 'text-gray-300')}`}>
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24, strokeWidth: isActive ? 2.5 : 2 })}
              </div>
              <span className={`z-10 text-[10px] font-black tracking-tight mt-1 transition-all duration-300 ${isActive ? 'text-[#7B2CBF]' : (isDarkMode ? 'text-gray-600' : 'text-gray-300')}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
