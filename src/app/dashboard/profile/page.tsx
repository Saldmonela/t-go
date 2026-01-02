"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore, useThemeStore } from "@/lib/store";
import { supabase } from "@/lib/supabase/client";
import { useUserProfile } from "@/hooks/useQueries";
import { useWallet, useWalletTransactions, useTopUp } from "@/hooks/useWallet";
import { 
  User, CreditCard, Settings, HelpCircle, Navigation, 
  LogOut, ChevronRight, ShieldCheck, Shield, Wallet, Plus, 
  History, Ticket, Bell, Moon, Globe, Star, Info,
  Camera, ArrowLeft, CheckCircle2, Landmark, Smartphone, Store,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

// Mock Data Constants from Reference
const TOPUP_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

const DashboardProfile = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  // Use TanStack Query for profile and wallet data
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactions = [] } = useWalletTransactions(10);
  const topUpMutation = useTopUp();
  
  // UI States
  const [activeView, setActiveView] = useState<'main' | 'topup' | 'history'>('main');
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [topupSuccess, setTopupSuccess] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('bank_transfer');

  const loading = profileLoading || walletLoading;

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      logout();
      router.push("/login");
      toast.success("Berhasil logout");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Gagal logout");
    }
  };

  const handleTopUp = async () => {
    if (!selectedAmount) return;
    
    try {
      await topUpMutation.mutateAsync({
        amount: selectedAmount,
        paymentMethod: selectedPaymentMethod,
        metadata: {
          selected_method: selectedPaymentMethod,
          timestamp: new Date().toISOString()
        }
      });
      
      setTopupSuccess(true);
      setTimeout(() => {
        setTopupSuccess(false);
        setActiveView('main');
        setSelectedAmount(null);
        toast.success(`Top Up Rp ${selectedAmount.toLocaleString()} berhasil!`);
      }, 2500);
    } catch (error: any) {
      console.error('Top up error:', error);
      toast.error(error.message || 'Gagal melakukan top up');
    }
  };

  const menuSections = [
    {
      title: "Akun Saya",
      items: [
        { icon: <User size={20} />, label: 'Informasi Akun', desc: 'Ubah profil & kontak', color: 'text-blue-500', bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50', path: '/dashboard/profile/account' },
        { icon: <Shield size={20} />, label: 'Keamanan Akun', desc: 'PIN, Biometrik & Perangkat', color: 'text-purple-500', bg: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50', path: '/dashboard/profile/security' },
        { icon: <Ticket size={20} />, label: 'Promo & Voucher', desc: 'Ada 5 voucher gratis', color: 'text-orange-500', bg: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50', path: '/dashboard/profile/promos' },
      ]
    },
    {
      title: "Bantuan & Legal",
      items: [
        { icon: <HelpCircle size={20} />, label: 'Pusat Bantuan', desc: 'FAQ & CS 24/7', color: 'text-blue-600', bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-100', path: '#' },
        { icon: <Info size={20} />, label: 'Kebijakan Privasi', desc: 'Syarat & Ketentuan T-GO', color: 'text-slate-600', bg: isDarkMode ? 'bg-slate-800' : 'bg-slate-100', path: '#' },
      ]
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FDFDFF]'}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7B2CBF] mx-auto mb-4" />
          <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Memuat profil...</p>
        </div>
      </div>
    );
  }

  // View: TopUp
  if (activeView === 'topup') {
    return (
      <div className={`min-h-full animate-in slide-in-from-right duration-300 pb-20 transition-colors ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FAFBFF]'}`}>
        <div className={`p-6 pt-12 flex items-center gap-4 border-b transition-colors ${isDarkMode ? 'bg-[#121216] border-gray-800' : 'bg-white border-gray-100 shadow-sm shadow-gray-200/20'}`}>
          <button onClick={() => setActiveView('main')} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <ArrowLeft size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <h2 className={`text-xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Isi Saldo T-GO Pay</h2>
        </div>

        {topupSuccess ? (
          <div className="p-10 flex flex-col items-center text-center space-y-6 animate-in zoom-in">
            <div className="w-24 h-24 bg-emerald-100/10 rounded-full flex items-center justify-center text-emerald-500">
              <CheckCircle2 size={56} />
            </div>
            <div>
              <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Up Berhasil!</h3>
              <p className="text-gray-400 font-bold mt-2">Saldo Anda telah ditambahkan sebesar Rp {selectedAmount?.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            <section className="space-y-4">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Pilih Nominal</h3>
              <div className="grid grid-cols-3 gap-3">
                {TOPUP_AMOUNTS.map(amount => (
                  <button 
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`relative w-full py-5 rounded-2xl border-2 font-black text-sm transition-all duration-300 transform active:scale-95 flex items-center justify-center overflow-hidden ${
                      selectedAmount === amount 
                        ? 'border-[#7B2CBF] bg-[#7B2CBF]/15 text-[#7B2CBF] ring-4 ring-[#7B2CBF]/10' 
                        : (isDarkMode ? 'border-gray-800 bg-[#1A1A20]/60 text-gray-500 hover:border-gray-700 hover:bg-[#1A1A20]' : 'border-gray-100 bg-white text-gray-400 shadow-sm hover:border-violet-200 hover:text-gray-500')
                    }`}
                  >
                    {selectedAmount === amount && (
                      <motion.div 
                        layoutId="activeNominal"
                        className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/5 pointer-events-none"
                      />
                    )}
                    <span className="relative z-10">{amount / 1000}rb</span>
                    {selectedAmount === amount && (
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7B2CBF] shadow-sm shadow-purple-500/50" />
                    )}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Metode Pembayaran</h3>
              <div className="space-y-3">
                {[
                  { icon: <Landmark size={20} />, name: 'Transfer Bank (VA)', desc: 'BCA, Mandiri, BNI', method: 'bank_transfer' },
                  { icon: <Smartphone size={20} />, name: 'E-Wallet', desc: 'OVO, GoPay, Dana', method: 'ewallet' },
                  { icon: <Store size={20} />, name: 'Minimarket', desc: 'Alfamart, Indomaret', method: 'minimarket' },
                ].map((item, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedPaymentMethod(item.method)}
                    className={`w-full flex items-center justify-between p-5 rounded-[28px] border-2 transition-all duration-300 transform active:scale-[0.98] ${
                      selectedPaymentMethod === item.method 
                        ? 'border-[#7B2CBF] bg-[#7B2CBF]/15 ring-4 ring-[#7B2CBF]/10' 
                        : (isDarkMode ? 'border-gray-800/50 bg-[#1A1A20]/40 text-gray-500 hover:border-gray-700 hover:bg-[#1A1A20]/60' : 'border-gray-100 bg-white shadow-sm hover:border-violet-100')
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        selectedPaymentMethod === item.method 
                          ? 'bg-[#7B2CBF] text-white shadow-lg shadow-purple-500/30' 
                          : (isDarkMode ? 'bg-gray-800/80 text-gray-400' : 'bg-gray-50 text-gray-400')
                      }`}>
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-black transition-colors ${
                          selectedPaymentMethod === item.method 
                            ? (isDarkMode ? 'text-white' : 'text-gray-900') 
                            : (isDarkMode ? 'text-gray-300' : 'text-gray-800')
                        }`}>{item.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-tight transition-colors ${
                          selectedPaymentMethod === item.method ? 'text-purple-400' : 'text-gray-400'
                        }`}>{item.desc}</p>
                      </div>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedPaymentMethod === item.method 
                        ? 'border-[#7B2CBF] bg-[#7B2CBF]' 
                        : (isDarkMode ? 'border-gray-700 bg-gray-900/40' : 'border-gray-200 bg-gray-50')
                    }`}>
                      {selectedPaymentMethod === item.method && (
                        <CheckCircle2 size={14} className="text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <button 
              disabled={!selectedAmount}
              onClick={handleTopUp}
              className="w-full py-5 bg-[#7B2CBF] text-white rounded-[28px] font-black text-base shadow-xl shadow-purple-900/20 active:scale-95 disabled:opacity-30 transition-all mt-4"
            >
              Konfirmasi Top Up
            </button>
          </div>
        )}
      </div>
    );
  }

  // View: History
  if (activeView === 'history') {
    return (
      <div className={`min-h-full animate-in slide-in-from-right duration-300 pb-20 transition-colors ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FAFBFF]'}`}>
        <div className={`p-6 pt-12 flex items-center gap-4 border-b sticky top-0 z-30 transition-colors ${isDarkMode ? 'bg-[#121216] border-gray-800 shadow-xl shadow-black/20' : 'bg-white border-gray-100 shadow-sm shadow-gray-200/20'}`}>
          <button onClick={() => setActiveView('main')} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <ArrowLeft size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
          </button>
          <h2 className={`text-xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Riwayat Transaksi</h2>
        </div>

        <div className="p-5 space-y-4">
          <div className={`rounded-[32px] overflow-hidden border shadow-sm transition-colors ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
            {transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <div key={tx.id} className={`p-5 flex items-center justify-between ${idx !== transactions.length - 1 ? (isDarkMode ? 'border-b border-gray-800' : 'border-b border-gray-50') : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${tx.type === 'topup' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-purple-500/10 text-[#7B2CBF]'}`}>
                      {tx.type === 'topup' ? <Wallet size={24} /> : <Navigation size={24} />}
                    </div>
                    <div>
                      <p className={`text-sm font-black transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{tx.description || 'Transaksi'}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${tx.type === 'topup' ? 'text-emerald-500' : (isDarkMode ? 'text-gray-200' : 'text-gray-800')}`}>
                      {tx.type === 'topup' ? '+' : '-'}{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">{tx.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-gray-400 text-sm font-bold">Belum ada transaksi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // View: Main Profile
  return (
    <div className={`min-h-full animate-in fade-in duration-500 pb-32 transition-colors duration-500 ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FAFBFF]'}`}>
      {/* Header Section */}
      <div className="bg-[#7B2CBF] pt-14 pb-16 px-6 rounded-b-[48px] relative overflow-hidden shadow-2xl shadow-purple-900/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-[28px] border-4 border-white/20 p-1 shadow-2xl">
              <img 
                src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                alt="Avatar" 
                className="w-full h-full rounded-[24px] object-cover bg-white"
              />
            </div>
            <button className="absolute -bottom-1 -right-1 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-[#7B2CBF]">
              <Camera size={14} />
            </button>
          </div>
          <div className="text-white">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black">{profile?.full_name || user?.email?.split('@')[0] || "User T-GO"}</h2>
              <div className="bg-emerald-400 p-0.5 rounded-full">
                <ShieldCheck size={12} className="text-white" />
              </div>
            </div>
            <p className="text-white/70 text-xs font-bold mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-yellow-400 text-[#7B2CBF] px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                GOLD MEMBER
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Info Cards Container */}
      <div className="px-5 -mt-8 space-y-4 relative z-20">
        {/* T-GO Pay Mini Card */}
        <div className={`rounded-[32px] p-5 shadow-md border flex items-center justify-between transition-all ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center shadow-sm transition-colors ${isDarkMode ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-[#7B2CBF]'}`}>
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-1">T-GO Pay</p>
               <p className={`text-xl font-black tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rp {(wallet?.balance || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setActiveView('history')} className="flex flex-col items-center gap-1 group">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group-active:scale-90 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-400'}`}>
                 <History size={18} />
               </div>
               <span className="text-[9px] font-black text-gray-400">Riwayat</span>
             </button>
             <button onClick={() => setActiveView('topup')} className="bg-[#7B2CBF] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-purple-900/20 active:scale-90 transition-transform ml-1">
                <Plus size={22} />
             </button>
          </div>
        </div>

        {/* Loyalty Tier Progress Card */}
        <div className={`rounded-[36px] p-6 text-white overflow-hidden relative shadow-2xl ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-900'}`}>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest mb-1">Loyalty Perk</p>
              <h3 className="text-base font-black">Menuju Platinum</h3>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[180px] leading-relaxed">
                <span className="text-white font-bold">14 trip lagi</span> untuk diskon 20% flat setiap perjalanan!
              </p>
            </div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full mt-5 relative z-10 overflow-hidden">
             <div className="h-full bg-gradient-to-r from-[#7B2CBF] to-purple-400 w-[86%] rounded-full shadow-[0_0_10px_rgba(123,44,191,0.5)]"></div>
          </div>
          <Star className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 -rotate-12" />
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, sIdx) => (
          <div key={sIdx} className="pt-2">
            <h3 className="px-3 mb-3 text-[10px] font-black text-gray-400 uppercase tracking-[3px]">
              {section.title}
            </h3>
            <div className={`rounded-[32px] overflow-hidden border shadow-sm transition-colors ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
              {section.items.map((item, iIdx) => (
                <button 
                  key={iIdx} 
                  onClick={() => item.path && router.push(item.path)}
                  className={`w-full flex items-center justify-between p-4 active:bg-purple-500/5 transition-all ${iIdx !== section.items.length - 1 ? (isDarkMode ? 'border-b border-gray-800' : 'border-b border-gray-50') : ''}`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className={`${item.bg} ${item.color} w-11 h-11 rounded-[18px] flex items-center justify-center shadow-sm`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-black transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{item.label}</p>
                      <p className="text-[10px] text-gray-400 font-bold tracking-tight mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Theme Toggle */}
        <div className={`rounded-[32px] p-5 border shadow-sm flex items-center justify-between transition-colors ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-4 text-left">
              <div className={`w-11 h-11 rounded-[18px] flex items-center justify-center shadow-sm transition-colors ${isDarkMode ? 'bg-yellow-500/10 text-yellow-500' : 'bg-slate-100 text-slate-500'}`}>
                <Moon size={20} />
              </div>
              <div>
                <p className={`text-sm font-black transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Mode Gelap</p>
                <p className="text-[10px] text-gray-400 font-bold tracking-tight mt-0.5">Hemat baterai gadget Anda</p>
              </div>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`w-14 h-7 rounded-full p-1 transition-all duration-300 relative shadow-inner ${isDarkMode ? 'bg-[#7B2CBF]' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-lg ${isDarkMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
            </button>
        </div>

        <div className="pt-6 pb-12">
          <button 
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-3 py-5 rounded-[28px] font-black text-xs uppercase tracking-[3px] border transition-all active:scale-95 shadow-sm ${isDarkMode ? 'bg-red-500/10 border-red-900/20 text-red-500' : 'bg-white border-red-50 text-red-500 shadow-red-100/50'}`}>
            <LogOut size={20} />
            Keluar Akun
          </button>
          <p className="text-center text-[10px] text-gray-400 font-bold mt-6 tracking-widest uppercase opacity-50">T-GO v1.0.4 • Tangerang Modern Transport</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardProfile;
