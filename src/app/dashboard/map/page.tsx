"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, useThemeStore } from "@/lib/store";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Search, MapPin, Navigation, Info, ArrowRight, User } from "lucide-react";
import MapContainer from "@/components/section/map/MapContainer";
import { toast } from "sonner";
import { Route, RouteStop } from "@/types/types";
import BookingModal from "@/components/BookingModal"; 

interface BookingData {
  startPoint: string;
  endPoint: string;
  passengerCount: number;
  travelDate: string;
}

export default function MapPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Booking State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { isDarkMode } = useThemeStore(); // Default preference

  // Prevent body scroll when component mounts
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Check authentication
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchRoutesData();
  }, [user, router]);

  const fetchRoutesData = async () => {
    try {
      // Fetch routes
      const { data: routesData, error: routesError } = await supabase
        .from("routes")
        .select("*")
        .order("route_code");

      if (routesError) throw routesError;

      // Fetch route stops
      const { data: stopsData, error: stopsError } = await supabase
        .from("route_stops")
        .select("*")
        .order("route_id, stop_order");

      if (stopsError) throw stopsError;

      setRoutes((routesData || []).map(r => ({ ...r, color: r.color || '#7B2CBF' })));
      setRouteStops(stopsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Gagal memuat data rute");
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = (route: Route) => {
    setSelectedRoute(route);
  };

  const handleBookingConfirm = async (bookingData: BookingData) => {
    if (!user || !selectedRoute) return;
    setIsBookingModalOpen(false); // Close modal first

    const loadingToast = toast.loading("Memproses pemesanan...");

    try {
      const qrCodeData = `TGO-${Date.now()}-${user.id.substring(0, 8)}`;
      
      const { data: ticketData, error } = await supabase
        .from("tickets")
        .insert([
          {
            user_id: user.id,
            route_id: selectedRoute.id,
            start_point: bookingData.startPoint,
            end_point: bookingData.endPoint,
            passenger_count: bookingData.passengerCount,
            total_fare: selectedRoute.fare * bookingData.passengerCount,
            qr_code: qrCodeData,
            status: "active", // Direct active for demo
            travel_date: bookingData.travelDate,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.dismiss(loadingToast);
      toast.success("Tiket berhasil dipesan!");
      router.push("/dashboard/ticket");
      
    } catch (error) {
      console.error("Booking failed:", error);
      toast.dismiss(loadingToast);
      toast.error("Gagal memproses pemesanan");
    }
  };

  // Filter routes based on search query
  const filteredRoutes = routes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.route_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.start_point.toLowerCase().includes(searchQuery.toLowerCase()) ||
      route.end_point.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`fixed inset-0 h-screen w-full flex items-center justify-center z-50 transition-colors ${isDarkMode ? 'bg-[#121216]' : 'bg-white'}`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#7B2CBF] animate-spin mx-auto mb-4" />
          <p className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Memuat peta rute...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[80vh] overflow-hidden ${isDarkMode ? 'bg-[#121216]' : 'bg-[#FAFBFF]'}`}>
      
      {/* 🗺️ MAP LAYER */}
      <MapContainer
        routes={filteredRoutes}
        routeStops={routeStops}
        selectedRoute={selectedRoute}
        onRouteSelect={handleRouteSelect}
        isDarkMode={isDarkMode}
      />

      {/* 🔍 TOP SEARCH OVERLAY */}
      <div className="absolute top-0 left-0 right-0 z-[20] p-6 pt-8 pointer-events-none">
        <div className={`backdrop-blur-md shadow-lg rounded-[28px] p-4 flex items-center gap-3 border transition-colors ${isDarkMode ? 'bg-[#1A1A20]/90 shadow-black/20 border-gray-800' : 'bg-white/90 shadow-gray-200/20 border-white/50'} pointer-events-auto`}>
            <Search size={20} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
            <input 
                type="text" 
                placeholder="Cari rute, tujuan, atau halte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder-gray-400 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
            />
            {selectedRoute && (
                <button 
                  onClick={() => setSelectedRoute(null)}
                  className={`p-2 rounded-full text-xs font-bold transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                    Reset
                </button>
            )}
        </div>
      </div>

      {/* 📍 SELECTED ROUTE CARD (Bottom Sheet Replacement) */}
      <div className={`absolute bottom-24 left-0 right-0 z-[20] px-4 transition-all duration-500 transform ${selectedRoute ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        {selectedRoute && (
             <div className={`backdrop-blur-xl rounded-[32px] p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border animate-in slide-in-from-bottom duration-500 transition-colors ${isDarkMode ? 'bg-[#1A1A20]/95 border-gray-800' : 'bg-white/95 border-white/50'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg`} style={{ backgroundColor: selectedRoute.color || '#7B2CBF' }}>
                      {selectedRoute.route_code}
                    </div>
                    <div>
                      <h4 className={`font-black text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedRoute.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded-full uppercase tracking-wide">Aktif</span>
                          <span className="text-[10px] font-bold text-gray-400">• 15-20 min</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[#7B2CBF]">Rp {selectedRoute.fare.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Per Orang</p>
                  </div>
                </div>

                {/* Route Path Indicator */}
                <div className={`flex items-center gap-3 p-3 rounded-2xl border mb-5 transition-colors ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'}`}>
                   <div className="flex-1 flex items-center gap-2 overflow-hidden">
                      <div className={`w-2 h-2 rounded-full border-2 border-[#7B2CBF] flex-shrink-0 ${isDarkMode ? 'bg-[#1A1A20]' : 'bg-white'}`}></div>
                      <span className={`text-xs font-bold truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedRoute.start_point}</span>
                   </div>
                   <div className="flex-shrink-0 text-gray-300">
                      <ArrowRight size={14} />
                   </div>
                   <div className="flex-1 flex items-center gap-2 overflow-hidden justify-end">
                      <span className={`text-xs font-bold truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{selectedRoute.end_point}</span>
                      <MapPin size={12} className="text-red-500 flex-shrink-0" />
                   </div>
                </div>
                
                <div className="flex gap-3">
                   <button 
                      onClick={() => setSelectedRoute(null)}
                      className={`flex-1 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                   >
                      Tutup
                   </button>
                   <button 
                      onClick={() => setIsBookingModalOpen(true)}
                      className="flex-[2] py-3.5 bg-[#7B2CBF] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                   >
                      <Navigation size={14} />
                      Pesan Sekarang
                   </button>
                </div>
             </div>
        )}
      </div>

      {/* 🧭 DEFAULT STATE INFO (When no route selected) */}
      {!selectedRoute && !loading && (
         <div className="absolute bottom-28 left-6 right-6 z-[20] pointer-events-none">
             <div className="flex justify-end gap-3 mb-4 pointer-events-auto">
                <button className={`w-11 h-11 rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-all ${isDarkMode ? 'bg-[#1A1A20] shadow-black/20 text-gray-400' : 'bg-white shadow-gray-200/50 text-gray-600'}`}>
                    <Navigation size={20} />
                </button>
             </div>
             <div className={`backdrop-blur-md p-4 rounded-[24px] shadow-lg border flex items-center gap-4 pointer-events-auto transition-colors ${isDarkMode ? 'bg-[#1A1A20]/90 border-gray-800' : 'bg-white/90 border-white/50'}`}>
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-[#7B2CBF]'}`}>
                    <Info size={20} />
                 </div>
                 <div>
                    <h5 className={`font-bold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Cari Rute Angkot</h5>
                    <p className={`text-[10px] font-medium leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ketuk jalur berwarna pada peta atau gunakan pencarian di atas.</p>
                 </div>
             </div>
         </div>
      )}

      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        route={selectedRoute}
        onConfirm={handleBookingConfirm}
      />
      
    </div>
  );
}
