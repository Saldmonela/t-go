"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/lib/store";
import { 
  ArrowLeft, 
  Ticket, 
  Zap, 
  Star, 
  Clock, 
  ChevronRight,
  Gift,
  Copy
} from "lucide-react";
import { toast } from "sonner";

const PromosPage = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();

  const vouchers = [
    {
      id: 1,
      title: 'Diskon 50% T-GO Pay',
      desc: 'Berlaku untuk rute Karawaci - Poris',
      code: 'TGOPAY50',
      exp: 'Berakhir dalam 2 hari',
      type: 'Ride',
      icon: <Zap className="text-yellow-500" size={24} />,
      gradient: 'from-orange-500 to-yellow-500'
    },
    {
      id: 2,
      title: 'Gratis Perjalanan Pertama',
      desc: 'Khusus pengguna baru T-GO App',
      code: 'NEWUSERTGO',
      exp: 'Berakhir dalam 12 hari',
      type: 'Promo',
      icon: <Star className="text-blue-500" size={24} />,
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      id: 3,
      title: 'Cashback Rp 2.000',
      desc: 'Minimal top up Rp 50.000',
      code: 'TOPUPHEMAT',
      exp: 'Berakhir dalam 5 hari',
      type: 'Topup',
      icon: <Gift className="text-emerald-500" size={24} />,
      gradient: 'from-emerald-500 to-teal-500'
    }
  ];

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Kode promo berhasil disalin!");
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FAFBFF]'}`}>
      {/* Header */}
      <div className={`p-6 pt-12 flex items-center gap-4 border-b transition-colors ${isDarkMode ? 'bg-[#121216] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
        <button onClick={() => router.back()} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <ArrowLeft size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
        </button>
        <h2 className={`text-xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Promo & Voucher</h2>
      </div>

      <div className="p-6 space-y-6 max-w-[430px] mx-auto">
        {/* Active Vouchers Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[3px]">Tersedia ({vouchers.length})</h3>
            <span className="text-[10px] font-black text-[#7B2CBF] uppercase tracking-widest">Riwayat</span>
          </div>

          <div className="space-y-5">
            {vouchers.map((v) => (
              <div key={v.id} className={`relative group transition-transform active:scale-[0.98]`}>
                {/* Visual Voucher Design */}
                <div className={`flex rounded-[32px] overflow-hidden border shadow-lg ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
                  {/* Left Side (Accent) */}
                  <div className={`w-1/4 bg-gradient-to-br ${v.gradient} flex flex-col items-center justify-center relative`}>
                    <div className="absolute top-0 bottom-0 left-full -translate-x-1/2 flex flex-col justify-around py-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FAFBFF]'}`} />
                      ))}
                    </div>
                    <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                      {v.icon}
                    </div>
                    <span className="mt-2 text-[8px] font-black text-white/80 uppercase tracking-widest">{v.type}</span>
                  </div>

                  {/* Right Side (Content) */}
                  <div className="flex-1 p-5 pl-8 space-y-3">
                    <div>
                      <h4 className={`text-sm font-black transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{v.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">{v.desc}</p>
                    </div>

                    <div className="flex items-center gap-2 py-2">
                      <Clock size={12} className="text-orange-500" />
                      <span className="text-[9px] font-black text-orange-500 uppercase tracking-wider">{v.exp}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border border-dashed text-[10px] font-black tracking-widest ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                        {v.code}
                        <button onClick={() => copyCode(v.code)} className="text-[#7B2CBF] active:scale-90 transition-transform">
                          <Copy size={14} />
                        </button>
                      </div>
                      <button className="bg-[#7B2CBF] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-purple-900/10 active:scale-95 transition-transform">
                        Pakai
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promo Categories */}
        <section className="pt-4 space-y-4">
          <h3 className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[3px]">Kategori</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'T-GO Pay', icon: <Gift className="text-emerald-500" />, items: 12, bg: 'bg-emerald-500/10' },
              { label: 'Perjalanan', icon: <Zap className="text-orange-500" />, items: 8, bg: 'bg-orange-500/10' },
              { label: 'Promo Bank', icon: <Star className="text-blue-500" />, items: 5, bg: 'bg-blue-500/10' },
              { label: 'Merchant', icon: <Gift className="text-purple-500" />, items: 3, bg: 'bg-purple-500/10' },
            ].map((cat, idx) => (
              <div key={idx} className={`p-5 rounded-[32px] border transition-all active:scale-95 ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                <div className={`${cat.bg} w-10 h-10 rounded-2xl flex items-center justify-center mb-4`}>
                  {cat.icon}
                </div>
                <p className={`text-xs font-black ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{cat.label}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-gray-400 font-bold">{cat.items} Promo</p>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PromosPage;
