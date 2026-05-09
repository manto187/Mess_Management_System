'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  Filter, 
  ChevronRight,
  Loader2,
  Table as TableIcon,
  TrendingUp,
  Receipt,
  UserCheck,
  Users
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { exportToExcel, exportToPDF } from '@/lib/export';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

type ReportType = 'ledger' | 'attendance' | 'expenses' | 'profit-loss';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportType>('ledger');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  
  // Filters
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  useEffect(() => {
    fetchStudents();
    fetchReport();
  }, [activeTab]);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data.data);
    } catch (err) {
      console.error('Failed to fetch students', err);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `/reports/${activeTab}?startDate=${startDate}&endDate=${endDate}`;
      if (activeTab === 'ledger' && selectedStudent !== 'all') {
        url += `&studentId=${selectedStudent}`;
      }
      
      const { data } = await api.get(url);
      if (activeTab === 'profit-loss') {
        setSummary(data.data.summary);
        setData([]); // No list for PL
      } else {
        setData(data.data);
        setSummary(null);
      }
    } catch (err) {
      console.error('Failed to fetch report', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (activeTab === 'profit-loss' && summary) {
      exportToExcel([summary], `Profit_Loss_Report`);
    } else {
      const exportData = data.map(item => ({
        ...item,
        student: item.student?.name || 'N/A',
        date: format(new Date(item.date || item.createdAt), 'yyyy-MM-dd'),
      }));
      exportToExcel(exportData, `${activeTab}_Report`);
    }
  };

  const handleExportPDF = () => {
    let title = '';
    let headers: string[][] = [];
    let body: any[][] = [];

    if (activeTab === 'ledger') {
      title = 'Student Ledger Report';
      headers = [['Date', 'Student', 'Type', 'Amount', 'Balance After']];
      body = data.map(item => [
        format(new Date(item.createdAt), 'yyyy-MM-dd'),
        item.student?.name,
        item.type,
        item.amount,
        item.balanceAfter
      ]);
    } else if (activeTab === 'attendance') {
      title = 'Attendance Report';
      headers = [['Date', 'Student', 'Status', 'Meal Type', 'Amount']];
      body = data.map(item => [
        format(new Date(item.date), 'yyyy-MM-dd'),
        item.student?.name,
        item.status,
        item.mealType,
        item.amount
      ]);
    } else if (activeTab === 'expenses') {
      title = 'Expense Report';
      headers = [['Date', 'Category', 'Description', 'Amount']];
      body = data.map(item => [
        format(new Date(item.date), 'yyyy-MM-dd'),
        item.category,
        item.description,
        item.amount
      ]);
    } else if (activeTab === 'profit-loss') {
      title = 'Profit & Loss Report';
      headers = [['Metric', 'Amount']];
      body = [
        ['Total Deposits', formatCurrency(summary.totalDeposits)],
        ['Total Meal Charges', formatCurrency(summary.totalMealCharges)],
        ['Total Refunds', formatCurrency(summary.totalRefunds)],
        ['Total Expenses', formatCurrency(summary.totalExpenses)],
        ['Net Profit', formatCurrency(summary.netProfit)],
      ];
    }

    exportToPDF(title, headers, body, `${activeTab}_Report`);
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800">رپورٹس</h1>
          <p className="text-slate-500 text-lg mt-1">میس کے ریکارڈز اور مالیاتی رپورٹس</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleExportExcel} 
            variant="outline" 
            className="rounded-2xl border-2 border-emerald-100 text-emerald-700 hover:bg-emerald-50 h-12 gap-2"
          >
            <Download className="w-5 h-5" />
            ایکسل ایکسپورٹ
          </Button>
          <Button 
            onClick={handleExportPDF} 
            className="rounded-2xl bg-slate-900 hover:bg-slate-800 h-12 gap-2"
          >
            <FileText className="w-5 h-5" />
            پی ڈی ایف ڈاؤن لوڈ
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-slate-100 rounded-[2rem] w-fit">
         <TabButton active={activeTab === 'ledger'} onClick={() => setActiveTab('ledger')} icon={Users} label="لیجر" />
         <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={UserCheck} label="حاضری" />
         <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={Receipt} label="اخراجات" />
         <TabButton active={activeTab === 'profit-loss'} onClick={() => setActiveTab('profit-loss')} icon={TrendingUp} label="نفع و نقصان" />
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 mr-2">تاریخ سے</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                <Input 
                  type="date" 
                  className="rounded-2xl h-12 pr-10 border-slate-200 focus:ring-emerald-500" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 mr-2">تاریخ تک</label>
              <div className="relative">
                <Calendar className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                <Input 
                  type="date" 
                  className="rounded-2xl h-12 pr-10 border-slate-200 focus:ring-emerald-500" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            {activeTab === 'ledger' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 mr-2">اسٹوڈنٹ منتخب کریں</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                   <SelectTrigger className="rounded-2xl h-12 border-slate-200">
                      <SelectValue placeholder="تمام طلباء" />
                   </SelectTrigger>
                   <SelectContent className="rounded-2xl border-slate-100">
                      <SelectItem value="all">تمام طلباء</SelectItem>
                      {students.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                   </SelectContent>
                </Select>
              </div>
            )}
            <Button 
              onClick={fetchReport}
              disabled={loading}
              className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 h-12 gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              رپورٹ دیکھیں
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Data */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'profit-loss' && summary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <ReportStat label="کل ڈپازٹس" value={summary.totalDeposits} color="text-indigo-600" />
             <ReportStat label="میل چارجز" value={summary.totalMealCharges} color="text-emerald-600" />
             <ReportStat label="کل اخراجات" value={summary.totalExpenses} color="text-rose-600" />
             <div className="md:col-span-2 lg:col-span-3 p-8 rounded-[2.5rem] bg-slate-900 text-white flex justify-between items-center">
                <div>
                   <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-1">خالص نفع / نقصان</p>
                   <h2 className="text-5xl font-black">{formatCurrency(summary.netProfit)}</h2>
                </div>
                <TrendingUp className={`w-16 h-16 ${summary.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
             </div>
          </div>
        ) : (
          <Card className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="p-6 text-slate-500 font-bold">تاریخ</th>
                      {(activeTab === 'ledger' || activeTab === 'attendance') && (
                        <th className="p-6 text-slate-500 font-bold">نام</th>
                      )}
                      <th className="p-6 text-slate-500 font-bold">تفصیل / کیٹیگری</th>
                      <th className="p-6 text-slate-500 font-bold">رقم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400">کوئی ریکارڈ نہیں ملا</td>
                      </tr>
                    ) : (
                      data.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-6 font-medium text-slate-600">
                            {format(new Date(item.date || item.createdAt), 'dd MMM, yyyy')}
                          </td>
                          {(activeTab === 'ledger' || activeTab === 'attendance') && (
                            <td className="p-6">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                     {item.student?.name?.[0]}
                                  </div>
                                  <span className="font-bold text-slate-800">{item.student?.name}</span>
                               </div>
                            </td>
                          )}
                          <td className="p-6 text-slate-500">
                            {item.description || item.type || item.mealType || item.category}
                          </td>
                          <td className="p-6">
                            <span className="font-black text-slate-800">{formatCurrency(item.amount)}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-8 py-3.5 rounded-[1.8rem] text-sm font-bold transition-all ${
        active 
          ? 'bg-white text-emerald-700 shadow-md scale-[1.05] z-10' 
          : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'text-emerald-500' : ''}`} />
      {label}
    </button>
  );
}

function ReportStat({ label, value, color }: any) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/40 border border-slate-50">
       <p className="text-slate-400 text-sm font-bold mb-1">{label}</p>
       <p className={`text-3xl font-black ${color}`}>{formatCurrency(value)}</p>
    </div>
  );
}
