'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore, useThemeStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, User, Shield, Bell, Globe, Moon, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { useUserProfile, useUpdateProfile } from '@/hooks/useQueries';

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [loading, setLoading] = useState(false);
  
  // Queries
  const { data: profileData, isLoading: isProfileLoading } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    appName: 'T-Go Angkot Digital',
    contactEmail: 'admin@tgo.com',
    maintenanceMode: false,
    enableRegistration: true,
    baseFare: 3000
  });

  // Profile Settings State
  const [profileSettings, setProfileSettings] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (profileData) {
      setProfileSettings(prev => ({
        ...prev,
        fullName: profileData.full_name || '',
        email: user?.email || ''
      }));
    }
  }, [profileData, user]);

  const handleSystemSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Pengaturan sistem berhasil disimpan');
    setLoading(false);
  };

  const handleProfileSave = async () => {
    if (profileSettings.newPassword && profileSettings.newPassword !== profileSettings.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }

    setLoading(true);
    try {
      // Update profile data using mutation
      await updateProfileMutation.mutateAsync({ 
        full_name: profileSettings.fullName 
      });

      // Update password if provided
      if (profileSettings.newPassword) {
        const { error: authError } = await supabase.auth.updateUser({
          password: profileSettings.newPassword
        });
        if (authError) throw authError;
        toast.success('Profil dan password berhasil diperbarui');
      } else {
        toast.success('Profil berhasil diperbarui');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  if (isProfileLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 max-w-5xl mx-auto min-h-full ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-2xl font-black tracking-tight">Pengaturan</h1>
           <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
             Kelola konfigurasi sistem dan preferensi akun admin.
           </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className={`grid w-full grid-cols-3 lg:w-[400px] mb-6 ${isDarkMode ? 'bg-[#1A1A20]' : 'bg-gray-100'}`}>
          <TabsTrigger 
            value="general" 
            className={`font-semibold ${isDarkMode ? 'data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400' : 'data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-500'}`}
          >
            Umum
          </TabsTrigger>
          <TabsTrigger 
            value="profile"
             className={`font-semibold ${isDarkMode ? 'data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400' : 'data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-500'}`}
          >
            Profil
          </TabsTrigger>
          <TabsTrigger 
            value="notifications"
             className={`font-semibold ${isDarkMode ? 'data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400' : 'data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-500'}`}
          >
            Sistem
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className={`border shadow-sm ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Globe className="w-5 h-5 text-purple-600" />
                Informasi Aplikasi
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Konfigurasi dasar identitas aplikasi T-Go.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="appName" className={isDarkMode ? 'text-gray-300' : ''}>Nama Aplikasi</Label>
                <Input 
                  id="appName" 
                  value={systemSettings.appName}
                  onChange={(e) => setSystemSettings({...systemSettings, appName: e.target.value})}
                  className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail" className={isDarkMode ? 'text-gray-300' : ''}>Email Kontak Support</Label>
                <Input 
                  id="contactEmail" 
                  type="email"
                  value={systemSettings.contactEmail}
                  onChange={(e) => setSystemSettings({...systemSettings, contactEmail: e.target.value})}
                  className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="baseFare" className={isDarkMode ? 'text-gray-300' : ''}>Tarif Dasar (Estimasi)</Label>
                <Input 
                  id="baseFare" 
                  type="number"
                  value={systemSettings.baseFare}
                  onChange={(e) => setSystemSettings({...systemSettings, baseFare: parseInt(e.target.value)})}
                  className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={`border shadow-sm ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
             <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-orange-500" />}
                Tampilan
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Sesuaikan tema panel admin.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className={`text-base ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Mode Gelap</Label>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Aktifkan tampilan gelap untuk kenyamanan mata.
                  </p>
                </div>
                <Switch 
                  checked={isDarkMode}
                  onCheckedChange={toggleDarkMode}
                />
              </div>
            </CardContent>
          </Card>

           <div className="flex justify-end">
            <Button onClick={handleSystemSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </Button>
          </div>
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-6">
          <Card className={`border shadow-sm ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <User className="w-5 h-5 text-purple-600" />
                Profil Admin
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Kelola informasi akun Anda dan keamanan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName" className={isDarkMode ? 'text-gray-300' : ''}>Nama Lengkap</Label>
                <Input 
                  id="fullName" 
                  value={profileSettings.fullName}
                  onChange={(e) => setProfileSettings({...profileSettings, fullName: e.target.value})}
                  className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className={isDarkMode ? 'text-gray-300' : ''}>Email</Label>
                <Input 
                  id="email" 
                  value={profileSettings.email}
                  disabled
                  className={isDarkMode ? 'bg-gray-900/50 border-gray-800 text-gray-500' : 'bg-gray-100 text-gray-500'}
                />
              </div>
              
              <Separator className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} />
              
              <h3 className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Ganti Password</h3>
              
              <div className="grid gap-2">
                <Label htmlFor="newPassword" className={isDarkMode ? 'text-gray-300' : ''}>Password Baru</Label>
                <Input 
                  id="newPassword" 
                  type="password"
                  value={profileSettings.newPassword}
                  onChange={(e) => setProfileSettings({...profileSettings, newPassword: e.target.value})}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword" className={isDarkMode ? 'text-gray-300' : ''}>Konfirmasi Password Baru</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  value={profileSettings.confirmPassword}
                  onChange={(e) => setProfileSettings({...profileSettings, confirmPassword: e.target.value})}
                  placeholder="Ulangi password baru"
                  className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleProfileSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Update Profil
            </Button>
          </div>
        </TabsContent>

        {/* System / Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className={`border shadow-sm ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <Shield className="w-5 h-5 text-red-500" />
                Zona Bahaya & Akses
              </CardTitle>
              <CardDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Pengaturan sensitif sistem yang mempengaruhi akses pengguna.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className={`text-base ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Mode Maintenance (Perbaikan)</Label>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Nonaktifkan akses pengguna sementara waktu. Hanya admin yang bisa login.
                  </p>
                </div>
                <Switch 
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                />
              </div>
              <Separator className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className={`text-base ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Registrasi Pengguna Baru</Label>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    Izinkan publik mendaftar akun baru di aplikasi.
                  </p>
                </div>
                <Switch 
                  checked={systemSettings.enableRegistration}
                  onCheckedChange={(checked) => setSystemSettings({...systemSettings, enableRegistration: checked})}
                />
              </div>
            </CardContent>
          </Card>
           <div className="flex justify-end">
            <Button onClick={handleSystemSave} disabled={loading} variant="destructive">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Simpan Konfigurasi Sistem
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
