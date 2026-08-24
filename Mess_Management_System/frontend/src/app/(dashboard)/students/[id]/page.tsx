'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Wallet, 
  Plus, 
  History, 
  Phone, 
  DoorOpen, 
  TrendingDown, 
  TrendingUp,
  Loader2,
  Calendar,
  CreditCard
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Student {
  id: string;
  name: string;
  phone: string;
  room: string;
  balance: number;
  status: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: 'DEPOSIT' | 'MEAL_CHARGE' | 'REFUND';
  method?: string;
  description?: string;
  date: string;
}

const methodLabels: Record<string, string> = {
  CASH: 'کیش',
  EASYPAISA: 'ایزی پیسہ',
  JAZZCASH: 'جاز کیش',
  BANK_TRANSFER: 'بینک ٹرانسفر'
};

export default function StudentLedgerPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    amount: '',
    method: 'CASH',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sRes, tRes] = await Promise.all([
        api.get(`/students/${id}`),
        api.get(`/transactions/student/${id}`)
      ]);
      setStudent(sRes.data.data || sRes.data);
      setTransactions(Array.isArray(tRes.data) ? tRes.data : tRes.data.data || []);
    } catch {
      toast({ title: 'خرابی', description: 'ڈیٹا لوڈ نہیں ہو سکا', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/transactions', {
        studentId: id,
        amount: parseFloat(form.amount),
        type: 'DEPOSIT',
        method: form.method,
        description: form.description || 'رقم جمع کرائی گئی'
      });
      toast({ title: 'کامیاب', description: 'رقم جمع کر دی گئی' });
      setIsDepositOpen(false);
      setForm({ amount: '', method: 'CASH', description: '' });
      fetchData();
    } catch {
      toast({ title: 'خرابی', description: 'ٹرانزیکشن ناکام رہی', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-12 w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-40 col-span-1" />
        <Skeleton className="h-40 col-span-2" />
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );

  if (!student) return <div className="text-center py-20">اسٹوڈنت نہیں ملا</div>;

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => window.history.back()} className="rounded-full h-12 w-12 p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-3xl font-bold text-slate-800">{student.name} کا لیجر</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-2xl" />
          <CardContent className="p-8 relative z-10">
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-1">موجودہ بیلنس</p>
                <h2 className="text-5xl font-black">{formatCurrency(student.balance)}</h2>
                {student.balance < 0 && (
                  <Badge className="mt-4 bg-rose-500/20 text-rose-300 border-0 text-sm px-3 py-1">قرض / بقایا جات</Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-4 h-4" />
                  <span dir="ltr">{student.phone || '---'}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-300">
                  <DoorOpen className="w-4 h-4" />
                  <span>کمرہ: {student.room || '---'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action & Stats Card */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
            <CardTitle className="text-lg">ڈیپازٹ مینجمنٹ</CardTitle>
            <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 bg-emerald-600 hover:bg-emerald-700 gap-2 shadow-lg shadow-emerald-600/20">
                  <Plus className="w-5 h-5" /> رقم جمع کریں
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md" dir="rtl">
                <DialogHeader><DialogTitle>رقم جمع کریں</DialogTitle></DialogHeader>
                <form onSubmit={handleDeposit} className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">رقم (روپے) *</label>
                    <Input 
                      required type="number" value={form.amount} 
                      onChange={e => setForm({...form, amount: e.target.value})}
                      className="h-14 text-2xl font-bold text-center" placeholder="0" dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">ادائیگی کا طریقہ</label>
                    <Select value={form.method} onValueChange={v => setForm({...form, method: v})}>
                      <SelectTrigger className="h-14 text-lg"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(methodLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-600">تفصیل (اختیاری)</label>
                    <Input 
                      value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                      className="h-12" placeholder="نوٹ لکھیں..."
                    />
                  </div>
                  <Button type="submit" disabled={submitting || !form.amount} className="w-full h-14 text-xl bg-emerald-600">
                    {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : 'جمع کریں'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="p-0">
             <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-50">
               <div className="p-8 text-center hover:bg-emerald-50/30 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-3">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1 font-medium">کل ڈیپازٹ</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(transactions.filter(t => t.type === 'DEPOSIT').reduce((s, t) => s + t.amount, 0))}
                  </p>
               </div>
               <div className="p-8 text-center hover:bg-rose-50/30 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-3">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                  <p className="text-slate-400 text-sm mb-1 font-medium">کل خرچہ</p>
                  <p className="text-2xl font-bold text-rose-600">
                    {formatCurrency(transactions.filter(t => t.type === 'MEAL_CHARGE').reduce((s, t) => s + t.amount, 0))}
                  </p>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Ledger Timeline */}
      <Card className="border-0 shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center gap-2">
             <History className="w-5 h-5 text-slate-400" />
             <CardTitle className="text-lg">لیجر ٹائم لائن</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="py-20 text-center text-slate-400 italic">کوئی ٹرانزیکشن نہیں ملی</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {transactions.map((t) => (
                <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-110 ${
                      t.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-600' : 
                      t.type === 'REFUND' ? 'bg-blue-100 text-blue-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {t.type === 'DEPOSIT' ? <Wallet className="w-7 h-7" /> : 
                       t.type === 'REFUND' ? <Plus className="w-7 h-7" /> : <TrendingDown className="w-7 h-7" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">
                        {t.type === 'DEPOSIT' ? 'رقم جمع کرائی' : 
                         t.type === 'REFUND' ? 'رقم کی واپسی' : 'کھانے کی کٹوتی'}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(t.date).toLocaleDateString('ur-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        {t.method && (
                          <Badge variant="outline" className="bg-white text-slate-500 font-normal gap-1 px-2 border-slate-200">
                            <CreditCard className="w-3 h-3" /> {methodLabels[t.method]}
                          </Badge>
                        )}
                      </div>
                      {t.description && <p className="text-sm text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border-r-2 border-slate-200">{t.description}</p>}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`text-2xl font-black ${
                      t.type === 'DEPOSIT' || t.type === 'REFUND' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {t.type === 'DEPOSIT' || t.type === 'REFUND' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
