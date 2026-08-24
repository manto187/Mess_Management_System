'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Payment, Member } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, MONTHS, PAYMENT_STATUS_LABELS, HALL_LABELS, HALLS } from '@/lib/utils';
import { Plus, Loader2, CreditCard, CheckCircle2, Building2, DoorOpen } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const now = new Date();
  const [form, setForm] = useState({
    memberId: '', 
    amount: '', 
    month: String(now.getMonth() + 1), 
    year: String(now.getFullYear()), 
    status: 'PAID', 
    method: 'CASH',
    note: '',
    // Validation fields
    studentName: '',
    room: '',
    hall: '',
  });
  const [phoneSearch, setPhoneSearch] = useState('');
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);

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

  // Real-time phone search
  useEffect(() => {
    if (!phoneSearch.trim()) {
      setFilteredMembers([]);
      return;
    }

    const query = phoneSearch.toLowerCase().trim();
    const filtered = members.filter(m => 
      m.status === 'ACTIVE' && 
      (m.phone?.toLowerCase().includes(query) ||
       m.name?.toLowerCase().includes(query) ||
       m.room?.toLowerCase().includes(query))
    );
    setFilteredMembers(filtered);
  }, [phoneSearch, members]);

  // Auto-fill student details when selected
  const handleStudentSelect = (studentId: string) => {
    const student = members.find(m => m.id === studentId);
    if (student) {
      setForm({
        ...form,
        memberId: studentId,
        studentName: student.name,
        room: student.room || '',
        hall: student.hall || '',
      });
      setPhoneSearch(''); // Clear search after selection
      setFilteredMembers([]);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation: Check if name, room, hall match
    const selectedStudent = members.find(m => m.id === form.memberId);
    if (!selectedStudent) {
      toast({ title: 'خرابی', description: 'طالب علم منتخب کریں', variant: 'destructive' });
      return;
    }

    // Validate name match
    if (form.studentName && selectedStudent.name.toLowerCase() !== form.studentName.toLowerCase()) {
      toast({ 
        title: 'نام میں فرق', 
        description: `منتخب شدہ: ${selectedStudent.name} ≠ داخل شدہ: ${form.studentName}`,
        variant: 'destructive' 
      });
      return;
    }

    // Validate room match
    if (form.room && selectedStudent.room !== form.room) {
      toast({ 
        title: 'کمرہ نمبر میں فرق', 
        description: `منتخب شدہ: ${selectedStudent.room} ≠ داخل شدہ: ${form.room}`,
        variant: 'destructive' 
      });
      return;
    }

    // Validate hall match
    if (form.hall && selectedStudent.hall !== form.hall) {
      toast({ 
        title: 'ہال میں فرق', 
        description: `منتخب شدہ: ${HALL_LABELS[selectedStudent.hall || '']} ≠ داخل شدہ: ${HALL_LABELS[form.hall]}`,
        variant: 'destructive' 
      });
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/payments', { 
        studentId: form.memberId,
        amount: parseFloat(form.amount), 
        month: parseInt(form.month), 
        year: parseInt(form.year),
        status: form.status,
        method: form.method,
        note: form.note,
        // Send validation fields to backend
        studentName: form.studentName,
        room: form.room,
        hall: form.hall,
      });
      toast({ title: 'ادائیگی ریکارڈ ہو گیا ✓', description: 'بیلنس اپ ڈیٹ ہو گیا' });
      setOpen(false);
      setForm({
        memberId: '', 
        amount: '', 
        month: String(now.getMonth() + 1), 
        year: String(now.getFullYear()), 
        status: 'PAID', 
        method: 'CASH',
        note: '',
        studentName: '',
        room: '',
        hall: '',
      });
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

  // Filter and sort payments based on search query
  const getFilteredAndSortedPayments = () => {
    if (!searchQuery.trim()) {
      return payments;
    }

    const query = searchQuery.toLowerCase().trim();
    
    // Separate matching and non-matching payments
    const matching: Payment[] = [];
    const nonMatching: Payment[] = [];

    payments.forEach(payment => {
      const student = payment.student;
      const matchesName = student?.name?.toLowerCase().includes(query);
      const matchesPhone = student?.phone?.toLowerCase().includes(query);
      const matchesRoom = student?.room?.toLowerCase().includes(query);
      
      if (matchesName || matchesPhone || matchesRoom) {
        matching.push(payment);
      } else {
        nonMatching.push(payment);
      }
    });

    // Return matching payments first, then non-matching
    return [...matching, ...nonMatching];
  };

  const filteredPayments = getFilteredAndSortedPayments();

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
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader><DialogTitle>ادائیگی ریکارڈ کریں</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-2">
              <div>
                <label className="text-sm text-slate-600 block mb-1">فون نمبر سے تلاش کریں *</label>
                <Input
                  type="text"
                  placeholder="فون نمبر، نام، یا کمرہ نمبر..."
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  className="h-12 text-right"
                  disabled={!!form.memberId}
                />
                
                {/* Search Results */}
                {filteredMembers.length > 0 && !form.memberId && (
                  <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg bg-white">
                    {filteredMembers.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleStudentSelect(m.id)}
                        className="w-full text-right px-4 py-3 hover:bg-slate-50 border-b last:border-b-0 transition-colors"
                      >
                        <p className="font-semibold text-slate-800">{m.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {m.phone && `${m.phone} • `}
                          {m.room && `کمرہ ${m.room} • `}
                          {m.hall && HALL_LABELS[m.hall]}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {phoneSearch && filteredMembers.length === 0 && !form.memberId && (
                  <p className="text-xs text-red-600 mt-2">کوئی طالب علم نہیں ملا</p>
                )}
              </div>

              {/* Validation Fields - Auto-filled */}
              {form.memberId && (
                <div className="bg-slate-50 p-4 rounded-lg space-y-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600">تصدیق کی معلومات (خودکار)</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setForm({
                          ...form,
                          memberId: '',
                          studentName: '',
                          room: '',
                          hall: '',
                        });
                        setPhoneSearch('');
                      }}
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      تبدیل کریں
                    </Button>
                  </div>
                  
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">نام</label>
                    <div className="flex items-center gap-2 bg-white p-2 rounded border">
                      <span className="text-sm font-medium">{form.studentName}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1">کمرہ نمبر</label>
                      <div className="flex items-center gap-2 bg-white p-2 rounded border">
                        <DoorOpen className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium">{form.room || '---'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-500 block mb-1">ہال</label>
                      <div className="flex items-center gap-2 bg-white p-2 rounded border">
                        <Building2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm font-medium text-emerald-700">
                          {form.hall ? HALL_LABELS[form.hall] : '---'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                <label className="text-sm text-slate-600 block mb-1">ادائیگی کا طریقہ</label>
                <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">نقد</SelectItem>
                    <SelectItem value="EASYPAISA">ایزی پیسہ</SelectItem>
                    <SelectItem value="JAZZCASH">جاز کیش</SelectItem>
                    <SelectItem value="BANK_TRANSFER">بینک ٹرانسفر</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Search Box */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="نام، فون نمبر، یا کمرہ سے تلاش کریں..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 text-right"
        />
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
          {filteredPayments.map((pay) => (
            <Card key={pay.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{pay.student?.name || 'نامعلوم'}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{MONTHS[pay.month - 1]} {pay.year}</span>
                        {pay.student?.phone && (
                          <>
                            <span>•</span>
                            <span>{pay.student.phone}</span>
                          </>
                        )}
                        {pay.student?.hall && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Building2 className="w-3 h-3" />
                              {HALL_LABELS[pay.student.hall]}
                            </span>
                          </>
                        )}
                        {pay.student?.room && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <DoorOpen className="w-3 h-3" />
                              کمرہ {pay.student.room}
                            </span>
                          </>
                        )}
                      </div>
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
