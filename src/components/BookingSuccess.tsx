"use client";

import React from "react";
import { Check, ArrowRight, Wallet } from "lucide-react";
import { AngkotIcon } from "./AngkotIcon";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

interface BookingSuccessProps {
  routeCode: string;
  stopName: string;
  onViewTicket: () => void;
  onClose: () => void;
}

const BookingSuccess = ({ routeCode, stopName, onViewTicket, onClose }: BookingSuccessProps) => {
  return (
    <div className="absolute inset-0 z-[100] flex flex-col bg-[#0F0F13] text-white font-sans overflow-hidden">
      {/* Header */}
      <div className="p-6 pt-8 animate-in slide-in-from-top duration-500">
        <h1 className="text-2xl font-black tracking-tight">Pemesanan Berhasil</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center space-y-10">
        {/* Main Illustration */}
        <div className="relative">
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="w-24 h-24 rounded-[40px] bg-[#1A2E26] flex items-center justify-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#10B981] flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <Check size={48} className="text-white stroke-[4px]" />
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 20, y: 20, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute -bottom-2 -right-2 w-14 h-14 rounded-2xl bg-[#2D1D4D] border-4 border-[#0F0F13] flex items-center justify-center shadow-lg"
          >
            <AngkotIcon className="w-7 h-7" color="#A855F7" />
          </motion.div>
        </div>

        {/* Text Content */}
        <div className="space-y-4 max-w-xs">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-black italic tracking-tight"
          >
            Siap Meluncur!
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400 font-medium leading-relaxed"
          >
            Driver Angkot <span className="text-[#A855F7] font-black">{routeCode}</span> sedang menuju titik jemput <span className="text-[#A855F7] font-black">{stopName}</span>.
          </motion.p>
        </div>

        {/* Info Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-sm bg-[#1A1F2C] rounded-[32px] p-8 flex items-center divide-x divide-white/5 shadow-2xl border border-white/5"
        >
          <div className="flex-1 text-center pr-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Estimasi Tiba</p>
            <p className="text-2xl font-black tracking-tight">4 Menit</p>
          </div>
          <div className="flex-1 text-center pl-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">No. Lambung</p>
            <p className="text-3xl font-black text-[#C77DFF] tracking-tighter">2910</p>
          </div>
        </motion.div>
      </div>

      {/* Footer Actions */}
      <div className="p-8 pb-12 space-y-4 mt-auto">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.7 }}
        >
            <Button 
                onClick={onViewTicket}
                className="w-full h-16 bg-[#7B2CBF] hover:bg-[#6a25a5] text-white rounded-[24px] font-black text-lg shadow-[0_10px_30px_rgba(123,44,191,0.3)] transition-all active:scale-95"
            >
                Lihat Tiket Saya
                <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          onClick={onClose}
          className="w-full py-2 text-gray-500 font-bold text-sm tracking-wide hover:text-white transition-colors uppercase"
        >
          Kembali ke Beranda
        </motion.button>
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden z-[-1]">
          <div className="absolute top-1/4 -right-20 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-emerald-600/5 rounded-full blur-[100px]" />
      </div>
    </div>
  );
};

export default BookingSuccess;
