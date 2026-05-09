'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Meal, Member } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { MEAL_TYPE_LABELS, formatCurrency } from '@/lib/utils';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  UtensilsCrossed, 
  Calendar as CalendarIcon,
  Search,
  ChevronRight,
  Clock,
  Coffee,
  Sun,
  Moon,
  ChefHat,
  Table as TableIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

const mealTheme: Record<string, { icon: any, color: string, bg: string, text: string }> = {
  BREAKFAST: { icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50', text: 'ناشتہ' },
  LUNCH: { icon: Sun, color: 'text-emerald-600', bg: 'bg-emerald-50', text: 'دوپہر کا کھانا' },
  DINNER: { icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50', text: 'رات کا کھانا' },
};

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const [form, setForm] = useState({ memberId: '', date: new Date().toISOString().split('T')[0], type: '', amount: '100' });

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/meals');
      setMeals(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Failed to fetch meals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
    api.get('/students').then((r) => {
      const data = r.data;
      setMembers(Array.isArray(data) ? data : data.data || []);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/meals', {
        studentId: form.memberId,
        date: form.date,
        type: form.type,
        amount: Number(form.amount)
      });
      toast({ title: 'کھانا ریکارڈ ہو گیا ✓' });
      setOpen(false);
      setForm({ memberId: '', date: new Date().toISOString().split('T')[0], type: '', amount: '100' });
      fetchMeals();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'کھانا ریکارڈ نہیں ہوا';
      toast({ title: 'خرابی', description: msg, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/meals/${id}`);
      toast({ title: 'ریکارڈ ہٹا دیا' });
      fetchMeals();
    } catch {
      toast({ title: 'خرابی', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-800">کھانا مینجمنٹ</h1>
          <p className="text-slate-500 text-lg mt-1">روزانہ کے کھانے کا ریکارڈ اور مینو</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 h-14 px-8 text-lg font-bold shadow-lg shadow-indigo-100 gap-2">
              <Plus className="w-6 h-6" /> کھانا شامل کریں
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-8 max-w-md border-0 shadow-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <ChefHat className="w-8 h-8 text-indigo-500" />
                کھانا ریکارڈ کریں
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 mr-2">اسٹوڈنٹ منتخب کریں</label>
                <Select value={form.memberId} onValueChange={(v) => setForm({ ...form, memberId: v })}>
                  <SelectTrigger className="rounded-2xl h-14 border-slate-200">
                    <SelectValue placeholder="ممبر چنیں" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    {members.filter(m => m.status === 'ACTIVE').map(m => (
                      <SelectItem key={m.id} value={m.id} className="rounded-xl">{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 mr-2">تاریخ</label>
                <div className="relative">
                  <CalendarIcon className="absolute right-4 top-4 w-6 h-6 text-slate-400" />
                  <input 
                    type="date" 
                    value={form.date} 
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full h-14 pr-12 pl-4 border border-slate-200 rounded-2xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 mr-2">کھانے کا وقت</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(MEAL_TYPE_LABELS).map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setForm({ ...form, type: k })}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        form.type === k 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {/* @ts-ignore */}
                      {(() => { const Icon = mealTheme[k]?.icon; return Icon ? <Icon className="w-6 h-6" /> : null })()}
                      <span className="text-xs font-bold">{v}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 mr-2">قیمت (روپے)</label>
                <div className="relative">
                  <span className="absolute left-4 top-4 text-slate-400 font-bold">Rs</span>
                  <input 
                    type="number" 
                    value={form.amount} 
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full h-14 pl-12 pr-4 border border-slate-200 rounded-2xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold" 
                    required 
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={submitting || !form.memberId || !form.type}
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-lg shadow-indigo-100 mt-2"
              >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'محفوظ کریں'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Records List */}
        <Card className="lg:col-span-2 border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-8 pb-0">
             <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <TableIcon className="w-7 h-7 text-slate-400" />
                حالیہ ریکارڈز
             </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-[1.5rem]" />)}
              </div>
            ) : meals.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <UtensilsCrossed className="w-20 h-20 mx-auto mb-4 text-slate-200" />
                <p className="text-xl font-bold text-slate-400">کوئی ریکارڈ نہیں ملا</p>
              </div>
            ) : (
              <div className="space-y-4">
                {meals.map((meal) => {
                  const theme = mealTheme[meal.type] || mealTheme.BREAKFAST;
                  const Icon = theme.icon;
                  return (
                    <div 
                      key={meal.id} 
                      className="group flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-slate-100"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl ${theme.bg} flex items-center justify-center ${theme.color} shadow-sm group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7" />
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-800">{meal.student?.name || 'نامعلوم'}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-slate-400 text-sm">
                              <CalendarIcon className="w-4 h-4" />
                              {format(new Date(meal.date), 'dd MMM, yyyy')}
                            </span>
                            <Badge className={`${theme.bg} ${theme.color} border-0 rounded-lg px-3 py-1 text-xs font-bold`}>
                              {theme.text}
                            </Badge>
                            <span className="text-sm font-black text-slate-700">{formatCurrency(meal.amount || 0)}</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl h-12 w-12"
                        onClick={() => handleDelete(meal.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats / Summary */}
        <div className="space-y-6">
           <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-slate-900 text-white p-8">
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-indigo-400" />
                 </div>
                 <h3 className="text-xl font-bold">آج کی سمری</h3>
              </div>
              <div className="space-y-6">
                 <SummaryItem icon={Coffee} label="ناشتہ" count={meals.filter(m => m.type === 'BREAKFAST').length} />
                 <SummaryItem icon={Sun} label="دوپہر" count={meals.filter(m => m.type === 'LUNCH').length} />
                 <SummaryItem icon={Moon} label="رات" count={meals.filter(m => m.type === 'DINNER').length} />
              </div>
           </Card>

           <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-indigo-600 text-white p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
              <ChefHat className="w-12 h-12 text-indigo-200 mb-4" />
              <p className="text-indigo-100 text-sm font-bold opacity-80 uppercase tracking-widest mb-1">ٹوٹل کھانے (آج)</p>
              <h2 className="text-5xl font-black">{meals.length}</h2>
              <p className="text-indigo-200 text-xs mt-4">تمام ممبران کے کل کھانے</p>
           </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ icon: Icon, label, count }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
       <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-slate-400" />
          <span className="font-bold">{label}</span>
       </div>
       <span className="text-2xl font-black text-indigo-400">{count}</span>
    </div>
  );
}
