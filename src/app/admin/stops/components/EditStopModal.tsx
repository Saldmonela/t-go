// app/admin/stops/components/EditStopModal.tsx

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
import { Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface EditStopModalProps {
  isOpen: boolean;
  onClose: () => void;
  stop: any | null;
  onSuccess: () => void;
}

export default function EditStopModal({
  isOpen,
  onClose,
  stop,
  onSuccess,
}: EditStopModalProps) {
  const { isDarkMode } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    stop_name: "",
    stop_order: 1,
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (stop) {
      setFormData({
        stop_name: stop.stop_name || "",
        stop_order: stop.stop_order || 1,
        latitude: stop.latitude?.toString() || "",
        longitude: stop.longitude?.toString() || "",
      });
    }
  }, [stop]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stop) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("route_stops")
        .update({
          stop_name: formData.stop_name,
          stop_order: parseInt(formData.stop_order.toString()),
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        })
        .eq("id", stop.id);

      if (error) throw error;

      toast.success("Halte berhasil diperbarui");
      onSuccess();
    } catch (error: any) {
      console.error("Error updating stop:", error);
      toast.error(error.message || "Gagal memperbarui halte");
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
            <MapPin className="w-5 h-5 text-blue-500" />
            Edit Halte
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <p className={`text-xs font-bold uppercase ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {stop?.routes?.route_code} - {stop?.routes?.name}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_stop_name" className={isDarkMode ? 'text-gray-300' : ''}>Nama Halte *</Label>
            <Input
              id="edit_stop_name"
              value={formData.stop_name}
              onChange={(e) => setFormData({...formData, stop_name: e.target.value})}
              required
              className={inputClasses}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_stop_order" className={isDarkMode ? 'text-gray-300' : ''}>Urutan *</Label>
              <Input
                id="edit_stop_order"
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
              <Label htmlFor="edit_lat" className={isDarkMode ? 'text-gray-300' : ''}>Latitude *</Label>
              <Input
                id="edit_lat"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                required
                className={inputClasses}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_lng" className={isDarkMode ? 'text-gray-300' : ''}>Longitude *</Label>
              <Input
                id="edit_lng"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: e.target.value})}
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
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Update Halte"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
