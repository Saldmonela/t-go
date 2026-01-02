// app/admin/wallet/page.tsx

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpRight, ArrowDownLeft, Wallet, Loader2, Download, Filter } from "lucide-react";
import { useThemeStore } from "@/lib/store";

interface Transaction {
  id: string;
  user_name: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  metadata?: any;
}

export default function AdminWalletPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any).rpc("get_admin_wallet_transactions");

      if (error) {
        console.error("Error fetching transactions:", error?.message || error);
      } else {
        setTransactions(data || []);
      }
    } catch (error: any) {
      console.error("Unexpected error:", error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) =>
    (t.user_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalIn = transactions
    .filter((t) => t.type === "topup" || t.type === "refund")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalOut = transactions
    .filter((t) => t.type === "payment")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className={`p-6 space-y-8 min-h-full ${isDarkMode ? 'bg-[#121216] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Keuangan & Transaksi</h1>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Pantau arus kas dan riwayat transaksi ekosistem T-Go.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className={`border-dashed ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800' : 'bg-white'}`}>
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-900/20">
            <Download className="w-4 h-4 mr-2" />
            Export Laporan
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={`border shadow-sm border-t-4 border-t-emerald-500 ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Pemasukan (Top Up)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mt-1">
              <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-inner">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <div className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Rp {totalIn.toLocaleString("id-ID")}
                </div>
                <p className="text-[10px] text-emerald-500 font-bold uppercase mt-0.5">Berhasil Terproses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border shadow-sm border-t-4 border-t-orange-500 ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Total Pengeluaran (Tiket)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mt-1">
              <div className="p-3 rounded-2xl bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-inner">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <div className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Rp {totalOut.toLocaleString("id-ID")}
                </div>
                <p className="text-[10px] text-orange-500 font-bold uppercase mt-0.5">Penjualan Tiket</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border shadow-sm border-t-4 border-t-purple-500 ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
          <CardHeader className="pb-2">
            <CardTitle className={`text-[11px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Estimasi Saldo Sistem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mt-1">
              <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-inner">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <div className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Rp {(totalIn - totalOut).toLocaleString("id-ID")}
                </div>
                <p className="text-[10px] text-purple-500 font-bold uppercase mt-0.5">Total Saldo Aktif</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table Section */}
      <div className={`rounded-2xl border shadow-lg overflow-hidden ${isDarkMode ? 'bg-[#1A1A20] border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari transaksi berdasarkan nama atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 h-10 ${isDarkMode ? 'bg-gray-800/50 border-gray-700 text-white focus:ring-purple-500' : 'bg-gray-50 border-gray-200'}`}
            />
          </div>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            Daftar Transaksi Terkini
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className={isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50/50'}>
              <TableRow className={isDarkMode ? 'border-gray-800' : 'border-gray-100'}>
                <TableHead className="font-bold py-4">Waktu</TableHead>
                <TableHead className="font-bold py-4">Pengguna</TableHead>
                <TableHead className="font-bold py-4">Tipe</TableHead>
                <TableHead className="font-bold py-4">Deskripsi</TableHead>
                <TableHead className="text-right font-bold py-4">Nominal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Menarik data transaksi...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-24 text-gray-500">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                      <Wallet className="w-12 h-12 mb-2" />
                      <p className="font-bold">Tidak ada transaksi ditemukan.</p>
                      <p className="text-xs">{searchQuery ? 'Coba gunakan kata kunci pencarian yang berbeda.' : 'Sistem belum mencatat transaksi apapun.'}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t) => (
                  <TableRow key={t.id} className={`${isDarkMode ? 'border-gray-800 hover:bg-gray-800/30' : 'border-gray-50 hover:bg-gray-50/50'} transition-colors`}>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className={`text-[13px] font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(t.created_at).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(t.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                          {t.user_name ? t.user_name.substring(0, 2).toUpperCase() : '??'}
                        </div>
                        <span className={`font-bold text-[13px] ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {t.user_name || "Unknown"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        className={`
                          px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border-none
                          ${
                            t.type === "topup"
                              ? "bg-emerald-500/10 text-emerald-500 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]"
                              : t.type === "payment"
                              ? "bg-orange-500/10 text-orange-500 shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]"
                              : "bg-blue-500/10 text-blue-500"
                          }
                        `}
                      >
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className={`text-[13px] font-medium max-w-[300px] truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t.description}
                      </p>
                    </TableCell>
                    <TableCell className={`text-right py-4`}>
                      <div className="flex flex-col items-end">
                        <span className={`font-black text-sm ${
                          t.type === 'topup' || t.type === 'refund' ? 'text-emerald-500' : 
                          t.type === 'payment' ? 'text-red-500' : 
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {t.type === "payment" ? "-" : "+"} Rp {Number(t.amount).toLocaleString("id-ID")}
                        </span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Selesai</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
