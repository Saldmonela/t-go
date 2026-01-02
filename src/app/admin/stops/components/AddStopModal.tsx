// app/admin/stops/components/AddStopModal.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useThemeStore } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface AddStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStopModal({
  isOpen,
  onClose,
  onSuccess,
}: AddStopModalProps) {
  const { isDarkMode } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    route_id: "",
    stop_name: "",
    stop_order: 1,
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchRoutes();
    }
  }, [isOpen]);

  const fetchRoutes = async () => {
    const { data } = await supabase.from("routes").select("id, name, route_code").order("route_code");
    setRoutes(data || []);
  };

  const handleRouteChange = async (routeId: string) => {
    setFormData(prev => ({ ...prev, route_id: routeId }));
    
    // Auto-calculate next order for this route
    const { data } = await supabase
      .from("route_stops")
      .select("stop_order")
      .eq("route_id", routeId)
      .order("stop_order", { ascending: false })
      .limit(1);
    
    const nextOrder = data && data.length > 0 ? data[0].stop_order + 1 : 1;
    setFormData(prev => ({ ...prev, stop_order: nextOrder }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.route_id) {
       toast.error("Pilih rute terlebih dahulu");
       return;
    }
    setLoading(true);

    try {
      const { error } = await supabase.from("route_stops").insert([{
        ...formData,
        stop_order: parseInt(formData.stop_order.toString()),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      }]);

      if (error) throw error;

      toast.success("Halte berhasil ditambahkan");
      onSuccess();
      setFormData({
        route_id: "",
        stop_name: "",
        stop_order: 1,
        latitude: "",
        longitude: "",
      });
    } catch (error: any) {
      console.error("Error adding stop:", error);
      toast.error(error.message || "Gagal menambahkan halte");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = isDarkMode 
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500" 
    : "focus:ring-purple-500";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md ${isDarkMode ? 'bg-[#1A1A20] border-gray-800 text-white' : ''}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            <MapPin className="w-5 h-5 text-purple-500" />
            Tambah Halte Baru
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label className={isDarkMode ? 'text-gray-300' : ''}>Pilih Rute *</Label>
            <Select onValueChange={handleRouteChange} value={formData.route_id}>
                <SelectTrigger className={inputClasses}>
                    <SelectValue placeholder="Pilih rute untuk halte ini" />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-[#1A1A20] border-gray-800 text-white' : ''}>
                    {routes.map(route => (
                        <SelectItem key={route.id} value={route.id}>
                            {route.route_code} - {route.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stop_name" className={isDarkMode ? 'text-gray-300' : ''}>Nama Halte *</Label>
            <Input
              id="stop_name"
              value={formData.stop_name}
              onChange={(e) => setFormData({...formData, stop_name: e.target.value})}
              placeholder="Contoh: Halte Stasiun Tangerang"
              required
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stop_order" className={isDarkMode ? 'text-gray-300' : ''}>Urutan *</Label>
              <Input
                id="stop_order"
                type="number"
                value={formData.stop_order}
                onChange={(e) => setFormData({...formData, stop_order: parseInt(e.target.value)})}
                min="1"
                required
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat" className={isDarkMode ? 'text-gray-300' : ''}>Latitude *</Label>
              <Input
                id="lat"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                placeholder="-6.17..."
                required
                className={inputClasses}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng" className={isDarkMode ? 'text-gray-300' : ''}>Longitude *</Label>
              <Input
                id="lng"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                placeholder="106.63..."
                required
                className={inputClasses}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className={`flex-1 ${isDarkMode ? 'bg-transparent border-gray-700 hover:bg-gray-800 text-gray-300' : ''}`}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Halte"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
