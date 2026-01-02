// app/admin/stops/page.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { MapPin, Search, Filter, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useThemeStore } from "@/lib/store";
import { toast } from "sonner";
import AddStopModal from "./components/AddStopModal";
import EditStopModal from "./components/EditStopModal";

export default function AdminStopsPage() {
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode } = useThemeStore();
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<any | null>(null);

  useEffect(() => {
    fetchStops();
  }, []);

  const fetchStops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("route_stops")
        .select(`
            id, 
            stop_name, 
            stop_order, 
            latitude, 
            longitude, 
            route_id,
            routes (name, route_code, color)
        `)
        .order("route_id", { ascending: true })
        .order("stop_order", { ascending: true });

      if (error) throw error;
      setStops(data || []);
    } catch (error: any) {
      console.error("Error fetching stops:", error?.message || error);
      toast.error("Gagal memuat data halte");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStop = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus halte ini?")) return;
    
    try {
      const { error } = await supabase.from("route_stops").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Halte berhasil dihapus");
      setStops(stops.filter(s => s.id !== id));
    } catch (error: any) {
      console.error("Error deleting stop:", error);
      toast.error("Gagal menghapus halte");
    }
  };

  const filteredStops = stops.filter((stop) =>
    (stop.stop_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (stop.routes?.route_code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (stop.routes?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStops.length / itemsPerPage);
  const paginatedStops = filteredStops.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className={`p-6 space-y-6 min-h-full ${isDarkMode ? 'bg-[#121216] text-white' : 'bg-gray-50 text-gray-900'}`}>
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Database Halte</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Kelola seluruh titik pemberhentian sistem angkot T-Go.
          </p>
        </div>
        <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
        >
             <Plus className="w-4 h-4 mr-2" />
             Tambah Halte
        </Button>
      </div>

      <div className={`rounded-xl border shadow-sm overflow-hidden ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 bg-transparent">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    placeholder="Cari halte atau rute..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 h-10 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500' : 'bg-gray-50 border-gray-200'}`}
                />
            </div>
             <Button variant="outline" className={`gap-2 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white'}`}>
                <Filter className="w-4 h-4" />
                Filter Rute
            </Button>
        </div>

        <Table>
          <TableHeader className={isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}>
            <TableRow className={isDarkMode ? 'border-gray-800 hover:bg-transparent' : 'border-gray-100 hover:bg-transparent'}>
              <TableHead className="font-bold">Rute</TableHead>
              <TableHead className="font-bold">Urutan</TableHead>
              <TableHead className="font-bold">Nama Halte</TableHead>
              <TableHead className="font-bold">Koordinat</TableHead>
              <TableHead className="text-right font-bold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                 <TableCell colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Memuat halte...</p>
                    </div>
                 </TableCell>
              </TableRow>
            ) : paginatedStops.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-20 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                        <MapPin className="w-12 h-12 opacity-20" />
                        <p>Tidak ada halte ditemukan.</p>
                        {searchQuery && <Button variant="link" onClick={() => setSearchQuery("")} className="text-purple-500">Hapus filter</Button>}
                    </div>
                 </TableCell>
              </TableRow>
            ) : (
              paginatedStops.map((stop) => (
                <TableRow key={stop.id} className={isDarkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-50 hover:bg-gray-50'}>
                  <TableCell>
                      <div className="flex items-center gap-2">
                           <span 
                            className="px-2 py-0.5 rounded text-[10px] font-black text-white shadow-sm" 
                            style={{ backgroundColor: stop.routes?.color || '#7B2CBF' }}
                           >
                               {stop.routes?.route_code || 'T??'}
                           </span>
                           <span className={`text-[10px] font-bold truncate max-w-[100px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                {stop.routes?.name}
                           </span>
                      </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-blue-500 font-bold">#{stop.stop_order}</TableCell>
                  <TableCell className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{stop.stop_name}</TableCell>
                  <TableCell className="text-[10px] text-gray-500 font-mono">
                      {stop.latitude?.toFixed(6)}, {stop.longitude?.toFixed(6)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-8 w-8 p-0 ${isDarkMode ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-600 hover:bg-blue-50'}`}
                            onClick={() => setEditingStop(stop)}
                         >
                             <Edit className="w-4 h-4" />
                         </Button>
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`h-8 w-8 p-0 ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}
                            onClick={() => handleDeleteStop(stop.id)}
                         >
                             <Trash2 className="w-4 h-4" />
                         </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

         {/* Pagination */}
        <div className={`p-4 border-t flex items-center justify-between ${isDarkMode ? 'border-gray-800 bg-gray-900/20' : 'border-gray-100 bg-gray-50/30'}`}>
             <p className="text-xs text-gray-500 font-medium">
                {filteredStops.length > 0 ? (
                    <>
                        Menampilkan <span className="font-bold text-purple-500">{(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, filteredStops.length)}</span> dari <span className="font-bold">{filteredStops.length}</span> halte
                    </>
                ) : '0 data'}
             </p>
             <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-transparent border-gray-700 text-gray-300 disabled:opacity-30' : ''}`}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                >
                    Sebelumnya
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className={`h-8 text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-transparent border-gray-700 text-gray-300 disabled:opacity-30' : ''}`}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                >
                    Selanjutnya
                </Button>
             </div>
        </div>
      </div>

      {/* Modals */}
      <AddStopModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
            setIsAddModalOpen(false);
            fetchStops();
        }}
      />

      <EditStopModal 
        isOpen={!!editingStop}
        onClose={() => setEditingStop(null)}
        stop={editingStop}
        onSuccess={() => {
            setEditingStop(null);
            fetchStops();
        }}
      />
    </div>
  );
}
