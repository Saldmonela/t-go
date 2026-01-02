'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useThemeStore } from '@/lib/store';
import { Route, RouteStop } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminRouteStopsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const { isDarkMode } = useThemeStore();
  
  const [route, setRoute] = useState<Route | null>(null);
  const [stops, setStops] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<RouteStop | null>(null);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    stop_name: '',
    stop_order: 1,
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    if (id) {
      fetchRouteAndStops();
    }
  }, [id]);

  const fetchRouteAndStops = async () => {
    try {
      setLoading(true);
      
      // Fetch route details
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .select('*')
        .eq('id', id)
        .single();

      if (routeError) throw routeError;
      setRoute(routeData);

      // Fetch stops
      const { data: stopsData, error: stopsError } = await supabase
        .from('route_stops')
        .select('*')
        .eq('route_id', id)
        .order('stop_order', { ascending: true });

      if (stopsError) throw stopsError;
      setStops(stopsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data rute dan halte');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (stop?: RouteStop) => {
    if (stop) {
      setEditingStop(stop);
      setFormData({
        stop_name: stop.stop_name || '',
        stop_order: stop.stop_order || 1,
        latitude: stop.latitude?.toString() || '',
        longitude: stop.longitude?.toString() || '',
      });
    } else {
      setEditingStop(null);
      setFormData({
        stop_name: '',
        stop_order: (stops?.length || 0) + 1,
        latitude: '',
        longitude: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.stop_name || !formData.latitude || !formData.longitude) {
      toast.error('Mohon lengkapi semua field');
      return;
    }

    try {
      setProcessing(true);

      const payload = {
        route_id: id,
        stop_name: formData.stop_name,
        stop_order: parseInt(formData.stop_order.toString()),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };

      if (editingStop) {
        // Update
        const { error } = await supabase
          .from('route_stops')
          .update(payload)
          .eq('id', editingStop.id);
        
        if (error) throw error;
        toast.success('Halte berhasil diperbarui');
      } else {
        // Create
        const { error } = await supabase
          .from('route_stops')
          .insert(payload);
        
        if (error) throw error;
        toast.success('Halte berhasil ditambahkan');
      }

      setIsDialogOpen(false);
      fetchRouteAndStops();

    } catch (error) {
      console.error('Error saving stop:', error);
      toast.error('Gagal menyimpan data halte');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (stopId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus halte ini?')) return;

    try {
      setProcessing(true);
      const { error } = await supabase
        .from('route_stops')
        .delete()
        .eq('id', stopId);

      if (error) throw error;
      
      toast.success('Halte berhasil dihapus');
      fetchRouteAndStops();
    } catch (error) {
      console.error('Error deleting stop:', error);
      toast.error('Gagal menghapus halte');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-[#121216]' : 'bg-gray-50/50'}`}>
        <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Memuat data halte...</p>
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className={`p-6 text-center min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-[#121216] text-white' : 'bg-white'}`}>
        <MapPin className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold">Rute Tidak Ditemukan</h1>
        <Button onClick={() => router.push('/admin/routes')} className="mt-6 bg-purple-600">Kembali ke Daftar Rute</Button>
      </div>
    );
  }

  const inputClasses = isDarkMode 
    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-purple-500" 
    : "focus:ring-purple-500";

  return (
    <div className={`p-6 min-h-full ${isDarkMode ? 'bg-[#121216] text-white' : 'bg-gray-50/50'}`}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.push('/admin/routes')}
                className={isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : ''}
            >
                <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
                <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Manajemen Halte</h1>
                <div className="flex items-center gap-2 mt-1 px-2 py-0.5 rounded-full bg-gray-500/10 w-fit">
                <span 
                    className="w-2.5 h-2.5 rounded-full shadow-sm" 
                    style={{ backgroundColor: route.color || '#7B2CBF' }}
                />
                <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {route.route_code} • {route.name}
                </p>
                </div>
            </div>
            </div>
            <Button 
                onClick={() => handleOpenDialog()}
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
            >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Halte
            </Button>
        </div>

        {/* Stops List */}
        <Card className={`border shadow-sm overflow-hidden ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
            <CardHeader className="border-b border-dashed border-gray-800/50">
            <CardTitle className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <MapPin className="w-5 h-5 text-purple-500" />
                Daftar Pemberhentian ({stops.length})
            </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
            <Table>
                <TableHeader className={isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'}>
                <TableRow className={isDarkMode ? 'border-gray-800' : ''}>
                    <TableHead className={`w-[80px] font-bold ${isDarkMode ? 'text-gray-400' : ''}`}>Urutan</TableHead>
                    <TableHead className={`font-bold ${isDarkMode ? 'text-gray-400' : ''}`}>Nama Halte</TableHead>
                    <TableHead className={`font-bold ${isDarkMode ? 'text-gray-400' : ''}`}>Koordinat</TableHead>
                    <TableHead className={`text-right font-bold ${isDarkMode ? 'text-gray-400' : ''}`}>Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {stops.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={4} className="text-center py-16 text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                            <MapPin className="w-12 h-12 opacity-20" />
                            <p>Belum ada halte untuk rute ini.</p>
                            <Button variant="link" onClick={() => handleOpenDialog()} className="text-purple-500">Tambah sekarang</Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ) : (
                    stops.map((stop) => (
                    <TableRow key={stop.id} className={`${isDarkMode ? 'hover:bg-gray-800/50 border-gray-800' : 'hover:bg-gray-50/50'}`}>
                        <TableCell className="text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${isDarkMode ? 'bg-purple-900/40 text-purple-400' : 'bg-purple-50 text-purple-700'}`}>
                                {stop.stop_order}
                            </span>
                        </TableCell>
                        <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                            <span className={isDarkMode ? 'text-gray-200' : 'text-gray-900'}>{stop.stop_name}</span>
                        </div>
                        </TableCell>
                        <TableCell className="font-mono text-[10px] text-gray-500">
                        {stop.latitude?.toFixed(6)}, {stop.longitude?.toFixed(6)}
                        </TableCell>
                        <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                            <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(stop)}
                            className={isDarkMode ? 'text-blue-400 hover:bg-blue-900/20' : 'text-blue-600'}
                            >
                            <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(stop.id)}
                            className={isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600'}
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
            </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className={`${isDarkMode ? 'bg-[#1A1A20] border-gray-800 text-white' : ''} sm:max-w-md`}>
            <DialogHeader>
                <DialogTitle className="font-bold flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-500" />
                    {editingStop ? 'Edit Halte' : 'Tambah Halte Baru'}
                </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-2">
                <Label htmlFor="stop_name" className={isDarkMode ? 'text-gray-300' : ''}>Nama Halte</Label>
                <Input
                    id="stop_name"
                    value={formData.stop_name}
                    onChange={(e) => setFormData({ ...formData, stop_name: e.target.value })}
                    placeholder="Contoh: Halte Pasar Lama"
                    required
                    className={inputClasses}
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="stop_order" className={isDarkMode ? 'text-gray-300' : ''}>Urutan</Label>
                <Input
                    id="stop_order"
                    type="number"
                    value={formData.stop_order}
                    onChange={(e) => setFormData({ ...formData, stop_order: parseInt(e.target.value) })}
                    min={1}
                    required
                    className={inputClasses}
                />
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="latitude" className={isDarkMode ? 'text-gray-300' : ''}>Latitude</Label>
                    <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="-6.xxxxxx"
                    required
                    className={inputClasses}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="longitude" className={isDarkMode ? 'text-gray-300' : ''}>Longitude</Label>
                    <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="106.xxxxxx"
                    required
                    className={inputClasses}
                    />
                </div>
                </div>
                <DialogFooter className="pt-4">
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className={`flex-1 ${isDarkMode ? 'bg-transparent border-gray-700 hover:bg-gray-800' : ''}`}
                >
                    Batal
                </Button>
                <Button 
                    type="submit" 
                    disabled={processing}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20"
                >
                    {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingStop ? 'Update Halte' : 'Simpan Halte'}
                </Button>
                </DialogFooter>
            </form>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
