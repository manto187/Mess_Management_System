'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Beef, 
  Wheat, 
  Flame, 
  Zap, 
  MoreHorizontal,
  Calendar as CalendarIcon,
  Receipt,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { id: 'VEGETABLES', label: 'سبزیاں', icon: ShoppingCart, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'MEAT', label: 'گوشت', icon: Beef, color: 'bg-rose-100 text-rose-600' },
  { id: 'RICE', label: 'چاول', icon: ShoppingCart, color: 'bg-amber-100 text-amber-600' },
  { id: 'FLOUR', label: 'آٹا', icon: Wheat, color: 'bg-orange-100 text-orange-600' },
  { id: 'GAS', label: 'گیس', icon: Flame, color: 'bg-blue-100 text-blue-600' },
  { id: 'UTILITIES', label: 'یوٹیلیٹیز', icon: Zap, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'OTHER', label: 'دیگر', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-600' },
];

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, byCategory: {} });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'VEGETABLES',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([
        api.get(`/expenses?date=${selectedDate}`),
        api.get(`/expenses/summary?date=${selectedDate}`)
      ]);
      setExpenses(Array.isArray(eRes.data) ? eRes.data : eRes.data.data || []);
      setSummary(sRes.data.data || sRes.data);
    } catch {
      toast({ title: 'خرابی', description: 'ڈیٹا لوڈ نہیں ہو سکا', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDate]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/expenses', {
        ...form,
        amount: parseFloat(form.amount)
      });
      toast({ title: 'کامیاب', description: 'خرچہ درج کر دیا گیا' });
      setIsAddOpen(false);
      setForm({ ...form, title: '', amount: '' });
      fetchData();
    } catch {
      toast({ title: 'خرابی', description: 'خرچہ درج نہیں ہو سکا', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('کیا آپ یہ خرچہ ختم کرنا چاہتے ہیں؟')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast({ title: 'ختم کر دیا گیا', description: 'خرچہ لسٹ سے ہٹا دیا گیا' });
      fetchData();
    } catch {
      toast({ title: 'خرابی', description: 'خرچہ ختم نہیں ہو سکا', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Top Header & Date Picker */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">روزانہ اخراجات</h1>
          <p className="text-slate-500">میس کے تمام اخراجات کا حساب</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
           <CalendarIcon className="w-5 h-5 mr-3 text-slate-400" />
           <Input 
             type="date" 
             value={selectedDate} 
             onChange={e => setSelectedDate(e.target.value)}
             className="border-0 focus-visible:ring-0 h-10 w-40 text-lg font-medium"
           />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-rose-600 to-rose-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
          <CardContent className="p-8 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-rose-100 text-sm font-medium uppercase tracking-widest mb-1">آج کا کل خرچہ</p>
                <h2 className="text-4xl font-black">{formatCurrency(summary.total)}</h2>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-0 shadow-lg bg-white overflow-hidden">
          <CardHeader className="pb-2 border-b border-slate-50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">فوری اندراج</CardTitle>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-6 bg-slate-800 hover:bg-slate-900 gap-2 shadow-lg">
                    <Plus className="w-5 h-5" /> نیا خرچہ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md" dir="rtl">
                  <DialogHeader><DialogTitle>نیا خرچہ درج کریں</DialogTitle></DialogHeader>
                  <form onSubmit={handleAdd} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">تفصیل / نام *</label>
                      <Input 
                        required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                        className="h-12 text-lg" placeholder="مثلاً: آج کی سبزی"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">رقم *</label>
                        <Input 
                          required type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})}
                          className="h-12 text-lg" placeholder="0" dir="ltr"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">تاریخ</label>
                        <Input 
                          type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}
                          className="h-12" dir="ltr"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">کیٹیگری</label>
                      <div className="grid grid-cols-3 gap-2">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setForm({...form, category: cat.id})}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                              form.category === cat.id ? 'border-slate-800 bg-slate-50' : 'border-transparent bg-slate-50/50 hover:bg-slate-50'
                            }`}
                          >
                            <cat.icon className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">{cat.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full h-14 text-xl bg-rose-600 hover:bg-rose-700 mt-4">
                      {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : 'محفوظ کریں'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                const amount = (summary.byCategory as any)[cat.id] || 0;
                if (amount === 0) return null;
                return (
                  <Badge key={cat.id} className={`px-4 py-2 text-sm rounded-xl border-0 shadow-sm ${cat.color}`}>
                    {cat.label}: {formatCurrency(amount)}
                  </Badge>
                );
              })}
              {Object.keys(summary.byCategory).length === 0 && (
                <p className="text-slate-400 italic text-sm">آج ابھی تک کوئی خرچہ نہیں ہوا</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <Card className="border-0 shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
             <Receipt className="w-5 h-5 text-slate-400" />
             <CardTitle className="text-lg">اخراجات کی تفصیل</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
             <div className="p-10 space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
             </div>
          ) : expenses.length === 0 ? (
            <div className="py-20 text-center text-slate-400 italic">منتخب تاریخ میں کوئی خرچہ نہیں ملا</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {expenses.map((e) => {
                const cat = categories.find(c => c.id === e.category) || categories[6];
                return (
                  <div key={e.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.color}`}>
                        <cat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{e.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-medium text-slate-400">{cat.label}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className="text-xs text-slate-400">{new Date(e.date).toLocaleDateString('ur-PK')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <p className="text-xl font-black text-slate-800">
                        {formatCurrency(e.amount)}
                      </p>
                      <Button 
                        variant="ghost" size="icon" 
                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full"
                        onClick={() => handleDelete(e.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
