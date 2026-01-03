"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useThemeStore } from "@/lib/store";
import { supabase } from "@/lib/supabase/client";
import { MapPin, ArrowLeft, Clock, CheckCircle2, Navigation, Loader2, Search, ChevronDown, LocateFixed } from "lucide-react";
import { AngkotIcon } from "@/components/AngkotIcon";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import BookingSuccess from "@/components/BookingSuccess";
import { motion, AnimatePresence } from "framer-motion";

import { useUserProfile, useStops, useFindRoutes, Route } from "@/hooks/useQueries";
import { useProcessPayment, useWallet } from "@/hooks/useWallet";


export default function BookingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  // State
  const [step, setStep] = useState(1);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'origin' | 'destination' | null>(null);

  // Use TanStack Query hooks
  const { data: profile } = useUserProfile();
  const { data: locations = [], isLoading: stopsLoading } = useStops();
  const { data: matchedRoutes = [], isLoading: matchingLoading, isFetched: isSearched } = useFindRoutes(origin, destination);
  const { data: wallet } = useWallet();
  const processPaymentMutation = useProcessPayment();
  
  // UI preferences
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    if (!user) {
        router.push("/login");
    }
  }, [user, router]);

  const handleSearchRoutes = () => {
    if (!origin || !destination) {
        toast.error("Mohon pilih lokasi jemput dan tujuan");
        return;
    }
    setStep(2);
  };

  const handleConfirmPayment = async () => {
    if (!selectedRoute || !user) return;
    
    const passengerCount = 1;
    const totalFare = selectedRoute.fare * passengerCount;

    // 1. Check Balance
    if (!wallet || wallet.balance < totalFare) {
      toast.error("Saldo T-GO Pay tidak cukup. Silakan top up.");
      router.push("/dashboard/profile"); // Redirect to profile/topup
      return;
    }

    setLoading(true);

    try {
      const qrCode = `TGO-${Date.now()}-${user.id.substring(0, 8)}`;
      const travelDate = new Date().toISOString(); 

      // 2. Process Payment & Ticket with Wallet Deduction
      // We'll use the process_payment RPC which handles the balance deduction and transaction record
      const paymentResult = await processPaymentMutation.mutateAsync({
        amount: totalFare,
        description: `Pembayaran Tiket ${selectedRoute.route_code}: ${origin} - ${destination}`,
        referenceType: 'ticket'
      });

      if (!paymentResult || !paymentResult.success) {
        throw new Error("Gagal melakukan pembayaran");
      }

      // 3. Create Ticket (Linking to the transaction if possible)
      const { error } = await supabase.from("tickets").insert({
        user_id: user.id,
        route_id: selectedRoute.id,
        start_point: origin,
        end_point: destination,
        passenger_count: passengerCount,
        total_fare: totalFare,
        qr_code: qrCode,
        status: "active",
        travel_date: travelDate,
        wallet_transaction_id: paymentResult.transaction_id
      });

      if (error) throw error;

      setStep(3);
      // toast.success("Pemesanan Berhasil!");
      
    } catch (error: any) {
       console.error("Booking error:", error);
       toast.error(error.message || "Gagal melakukan pemesanan");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={`min-h-full animate-in slide-in-from-right-4 duration-300 transition-colors ${isDarkMode ? 'bg-[#121216] text-white' : 'bg-[#FAFBFF] text-gray-900'} font-['Poppins']`}>
      {/* Dynamic Header based on Step */}
      <div className={`p-6 pt-10 rounded-b-[40px] shadow-sm space-y-4 border-b transition-all duration-500 ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100 shadow-gray-200/30'}`}>
        <div className="flex items-center gap-4">
          {step > 1 && step < 3 && (
            <button onClick={() => setStep(step - 1)} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <ArrowLeft size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
            </button>
          )}
          <h2 className={`text-xl font-black transition-colors ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {step === 3 ? 'Pemesanan Berhasil' : 'Booking Perjalanan'}
          </h2>
        </div>

        {step === 1 && (
          <div className="space-y-4 pt-4">
            <div className={`p-5 rounded-[32px] space-y-3 relative transition-all border ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-200 shadow-inner'}`}>
                
                {/* Origin Selector */}
                <div className="relative">
                   <div 
                    onClick={() => setActiveDropdown(activeDropdown === 'origin' ? null : 'origin')}
                    className="flex items-center gap-3 cursor-pointer group p-1"
                   >
                      <div className={`w-3 h-3 rounded-full border-2 ${isDarkMode ? 'border-purple-500 bg-purple-500/20' : 'border-purple-400 bg-white'}`}></div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Titik Jemput</p>
                        <p className={`text-sm font-black transition-colors ${origin ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>
                          {origin || (stopsLoading ? 'Memuat lokasi...' : 'Pilih Lokasi Jemput')}
                        </p>
                      </div>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${activeDropdown === 'origin' ? 'rotate-180' : ''}`} />
                   </div>

                   <AnimatePresence>
                    {activeDropdown === 'origin' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border max-h-48 overflow-y-auto shadow-2xl ${isDarkMode ? 'bg-[#1A1A20] border-gray-700' : 'bg-white border-gray-100'}`}
                      >
                        {locations.map(loc => (
                          <div 
                            key={loc} 
                            onClick={() => { setOrigin(loc); setActiveDropdown(null); }}
                            className={`p-4 text-sm font-bold border-b transition-colors last:border-none ${isDarkMode ? 'border-gray-800 text-gray-200 hover:bg-gray-800' : 'border-gray-50 text-gray-700 hover:bg-purple-50'}`}
                          >
                            {loc}
                          </div>
                        ))}
                      </motion.div>
                    )}
                   </AnimatePresence>
                </div>

                <div className={`ml-[5px] h-6 border-l-2 border-dashed ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}></div>
                
                {/* Destination Selector */}
                <div className="relative">
                   <div 
                    onClick={() => setActiveDropdown(activeDropdown === 'destination' ? null : 'destination')}
                    className="flex items-center gap-3 cursor-pointer group p-1"
                   >
                      <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-[#7B2CBF] shadow-[0_0_10px_rgba(123,44,191,0.5)]' : 'bg-[#7B2CBF]'}`}></div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Ke Mana?</p>
                        <p className={`text-sm font-black transition-colors ${destination ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-gray-400'}`}>
                          {destination || (stopsLoading ? 'Memuat lokasi...' : 'Tentukan Tujuan')}
                        </p>
                      </div>
                      <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${activeDropdown === 'destination' ? 'rotate-180' : ''}`} />
                   </div>

                   <AnimatePresence>
                    {activeDropdown === 'destination' && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border max-h-48 overflow-y-auto shadow-2xl ${isDarkMode ? 'bg-[#1A1A20] border-gray-700' : 'bg-white border-gray-100'}`}
                      >
                        {locations.map(loc => (
                          <div 
                            key={loc} 
                            onClick={() => { setDestination(loc); setActiveDropdown(null); }}
                            className={`p-4 text-sm font-bold border-b transition-colors last:border-none ${isDarkMode ? 'border-gray-800 text-gray-200 hover:bg-gray-800' : 'border-gray-50 text-gray-700 hover:bg-purple-50'}`}
                          >
                            {loc}
                          </div>
                        ))}
                      </motion.div>
                    )}
                   </AnimatePresence>
                </div>
            </div>
            <button 
              onClick={handleSearchRoutes}
              disabled={!origin || !destination || origin === destination}
              className="w-full py-4 bg-[#7B2CBF] text-white rounded-[24px] font-black shadow-lg shadow-purple-900/20 active:scale-95 disabled:opacity-50 transition-all"
            >
              Cari Angkot Terdekat
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="pt-2">
            <div className={`flex items-center gap-2 text-[11px] font-black w-fit px-3 py-1.5 rounded-xl mb-4 shadow-sm border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-purple-400' : 'bg-white border-gray-100 text-gray-400'}`}>
               <MapPin size={12} />
               <span>{origin} → {destination}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-6 pb-32">
        {step === 1 && (
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className={`font-black transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Riwayat Terakhir</h3>
                <button className="text-xs font-black text-[#7B2CBF]">Hapus</button>
             </div>
             <div className="space-y-4">
               {['Tangcity Mall', 'Cimone', 'Pasar Lama'].map(loc => (
                  <div 
                    key={loc} 
                    onClick={() => {
                        setOrigin('Pasar Lama');
                        setDestination(loc);
                    }}
                    className="flex items-center gap-4 group cursor-pointer"
                  >
                    <div className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 text-gray-500' : 'bg-white border-gray-100 text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500 group-hover:border-purple-200'}`}>
                      <Clock size={18} />
                    </div>
                    <div className={`flex-1 border-b pb-4 transition-colors ${isDarkMode ? 'border-gray-800' : 'border-gray-50'}`}>
                      <p className={`text-sm font-black transition-colors ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>{loc}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Kota Tangerang</p>
                    </div>
                  </div>
               ))}
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
             <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Pilih Armada</h3>
             {matchingLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                  <Loader2 size={40} className="animate-spin text-[#7B2CBF]" />
                  <p className="text-sm font-black text-gray-400">Mencari angkot terbaik untukmu...</p>
                </div>
             ) : matchedRoutes.length > 0 ? (
                matchedRoutes.map(route => (
                    <div 
                      key={route.id}
                      onClick={() => setSelectedRoute(route)}
                      className={`p-5 rounded-[32px] border-2 transition-all cursor-pointer flex items-center justify-between relative overflow-hidden ${selectedRoute?.id === route.id ? 'border-[#7B2CBF] bg-purple-500/5' : (isDarkMode ? 'border-gray-800 bg-[#1A1A20]' : 'border-gray-50 bg-white shadow-sm shadow-gray-200/20')}`}
                    >
                      {/* Left Accent Line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: route.color || '#7B2CBF' }}></div>

                      <div className="flex flex-col gap-2 flex-1 min-w-0 pl-2">
                         {/* Route Badge & Info */}
                        <div className="flex items-center gap-2">
                           <span className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white shadow-sm" style={{ backgroundColor: route.color || '#7B2CBF' }}>
                            {route.route_code}
                          </span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {route.estimated_time || 15} min • Tersedia
                          </span>
                        </div>
                        
                        <h4 className={`font-black text-[15px] leading-tight tracking-tight transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {route.name}
                        </h4>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 ml-4 flex-shrink-0">
                        <p className="text-base font-black text-[#7B2CBF] whitespace-nowrap">Rp {route.fare.toLocaleString('id-ID')}</p>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                          <p className="text-[8px] text-emerald-500 font-black tracking-widest uppercase whitespace-nowrap">READY</p>
                        </div>
                      </div>
                    </div>
                 ))
             ) : isSearched ? (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <Navigation size={40} className="text-gray-400" />
                  </div>
                  <div>
                    <h4 className={`font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rute Belum Tersedia</h4>
                    <p className="text-xs text-gray-400 font-bold mt-1 px-10">Maaf, saat ini belum ada angkot yang melayani rute langsung dari {origin} ke {destination}.</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-[#7B2CBF] text-xs font-black uppercase tracking-widest">Coba Rute Lain</button>
                </div>
             ) : null}
             
             {selectedRoute && (
               <div className="fixed bottom-32 left-8 right-8 md:absolute md:bottom-28 animate-in slide-in-from-bottom-10 z-40">
                 <button 
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="w-full py-5 bg-[#7B2CBF] text-white rounded-[28px] font-black shadow-2xl shadow-purple-900/40 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-70"
                 >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Memproses...
                        </>
                    ) : (
                        `Pesan & Bayar Rp ${selectedRoute.fare.toLocaleString('id-ID')}`
                    )}
                 </button>
               </div>
             )}
          </div>
        )}

        {step === 3 && selectedRoute && (
          <BookingSuccess 
            routeCode={selectedRoute.route_code}
            stopName={origin}
            onViewTicket={() => router.push("/dashboard/ticket")}
            onClose={() => {
              setStep(1);
              setOrigin("");
              setDestination("");
              setSelectedRoute(null);
            }}
          />
        )}
      </div>

    </div>
  );
}
