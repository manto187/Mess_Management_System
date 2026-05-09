'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Payment, Member } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, MONTHS, PAYMENT_STATUS_LABELS } from '@/lib/utils';
import { Plus, Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusColors: Record<string, string> = {
  PAID: 'bg-emerald-100 text-emerald-700',
  PENDING: 'bg-orange-100 text-orange-700',
  PARTIAL: 'bg-blue-100 text-blue-700',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const now = new Date();
  const [form, setForm] = useState({
    memberId: '', amount: '', month: String(now.getMonth() + 1), year: String(now.getFullYear()), status: 'PAID', note: ''
  });

  const fetchPayments = () => {
    setLoading(true);
    api.get('/payments').then((r) => {
      const data = r.data;
      setPayments(Array.isArray(data) ? data : data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
    api.get('/students').then((r) => {
      const data = r.data;
      setMembers(Array.isArray(data) ? data : data.data || []);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/payments', { 
        studentId: form.memberId,
        amount: parseFloat(form.amount), 
        month: parseInt(form.month), 
        year: parseInt(form.year),
        status: form.status,
        note: form.note
      });
      toast({ title: 'ادائیگی ریکارڈ ہو گیا ✓' });
      setOpen(false);
      fetchPayments();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: 'خرابی', description: msg || 'ادائیگی ریکارڈ نہیں ہوئی', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const markAsPaid = async (id: string) => {
    try {
      await api.patch(`/payments/${id}`, { status: 'PAID', paidAt: new Date().toISOString() });
      toast({ title: 'ادائیگی مکمل ✓' });
      fetchPayments();
    } catch { toast({ title: 'خرابی', variant: 'destructive' }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">ادائیگیاں</h2>
          <p className="text-slate-500 text-sm">{payments.length} ریکارڈ</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button id="add-payment-btn" className="h-12 px-6 bg-violet-600 hover:bg-violet-700 text-base gap-2">
              <Plus className="w-5 h-5" /> ادائیگی ریکارڈ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm" dir="rtl">
            <DialogHeader><DialogTitle>ادائیگی ریکارڈ کریں</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div>
                <label className="text-sm text-slate-600 block mb-1">ممبر *</label>
                <Select value={form.memberId} onValueChange={(v) => setForm({ ...form, memberId: v })}>
                  <SelectTrigger id="pay-member" className="h-12"><SelectValue placeholder="ممبر چنیں" /></SelectTrigger>
                  <SelectContent>
                    {members.filter(m => m.status === 'ACTIVE').map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-600 block mb-1">مہینہ</label>
                  <Select value={form.month} onValueChange={(v) => setForm({ ...form, month: v })}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-600 block mb-1">سال</label>
                  <Input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}
                    className="h-12" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">رقم (روپے) *</label>
                <Input id="pay-amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0" required min="0" className="h-12" dir="ltr" />
              </div>
              <div>
                <label className="text-sm text-slate-600 block mb-1">حیثیت</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={submitting || !form.memberId || !form.amount}
                className="w-full h-12 bg-violet-600 hover:bg-violet-700">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'محفوظ کریں'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">کوئی ادائیگی نہیں</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((pay) => (
            <Card key={pay.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{pay.student?.name || 'نامعلوم'}</p>
                    <p className="text-xs text-slate-400">{MONTHS[pay.month - 1]} {pay.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="font-bold text-violet-700">{formatCurrency(pay.amount)}</p>
                    <Badge className={`text-xs border-0 ${statusColors[pay.status]}`}>
                      {PAYMENT_STATUS_LABELS[pay.status]}
                    </Badge>
                  </div>
                  {pay.status !== 'PAID' && (
                    <Button variant="outline" size="sm" onClick={() => markAsPaid(pay.id)}
                      className="h-9 border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ادا
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
