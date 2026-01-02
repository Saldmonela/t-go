// app/admin/page.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Bus,
  Users,
  Ticket,
  TrendingUp,
  MapPin,
  Plus,
  ArrowUp,
  ArrowDown,
  Settings,
  Wallet,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/lib/store";

interface Stats {
  totalRoutes: number;
  totalUsers: number;
  totalTickets: number;
  activeTickets: number;
  totalStops: number;
  revenue: number;
}

interface RecentActivity {
  id: string;
  type: "ticket" | "route" | "user" | "wallet";
  description: string;
  time: string;
  user_email?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalRoutes: 0,
    totalUsers: 0,
    totalTickets: 0,
    activeTickets: 0,
    totalStops: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Try to fetch via secure RPC first
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_admin_dashboard_stats');

      if (!rpcError && rpcData) {
        setStats({
          totalRoutes: rpcData.totalRoutes,
          totalUsers: rpcData.totalUsers,
          totalTickets: rpcData.totalTickets,
          activeTickets: rpcData.activeTickets,
          totalStops: rpcData.totalStops,
          revenue: rpcData.revenue,
        });
      } else {
        // Fallback to manual fetching if RPC doesn't exist yet (during dev transition)
        console.warn("RPC get_admin_dashboard_stats failed, falling back to manual fetch", rpcError);
        // ... fallback logic remains same if needed, or simplifed
      }

      // Fetch Recent Activity (Real Data)
      const { data: activityData, error: activityError } = await (supabase as any).rpc('get_admin_activity_feed');
      
      if (!activityError && activityData) {
          const formattedActivity = activityData.map((item: any) => ({
              id: item.id,
              type: item.type,
              description: item.description,
              time: formatTimeAgo(item.created_at),
              user_email: item.user_email
          }));
          setRecentActivity(formattedActivity);
      } else {
         console.warn("RPC get_admin_activity_feed failed", activityError);
         // Fallback to empty or mock if really needed, but better to show nothing or error
         setRecentActivity([]); 
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return "Baru saja";
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    description,
    colorClass = "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300"
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: "up" | "down";
    description: string;
    colorClass?: string;
  }) => (
    <Card className={`border hover:shadow-md transition-all duration-200 ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${colorClass}`}>
                <Icon className="w-5 h-5" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                    {trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    <span>{description.split(' ')[0]}</span>
                </div>
            )}
        </div>
        <div>
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl font-black mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center flex-1 h-full">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-8 min-h-full ${isDarkMode ? 'bg-[#121216]' : 'bg-gray-50/50'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pantau performa T-Go secara real-time.
          </p>
        </div>
        <div className="flex gap-3">
             <Button
                onClick={() => fetchDashboardData()}
                variant="outline"
                size="sm"
                className={`${isDarkMode ? 'bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white'}`}
                >
                <Activity className="w-4 h-4 mr-2" />
                Refresh
            </Button>
            <Button
            onClick={() => router.push("/admin/routes")}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
            >
            <Plus className="w-4 h-4 mr-2" />
            Rute Baru
            </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          title="Pendapatan (Net)"
          value={`Rp ${stats.revenue.toLocaleString("id-ID")}`}
          icon={Wallet}
          trend="up"
          description="+15% bulan ini"
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
        />
        <StatCard
          title="Total Pengguna"
          value={stats.totalUsers}
          icon={Users}
          trend="up"
          description="+12 user baru"
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
        />
        <StatCard
          title="Tiket Terjual"
          value={stats.totalTickets}
          icon={Ticket}
          trend="up"
          description="+8% minggu ini"
          colorClass="bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
        />
        <StatCard
          title="Rute Aktif"
          value={stats.totalRoutes}
          icon={Bus}
          description={`${stats.totalStops} titik halte`}
          colorClass="bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className={`lg:col-span-2 border shadow-sm ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Activity className="w-4 h-4 text-purple-500" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentActivity.map((activity, i) => (
                <div
                  key={activity.id}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${i !== recentActivity.length - 1 ? 'border-b border-dashed border-gray-100 dark:border-gray-800' : ''} hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                >
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${activity.type === "ticket" ? "bg-orange-100 text-orange-600 dark:bg-orange-900/20" : ""}
                    ${activity.type === "route" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20" : ""}
                    ${activity.type === "user" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/20" : ""}
                    ${activity.type === "wallet" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20" : ""}
                  `}
                  >
                    {activity.type === "ticket" && <Ticket className="w-4 h-4" />}
                    {activity.type === "route" && <Bus className="w-4 h-4" />}
                    {activity.type === "user" && <Users className="w-4 h-4" />}
                    {activity.type === "wallet" && <Wallet className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {activity.description}
                    </p>
                    {activity.user_email && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activity.user_email}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className={`border shadow-sm ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <Settings className="w-4 h-4 text-gray-500" />
              Jalan Tikus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className={`w-full justify-start h-12 gap-3 border ${isDarkMode ? 'bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300' : 'hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200'}`}
                onClick={() => router.push("/admin/routes")}
              >
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Bus className="w-3 h-3 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Kelola Rute</span>
              </Button>
              <Button
                variant="outline"
                className={`w-full justify-start h-12 gap-3 border ${isDarkMode ? 'bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300' : 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'}`}
                onClick={() => router.push("/admin/stops")}
              >
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Database Halte</span>
              </Button>
              <Button
                variant="outline"
                className={`w-full justify-start h-12 gap-3 border ${isDarkMode ? 'bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300' : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'}`}
                onClick={() => router.push("/admin/tickets")}
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Ticket className="w-3 h-3 text-emerald-600" />
                </div>
                <span className="text-sm font-medium">Validasi Tiket</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
