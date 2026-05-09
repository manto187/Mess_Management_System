'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  students: {
    total: number;
    active: number;
    lowBalance: number;
  };
  attendance: {
    present: number;
    absent: number;
  };
  finance: {
    todayExpenses: number;
    todayIncome: number;
    mealCharges: number;
    profitLoss: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-3xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-800">خوش آمدید!</h1>
          <p className="text-slate-500 text-lg mt-1">آج کے میس کے اعداد و شمار درج ذیل ہیں</p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-3 bg-white shadow-lg shadow-slate-200/50 rounded-2xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
        >
          <Loader2 className={`w-6 h-6 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="کل اسٹوڈنٹس" 
          value={stats.students.total} 
          icon={Users} 
          color="bg-indigo-500" 
          subValue={`${stats.students.active} فعال`}
        />
        <StatCard 
          title="آج حاضر" 
          value={stats.attendance.present} 
          icon={UserCheck} 
          color="bg-emerald-500" 
          subValue="آج کی حاضری"
        />
        <StatCard 
          title="آج غیر حاضر" 
          value={stats.attendance.absent} 
          icon={UserX} 
          color="bg-rose-500" 
          subValue="رخصت یا غیر حاضر"
        />
        <StatCard 
          title="کم بیلنس" 
          value={stats.students.lowBalance} 
          icon={AlertCircle} 
          color="bg-amber-500" 
          subValue="فیس ادائیگی درکار"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Finance Overview */}
        <Card className="lg:col-span-2 border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-800">مالیاتی خلاصہ</CardTitle>
              <p className="text-slate-400">آج کی آمدنی اور خرچ کا موازنہ</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
              <Activity className="w-7 h-7 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-6">
                 <FinanceItem 
                   label="آج کے اخراجات" 
                   amount={stats.finance.todayExpenses} 
                   icon={ArrowDownRight} 
                   color="text-rose-600" 
                   bg="bg-rose-50"
                 />
                 <FinanceItem 
                   label="میل چارجز (آج)" 
                   amount={stats.finance.mealCharges} 
                   icon={ArrowUpRight} 
                   color="text-emerald-600" 
                   bg="bg-emerald-50"
                 />
              </div>
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">آج کا نفع / نقصان</p>
                <h3 className={`text-4xl font-black ${stats.finance.profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(stats.finance.profitLoss)}
                </h3>
                <p className="text-slate-500 text-xs mt-4">کھانے کی فیس بمقابلہ خرچہ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <CardHeader className="p-8 pb-0">
             <CardTitle className="text-xl font-bold flex items-center gap-2">
                <PieIcon className="w-6 h-6 text-indigo-400" />
                فوری معلومات
             </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
             <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-slate-400">آج کے ڈپازٹس</span>
                   <Wallet className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-2xl font-black">{formatCurrency(stats.finance.todayIncome)}</p>
             </div>
             
             <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-slate-400">حاضری فیصد</span>
                   <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-black">
                  {stats.students.total > 0 
                    ? Math.round((stats.attendance.present / stats.students.total) * 100) 
                    : 0}%
                </p>
             </div>

             <div className="pt-4">
                <p className="text-slate-400 text-xs text-center">آخری اپ ڈیٹ: ابھی</p>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subValue }: any) {
  return (
    <Card className="border-0 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      <CardContent className="p-6 flex items-center gap-5">
        <div className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-white shadow-lg shadow-inherit/20`}>
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-black text-slate-800">{value}</h3>
          <p className="text-slate-400 text-xs mt-0.5">{subValue}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FinanceItem({ label, amount, icon: Icon, color, bg }: any) {
  return (
    <div className="flex items-center justify-between p-5 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
          <p className={`text-xl font-black ${color}`}>{formatCurrency(amount)}</p>
        </div>
      </div>
    </div>
  );
}
